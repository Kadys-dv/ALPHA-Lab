"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import { useReducedMotion } from "framer-motion";
import { Suspense, useRef } from "react";
import type { Mesh } from "three";
import * as THREE from "three";

function AlphaCore() {
  const core = useRef<Mesh>(null);
  const ring = useRef<Mesh>(null);

  useFrame((state, delta) => {
    if (core.current) {
      core.current.rotation.x += delta * 0.08;
      core.current.rotation.y += delta * 0.13;
      core.current.position.x = THREE.MathUtils.lerp(core.current.position.x, state.pointer.x * 0.28, 0.035);
      core.current.position.y = THREE.MathUtils.lerp(core.current.position.y, state.pointer.y * 0.2, 0.035);
    }
    if (ring.current) {
      ring.current.rotation.x += delta * 0.05;
      ring.current.rotation.z -= delta * 0.09;
    }
  });

  return (
    <Float speed={1.25} rotationIntensity={0.28} floatIntensity={0.55}>
      <group>
        <mesh ref={core} scale={1.35}>
          <icosahedronGeometry args={[1, 6]} />
          <MeshDistortMaterial
            color="#7c3aed"
            roughness={0.12}
            metalness={0.66}
            distort={0.34}
            speed={1.25}
          />
        </mesh>
        <mesh ref={ring} rotation={[Math.PI / 2.6, 0.2, 0]}>
          <torusGeometry args={[1.85, 0.035, 16, 180]} />
          <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={2.4} />
        </mesh>
        <mesh rotation={[0.25, 1.1, 0.7]}>
          <torusGeometry args={[2.15, 0.018, 12, 180]} />
          <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={1.8} />
        </mesh>
      </group>
    </Float>
  );
}

export default function FloatingAlpha() {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <div className="alpha-orb-fallback" aria-hidden="true" />;
  }

  return (
    <div className="alpha-canvas" aria-hidden="true">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 5.5], fov: 40 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={1.15} />
        <directionalLight position={[4, 5, 5]} intensity={3.2} color="#67e8f9" />
        <pointLight position={[-4, -2, 4]} intensity={42} color="#ec4899" />
        <pointLight position={[1, -3, 3]} intensity={22} color="#7c3aed" />
        <Suspense fallback={null}>
          <AlphaCore />
        </Suspense>
      </Canvas>
    </div>
  );
}
