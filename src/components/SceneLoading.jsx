import { useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useProgress } from '@react-three/drei';

export function SceneReady({ onReady }) {
  const { gl, scene, camera, invalidate } = useThree();
  const ready = useRef(false);
  const stable = useRef(0);
  const compiling = useRef(false);
  useFrame((_, delta) => {
    const progress = useProgress.getState();
    if (ready.current || compiling.current) return;
    if (progress.active || progress.errors.length) { stable.current = 0; return; }
    stable.current += delta;
    if (stable.current < 0.5) return;
    compiling.current = true;
    const count = progress.loaded;
    Promise.resolve(gl.compileAsync ? gl.compileAsync(scene, camera) : gl.compile(scene, camera))
      .then(() => {
        const latest = useProgress.getState();
        if (!latest.active && !latest.errors.length && latest.loaded === count) {
          ready.current = true;
          invalidate();
          onReady();
        }
      })
      .catch(error => console.error('No se pudo preparar la escena', error))
      .finally(() => { compiling.current = false; stable.current = 0; });
  });
  return null;
}

export default function SceneLoading() {
  const { active, item, loaded, total, errors } = useProgress();
  const label = item.includes('black_death') ? 'Preparando la parca' :
    item.includes('animations') ? 'Cargando movimientos' :
    item.includes('models') ? 'Cargando objetos del despacho' :
    item.includes('textures') || item.startsWith('blob:') ? 'Cargando materiales y texturas' :
    'Preparando la iluminación';
  return (
    <div className="scene-loading" role="status" aria-live="polite">
      <div className="scene-loading-grain" />
      <div className="scene-loading-content">
        <p className="scene-loading-eyebrow">PORTAFOLIO · INGENIERÍA EN PROGRAMACIÓN</p>
        <h1>ENTRANDO AL DESPACHO</h1>
        <span className="scene-loading-spinner" aria-hidden="true" />
        <p key={label} className="scene-loading-label">{errors.length ? 'No se pudo cargar un recurso' : active ? label : 'Preparando la escena para entrar'}</p>
        <p className="scene-loading-count">{loaded} / {total} recursos procesados</p>
        {errors.length > 0 && <button onClick={() => window.location.reload()}>REINTENTAR CARGA</button>}
        <p className="scene-loading-hint">La oscuridad oculta más de lo que parece.</p>
      </div>
    </div>
  );
}
