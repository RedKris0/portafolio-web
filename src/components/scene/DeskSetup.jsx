import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Plane, useCursor, RoundedBox, useGLTF, Center, Html } from '@react-three/drei';
import * as THREE from 'three';
import { assetPath } from '../../utils/assetPath.js';
import Screen from '../Screen.jsx';
import { BloodTextureStain, GrimeLayer, makeTexture } from './SceneEnvironment.jsx';

const Desk = () => {
  const woodTexture = useMemo(() => makeTexture('wood'), []);
  useEffect(() => () => woodTexture.dispose(), [woodTexture]);

  return (
    <group>
      {/* Tabla de madera pesada de hospital, con canto y patas visibles en la penumbra */}
      <RoundedBox args={[14, 0.48, 6]} radius={0.07} smoothness={3} position={[0, -0.2, 0]} receiveShadow castShadow>
        <meshStandardMaterial map={woodTexture} color="#76583c" roughness={0.91} metalness={0} />
      </RoundedBox>
      <Box args={[14.08, 0.2, 0.22]} position={[0, -0.47, 2.92]} castShadow receiveShadow>
        <meshStandardMaterial color="#3a1f0f" roughness={0.9} />
      </Box>
      {[
        [-6.15, -2.1, 2.35], [6.15, -2.1, 2.35],
        [-6.15, -2.1, -2.35], [6.15, -2.1, -2.35]
      ].map((position, index) => (
        <Box key={index} args={[0.38, 3.5, 0.38]} position={position} castShadow>
          <meshStandardMaterial color="#291507" roughness={0.88} />
        </Box>
      ))}
      <GrimeLayer />
      {/* Salpicaduras PNG orgánicas situadas naturalmente sobre la cubierta sin cortes abruptos */}
      <BloodTextureStain file="bloodsplat.png" position={[0.2, 0.081, 1.45]} rotation={-0.1} size={[2.2, 1.25]} opacity={0.52} />
      <BloodTextureStain file="bloodspray.png" position={[-3.75, 0.081, -0.52]} rotation={0.48} size={[2.2, 1.24]} opacity={0.56} />
      <BloodTextureStain file="bloodsplat.png" position={[4.05, 0.081, -1.4]} rotation={-0.1} size={[2.15, 1.2]} opacity={0.6} />
      <BloodTextureStain file="bloodslash2.png" position={[4.65, 0.081, 1.42]} rotation={0.62} size={[1.7, 0.96]} opacity={0.58} />
    </group>
  );
};

const MONITOR_SCREEN = {
  position: [0, 0.02, 0.27],
  width: 3.06,
  height: 1.88,
  pixelWidth: 1024,
};
// Html transform usa 40 px por unidad con distanceFactor=10.
const MONITOR_SCREEN_SCALE = MONITOR_SCREEN.width * 40 / MONITOR_SCREEN.pixelWidth;

const Monitor = ({ onClick, isZooming, isScreenActive, isInMainMenu = false, onClose, onLoginFailure, onOpenInvestigation, onHover, onUnhover }) => {
  const [hovered, setHovered] = useState(false);
  useCursor(hovered && !isZooming && !isScreenActive && !isInMainMenu);

  return (
    <group
      position={[-2, 1.5, -1]}
      rotation={[0, 0.2, 0]}
    >
      {/* Base pesada, cuello articulado y carcasa con profundidad */}
      <RoundedBox args={[1.72, 0.14, 1.08]} radius={0.05} smoothness={2} position={[0, -1.45, 0.04]} castShadow receiveShadow>
        <meshStandardMaterial color="#080909" roughness={0.52} metalness={0.62} />
      </RoundedBox>
      <Box args={[0.22, 1.3, 0.26]} position={[0, -0.82, -0.16]} castShadow receiveShadow>
        <meshStandardMaterial color="#0a0c0d" roughness={0.38} metalness={0.72} />
      </Box>
      <Box args={[0.76, 0.12, 0.48]} position={[0, -0.3, -0.11]} rotation={[0.28, 0, 0]} castShadow>
        <meshStandardMaterial color="#121619" roughness={0.45} metalness={0.68} />
      </Box>
      <RoundedBox args={[3.52, 2.34, 0.42]} radius={0.08} smoothness={3} castShadow receiveShadow>
        <meshStandardMaterial color="#111416" roughness={0.36} metalness={0.74} />
      </RoundedBox>
      {/* Bisel interior y vidrio hundido */}
      <RoundedBox args={[3.27, 2.09, 0.07]} radius={0.025} smoothness={2} position={[0, 0, 0.235]}>
        <meshStandardMaterial color="#020706" roughness={0.2} metalness={0.55} />
      </RoundedBox>

      {/* LED de encendido del monitor */}
      <Box args={[0.16, 0.08, 0.04]} position={[1.48, -1.01, 0.27]}>
        <meshBasicMaterial color="#3585ff" />
      </Box>

      {/* Luz ambiente emitida por la pantalla sobre el escritorio */}
      <pointLight position={[0, 0, 0.9]} intensity={1.8} distance={5} color="#2a68e8" />

      {/* Vidrio, superficie de interacción y escritorio comparten el mismo centro local. */}
      <group position={MONITOR_SCREEN.position}>
        <Plane args={[MONITOR_SCREEN.width, MONITOR_SCREEN.height]}>
          <meshBasicMaterial color="#00138c" />
        </Plane>

        {/* Plano invisible 3D para capturar hover y click cuando no está en zoom sin interferir con Html */}
        {!isScreenActive && (
          <Plane
            args={[MONITOR_SCREEN.width, MONITOR_SCREEN.height]}
            position={[0, 0, 0.016]}
            onClick={!isZooming ? onClick : null}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHovered(true);
              if (onHover && !isZooming) onHover('terminal');
            }}
            onPointerOut={() => {
              setHovered(false);
              if (onUnhover) onUnhover();
            }}
          >
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </Plane>
        )}

        {/* Pantalla Interactiva alojada físicamente en el monitor (oculta cuando el Menú Principal está activo) */}
        {!isInMainMenu && (
          <group position={[0, 0, 0.012]}>
            <Html
              transform
              position={[0, 0, 0]}
              distanceFactor={10}
              scale={MONITOR_SCREEN_SCALE}
              pointerEvents={isScreenActive ? 'auto' : 'none'}
              wrapperClass={`xp-screen-container ${isScreenActive ? 'pointer-events-auto' : 'pointer-events-none'}`}
              zIndexRange={[10, 0]}
            >
              <div
                style={{
                  width: MONITOR_SCREEN.pixelWidth,
                  height: MONITOR_SCREEN.pixelWidth * MONITOR_SCREEN.height / MONITOR_SCREEN.width,
                }}
                className={`rounded-sm overflow-hidden select-none shadow-2xl ${isScreenActive ? 'pointer-events-auto' : 'pointer-events-none'
                  }`}
              >
                <Screen
                  isZoomedIn={isScreenActive}
                  onZoomIn={onClick}
                  onClose={onClose}
                  onLoginFailure={onLoginFailure}
                  onOpenInvestigation={onOpenInvestigation}
                />
              </div>
            </Html>
          </group>
        )}
      </group>
    </group>
  );
};

// Generador de textura de carpeta confidencial manila / gris con sello carmesí (Foto 4)
const makeFolderTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Fondo cartón desgastado gris-beige (Foto 4)
  ctx.fillStyle = '#68645a';
  ctx.fillRect(0, 0, 512, 512);

  // Fibras y grano de cartón desgastado
  for (let i = 0; i < 4500; i += 1) {
    const alpha = 0.03 + Math.random() * 0.08;
    ctx.fillStyle = Math.random() > 0.5 ? `rgba(20, 18, 14, ${alpha})` : `rgba(230, 222, 205, ${alpha})`;
    ctx.fillRect(Math.random() * 512, Math.random() * 512, 1 + Math.random() * 2, 1 + Math.random() * 2);
  }

  // Manchas de humedad y manipulación
  for (let i = 0; i < 35; i += 1) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const radius = 25 + Math.random() * 65;
    const patch = ctx.createRadialGradient(x, y, 0, x, y, radius);
    patch.addColorStop(0, 'rgba(15, 12, 8, 0.12)');
    patch.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = patch;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // Sello estampado "CONFIDENTIAL" con doble marco en carmesí oscuro (Foto 4)
  ctx.save();
  ctx.translate(256, 256);
  ctx.rotate(-0.025);

  // Marco exterior
  ctx.strokeStyle = '#5a1212';
  ctx.lineWidth = 5.5;
  ctx.strokeRect(-165, -52, 330, 104);

  // Marco interior fino
  ctx.lineWidth = 1.8;
  ctx.strokeRect(-158, -45, 316, 90);

  // Texto CONFIDENTIAL
  ctx.font = 'bold 36px "Courier Prime", monospace';
  ctx.fillStyle = '#5a1212';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.letterSpacing = '5px';
  ctx.fillText('CONFIDENTIAL', 0, 0);

  // Micro-desgastes en el sello de tinta
  for (let i = 0; i < 160; i += 1) {
    ctx.fillStyle = 'rgba(104, 100, 90, 0.5)';
    ctx.fillRect(-170 + Math.random() * 340, -56 + Math.random() * 112, 2 + Math.random() * 3, 2 + Math.random() * 3);
  }
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
};

const DocumentFolder = ({ onClick, isZooming, onHover, onUnhover }) => {
  const [hovered, setHovered] = useState(false);
  const folderTexture = useMemo(() => makeFolderTexture(), []);
  useCursor(hovered && !isZooming);
  useEffect(() => () => folderTexture.dispose(), [folderTexture]);

  return (
    <group
      position={[1.65, 0.04, 0.65]}
      rotation={[-Math.PI / 2, 0, -0.16]}
      onClick={!isZooming ? onClick : null}
      onPointerOver={() => {
        setHovered(true);
        if (onHover && !isZooming) onHover('document');
      }}
      onPointerOut={() => {
        setHovered(false);
        if (onUnhover) onUnhover();
      }}
    >
      {/* Sombra de contacto suave en la madera */}
      <Plane args={[1.5, 1.95]} position={[0, 0, -0.015]}>
        <meshBasicMaterial color="#000" opacity={0.65} transparent />
      </Plane>

      {/* Contraportada de cartulina */}
      <Box args={[1.32, 1.82, 0.015]} position={[0, 0, 0.008]} castShadow receiveShadow>
        <meshStandardMaterial color="#555249" roughness={0.88} />
      </Box>

      {/* Hojas interiores de papel blanco marfil visibles en los bordes (Foto 4) */}
      <Box args={[1.28, 1.78, 0.03]} position={[0.015, -0.01, 0.024]} receiveShadow>
        <meshStandardMaterial color="#ddd7cb" roughness={0.92} />
      </Box>

      {/* Portada del expediente con el sello CONFIDENTIAL estampado */}
      <Plane args={[1.32, 1.82]} position={[0, 0, 0.042]} receiveShadow castShadow>
        <meshStandardMaterial map={folderTexture} roughness={0.85} />
      </Plane>

      {/* Lomo / solapa izquierda reforzada */}
      <Box args={[0.08, 1.83, 0.044]} position={[-0.65, 0, 0.024]} castShadow>
        <meshStandardMaterial color="#423f37" roughness={0.9} />
      </Box>
    </group>
  );
};



const InteractiveCamera = ({ onClick, isZooming, isActive, onHover, onUnhover }) => {
  const [hovered, setHovered] = useState(false);
  const { scene } = useGLTF(assetPath('assets/models/low_poly_outlast_camera.glb'));
  const cameraModel = useMemo(() => scene.clone(true), [scene]);

  // Contorno blanco invertido (Inverted Hull) para silueta 3D nítida en hover
  const outlineModel = useMemo(() => {
    const clone = scene.clone(true);
    const outlineMat = new THREE.MeshBasicMaterial({
      color: '#ffffff',
      side: THREE.BackSide,
      depthWrite: false,
      transparent: true,
      opacity: 0.95,
    });
    clone.traverse((object) => {
      if (object.isMesh) {
        object.material = outlineMat;
      }
    });
    return clone;
  }, [scene]);

  useCursor(hovered && !isZooming);

  useEffect(() => {
    cameraModel.traverse((object) => {
      if (!object.isMesh) return;
      object.castShadow = true;
      object.receiveShadow = true;
      if (object.material) {
        object.material = object.material.clone();
      }
    });
  }, [cameraModel]);

  // Iluminar los materiales y contornos de la cámara en blanco brillante al pasar el cursor
  useEffect(() => {
    cameraModel.traverse((object) => {
      if (!object.isMesh || !object.material) return;
      if (hovered) {
        object.material.emissive = new THREE.Color('#ffffff');
        object.material.emissiveIntensity = 0.42;
      } else if (isActive) {
        object.material.emissive = new THREE.Color('#0a3a14');
        object.material.emissiveIntensity = 0.25;
      } else {
        object.material.emissive = new THREE.Color('#000000');
        object.material.emissiveIntensity = 0;
      }
    });
  }, [hovered, isActive, cameraModel]);

  return (
    <group
      position={[-4.6, 0.7, -0.7]}
      rotation={[0, 1, 0]}
      scale={5}
      onClick={!isZooming ? onClick : null}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        if (onHover && !isZooming) onHover('camcorder');
      }}
      onPointerOut={() => {
        setHovered(false);
        if (onUnhover) onUnhover();
      }}
    >
      <Center>
        <group>
          <primitive object={cameraModel} />
          {/* Contorno blanco que bordea el modelo tridimensional */}
          {hovered && !isZooming && (
            <group scale={1.055}>
              <primitive object={outlineModel} />
            </group>
          )}
        </group>
      </Center>

      {/* Luz puntual blanca centrada en la cámara al hacer hover */}
      <pointLight
        position={[0, 0.25, 0]}
        intensity={hovered ? 6 : isActive ? 2 : 0}
        distance={2.4}
        color={hovered ? '#ffffff' : '#22ff77'}
      />

    </group>
  );
};


const Keyboard = () => {
  const { scene } = useGLTF(assetPath('assets/models/keyboard.glb'));
  const keyboard = useMemo(() => scene.clone(true), [scene]);

  useEffect(() => {
    keyboard.traverse((object) => {
      if (!object.isMesh) return;
      object.castShadow = true;
      object.receiveShadow = true;
    });
  }, [keyboard]);

  return (
    <group position={[-2.55, 0.12, 1.4]} rotation={[0, 0.1, 0]} scale={10.0}>
      <Center>
        <primitive object={keyboard} />
      </Center>
    </group>
  );
};

const Mouse = () => (
  <group position={[0.15, 0.15, 1.38]} rotation={[0, -0.18, 0]}>
    <mesh scale={[0.24, 0.1, 0.36]} castShadow receiveShadow>
      <sphereGeometry args={[1, 24, 16]} />
      <meshStandardMaterial color="#161714" roughness={0.43} metalness={0.5} />
    </mesh>
    <Box args={[0.012, 0.015, 0.27]} position={[0, 0.092, -0.06]}>
      <meshBasicMaterial color="#060706" />
    </Box>
    <mesh position={[0, 0.107, -0.085]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.031, 0.031, 0.025, 12]} />
      <meshStandardMaterial color="#aaa180" roughness={0.46} metalness={0.48} />
    </mesh>
    <mesh position={[0, 0.067, 0.1]} rotation={[-Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.12, 0.008, 6, 16, Math.PI]} />
      <meshBasicMaterial color="#2f342e" />
    </mesh>
  </group>
);

const FloatingDust = ({ isCamcorderActive = false }) => {
  const dustData = useMemo(() => {
    const count = 220;
    const positions = new Float32Array(count * 3);
    const base = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < positions.length; i += 3) {
      const y = -0.5 + Math.random() * 4.6;
      base[i] = (Math.random() - 0.5) * 8.5;
      base[i + 1] = y;
      base[i + 2] = 0.5 + (Math.random() - 0.5) * 6;
      positions[i] = base[i];
      positions[i + 1] = base[i + 1];
      positions[i + 2] = base[i + 2];
      speeds[i / 3] = 0.12 + Math.random() * 0.28;
    }
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const glow = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    glow.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    glow.addColorStop(0.3, 'rgba(255, 255, 255, 0.4)');
    glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, 64, 64);
    const sprite = new THREE.CanvasTexture(canvas);
    return { positions, base, speeds, sprite };
  }, []);

  const dust = useRef();
  const geometry = useRef();
  const matRef = useRef();

  useFrame(({ clock }) => {
    if (geometry.current) {
      const time = clock.getElapsedTime();
      const positions = geometry.current.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        const speed = dustData.speeds[i / 3];
        positions[i] = dustData.base[i] + Math.sin(time * speed + i) * 0.1;
        positions[i + 1] = dustData.base[i + 1] + Math.sin(time * speed * 0.7 + i * 0.3) * 0.16;
        positions[i + 2] = dustData.base[i + 2] + Math.cos(time * speed * 0.8 + i) * 0.08;
      }
      geometry.current.attributes.position.needsUpdate = true;
    }

    if (matRef.current) {
      const targetColor = isCamcorderActive ? new THREE.Color('#78f59d') : new THREE.Color('#c2b48a');
      matRef.current.color.lerp(targetColor, 0.1);
      matRef.current.opacity = isCamcorderActive ? 0.38 : 0.18;
    }
  });

  useEffect(() => () => dustData.sprite.dispose(), [dustData]);

  return (
    <points ref={dust}>
      <bufferGeometry ref={geometry}>
        <bufferAttribute attach="attributes-position" args={[dustData.positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        ref={matRef}
        map={dustData.sprite}
        color="#c2b48a"
        size={0.032}
        transparent
        opacity={0.18}
        alphaTest={0.01}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
};

const Clutter = () => (
  <group>
    {/* Stack of folders */}
    <Box args={[1.5, 1.2, 2]} position={[3.5, 0.6, -0.5]} rotation={[0, -0.2, 0]} castShadow receiveShadow>
      <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
    </Box>
    <Box args={[1.6, 0.1, 2.1]} position={[3.5, 1.25, -0.5]} rotation={[0, -0.2, 0]} castShadow receiveShadow>
      <meshStandardMaterial color="#2d426b" roughness={0.8} />
    </Box>
    <Keyboard />
    <Mouse />
  </group>
);

export { Clutter, Desk, DocumentFolder, FloatingDust, InteractiveCamera, Monitor };

