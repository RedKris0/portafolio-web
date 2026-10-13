import { Suspense, useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree, useLoader } from '@react-three/fiber';
import { Box, Plane, Text, useGLTF, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { clone as cloneSkeleton } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { prepareCharacterRig } from '../../utils/characterRig.js';
import { registerCharacterMaterials } from '../../utils/legacyCharacterMaterials.js';
import { assetPath } from '../../utils/assetPath.js';
import { TERMINAL_PASSWORD } from '../Screen.jsx';

// ---- 3D Models & Enclosed Asylum Office ----
const AsylumDoor = ({ isCamcorderActive = false }) => (
  <group position={[6.2, -0.35, -5.14]}>
    {/* Marco metálico de la puerta pesada de manicomio (desde el suelo y = -4 hasta y = 3.3, a la misma altura del tablero) */}
    <Box args={[3.4, 7.3, 0.26]} position={[0, 0, 0]} castShadow receiveShadow>
      <meshStandardMaterial color="#141816" roughness={0.7} metalness={0.6} />
    </Box>
    {/* Hoja de la puerta de madera maciza hospitalaria blindada */}
    <Box args={[3.06, 6.98, 0.16]} position={[0, -0.06, 0.05]} castShadow receiveShadow>
      <meshStandardMaterial color="#2c221a" roughness={0.85} metalness={0.1} />
    </Box>
    {/* Plancha de protección de acero en la parte inferior descansando directamente en el suelo */}
    <Box args={[3.02, 1.8, 0.18]} position={[0, -2.65, 0.06]} castShadow receiveShadow>
      <meshStandardMaterial color="#3a3d3a" roughness={0.5} metalness={0.8} />
    </Box>
    {/* Ventana de observación rectangular con barras a la altura natural de los ojos */}
    <group position={[0, 1.55, 0.06]}>
      <Box args={[0.88, 1.45, 0.18]}>
        <meshStandardMaterial color="#0b0e0c" roughness={0.4} />
      </Box>
      {/* Cristal reforzado esmerilado */}
      <Plane args={[0.72, 1.28]} position={[0, 0, 0.09]}>
        <meshStandardMaterial color="#2d4251" roughness={0.3} metalness={0.4} transparent opacity={0.85} />
      </Plane>
      {/* Barrotes de seguridad */}
      {[-0.22, 0, 0.22].map((x, i) => (
        <Box key={i} args={[0.035, 1.28, 0.035]} position={[x, 0, 0.11]}>
          <meshStandardMaterial color="#1a1a1a" metalness={0.85} roughness={0.3} />
        </Box>
      ))}
    </group>
    {/* Barra antipánico / manija pesada industrial de manicomio */}
    <Box args={[0.12, 0.55, 0.2]} position={[-1.2, 0.05, 0.12]} castShadow>
      <meshStandardMaterial color="#a0a5a0" metalness={0.85} roughness={0.35} />
    </Box>
    <Box args={[2.4, 0.08, 0.14]} position={[0, 0.05, 0.12]} castShadow>
      <meshStandardMaterial color="#787e78" metalness={0.8} roughness={0.3} />
    </Box>
    {/* Letrero institucional en la parte superior */}
    <Plane args={[2.0, 0.36]} position={[0, 2.85, 0.12]}>
      <meshStandardMaterial color="#0c0e0c" roughness={0.5} />
    </Plane>
    <Text scale={isCamcorderActive ? 1 : 0} position={[0, 2.85, 0.13]} fontSize={0.13} color="#e6dec8">
      PABELLÓN D // CONSULTA 04
    </Text>
    {/* Haz frío de luz que se filtra por debajo y por la mirilla desde el pasillo exterior del pabellón */}
    <pointLight position={[0, -3.5, 0.4]} intensity={4.5} distance={4.2} color="#1d4d3d" />
    <pointLight position={[0, 1.55, 0.3]} intensity={2.4} distance={2.8} color="#5e1212" />
  </group>
);

const AsylumExitSign = ({ position = [6.2, 1.95, -5.12] }) => {
  const lightRef = useRef();
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    if (lightRef.current) {
      // Oscilación tenue y zumbido del letrero de salida de emergencia
      const flicker = Math.sin(time * 8.5) > 0.86 ? 0.35 : (0.85 + Math.sin(time * 2.8) * 0.15);
      lightRef.current.intensity = 2.4 * flicker;
    }
  });

  return (
    <group position={position}>
      {/* Carcasa de chapa oxidada */}
      <Box args={[1.2, 0.46, 0.16]} castShadow>
        <meshStandardMaterial color="#1a1c1a" roughness={0.7} metalness={0.6} />
      </Box>
      {/* Pantalla difusora con rótulo de salida iluminado */}
      <Plane args={[1.05, 0.36]} position={[0, 0, 0.086]}>
        <meshBasicMaterial color="#300505" />
      </Plane>
      <Text position={[0, 0, 0.092]} fontSize={0.18} color="#ff3333" letterSpacing={0.12}>
        SALIDA
      </Text>
      <pointLight ref={lightRef} position={[0, -0.1, 0.25]} intensity={2.4} distance={3.8} color="#aa1515" />
    </group>
  );
};

const BloodWallWritings = ({ isCamcorderActive = false }) => {
  return (
    <group scale={isCamcorderActive ? 1 : 0}>
      {/* Mensaje principal sangriento en la pared frontal sobre los bloques de hormigón (Referencia Foto 1) */}
      <group position={[-1.2, 3.2, -5.14]}>
        {/* Palabra principal chorreante en sangre oscura */}
        <Text
          font={assetPath('assets/fonts/Nosifer.ttf')}
          fontSize={0.68}
          color="#540404"
          letterSpacing={0.12}
          anchorX="center"
          anchorY="middle"
        >
          OBSERVA
        </Text>

        {/* Segunda línea ensangrentada y tachada estilo paciente psiquiátrico (Foto 1) */}
        <Text
          position={[0, -0.72, 0]}
          font={assetPath('assets/fonts/Creepster.ttf')}
          fontSize={0.44}
          color="#480303"
          letterSpacing={0.08}
          anchorX="center"
          anchorY="middle"
        >
          LA VERDAD
        </Text>

        {/* Inscripciones frenéticas repetidas en sangre alrededor de las letras principales (Foto 1) */}
        {[
          [-2.3, 0.65, 0.17, -0.06, 'OBSERVA'],
          [2.1, 0.58, 0.16, 0.05, 'OBSERVA'],
          [-2.6, -0.45, 0.15, 0.08, 'NO HAY SALIDA'],
          [2.3, -0.52, 0.16, -0.07, 'CASO COLCHAGUA'],
          [-1.8, 1.05, 0.14, 0.04, 'DATAMART'],
          [1.6, 1.02, 0.15, -0.05, 'OBSERVAN'],
          [-0.8, -1.25, 0.16, 0.02, 'OBSERVA'],
          [1.1, -1.22, 0.15, -0.03, 'LA VERDAD'],
          [-3.2, 0.15, 0.14, -0.09, 'TERAPIA'],
          [3.0, 0.12, 0.14, 0.06, 'OBSERVA']
        ].map(([x, y, size, rot, text], i) => (
          <Text
            key={i}
            position={[x, y, 0.002]}
            rotation={[0, 0, rot]}
            font={assetPath('assets/fonts/RockSalt.ttf')}
            fontSize={size}
            color="#380303"
            letterSpacing={0.06}
            anchorX="center"
            anchorY="middle"
          >
            {text}
          </Text>
        ))}

        {/* Chorretones verticales gruesos de sangre que bajan por las juntas del hormigón hacia el piso (Foto 1) */}
        {[-2.2, -1.7, -1.2, -0.8, -0.2, 0.4, 0.9, 1.5, 2.1].map((x, i) => (
          <Box
            key={i}
            args={[0.024 + (i % 3) * 0.012, 1.2 + (i % 4) * 0.45, 0.006]}
            position={[x, -1.1 - (i % 3) * 0.25, 0.005]}
          >
            <meshStandardMaterial color="#2d0202" roughness={0.65} opacity={0.92} transparent />
          </Box>
        ))}
      </group>

      {/* Inscripciones en la pared lateral izquierda junto al conducto de ventilación */}
      <group position={[-9.43, 0.8, -2.8]} rotation={[0, Math.PI / 2, 0]}>
        <Text
          font={assetPath('assets/fonts/Nosifer.ttf')}
          fontSize={0.34}
          color="#420404"
          letterSpacing={0.05}
          anchorX="center"
          anchorY="middle"
        >
          NO HAY SALIDA
        </Text>
        <Text
          position={[0, -0.55, 0]}
          font={assetPath('assets/fonts/Creepster.ttf')}
          fontSize={0.24}
          color="#380303"
          letterSpacing={0.08}
          anchorX="center"
          anchorY="middle"
        >
          PURIFICACION POR DATOS
        </Text>
        {[-1.2, -0.6, 0.4, 1.0].map((x, i) => (
          <Box key={i} args={[0.02, 0.55 + (i % 3) * 0.2, 0.005]} position={[x, -0.35, 0.005]}>
            <meshStandardMaterial color="#2d0202" roughness={0.7} opacity={0.82} transparent />
          </Box>
        ))}
      </group>

      {/* Inscripción cerca del archivador */}
      <group position={[4.6, -1.8, -5.14]} rotation={[0, 0, -0.04]}>
        <Text
          font={assetPath('assets/fonts/RockSalt.ttf')}
          fontSize={0.19}
          color="#3e0505"
          letterSpacing={0.04}
          anchorX="center"
          anchorY="middle"
        >
          CREAR // PROBAR // MEJORAR
        </Text>
      </group>
    </group>
  );
};

const FlickeringFluorescentFixture = ({ position = [0, 5.05, 0.8], isCamcorderActive = false }) => {
  const lightRef = useRef();
  const tubeMatRef = useRef();

  useFrame(({ clock }) => {
    if (isCamcorderActive) {
      if (lightRef.current) {
        lightRef.current.intensity = 260;
        lightRef.current.color = new THREE.Color('#78ff9d');
      }
      if (tubeMatRef.current) {
        tubeMatRef.current.emissiveIntensity = 2.4;
      }
      return;
    }

    const time = clock.getElapsedTime();
    // Zumbido eléctrico y oscilación de tubo fluorescente de hospital psiquiátrico
    const hum = Math.sin(time * 55) * 0.08 + Math.cos(time * 26) * 0.05;
    // Cortes repentinos por sobretensión / balastro dañado
    const dip = Math.sin(time * 1.9) > 0.92 ? 0.32 : 1.0;
    const spark = Math.random() < 0.014 ? 0.12 : 1.0;
    const factor = Math.max(0.08, (1 + hum) * dip * spark);

    if (lightRef.current) {
      lightRef.current.color = new THREE.Color('#8da57a');
      lightRef.current.intensity = THREE.MathUtils.lerp(lightRef.current.intensity, 420 * factor, 0.22);
    }
    if (tubeMatRef.current) {
      tubeMatRef.current.emissiveIntensity = THREE.MathUtils.lerp(tubeMatRef.current.emissiveIntensity, 1.35 * factor, 0.22);
    }
  });

  return (
    <group position={position}>
      {/* Armazón metálico suspendido con pátina y óxido */}
      <Box args={[3.8, 0.16, 0.55]} castShadow>
        <meshStandardMaterial color="#1a1d1b" roughness={0.75} metalness={0.65} />
      </Box>
      {/* Cables / tirantes de fijación al techo */}
      {[-1.6, 1.6].map((x, i) => (
        <Box key={i} args={[0.02, 0.2, 0.02]} position={[x, 0.15, 0]}>
          <meshStandardMaterial color="#0b0d0c" metalness={0.9} roughness={0.2} />
        </Box>
      ))}
      {/* Tubos fluorescentes dobles */}
      {[-0.12, 0.12].map((z, i) => (
        <mesh key={i} position={[0, -0.1, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.032, 0.032, 3.4, 12]} />
          <meshStandardMaterial
            ref={i === 0 ? tubeMatRef : null}
            color="#8fa37e"
            emissive="#a6bfa0"
            emissiveIntensity={1.2}
            roughness={0.3}
          />
        </mesh>
      ))}
      {/* Rejilla de protección industrial */}
      <Box args={[3.6, 0.02, 0.48]} position={[0, -0.16, 0]}>
        <meshStandardMaterial color="#2d332f" metalness={0.8} roughness={0.4} wireframe />
      </Box>
      {/* Foco de luz verdosa sucia institucional */}
      <spotLight
        ref={lightRef}
        position={[0, -0.2, 0]}
        target-position={[0, -4, 0]}
        angle={1.15}
        penumbra={0.85}
        intensity={420}
        distance={14}
        color="#8da57a"
        castShadow
        shadow-mapSize={[512, 512]}
        shadow-bias={-0.0003}
      />
    </group>
  );
};



const FilingCabinet = ({ position = [8.3, -1.9, -4.2], rotation = [0, -0.35, 0] }) => (
  <group position={position} rotation={rotation}>
    {/* Estructura del archivador de 4 cajones */}
    <Box args={[1.3, 4.2, 1.5]} position={[0, 0, 0]} castShadow receiveShadow>
      <meshStandardMaterial color="#1f2622" roughness={0.65} metalness={0.55} />
    </Box>
    {/* 4 Cajones metálicos con manijas */}
    {[-1.4, -0.45, 0.5, 1.45].map((y, i) => (
      <group key={i} position={[0, y, 0.76]}>
        <Box args={[1.18, 0.82, 0.04]} castShadow>
          <meshStandardMaterial color="#262f2a" roughness={0.55} metalness={0.6} />
        </Box>
        {/* Manija cromada */}
        <Box args={[0.34, 0.05, 0.08]} position={[0, 0.05, 0.04]}>
          <meshStandardMaterial color="#8a928e" metalness={0.8} roughness={0.3} />
        </Box>
        {/* Porta-etiquetas */}
        <Box args={[0.22, 0.12, 0.02]} position={[0, -0.15, 0.03]}>
          <meshStandardMaterial color="#dfd4b8" roughness={0.9} />
        </Box>
      </group>
    ))}
  </group>
);

const OfficeShelf = ({ position = [9.1, -1.1, 1.5], rotation = [0, -Math.PI / 2, 0] }) => (
  <group position={position} rotation={rotation}>
    {/* Armazón metálico de la estantería */}
    <Box args={[3.2, 5.4, 0.8]} position={[0, 0, 0]} castShadow receiveShadow>
      <meshStandardMaterial color="#161816" roughness={0.7} metalness={0.7} />
    </Box>
    {/* 4 Baldas con archivadores y cajas de historiales clínicos */}
    {[-1.8, -0.6, 0.6, 1.8].map((y, shelfIdx) => (
      <group key={shelfIdx} position={[0, y, 0]}>
        <Box args={[3.1, 0.06, 0.74]} position={[0, -0.38, 0]}>
          <meshStandardMaterial color="#252725" metalness={0.6} />
        </Box>
        {/* Fila de carpetas y archivadores de cartón */}
        {[-1.2, -0.8, -0.4, 0, 0.4, 0.8, 1.1].map((x, fileIdx) => {
          const colors = ['#1e293b', '#3b1c1c', '#1e382b', '#42331c', '#27272a'];
          const color = colors[(shelfIdx + fileIdx) % colors.length];
          return (
            <Box key={fileIdx} args={[0.22, 0.7, 0.52]} position={[x, 0, 0.04]} castShadow>
              <meshStandardMaterial color={color} roughness={0.85} />
            </Box>
          );
        })}
      </group>
    ))}
  </group>
);

const InvestigationCorkboard = ({ isCamcorderActive = false }) => (
  <group position={[1.8, 2.2, -5.14]}>
    {/* Marco de madera de la pizarra */}
    <Box args={[3.6, 2.2, 0.08]} castShadow>
      <meshStandardMaterial color="#3a2717" roughness={0.9} />
    </Box>
    {/* Tablero de corcho */}
    <Plane args={[3.4, 2.0]} position={[0, 0, 0.045]}>
      <meshStandardMaterial color="#916a47" roughness={0.95} />
    </Plane>
    {/* Hojas y notas de investigación clavadas */}
    {[
      [-1.1, 0.4, 0.05, 0.08, '#d4c9aa'],
      [-0.4, 0.5, 0.052, -0.05, '#e0d8c2'],
      [0.6, 0.3, 0.05, 0.03, '#bfb291'],
      [1.1, -0.3, 0.052, -0.09, '#c8bc9f'],
      [-0.8, -0.4, 0.051, 0.12, '#8a0303'],
      [0.1, -0.35, 0.053, -0.02, '#ded3b6']
    ].map(([x, y, z, rot, col], idx) => (
      <Plane key={idx} args={[0.42, 0.54]} position={[x, y, z]} rotation={[0, 0, rot]}>
        <meshStandardMaterial color={col} roughness={0.9} />
      </Plane>
    ))}
    {/* Cordel rojo de conexión de pistas */}
    <Box args={[1.5, 0.015, 0.02]} position={[-0.3, 0.1, 0.056]} rotation={[0, 0, -0.35]}>
      <meshBasicMaterial color="#b30000" />
    </Box>

    {/* Credenciales de acceso escritas en la pared debajo del tablero con fuente Humble Wall */}
    <group scale={isCamcorderActive ? 1 : 0} position={[0, -1.45, 0.015]} rotation={[0, 0, -0.025]}>
      <Text
        font={assetPath('assets/fonts/HumbleWall.ttf')}
        fontSize={0.28}
        color="#4e0505"
        letterSpacing={0.06}
        anchorX="center"
        anchorY="middle"
      >
        USUARIO: crojas
      </Text>
      <Text
        position={[0, -0.34, 0]}
        font={assetPath('assets/fonts/HumbleWall.ttf')}
        fontSize={0.28}
        color="#4e0505"
        letterSpacing={0.06}
        anchorX="center"
        anchorY="middle"
      >
        {`PASSWORD: ${TERMINAL_PASSWORD}`}
      </Text>

      {/* Chorretones de sangre seca debajo de las credenciales */}
      {[-0.65, -0.15, 0.45].map((dx, i) => (
        <Box
          key={i}
          args={[0.02, 0.28 + i * 0.08, 0.003]}
          position={[dx, -0.56 - i * 0.04, 0.002]}
        >
          <meshStandardMaterial color="#350303" roughness={0.7} opacity={0.9} transparent />
        </Box>
      ))}
    </group>
  </group>
);

const AirDuctVent = () => (
  <group position={[-9.45, 2.2, -1]} rotation={[0, Math.PI / 2, 0]}>
    {/* Marco metálico del conducto de ventilación */}
    <Box args={[1.8, 1.2, 0.1]} castShadow>
      <meshStandardMaterial color="#222624" roughness={0.6} metalness={0.7} />
    </Box>
    {/* Interior oscuro */}
    <Plane args={[1.55, 0.95]} position={[0, 0, 0.052]}>
      <meshBasicMaterial color="#020403" />
    </Plane>
    {/* Lamas horizontales de la rejilla */}
    {[-0.35, -0.2, -0.05, 0.1, 0.25, 0.4].map((y, i) => (
      <Box key={i} args={[1.52, 0.04, 0.03]} position={[0, y, 0.06]}>
        <meshStandardMaterial color="#424744" metalness={0.7} roughness={0.5} />
      </Box>
    ))}
  </group>
);

const AnatomicalSkeleton = () => {
  const { scene } = useGLTF(assetPath('assets/models/black_death_rigged.glb'), true, true, registerCharacterMaterials);
  const animationData = useLoader(THREE.FileLoader, assetPath('assets/animations/black-death.json'));
  const animations = useMemo(
    () => JSON.parse(animationData).map((clip) => THREE.AnimationClip.parse(clip)),
    [animationData],
  );
  const { skeletonModel, scale, offset } = useMemo(() => {
    const model = cloneSkeleton(scene);
    prepareCharacterRig(model);
    const bounds = new THREE.Box3().setFromObject(model);
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    return {
      skeletonModel: model,
      scale: 7.8 / Math.max(size.y, 0.001),
      offset: [-center.x, -bounds.min.y, -center.z],
    };
  }, [scene]);
  const mixer = useMemo(() => new THREE.AnimationMixer(skeletonModel), [skeletonModel]);

  useFrame((_, delta) => mixer.update(Math.min(delta, 0.1)));

  useEffect(() => {
    skeletonModel.traverse((object) => {
      if (!object.isMesh) return;
      object.castShadow = true;
      object.receiveShadow = true;
      object.frustumCulled = false;
    });
    mixer.clipAction(animations.find((clip) => clip.name === 'Old Man Idle'))
      .setLoop(THREE.LoopRepeat, Infinity)
      .play();
    return () => {
      mixer.stopAllAction();
      mixer.uncacheRoot(skeletonModel);
    };
  }, [skeletonModel, animations, mixer]);

  return (
    <group position={[-7.6, -3.97, -3.8]} rotation={[0, Math.PI * 0.25, 0]} scale={scale}>
      <group position={offset}>
        <primitive object={skeletonModel} dispose={null} />
      </group>
    </group>
  );
};

// Linterna Infrarroja (IR Spotlight) fijada directamente al visor óptico de la cámara
const CamcorderIRSpotlight = ({ active, zoom = 1.0 }) => {
  const spotRef = useRef();
  const fillLightRef = useRef();
  const targetRef = useRef();
  const { camera, scene } = useThree();

  useEffect(() => {
    const targetObj = new THREE.Object3D();
    targetObj.name = 'IRSpotTarget';
    scene.add(targetObj);
    targetRef.current = targetObj;

    return () => {
      scene.remove(targetObj);
    };
  }, [scene]);

  useFrame(() => {
    if (!active) {
      if (spotRef.current) spotRef.current.intensity = 0;
      if (fillLightRef.current) fillLightRef.current.intensity = 0;
      return;
    }

    if (spotRef.current && targetRef.current) {
      spotRef.current.position.copy(camera.position);

      const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
      targetRef.current.position.copy(camera.position).add(forward.multiplyScalar(20));
      targetRef.current.updateMatrixWorld();

      spotRef.current.target = targetRef.current;
      spotRef.current.intensity = 1350 * Math.min(1.8, zoom);
    }

    if (fillLightRef.current) {
      fillLightRef.current.position.copy(camera.position);
      fillLightRef.current.intensity = 24;
    }
  });

  return (
    <>
      <spotLight
        ref={spotRef}
        intensity={0}
        distance={38}
        angle={0.92}
        penumbra={0.8}
        color="#85ff9e"
        decay={1.1}
        castShadow={false}
      />
      <pointLight
        ref={fillLightRef}
        intensity={0}
        distance={18}
        color="#25753e"
        decay={1.1}
      />
    </>
  );
};

// Material PBR para los muros de bloques de hormigón del hospital psiquiátrico (Foto 1)
const HospitalWallMaterial = ({ repeat = [5.5, 2.6], color = '#7c8b83' }) => {
  const [diffuse, normal, roughness] = useTexture([
    assetPath('assets/textures/wall/concrete_block_wall_diff_1k.jpg'),
    assetPath('assets/textures/wall/concrete_block_wall_nor_1k.jpg'),
    assetPath('assets/textures/wall/concrete_block_wall_rough_1k.jpg')
  ]);

  useEffect(() => {
    [diffuse, normal, roughness].forEach((tex) => {
      if (tex) {
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(repeat[0], repeat[1]);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.needsUpdate = true;
      }
    });
  }, [diffuse, normal, roughness, repeat]);

  return (
    <meshStandardMaterial
      map={diffuse}
      normalMap={normal}
      roughnessMap={roughness}
      color={color}
      roughness={0.92}
      metalness={0.04}
    />
  );
};

const Room = ({ isCamcorderActive = false }) => (
  <group>
    {/* Suelo: Baldosas clínicas institucionales de hospital manchadas y desgastadas */}
    <Plane args={[20, 14]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -4, 1.2]} receiveShadow>
      <meshStandardMaterial color="#0c0e0d" roughness={0.84} metalness={0.15} />
    </Plane>

    {/* Techo completamente cerrado: Placas acústicas industriales */}
    <Plane args={[20, 14]} rotation={[Math.PI / 2, 0, 0]} position={[0, 5.2, 1.2]} receiveShadow>
      <meshStandardMaterial color="#080a09" roughness={0.95} />
    </Plane>

    {/* Lámparas fluorescentes parpadeantes de hospital con luz verdosa sucia */}
    <FlickeringFluorescentFixture position={[0, 5.05, 0.8]} isCamcorderActive={isCamcorderActive} />
    <FlickeringFluorescentFixture position={[-4.5, 5.05, -1.8]} isCamcorderActive={isCamcorderActive} />

    {/* Paredes con textura PBR de bloques de hormigón y zócalo institucional (Referencia Foto 1) */}
    <Suspense fallback={null}>
      {/* Pared Frontal con división de bloques superiores y base más oscura */}
      <group position={[0, 0.6, -5.2]}>
        <Plane args={[20, 6.4]} position={[0, 1.5, 0]} receiveShadow>
          <HospitalWallMaterial repeat={[5.5, 1.8]} color="#88968f" />
        </Plane>
        {/* Moldura divisoria de mortero / zócalo intermedio */}
        <Box args={[20, 0.12, 0.05]} position={[0, -1.7, 0.02]} receiveShadow>
          <meshStandardMaterial color="#2d332e" roughness={0.8} />
        </Box>
        {/* Sección inferior más oscura con pátina y humedad */}
        <Plane args={[20, 2.8]} position={[0, -3.1, 0]} receiveShadow>
          <HospitalWallMaterial repeat={[5.5, 0.8]} color="#48534c" />
        </Plane>
      </group>

      {/* Pared Trasera */}
      <Plane args={[20, 9.4]} rotation={[0, Math.PI, 0]} position={[0, 0.6, 7.5]} receiveShadow>
        <HospitalWallMaterial repeat={[5.5, 2.6]} color="#7c8880" />
      </Plane>

      {/* Pared Izquierda */}
      <Plane args={[14, 9.4]} rotation={[0, Math.PI / 2, 0]} position={[-9.5, 0.6, 1.2]} receiveShadow>
        <HospitalWallMaterial repeat={[4.0, 2.6]} color="#808d86" />
      </Plane>

      {/* Pared Derecha */}
      <Plane args={[14, 9.4]} rotation={[0, -Math.PI / 2, 0]} position={[9.5, 0.6, 1.2]} receiveShadow>
        <HospitalWallMaterial repeat={[4.0, 2.6]} color="#808d86" />
      </Plane>
    </Suspense>

    {/* Zócalo de suelo */}
    <Box args={[20, 0.35, 0.1]} position={[0, -3.85, -5.15]} receiveShadow>
      <meshStandardMaterial color="#070908" roughness={0.7} metalness={0.3} />
    </Box>
    <Box args={[20, 0.35, 0.1]} position={[0, -3.85, 7.45]} receiveShadow>
      <meshStandardMaterial color="#070908" roughness={0.7} metalness={0.3} />
    </Box>
    <Box args={[0.1, 0.35, 14]} position={[-9.45, -3.85, 1.2]} receiveShadow>
      <meshStandardMaterial color="#070908" roughness={0.7} metalness={0.3} />
    </Box>
    <Box args={[0.1, 0.35, 14]} position={[9.45, -3.85, 1.2]} receiveShadow>
      <meshStandardMaterial color="#070908" roughness={0.7} metalness={0.3} />
    </Box>

    {/* Rótulo de SALIDA iluminado en rojo sobre la puerta pesada (ahora a y = 3.7 directamente sobre el marco) */}
    <AsylumExitSign position={[6.2, 3.7, -5.12]} />

    {/* Mensajes en sangre de pacientes / Padre Martin sobre los muros (solo con videocámara) */}
    <BloodWallWritings isCamcorderActive={isCamcorderActive} />

    {/* Regueros de sangre, salpicaduras y marcas de arrastre estilo Outlast */}
    <Suspense fallback={null}>
      {/* Rastro de arrastre que sale por debajo de la puerta hacia el pasillo */}
      <BloodTextureStain file="bloodslash_heavy.png" position={[6.2, -3.97, -3.6]} rotation={1.57} size={[3.2, 1.8]} opacity={0.75} />
      {/* Salpicaduras de sangre en la pared cerca de la puerta */}
      <BloodTextureStain file="bloodspray.png" position={[5.2, 0.4, -5.13]} planeRotation={[0, 0, 0.25]} size={[2.2, 1.4]} opacity={0.65} />
      {/* Mancha y salpicón vertical en la pared detrás del escritorio */}
      <BloodTextureStain file="bloodslash1.png" position={[-1.2, 2.6, -5.13]} planeRotation={[0, 0, -0.15]} size={[2.4, 1.3]} opacity={0.68} />
      {/* Charco bajo la peana del esqueleto anatómico */}
      <BloodTextureStain file="bloodsplat.png" position={[-7.6, -3.97, -3.8]} rotation={0.4} size={[2.4, 1.5]} opacity={0.65} />
    </Suspense>

    {/* Elementos arquitectónicos y de atrezo de la oficina */}
    <AsylumDoor isCamcorderActive={isCamcorderActive} />
    <OfficeShelf />
    <InvestigationCorkboard isCamcorderActive={isCamcorderActive} />
    <AirDuctVent />
    <Suspense fallback={null}>
      <AnatomicalSkeleton />
    </Suspense>
  </group>
);


const makeTexture = (kind) => {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (kind === 'grime') {
    ctx.clearRect(0, 0, 512, 512);
    for (let i = 0; i < 88; i += 1) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const radius = 12 + Math.random() * 66;
      const patch = ctx.createRadialGradient(x, y, 0, x, y, radius);
      patch.addColorStop(0, `rgba(13, 8, 4, ${0.06 + Math.random() * 0.18})`);
      patch.addColorStop(0.62, `rgba(36, 21, 10, ${0.02 + Math.random() * 0.1})`);
      patch.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = patch;
      ctx.beginPath();
      ctx.ellipse(x, y, radius, radius * (0.22 + Math.random() * 0.42), Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    for (let i = 0; i < 70; i += 1) {
      ctx.strokeStyle = `rgba(9, 6, 3, ${0.12 + Math.random() * 0.22})`;
      ctx.lineWidth = 0.4 + Math.random() * 1.8;
      ctx.beginPath();
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      ctx.moveTo(x, y);
      ctx.lineTo(x + 15 + Math.random() * 72, y - 4 + Math.random() * 8);
      ctx.stroke();
    }
  } else if (kind === 'blood') {
    ctx.clearRect(0, 0, 512, 512);
    ctx.save();
    ctx.filter = 'blur(1.8px)';
    const smear = ctx.createRadialGradient(245, 250, 16, 245, 250, 180);
    smear.addColorStop(0, 'rgba(78, 4, 3, 0.94)');
    smear.addColorStop(0.48, 'rgba(69, 5, 3, 0.7)');
    smear.addColorStop(1, 'rgba(42, 3, 2, 0)');
    ctx.fillStyle = smear;
    ctx.beginPath();
    ctx.ellipse(250, 250, 170, 82, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    for (let i = 0; i < 42; i += 1) {
      const x = 90 + Math.random() * 340;
      const y = 90 + Math.random() * 320;
      const radius = 1 + Math.random() * 10;
      ctx.fillStyle = `rgba(${50 + Math.floor(Math.random() * 38)}, ${2 + Math.floor(Math.random() * 10)}, 2, ${0.28 + Math.random() * 0.55})`;
      ctx.beginPath();
      ctx.ellipse(x, y, radius * (0.45 + Math.random()), radius, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (kind === 'wood') {
    ctx.fillStyle = '#382315';
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 780; i += 1) {
      const y = Math.random() * 512;
      const shade = Math.floor(18 + Math.random() * 42);
      ctx.strokeStyle = `rgba(${shade + 36}, ${shade + 13}, ${Math.max(5, shade - 5)}, ${0.12 + Math.random() * 0.28})`;
      ctx.lineWidth = 0.5 + Math.random() * 2.4;
      ctx.beginPath();
      ctx.moveTo(-20, y);
      ctx.bezierCurveTo(120, y - 8 + Math.random() * 16, 330, y + (Math.random() - 0.5) * 22, 532, y + (Math.random() - 0.5) * 11);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(9, 6, 3, 0.34)';
    for (let i = 0; i < 42; i += 1) {
      ctx.beginPath();
      ctx.ellipse(Math.random() * 512, Math.random() * 512, 4 + Math.random() * 18, 1 + Math.random() * 4, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    // Polvo adherido y pequeñas marcas oscuras acumuladas en la madera.
    for (let i = 0; i < 340; i += 1) {
      ctx.fillStyle = `rgba(8, 6, 4, ${0.06 + Math.random() * 0.2})`;
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 1 + Math.random() * 7, 1 + Math.random() * 3);
    }
  } else {
    ctx.fillStyle = '#b9ad8f';
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 4500; i += 1) {
      const alpha = 0.025 + Math.random() * 0.08;
      ctx.fillStyle = Math.random() > 0.5 ? `rgba(70, 50, 30, ${alpha})` : `rgba(255, 245, 210, ${alpha})`;
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 1 + Math.random() * 2, 1 + Math.random() * 2);
    }
    for (let i = 0; i < 38; i += 1) {
      ctx.strokeStyle = `rgba(71, 51, 28, ${0.025 + Math.random() * 0.04})`;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(0, Math.random() * 512);
      ctx.lineTo(512, Math.random() * 512);
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(kind === 'wood' ? 2.4 : 1.5, kind === 'wood' ? 1 : 1.5);
  return texture;
};

const BloodStain = ({ position, rotation = 0, size = [1.4, 0.7], opacity = 0.82 }) => {
  const bloodTexture = useMemo(() => makeTexture('blood'), []);
  useEffect(() => () => bloodTexture.dispose(), [bloodTexture]);
  return (
    <Plane args={size} rotation={[-Math.PI / 2, 0, rotation]} position={position} receiveShadow>
      <meshBasicMaterial map={bloodTexture} transparent opacity={opacity} depthWrite={false} side={THREE.DoubleSide} />
    </Plane>
  );
};

const BloodTextureStain = ({ file, position, rotation = 0, planeRotation = null, size, opacity = 1 }) => {
  const sourceTexture = useTexture(assetPath(`assets/textures/BlueRoseSonata%20Blood%20FX%20Pack/${file}`));

  useEffect(() => {
    if (sourceTexture) {
      sourceTexture.colorSpace = THREE.SRGBColorSpace;
      sourceTexture.needsUpdate = true;
    }
  }, [sourceTexture]);

  const finalRotation = planeRotation || [-Math.PI / 2, 0, rotation];

  return (
    <Plane args={size} rotation={finalRotation} position={position}>
      <meshStandardMaterial
        map={sourceTexture}
        transparent
        opacity={opacity}
        alphaTest={0.02}
        depthWrite={false}
        polygonOffset
        polygonOffsetFactor={-1}
        roughness={0.65}
        metalness={0.05}
        side={THREE.DoubleSide}
      />
    </Plane>
  );
};

const GrimeLayer = () => {
  const grimeTexture = useMemo(() => makeTexture('grime'), []);
  useEffect(() => () => grimeTexture.dispose(), [grimeTexture]);
  return (
    <Plane args={[10, 5.72]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.069, 0]} receiveShadow>
      <meshBasicMaterial map={grimeTexture} transparent opacity={0.86} depthWrite={false} side={THREE.DoubleSide} />
    </Plane>
  );
};

export { BloodTextureStain, CamcorderIRSpotlight, GrimeLayer, Room, makeTexture };

