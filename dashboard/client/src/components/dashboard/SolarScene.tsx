import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

interface SceneProps {
  panelAngle: number;
  sunAngle: number;
}

const Model = ({ panelAngle, sunAngle }: SceneProps) => {
  const rotatingPartRef = useRef<THREE.Group>(null);
  const sunRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (rotatingPartRef.current) {
      const targetRotation = THREE.MathUtils.degToRad(90 - panelAngle);
      rotatingPartRef.current.rotation.z = THREE.MathUtils.lerp(
        rotatingPartRef.current.rotation.z,
        targetRotation,
        0.1 // Smooth servo movement
      );
    }

    if (sunRef.current) {
      const visualSunAngle = Math.max(0, Math.min(180, sunAngle));
      const rad = THREE.MathUtils.degToRad(visualSunAngle);

      const radius = 7;
      // Math to create the Arc:
      // cos(rad) * -1  --> Moves from Left (-X) to Right (+X)
      sunRef.current.position.x = Math.cos(rad) * radius * -1;
      sunRef.current.position.y = Math.sin(rad) * radius * 0.8; // Flatten arc slightly
      sunRef.current.position.z = -4; // Push it INTO THE BACKGROUND so it doesn't hit the panel
    }
  });

  return (
    <>
      {/* --- STATIC STAND --- */}
      <group position={[0, -2, 0]}>
        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[2, 0.2, 2]} />
          <meshStandardMaterial color="#94a3b8" />
        </mesh>
        <mesh position={[0, 1.5, 0]}>
          <cylinderGeometry args={[0.15, 0.2, 3]} />
          <meshStandardMaterial color="#475569" metalness={0.6} />
        </mesh>
        <mesh position={[0, 3.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.5]} />
          <meshStandardMaterial color="#333" />
        </mesh>
      </group>

      {/* --- ROTATING PANEL --- */}
      <group ref={rotatingPartRef} position={[0, 1.1, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.6]} />
          <meshStandardMaterial color="silver" />
        </mesh>
        <mesh position={[0, 0.15, 0]}>
          <boxGeometry args={[3, 0.1, 1.5]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>
        <mesh position={[0, 0.25, 0]}>
          <boxGeometry args={[3.5, 0.1, 2]} />
          <meshStandardMaterial
            color="#172554"
            roughness={0.1}
            metalness={0.9}
          />
        </mesh>
        <mesh position={[0, 0.31, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[3.4, 1.9]} />
          <meshBasicMaterial
            color="#ffffff"
            wireframe
            transparent
            opacity={0.2}
          />
        </mesh>
      </group>

      {/* --- THE SUN --- */}
      <mesh ref={sunRef} position={[-5, 5, -5]}>
        <sphereGeometry args={[0.7, 64, 64]} />
        <meshBasicMaterial color="#fbbf24" toneMapped={false} />
        <mesh scale={[1.5, 1.5, 1.5]}>
          <sphereGeometry args={[0.7, 32, 32]} />
          <meshBasicMaterial color="#fbbf24" transparent opacity={0.2} />
        </mesh>
      </mesh>

      <ambientLight intensity={0.6} />
      <pointLight position={[0, 10, 5]} intensity={1.5} />
    </>
  );
};

const SolarScene = ({ panelAngle, sunAngle }: SceneProps) => {
  return (
    <div className="h-125 w-full rounded-xl overflow-hidden bg-linear-to-b from-sky-400 to-sky-100 shadow-inner border border-slate-200">
      <Canvas shadows camera={{ position: [0, 2, 8], fov: 45 }}>
        <Model panelAngle={panelAngle} sunAngle={sunAngle} />
        <OrbitControls
          enablePan={false}
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2 - 0.1}
        />
        <ContactShadows
          position={[0, -2, 0]}
          opacity={0.5}
          scale={10}
          blur={2}
          color="#0f172a"
        />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
};

export default SolarScene;
