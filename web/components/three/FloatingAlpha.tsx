"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group, Mesh } from "three";
import * as THREE from "three";

function AlphaCore() {
  const group = useRef<Group>(null);
  const core = useRef<Mesh>(null);
  const ring = useRef<Mesh>(null);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;

    if (group.current) {
      group.current.position.y = Math.sin(time * 0.85) * 0.11;
      group.current.rotation.z = Math.sin(time * 0.42) * 0.055;
    }

    if (core.current) {
      core.current.rotation.x += delta * 0.08;
      core.current.rotation.y += delta * 0.13;
      core.current.position.x = THREE.MathUtils.lerp(
        core.current.position.x,
        state.pointer.x * 0.28,
        0.035,
      );
      core.current.position.y = THREE.MathUtils.lerp(
        core.current.position.y,
        state.pointer.y * 0.2,
        0.035,
      );
      const pulse = 1.34 + Math.sin(time * 1.1) * 0.025;
      core.current.scale.setScalar(pulse);
    }

    if (ring.current) {
      ring.current.rotation.x += delta * 0.05;
      ring.current.rotation.z -= delta * 0.09;
    }
  });

  return (
    <group ref={group}>
      <mesh ref={core}>
        <icosahedronGeometry args={[1, 3]} />
        <meshStandardMaterial
          color="#7c3aed"
          roughness={0.16}
          metalness={0.7}
          emissive="#24104f"
          emissiveIntensity={0.5}
        />
      </mesh>
      <mesh scale={1.37}>
        <icosahedronGeometry args={[1, 2]} />
        <meshBasicMaterial color="#67e8f9" wireframe transparent opacity={0.12} />
      </mesh>
      <mesh ref={ring} rotation={[Math.PI / 2.6, 0.2, 0]}>
        <torusGeometry args={[1.85, 0.035, 10, 72]} />
        <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={2.2} />
      </mesh>
      <mesh rotation={[0.25, 1.1, 0.7]}>
        <torusGeometry args={[2.15, 0.018, 8, 64]} />
        <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={1.7} />
      </mesh>
    </group>
  );
}

export default function FloatingAlpha() {
  return (
    <div className="alpha-canvas" aria-hidden="true">
      <Canvas
        dpr={[1, 1.25]}
        camera={{ position: [0, 0, 5.5], fov: 40 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={1.1} />
        <directionalLight position={[4, 5, 5]} intensity={3} color="#67e8f9" />
        <pointLight position={[-4, -2, 4]} intensity={30} color="#ec4899" />
        <pointLight position={[1, -3, 3]} intensity={16} color="#7c3aed" />
        <AlphaCore />
      </Canvas>
    </div>
  );
}
