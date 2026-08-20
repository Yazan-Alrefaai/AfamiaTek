"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, RoundedBox } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import * as THREE from "three";

/* --------------------------------------------------------------------------
   Dimensions

   drei's <RoundedBox> is an ExtrudeGeometry under the hood, so it needs
   `depth >= radius * 2`. A 0.09 corner radius on a 0.075-thick slab breaks that
   and produces inverted walls, so the chassis is modelled at a legal depth and
   squashed on Z instead: the outer dimensions land exactly on spec (0.72 × 1.5 ×
   0.075) and three's normalMatrix keeps the shading correct under the
   non-uniform scale.
   -------------------------------------------------------------------------- */
const BODY_W = 0.72;
const BODY_H = 1.5;
const BODY_D = 0.075;
const MODEL_D = 0.24;
const Z_SQUASH = BODY_D / MODEL_D;
const CORNER = 0.09;
const HALF_D = BODY_D / 2;

const SCREEN_W = 0.648;
const SCREEN_H = 1.428;
const SCREEN_R = 0.056;

const BASE_PITCH = 0.07;
const BASE_YAW = -0.44;
/** rad/s — one revolution takes just under a minute. */
const SPIN_SPEED = 0.115;
const MAX_TILT = 0.22;

const ORONTES = "#141412";
/** machined mid-frame: neutral so the crimson stays an accent, not a paint job */
const METAL = "#5d5d58";
const CRIMSON = "#ed1847";

type Vec2 = { x: number; y: number };

/* --------------------------------------------------------------------------
   Screen artwork — painted on a 2D canvas so nothing is fetched over the wire
   -------------------------------------------------------------------------- */

function roundedPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function createScreenTexture(): THREE.CanvasTexture | null {
  const W = 512;
  const H = 1128;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // orontes ground
  const base = ctx.createLinearGradient(W * 0.15, 0, W * 0.85, H);
  base.addColorStop(0, "#0c0c0b");
  base.addColorStop(0.44, "#22201d");
  base.addColorStop(1, "#070706");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, W, H);

  // crimson bloom rising out of the lower third
  const bloom = ctx.createRadialGradient(
    W * 0.5,
    H * 0.7,
    10,
    W * 0.5,
    H * 0.7,
    W * 1.05,
  );
  bloom.addColorStop(0, "rgba(255,147,168,0.55)");
  bloom.addColorStop(0.26, "rgba(237,24,71,0.26)");
  bloom.addColorStop(0.6, "rgba(237,24,71,0.09)");
  bloom.addColorStop(1, "rgba(237,24,71,0)");
  ctx.fillStyle = bloom;
  ctx.fillRect(0, 0, W, H);

  // the colonnade, at screen scale: shafts under a shallow arcade
  const bays = 8;
  const gap = W / bays;
  const springLine = H * 0.24;
  const plinth = H * 0.86;

  ctx.lineWidth = 1.5;
  ctx.strokeStyle = "rgba(255,254,246,0.10)";
  ctx.beginPath();
  for (let i = 1; i < bays; i++) {
    const x = i * gap;
    ctx.moveTo(x, springLine);
    ctx.lineTo(x, plinth);
  }
  ctx.stroke();

  ctx.strokeStyle = "rgba(255,147,168,0.15)";
  for (let i = 1; i < bays - 1; i++) {
    ctx.beginPath();
    ctx.arc(i * gap + gap / 2, springLine, gap / 2, Math.PI, Math.PI * 2, false);
    ctx.stroke();
  }

  // horizon hairline
  ctx.fillStyle = "rgba(237,24,71,0.32)";
  ctx.fillRect(0, Math.round(plinth), W, 1);

  // light falling from the top of the frame
  const shaft = ctx.createLinearGradient(0, 0, 0, H * 0.6);
  shaft.addColorStop(0, "rgba(255,255,255,0.10)");
  shaft.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = shaft;
  ctx.fillRect(0, 0, W, H * 0.6);

  // status furniture — reads as a live handset without spelling anything out
  ctx.fillStyle = "rgba(255,254,246,0.44)";
  roundedPath(ctx, 56, 62, 48, 8, 4);
  ctx.fill();
  ctx.fillStyle = "rgba(255,254,246,0.28)";
  roundedPath(ctx, W - 112, 62, 56, 8, 4);
  ctx.fill();
  ctx.fillStyle = "rgba(255,254,246,0.5)";
  roundedPath(ctx, W / 2 - 86, H - 56, 172, 9, 5);
  ctx.fill();

  // inner vignette so the glass edges sink away
  const vignette = ctx.createRadialGradient(
    W / 2,
    H / 2,
    W * 0.24,
    W / 2,
    H / 2,
    W * 1.1,
  );
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(0,0,0,0.6)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, W, H);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return texture;
}

/* --------------------------------------------------------------------------
   A rounded plane with sane 0..1 UVs (ShapeGeometry maps UVs from world space)
   -------------------------------------------------------------------------- */

function createRoundedPlane(
  width: number,
  height: number,
  radius: number,
): THREE.ShapeGeometry {
  const hw = width / 2;
  const hh = height / 2;
  const r = Math.min(radius, hw, hh);

  const shape = new THREE.Shape();
  shape.moveTo(-hw + r, -hh);
  shape.lineTo(hw - r, -hh);
  shape.absarc(hw - r, -hh + r, r, -Math.PI / 2, 0, false);
  shape.lineTo(hw, hh - r);
  shape.absarc(hw - r, hh - r, r, 0, Math.PI / 2, false);
  shape.lineTo(-hw + r, hh);
  shape.absarc(-hw + r, hh - r, r, Math.PI / 2, Math.PI, false);
  shape.lineTo(-hw, -hh + r);
  shape.absarc(-hw + r, -hh + r, r, Math.PI, Math.PI * 1.5, false);

  const geometry = new THREE.ShapeGeometry(shape, 14);
  const position = geometry.attributes.position;
  const uv = new Float32Array(position.count * 2);
  for (let i = 0; i < position.count; i++) {
    uv[i * 2] = (position.getX(i) + hw) / width;
    uv[i * 2 + 1] = (position.getY(i) + hh) / height;
  }
  geometry.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  geometry.computeVertexNormals();
  return geometry;
}

/* --------------------------------------------------------------------------
   The handset
   -------------------------------------------------------------------------- */

const LENS_OFFSETS = [0.14, 0, -0.14];

function Handset({
  pointer,
  animate,
}: {
  pointer: RefObject<Vec2>;
  animate: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const spin = useRef(BASE_YAW);
  const tilt = useRef<Vec2>({ x: 0, y: 0 });

  const invalidate = useThree((state) => state.invalidate);
  const viewport = useThree((state) => state.viewport);

  const screenTexture = useMemo(() => createScreenTexture(), []);
  const screenGeometry = useMemo(
    () => createRoundedPlane(SCREEN_W, SCREEN_H, SCREEN_R),
    [],
  );

  useEffect(() => {
    return () => {
      screenGeometry.dispose();
      screenTexture?.dispose();
    };
  }, [screenGeometry, screenTexture]);

  // the reduced-motion path renders on demand, so make sure the one frame lands
  useEffect(() => {
    invalidate();
  }, [invalidate, screenTexture]);

  const scale = useMemo(() => {
    const fit = Math.min(viewport.width / 1.15, viewport.height / 1.95);
    return THREE.MathUtils.clamp(fit, 0.6, 1.35);
  }, [viewport.width, viewport.height]);

  useFrame((state, delta) => {
    const node = group.current;
    if (!node || !animate) return;

    // a tab that just woke up can hand us a huge delta — don't let it snap
    const step = Math.min(delta, 0.05);
    const time = state.clock.elapsedTime;

    spin.current += step * SPIN_SPEED;

    const target = pointer.current;
    const wantX = THREE.MathUtils.clamp(-target.y * MAX_TILT, -MAX_TILT, MAX_TILT);
    const wantY = THREE.MathUtils.clamp(target.x * MAX_TILT, -MAX_TILT, MAX_TILT);
    tilt.current.x = THREE.MathUtils.damp(tilt.current.x, wantX, 2.2, step);
    tilt.current.y = THREE.MathUtils.damp(tilt.current.y, wantY, 2.2, step);

    node.rotation.x = BASE_PITCH + tilt.current.x + Math.sin(time * 0.55) * 0.028;
    node.rotation.y = spin.current + tilt.current.y;
    node.rotation.z = Math.sin(time * 0.4) * 0.022;
    node.position.y = Math.sin(time * 0.72) * 0.05;
  });

  return (
    <group
      ref={group}
      scale={scale}
      rotation={[BASE_PITCH, BASE_YAW, 0]}
      position={[0, 0, 0]}
    >
      {/* crimson mid-frame — slightly wider and slightly thinner than the
          chassis, so it only reads as a lit rail around the silhouette */}
      <RoundedBox
        args={[BODY_W + 0.022, BODY_H + 0.022, MODEL_D]}
        radius={CORNER + 0.011}
        smoothness={6}
        scale={[1, 1, Z_SQUASH * 0.94]}
      >
        <meshStandardMaterial
          color={METAL}
          metalness={1}
          roughness={0.2}
          envMapIntensity={1.5}
        />
      </RoundedBox>

      {/* chassis */}
      <RoundedBox
        args={[BODY_W, BODY_H, MODEL_D]}
        radius={CORNER}
        smoothness={8}
        scale={[1, 1, Z_SQUASH]}
      >
        <meshPhysicalMaterial
          color={ORONTES}
          metalness={0.85}
          roughness={0.28}
          clearcoat={1}
          clearcoatRoughness={0.18}
          envMapIntensity={1.15}
        />
      </RoundedBox>

      {/* display */}
      <mesh geometry={screenGeometry} position={[0, 0, HALF_D + 0.0016]}>
        {screenTexture ? (
          <meshStandardMaterial
            color="#000000"
            emissive="#ffffff"
            emissiveMap={screenTexture}
            emissiveIntensity={1.15}
            roughness={0.9}
            metalness={0}
          />
        ) : (
          <meshStandardMaterial
            color="#000000"
            emissive={CRIMSON}
            emissiveIntensity={0.35}
            roughness={0.9}
            metalness={0}
          />
        )}
      </mesh>

      {/* cover glass */}
      <mesh geometry={screenGeometry} position={[0, 0, HALF_D + 0.004]}>
        <meshPhysicalMaterial
          transparent
          opacity={0.15}
          color="#eae8de"
          roughness={0.03}
          metalness={0.05}
          clearcoat={1}
          clearcoatRoughness={0.02}
          envMapIntensity={2.2}
        />
      </mesh>

      {/* punch-hole selfie camera */}
      <mesh position={[0, 0.63, HALF_D + 0.005]}>
        <circleGeometry args={[0.019, 24]} />
        <meshBasicMaterial color="#04060a" />
      </mesh>
      <mesh position={[0, 0.63, HALF_D + 0.0055]}>
        <ringGeometry args={[0.019, 0.0225, 24]} />
        <meshBasicMaterial color={CRIMSON} transparent opacity={0.55} />
      </mesh>

      {/* rear camera island */}
      <group position={[-0.19, 0.46, 0]}>
        <RoundedBox
          args={[0.3, 0.46, 0.18]}
          radius={0.06}
          smoothness={5}
          scale={[1, 1, 0.19]}
          position={[0, 0, -HALF_D - 0.014]}
        >
          <meshPhysicalMaterial
            color="#181c23"
            metalness={0.9}
            roughness={0.24}
            clearcoat={1}
            clearcoatRoughness={0.14}
          />
        </RoundedBox>

        {LENS_OFFSETS.map((y) => (
          <group key={y} position={[0, y, -0.072]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 0.016, 28]} />
              <meshPhysicalMaterial
                color="#05070b"
                metalness={0.15}
                roughness={0.05}
                clearcoat={1}
                clearcoatRoughness={0.03}
                ior={1.7}
                reflectivity={0.9}
                envMapIntensity={1.6}
              />
            </mesh>
            <mesh position={[0, 0, -0.005]}>
              <torusGeometry args={[0.053, 0.005, 10, 32]} />
              <meshStandardMaterial
                color={METAL}
                metalness={1}
                roughness={0.2}
                envMapIntensity={1.5}
              />
            </mesh>
          </group>
        ))}
      </group>

      {/* side rails */}
      <mesh position={[BODY_W / 2 - 0.001, 0.3, 0]}>
        <boxGeometry args={[0.014, 0.15, 0.036]} />
        <meshStandardMaterial color={METAL} metalness={1} roughness={0.3} />
      </mesh>
      <mesh position={[BODY_W / 2 - 0.001, 0.06, 0]}>
        <boxGeometry args={[0.014, 0.26, 0.036]} />
        <meshStandardMaterial color={METAL} metalness={1} roughness={0.3} />
      </mesh>
    </group>
  );
}

/* --------------------------------------------------------------------------
   Canvas host
   -------------------------------------------------------------------------- */

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function PhoneScene() {
  const host = useRef<HTMLDivElement>(null);
  const pointer = useRef<Vec2>({ x: 0, y: 0 });

  const [reduced, setReduced] = useState(prefersReducedMotion);
  const [inView, setInView] = useState(true);
  const [finePointer, setFinePointer] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const query = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => setFinePointer(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  // stop burning frames once the hero has scrolled away
  useEffect(() => {
    const node = host.current;
    if (!node || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) setInView(entry.isIntersecting);
      },
      { rootMargin: "160px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const parallax = finePointer && !reduced;

  useEffect(() => {
    if (!parallax) {
      pointer.current.x = 0;
      pointer.current.y = 0;
      return;
    }

    // tracked on the window, not the canvas, so the tilt keeps following the
    // cursor while it is over the copy column
    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((event.clientY / window.innerHeight) * 2 - 1);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [parallax]);

  const frameloop = reduced ? "demand" : inView ? "always" : "never";

  return (
    <div ref={host} aria-hidden className="h-full w-full">
      <Canvas
        frameloop={frameloop}
        dpr={[1, 1.5]}
        gl={{ antialias: true, powerPreference: "default", alpha: true }}
        camera={{ position: [0, 0, 4.1], fov: 32, near: 0.1, far: 30 }}
        style={{ pointerEvents: "none" }}
      >
        {/* key light */}
        <directionalLight
          position={[3.2, 4.6, 4.2]}
          intensity={3.1}
          color="#fffef6"
        />
        {/* Apama Crimson rim, raking across the back edge. Kept low: the
            handset is Orontes Stone that catches crimson, not a red phone. */}
        <directionalLight
          position={[-3.4, -1.2, -2.6]}
          intensity={1.1}
          color="#ed1847"
        />
        <ambientLight intensity={0.22} color="#6f6d66" />

        {/* light probes are built in-scene — no HDRI is fetched from a CDN */}
        <Environment resolution={256}>
          <Lightformer
            form="rect"
            intensity={3.4}
            color="#fffef6"
            position={[0, 2.8, 2.2]}
            rotation={[-Math.PI / 2.6, 0, 0]}
            scale={[7, 3.5, 1]}
          />
          <Lightformer
            form="rect"
            intensity={0.9}
            color="#ed1847"
            position={[-3.2, 0.6, 1.6]}
            rotation={[0, Math.PI / 2, 0]}
            scale={[5, 5, 1]}
          />
          <Lightformer
            form="rect"
            intensity={2.0}
            color="#c4c2b7"
            position={[3.2, -0.4, 1.4]}
            rotation={[0, -Math.PI / 2, 0]}
            scale={[5, 5, 1]}
          />
          <Lightformer
            form="ring"
            intensity={1.5}
            color="#ff416a"
            position={[1.8, 2.2, -3]}
            scale={2.4}
          />
          <Lightformer
            form="rect"
            intensity={0.5}
            color="#262623"
            position={[0, -3.4, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            scale={[9, 9, 1]}
          />
        </Environment>

        <Handset pointer={pointer} animate={!reduced} />
      </Canvas>
    </div>
  );
}
