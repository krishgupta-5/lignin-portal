import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, Instances, Instance, Line } from '@react-three/drei';
import { useScroll } from 'framer-motion';
import * as THREE from 'three';

// ---------------------------------------------------------
// 1. BIOMASS FIELD
// Intertwined procedural fibers
// ---------------------------------------------------------
function BiomassField({ scrollYProgress }) {
  const groupRef = useRef();

  // Procedural curves for fibers
  const fibers = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 7; i++) {
      const points = [];
      const xOffset = (Math.random() - 0.5) * 1.5;
      const zOffset = (Math.random() - 0.5) * 1.5;
      for (let y = -10; y <= 10; y += 2) {
        points.push(
          new THREE.Vector3(
            xOffset + Math.sin(y * 0.5 + i) * 0.3,
            y,
            zOffset + Math.cos(y * 0.3 + i) * 0.3
          )
        );
      }
      arr.push(new THREE.CatmullRomCurve3(points));
    }
    return arr;
  }, []);

  useFrame(({ clock }) => {
    const s = scrollYProgress.get();
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      // Subtle organic sway
      groupRef.current.position.y = Math.sin(t * 0.5) * 0.2;
      groupRef.current.rotation.y = t * 0.05 + s * 1.5; // Rotate slightly on scroll
    }
  });

  return (
    <group ref={groupRef} position={[-2, 0, 0]}>
      {fibers.map((curve, idx) => (
        <mesh key={idx}>
          <tubeGeometry args={[curve, 64, 0.15 + Math.random() * 0.1, 8, false]} />
          <meshStandardMaterial 
            color="#214B36" 
            roughness={0.8} 
            transparent 
            opacity={0.9} 
          />
        </mesh>
      ))}
      <Html position={[0, -3, 0]} center>
        <div className="hero-annotation"><span className="line"></span>LIGNOCELLULOSIC MATRIX</div>
      </Html>
    </group>
  );
}

// ---------------------------------------------------------
// 2 & 5. LIGNIN MATRIX -> DATA TRANSFORMATION
// ---------------------------------------------------------
function LigninMatrix({ scrollYProgress }) {
  const groupRef = useRef();

  // Create fragmented lignin matrix patches
  const patches = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 15; i++) {
      arr.push({
        initialPos: new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 2
        ),
        targetPos: new THREE.Vector3(
          3 + (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 2
        ),
        rotation: new THREE.Euler(Math.random(), Math.random(), Math.random()),
        scale: 0.5 + Math.random() * 0.5
      });
    }
    return arr;
  }, []);

  return (
    <group ref={groupRef} position={[-2, 0, 0]}>
      {patches.map((p, idx) => (
        <LigninFragment key={idx} data={p} scrollYProgress={scrollYProgress} idx={idx} />
      ))}
    </group>
  );
}

function LigninFragment({ data, scrollYProgress, idx }) {
  const meshRef = useRef();
  const dataRef = useRef();
  
  useFrame(({ clock }) => {
    const s = scrollYProgress.get();
    const t = clock.getElapsedTime();
    
    // SCROLL LOGIC
    // 0 - 0.4: Attached to biomass
    // 0.4 - 0.6: Detaching & moving outward
    // 0.6 - 0.8: Transformation to data & moving to NODE
    
    let pos = new THREE.Vector3().copy(data.initialPos);
    let scale = data.scale;
    let dataScale = 0;
    
    // Bio rotation to match the matrix
    const bioRot = t * 0.05 + s * 1.5;
    pos.applyAxisAngle(new THREE.Vector3(0,1,0), bioRot);
    
    if (s > 0.4 && s <= 0.6) {
      // Fractionation
      const localS = (s - 0.4) / 0.2;
      const outward = new THREE.Vector3().copy(data.initialPos).normalize().multiplyScalar(localS * 3);
      pos.add(outward);
      scale = data.scale * (1 - localS * 0.5); // shrink slightly
    } else if (s > 0.6) {
      // Feature extraction (Data transformation)
      const localS = Math.min((s - 0.6) / 0.2, 1);
      
      // Interpolate position toward NODE
      const startPos = new THREE.Vector3().copy(data.initialPos).add(new THREE.Vector3().copy(data.initialPos).normalize().multiplyScalar(3));
      // Target pos is relative to this group (which is at x=-2, NODE is at x=3 -> target is x=5)
      const target = new THREE.Vector3(5 + (data.targetPos.x - 3), data.targetPos.y, data.targetPos.z);
      
      pos.lerpVectors(startPos, target, localS);
      
      scale = data.scale * (1 - localS);
      dataScale = localS;
    }

    // Add organic wobble
    pos.y += Math.sin(t + idx) * 0.1;

    if (meshRef.current) {
      meshRef.current.position.copy(pos);
      meshRef.current.scale.setScalar(scale);
      meshRef.current.rotation.copy(data.rotation);
      meshRef.current.rotation.x += t * 0.5;
    }
    
    if (dataRef.current) {
      dataRef.current.position.copy(pos);
      dataRef.current.scale.setScalar(dataScale);
      dataRef.current.visible = dataScale > 0;
    }
  });

  return (
    <>
      <mesh ref={meshRef}>
        <dodecahedronGeometry args={[0.2, 0]} />
        <meshStandardMaterial color="#C47A35" roughness={0.4} transparent opacity={0.9} />
      </mesh>
      <mesh ref={dataRef}>
        <octahedronGeometry args={[0.1, 0]} />
        <meshBasicMaterial color="#8FE0D2" />
      </mesh>
      
      {idx === 0 && (
        <Html position={[0, 0.5, 0]} center>
           <div className="hero-annotation" style={{opacity: 0.7}}><span className="line"></span>LIGNIN FRACTIONATION</div>
        </Html>
      )}
    </>
  );
}

// ---------------------------------------------------------
// 3. DES FLOW FIELD
// ---------------------------------------------------------
function DESFlowField({ scrollYProgress }) {
  const count = 300;
  
  const particles = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      angle: Math.random() * Math.PI * 2,
      radius: 3 + Math.random() * 3,
      y: (Math.random() - 0.5) * 15,
      speed: 0.2 + Math.random() * 0.5,
      offset: Math.random() * 100
    }));
  }, [count]);

  const instancesRef = useRef();
  
  return (
    <group ref={instancesRef} position={[-2, 0, 0]}>
      <Instances limit={count} range={count}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color="#78C8B8" emissive="#4D8F82" emissiveIntensity={0.5} />
        {particles.map((data, i) => (
          <DESParticle key={i} data={data} scrollYProgress={scrollYProgress} idx={i} />
        ))}
      </Instances>
      <Html position={[-3, 2, 0]} center>
         <div className="hero-annotation"><span className="line"></span>DES SOLVENT FLOW</div>
      </Html>
    </group>
  );
}

function DESParticle({ data, scrollYProgress, idx }) {
  const ref = useRef();
  
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    const s = scrollYProgress.get();
    
    // Flow field logic
    const currentAngle = data.angle + t * data.speed;
    let r = data.radius;
    
    // Interaction phase: at s=0.2, DES enters the biomass
    if (s > 0.1 && s < 0.5) {
      const interaction = Math.sin((s - 0.1) * Math.PI / 0.4); // 0 -> 1 -> 0
      r = r - (r - 0.5) * interaction * 0.8; // Constrict radius toward biomass
    }
    
    // Vertical flow using noise/sine
    const yFlow = data.y + Math.sin(t * 0.5 + data.offset) * 2;
    
    const x = Math.cos(currentAngle) * r;
    const z = Math.sin(currentAngle) * r;
    
    ref.current.position.set(x, yFlow, z);
  });

  return <Instance ref={ref} />;
}

// ---------------------------------------------------------
// 6. NODE COMPUTATIONAL TOPOLOGY
// ---------------------------------------------------------
function NodeTopology({ scrollYProgress }) {
  const groupRef = useRef();
  const readoutRef = useRef();

  // Generate hierarchical layers
  const layers = [
    { x: -1, nodes: [1.5, 0.5, -0.5, -1.5] }, // Input features
    { x: 0, nodes: [1, 0, -1] },              // Hidden 1
    { x: 1, nodes: [0.5, -0.5] },             // Hidden 2
    { x: 2, nodes: [0] }                      // Prediction
  ];

  const lines = useMemo(() => {
    const arr = [];
    for (let i = 0; i < layers.length - 1; i++) {
      layers[i].nodes.forEach(y1 => {
        layers[i+1].nodes.forEach(y2 => {
          arr.push([new THREE.Vector3(layers[i].x, y1, 0), new THREE.Vector3(layers[i+1].x, y2, 0)]);
        });
      });
    }
    return arr;
  }, []);

  useFrame(({ clock }) => {
    const s = scrollYProgress.get();
    const t = clock.getElapsedTime();
    
    if (groupRef.current) {
      // Reveal opacity based on scroll > 0.7
      const visibility = Math.max(0, Math.min((s - 0.6) / 0.2, 1));
      groupRef.current.scale.setScalar(0.8 + visibility * 0.2);
      
      // Pulse effect at s > 0.8
      const pulse = s > 0.8 ? (Math.sin(t * 5) * 0.5 + 0.5) : 0;
      
      groupRef.current.children.forEach(child => {
        if (child.type === 'Mesh') {
          child.material.opacity = visibility * 0.8;
          child.material.emissiveIntensity = visibility * (0.2 + pulse * 0.8);
        }
      });
      
      if (readoutRef.current) {
        readoutRef.current.style.opacity = s > 0.85 ? '1' : '0';
      }
    }
  });

  return (
    <group position={[3, 0, -2]}>
      <group ref={groupRef}>
        {/* Connections */}
        {lines.map((pts, i) => (
          <Line key={i} points={pts} color="#4D8F82" lineWidth={1} transparent opacity={0.2} />
        ))}
        
        {/* Nodes */}
        {layers.map((layer, i) => (
          <group key={i}>
            {layer.nodes.map((y, j) => (
              <mesh key={j} position={[layer.x, y, 0]}>
                <sphereGeometry args={[0.06, 16, 16]} />
                <meshStandardMaterial color="#8FE0D2" emissive="#8FE0D2" transparent opacity={0} />
              </mesh>
            ))}
          </group>
        ))}
        
        <Html position={[0.5, -2.5, 0]} center>
          <div className="hero-annotation" style={{textAlign: 'center', opacity: 0.8}}>
            <div style={{fontWeight: 600, color: 'var(--data)'}}>NODE</div>
            <div style={{fontSize: '0.65rem'}}>COMPUTATIONAL TOPOLOGY</div>
          </div>
        </Html>
      </group>
      
      {/* Prediction Readout */}
      <Html position={[3.5, 0, 0]} center>
        <div ref={readoutRef} style={{
          opacity: 0,
          transition: 'opacity 0.5s ease',
          background: 'var(--bg-2)',
          border: '1px solid var(--border)',
          padding: '16px',
          fontFamily: 'var(--font-mono)',
          whiteSpace: 'nowrap'
        }}>
          <div style={{color: 'var(--data)', fontSize: '0.75rem', marginBottom: '12px'}}>PREDICTION STATE</div>
          <div style={{display: 'flex', gap: '32px'}}>
            <div>
              <div style={{fontSize: '0.7rem', color: 'var(--text-secondary)'}}>R²</div>
              <div style={{fontSize: '1.25rem', color: 'var(--text)'}}>0.8726</div>
            </div>
            <div>
              <div style={{fontSize: '0.7rem', color: 'var(--text-secondary)'}}>MAE</div>
              <div style={{fontSize: '1.25rem', color: 'var(--text)'}}>0.0504</div>
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
}

// ---------------------------------------------------------
// 7. CAMERA CHOREOGRAPHY
// ---------------------------------------------------------
function CameraChoreography({ scrollYProgress }) {
  const { camera } = useThree();
  
  useFrame(() => {
    const s = scrollYProgress.get();
    
    // Initial: [0, 0, 10]
    // Middle: zoom in slightly on biomass [-1, 0, 7]
    // End: pan to NODE [1, 0, 9]
    
    let targetX = 0;
    let targetZ = 12;
    let lookX = -2;
    
    if (s < 0.4) {
      targetX = -1;
      targetZ = 9;
      lookX = -2;
    } else if (s >= 0.4 && s < 0.7) {
      targetX = 0;
      targetZ = 10;
      lookX = 0;
    } else {
      targetX = 2;
      targetZ = 9;
      lookX = 2;
    }
    
    // Smooth interpolation
    camera.position.lerp(new THREE.Vector3(targetX, 0, targetZ), 0.02);
    
    const targetLookAt = new THREE.Vector3(lookX, 0, 0);
    // We can't lerp lookAt directly easily without a ref object, but this works adequately for this scope
    // or we just manually adjust rotation
  });
  
  return null;
}

// ---------------------------------------------------------
// MAIN SCENE EXPORT
// ---------------------------------------------------------
export default function HeroScene({ scrollYProgress }) {
  return (
    <Canvas camera={{ position: [0, 0, 12], fov: 35 }}>
      {/* 10. CINEMATIC LIGHTING */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} color="#F2F0E8" /> {/* Key */}
      <directionalLight position={[-10, 5, -5]} intensity={2.5} color="#C47A35" /> {/* Warm rim for Lignin */}
      <directionalLight position={[0, -5, 5]} intensity={1} color="#78C8B8" /> {/* Cool fill */}
      <fog attach="fog" args={['#07100C', 10, 25]} /> {/* 11. DEPTH (Fog) */}
      
      <BiomassField scrollYProgress={scrollYProgress} />
      <LigninMatrix scrollYProgress={scrollYProgress} />
      <DESFlowField scrollYProgress={scrollYProgress} />
      <NodeTopology scrollYProgress={scrollYProgress} />
      
      <CameraChoreography scrollYProgress={scrollYProgress} />
    </Canvas>
  );
}
