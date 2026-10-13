import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// ---- Camera Controller (Breathing, Fear Tremor, Mouse Look, Dynamic Optical Zoom & 90-degree Turns) ----
const CameraController = ({
  target,
  onReachedTarget,
  isCamcorderActive,
  zoomLevel = 1.0,
  baseYaw = 0
}) => {
  const { camera, clock } = useThree();
  const basePos = new THREE.Vector3(0, 3.5, 4);
  const currentYaw = useRef(0);

  // Usar orden de Euler 'YXZ' para evitar bloqueos de cardán y rotar la cabeza limpiamente
  useEffect(() => {
    camera.rotation.order = 'YXZ';
  }, [camera]);

  useFrame((state) => {
    const time = clock.getElapsedTime();

    // Zoom óptico analógico dinámico: reduce el FOV para ampliar la vista como en Outlast
    const baseFov = 60;
    const targetFov = isCamcorderActive ? baseFov / zoomLevel : baseFov;
    if (Math.abs(camera.fov - targetFov) > 0.02) {
      camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, 0.16);
      camera.updateProjectionMatrix();
    }

    if (target === 'none') {
      const targetX = (state.pointer.x * Math.PI) / 5;
      const targetY = (state.pointer.y * Math.PI) / 8 - 0.2;

      // Temblor de pulso nervioso y miedo al sostener la cámara (Outlast handheld camera jitter)
      const tremorX = isCamcorderActive ? (Math.sin(time * 24) * 0.0035 + Math.cos(time * 38) * 0.002) : 0;
      const tremorY = isCamcorderActive ? (Math.cos(time * 20) * 0.0035 + Math.sin(time * 34) * 0.002) : 0;

      // Interpolación suave hacia el nuevo ángulo de 90° (baseYaw)
      currentYaw.current = THREE.MathUtils.lerp(currentYaw.current, baseYaw, 0.08);

      const targetYaw = currentYaw.current - targetX + tremorX;
      camera.rotation.y = THREE.MathUtils.lerp(camera.rotation.y, targetYaw, 0.08);
      camera.rotation.x = THREE.MathUtils.lerp(camera.rotation.x, targetY + tremorY, 0.08);

      // Respiración más agitada e irregular en visión nocturna
      const breathIntensity = isCamcorderActive ? 0.065 : 0.04;
      const breathSpeed = isCamcorderActive ? 2.1 : 1.4;
      const breathing = Math.sin(time * breathSpeed) * breathIntensity;

      const targetPos = basePos.clone();
      targetPos.y += breathing;
      camera.position.lerp(targetPos, 0.05);
    }
    else if (target === 'document') {
      currentYaw.current = THREE.MathUtils.lerp(currentYaw.current, 0, 0.1);
      const docPos = new THREE.Vector3(1.5, 1.8, 1.2);
      camera.position.lerp(docPos, 0.08);

      const lookTarget = new THREE.Vector3(1.5, 0, 0.5);
      const currentLookAt = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).add(camera.position);
      currentLookAt.lerp(lookTarget, 0.1);
      camera.lookAt(currentLookAt);

      if (camera.position.distanceTo(docPos) < 0.1) onReachedTarget('document');
    }
    else if (target === 'terminal') {
      currentYaw.current = THREE.MathUtils.lerp(currentYaw.current, 0, 0.1);
      // Cámara centrada perpendicular a la pantalla para que el monitor ocupe ~75% de la vista con el entorno 3D visible
      const monPos = new THREE.Vector3(-1.46, 1.52, 1.66);
      camera.position.lerp(monPos, 0.08);

      const lookTarget = new THREE.Vector3(-1.95, 1.52, -0.74);
      camera.lookAt(lookTarget);

      if (camera.position.distanceTo(monPos) < 0.08) onReachedTarget('terminal');
    }
    else if (target === 'scare' || target === 'scareHold') {
      const scarePos = new THREE.Vector3(0, 3.5, 4);
      const scareTarget = new THREE.Vector3(-7.6, 0.3, -3.8);
      const targetRotation = new THREE.Quaternion().setFromRotationMatrix(
        new THREE.Matrix4().lookAt(camera.position, scareTarget, camera.up),
      );

      camera.position.lerp(scarePos, 0.04);
      camera.quaternion.slerp(targetRotation, 0.025);

      if (target === 'scare' && camera.position.distanceTo(scarePos) < 0.12 && camera.quaternion.angleTo(targetRotation) < 0.04) {
        onReachedTarget('scare');
      }
    }
  });

  return null;
};

export default CameraController;

