import { Suspense, useState, useEffect, useRef, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { assetPath } from '../utils/assetPath.js';
import SceneLoading, { SceneReady } from './SceneLoading.jsx';
import { playSound } from '../utils/audioManager.js';
import InvestigationFiles from './InvestigationFiles.jsx';
import CamcorderOverlay from './CamcorderOverlay.jsx';
import ProfileOverlay from './ProfileOverlay.jsx';
import MainMenu from './MainMenu.jsx';
import CameraController from './scene/CameraController.jsx';
import { Clutter, Desk, DocumentFolder, FloatingDust, InteractiveCamera, Monitor } from './scene/DeskSetup.jsx';
import { CamcorderIRSpotlight, Room } from './scene/SceneEnvironment.jsx';

// ---- Main Scene Component ----
export default function DesktopScene() {
  const [isInMainMenu, setIsInMainMenu] = useState(true);
  const [sceneReady, setSceneReady] = useState(false);
  const [isCamcorderPrewarming, setIsCamcorderPrewarming] = useState(true);
  const [isJumpscarePlaying, setIsJumpscarePlaying] = useState(false);
  const [isJumpscareReady, setIsJumpscareReady] = useState(false);
  const [isTransitionBlack, setIsTransitionBlack] = useState(false);
  const jumpscareRef = useRef(null);
  const transitionTimerRef = useRef(null);
  const scareDelayRef = useRef(null);
  const isTransitioningRef = useRef(false);
  const isScareSequenceRef = useRef(false);
  const startGame = () => setIsInMainMenu(false);
  const [animatingTo, setAnimatingTo] = useState('none');
  const [activeOverlay, setActiveOverlay] = useState('none');
  const [hoveredItem, setHoveredItem] = useState(null); // 'terminal' | 'document' | 'camcorder' | null
  const [isCamcorderActive, setIsCamcorderActive] = useState(false);
  const isCamcorderVisualActive = isCamcorderActive;
  const [isCameraOnDesk, setIsCameraOnDesk] = useState(true);
  const [sensorFlash, setSensorFlash] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [baseYaw, setBaseYaw] = useState(0); // Ángulo base de rotación en pasos de 90°
  const lastTurnTime = useRef(0);

  const runBlackTransition = useCallback((action) => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    setIsTransitionBlack(true);
    transitionTimerRef.current = setTimeout(() => {
      action();
      requestAnimationFrame(() => setIsTransitionBlack(false));
      isTransitioningRef.current = false;
    }, 500);
  }, []);

  useEffect(() => () => {
    clearTimeout(transitionTimerRef.current);
    clearTimeout(scareDelayRef.current);
  }, []);

  const setCamcorderState = useCallback((active, silent = false) => {
    if (active) {
      if (!silent) playSound('camera_pickup', 0.95);
      setIsCameraOnDesk(false);
      setHoveredItem(null);
      setSensorFlash(true);
      setTimeout(() => setSensorFlash(false), 60);
      setIsCamcorderActive(true);
      setZoomLevel(1.0);
    } else {
      if (!silent) playSound('nightvision_off', 0.85);
      setIsCamcorderActive(false);
      setIsCameraOnDesk(true);
      setHoveredItem(null);
      setZoomLevel(1.0);
    }
  }, []);

  const markSceneReady = useCallback(() => {
    setCamcorderState(true, true);
    let frames = 0;
    const finishPrewarm = () => {
      if (++frames < 8) return requestAnimationFrame(finishPrewarm);
      setCamcorderState(false, true);
      requestAnimationFrame(() => {
        setIsCamcorderPrewarming(false);
        requestAnimationFrame(() => setSceneReady(true));
      });
    };
    requestAnimationFrame(finishPrewarm);
  }, [setCamcorderState]);

  // Sonido ambiental tétrico y pesado de Outlast en bucle continuo
  const ambientAudioRef = useRef(null);

  useEffect(() => {
    const audio = new Audio(assetPath('assets/sounds/ambiencesound.wav'));
    audio.loop = true;
    audio.volume = 0.22; // Nivel bajo y pesado para generar tensión inmersiva
    ambientAudioRef.current = audio;

    const startAmbience = () => {
      if (ambientAudioRef.current) {
        ambientAudioRef.current.play().catch(() => { });
      }
    };

    window.addEventListener('click', startAmbience, { once: true });
    window.addEventListener('keydown', startAmbience, { once: true });
    startAmbience();

    return () => {
      window.removeEventListener('click', startAmbience);
      window.removeEventListener('keydown', startAmbience);
      if (ambientAudioRef.current) {
        ambientAudioRef.current.pause();
        ambientAudioRef.current = null;
      }
    };
  }, []);

  // Intensidad adaptativa con la videocámara activa
  useEffect(() => {
    if (ambientAudioRef.current) {
      ambientAudioRef.current.volume = isCamcorderActive ? 0.28 : 0.20;
    }
  }, [isCamcorderActive]);

  const playTurnSound = () => {
    playSound('camera_turn', 0.5);
  };

  const handleTurn = (direction) => {
    if (!sceneReady) return;
    if (activeOverlay !== 'none') return;
    const now = Date.now();
    if (now - lastTurnTime.current < 280) return; // Cooldown para evitar giros involuntarios dobles
    lastTurnTime.current = now;

    playTurnSound();
    setBaseYaw((prev) => (direction === 'right' ? prev - Math.PI / 2 : prev + Math.PI / 2));
  };

  const handleOpen = (target) => {
    if (!sceneReady) return;
    setAnimatingTo(target);
  };

  const handleClose = () => {
    const closeView = () => {
      setActiveOverlay('none');
      setAnimatingTo('none');
    };

    if (activeOverlay === 'terminal' || animatingTo === 'terminal') runBlackTransition(closeView);
    else closeView();
  };

  const closeInvestigation = () => {
    if (animatingTo === 'terminal') {
      setActiveOverlay('terminal');
    } else {
      setActiveOverlay('none');
      setIsInMainMenu(true);
    }
  };

  const playJumpscare = () => {
    if (isScareSequenceRef.current) return;
    isScareSequenceRef.current = true;
    scareDelayRef.current = setTimeout(() => {
      runBlackTransition(() => {
        setActiveOverlay('none');
        setAnimatingTo('scare');
      });
    }, 1000);
  };

  const finishScareTurn = () => {
    setAnimatingTo('scareHold');
    scareDelayRef.current = setTimeout(() => {
      runBlackTransition(() => {
        setAnimatingTo('none');
        const video = jumpscareRef.current;
        if (!video) {
          isScareSequenceRef.current = false;
          return;
        }
        video.currentTime = 0;
        setIsJumpscarePlaying(true);
        video.play().catch(() => {
          setIsJumpscarePlaying(false);
          isScareSequenceRef.current = false;
        });
      });
    }, 900);
  };

  const handleToggleCamcorder = () => {
    runBlackTransition(() => setCamcorderState(!isCamcorderActive));
  };

  // Zoom interactivo con la rueda del ratón (Scroll) mientras la videocámara está levantada
  useEffect(() => {
    if (!isCamcorderActive) return;

    const handleWheel = (e) => {
      e.preventDefault();
      setZoomLevel((prev) => {
        const delta = e.deltaY > 0 ? -0.18 : 0.18;
        const next = Math.min(2.8, Math.max(1.0, prev + delta));
        return parseFloat(next.toFixed(2));
      });
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [isCamcorderActive]);



  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!sceneReady) return;
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === 'Escape') {
        if (activeOverlay === 'investigation') {
          closeInvestigation();
        } else if (isInMainMenu) {
          return;
        } else if (activeOverlay !== 'none' || animatingTo === 'terminal') {
          handleClose();
        } else if (isCamcorderActive) {
          handleToggleCamcorder();
        } else {
          setIsInMainMenu(true);
        }
      } else if (activeOverlay === 'none' && animatingTo !== 'terminal' && !isInMainMenu) {
        if (e.key.toLowerCase() === 'f' && !isCamcorderActive) {
          handleToggleCamcorder();
          return;
        }
        // Atajos de teclado para girar 90° libremente
        if (e.key === 'ArrowRight' || e.key === 'e' || e.key === 'E') {
          handleTurn('right');
        } else if (e.key === 'ArrowLeft' || e.key === 'q' || e.key === 'Q') {
          handleTurn('left');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeOverlay, animatingTo, isCamcorderActive, sceneReady, isInMainMenu]);

  return (
    <div className="w-screen h-screen relative bg-black overflow-hidden outlast-cursor">
      <div className={`camera-viewport w-full h-full ${isCamcorderVisualActive ? 'outlast-nightvision-viewport' : ''}`}>
        <Canvas dpr={[1, 1.5]} frameloop={isInMainMenu && sceneReady ? 'demand' : 'always'} camera={{ position: [0, 3.5, 4], fov: 60 }}>
          <color attach="background" args={['#020403']} />
          <fog attach="fog" args={['#020503', 2.0, isCamcorderVisualActive ? 16 : 13]} />

          {/* Iluminación base adaptada: En visión nocturna el ambiente mantiene oscuridad tétrica de Outlast */}
          <ambientLight
            intensity={isCamcorderVisualActive ? 0.22 : 0.08}
            color={isCamcorderVisualActive ? "#183e25" : "#16221a"}
          />
          <hemisphereLight
            args={isCamcorderVisualActive ? ['#285936', '#0a1a10', 0.4] : ['#29362c', '#080c09', 0.22]}
          />

          {/* Rebote ambiental de hospital psiquiátrico */}
          <pointLight
            position={[-5, 1.5, -1]}
            intensity={isCamcorderVisualActive ? 7 : 11}
            distance={7.5}
            color={isCamcorderVisualActive ? "#266b3d" : "#1c3629"}
          />
          <pointLight
            position={[-3.8, 1.15, 0.7]}
            intensity={isCamcorderVisualActive ? 4 : 5}
            distance={5.0}
            color={isCamcorderVisualActive ? "#215733" : "#1d3628"}
          />

          {/* Linterna Infrarroja (IR Spotlight) que ilumina hacia donde mira el jugador con zoom dinámico */}
          <CamcorderIRSpotlight active={isCamcorderVisualActive} zoom={zoomLevel} />

          <Room isCamcorderActive={isCamcorderVisualActive} />
          <Suspense fallback={null}>
            <Desk />
            <Monitor
              onClick={() => handleOpen('terminal')}
              isZooming={animatingTo !== 'none'}
              isScreenActive={animatingTo === 'terminal' || activeOverlay === 'terminal'}
              isInMainMenu={isInMainMenu}
              onClose={handleClose}
              onLoginFailure={playJumpscare}
              onOpenInvestigation={() => setActiveOverlay('investigation')}
              onHover={setHoveredItem}
              onUnhover={() => setHoveredItem(null)}
            />
            <DocumentFolder
              onClick={() => handleOpen('document')}
              isZooming={animatingTo !== 'none'}
              onHover={setHoveredItem}
              onUnhover={() => setHoveredItem(null)}
            />
            {/* La cámara desaparece al agarrarla y solo reaparece en la mesa cuando la pantalla está completamente en negro */}
            <group visible={isCameraOnDesk}>
              <InteractiveCamera
                onClick={handleToggleCamcorder}
                isZooming={animatingTo !== 'none'}
                isActive={isCamcorderActive}
                onHover={setHoveredItem}
                onUnhover={() => setHoveredItem(null)}
              />
            </group>
            <Clutter />
          </Suspense>
          <FloatingDust isCamcorderActive={isCamcorderVisualActive} />

          <CameraController
            target={animatingTo}
            isCamcorderActive={isCamcorderActive}
            zoomLevel={zoomLevel}
            baseYaw={baseYaw}
            onReachedTarget={(target) => {
              if (target === 'scare') {
                finishScareTurn();
                return;
              }
              if (activeOverlay === 'none') setActiveOverlay(target);
            }}
          />

          <SceneReady onReady={markSceneReady} />
        </Canvas>
      </div>

      {/* Indicadores visuales interactivos de giro de 90° (Solo la flecha, visibles siempre y en modo videocámara) */}
      {activeOverlay === 'none' && animatingTo !== 'terminal' && !isInMainMenu && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleTurn('left');
            }}
            className={`fixed left-4 sm:left-8 top-1/2 -translate-y-1/2 z-[45] w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold transition-all duration-200 hover:scale-110 active:scale-95 shadow-[0_0_20px_rgba(0,0,0,0.85)] backdrop-blur-sm cursor-pointer select-none border ${isCamcorderActive
              ? 'bg-black/80 border-[#3dff84]/70 text-[#3dff84] shadow-[0_0_15px_rgba(61,255,132,0.5)] opacity-85 hover:opacity-100'
              : 'bg-black/75 border-white/30 hover:border-white text-white/80 hover:text-white opacity-70 hover:opacity-100'
              }`}
            title="Girar 90° a la izquierda (o pulsa Q / ◀)"
          >
            ◀
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleTurn('right');
            }}
            className={`fixed right-4 sm:right-8 top-1/2 -translate-y-1/2 z-[45] w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold transition-all duration-200 hover:scale-110 active:scale-95 shadow-[0_0_20px_rgba(0,0,0,0.85)] backdrop-blur-sm cursor-pointer select-none border ${isCamcorderActive
              ? 'bg-black/80 border-[#3dff84]/70 text-[#3dff84] shadow-[0_0_15px_rgba(61,255,132,0.5)] opacity-85 hover:opacity-100'
              : 'bg-black/75 border-white/30 hover:border-white text-white/80 hover:text-white opacity-70 hover:opacity-100'
              }`}
            title="Girar 90° a la derecha (o pulsa E / ▶)"
          >
            ▶
          </button>
        </>
      )}

      {/* Micro-destello de activación de sensor infrarrojo fosforescente (90ms, sin pantalla negra) */}
      {sensorFlash && (
        <div className="fixed inset-0 z-40 bg-[#52ff94]/15 pointer-events-none transition-opacity duration-100" />
      )}

      {/* Visión Nocturna y HUD de Videocámara Outlast (100% fiel a la referencia) */}
      <CamcorderOverlay
        isActive={isCamcorderActive}
        isPrewarming={isCamcorderPrewarming}
        onToggleActive={handleToggleCamcorder}
        zoom={zoomLevel}
        onZoomChange={setZoomLevel}
        isDocumentOrTerminalOpen={activeOverlay !== 'none' || animatingTo === 'terminal'}
      />

      {/* In-Game HUD Interaction Prompt (oculto si la cámara está activa o en el menú) */}
      {!isCamcorderActive && hoveredItem && animatingTo === 'none' && activeOverlay === 'none' && !isInMainMenu && (
        <div className="fixed bottom-10 left-0 right-0 z-50 flex justify-center pointer-events-none select-none animate-in fade-in duration-200">
          <div className="bg-black/75 border border-white/20 text-[#eaeaea] px-6 py-2 rounded-xs font-typewriter text-xs sm:text-sm tracking-wider shadow-[0_4px_30px_rgba(0,0,0,0.95)] backdrop-blur-sm flex items-center gap-2">
            <span>Pulsa</span>
            <span className="text-white font-bold drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
              (BOTÓN IZQUIERDO DEL RATÓN)
            </span>
            <span>
              para{' '}
              {hoveredItem === 'document'
                ? 'ver Perfil profesional'
                : hoveredItem === 'camcorder'
                  ? 'coger Videocámara'
                  : 'usar Terminal'}
            </span>
          </div>
        </div>
      )}

      {/* Botón flotante para alejarse del monitor y volver a la vista del escritorio */}
      {(animatingTo === 'terminal' || activeOverlay === 'terminal') && (
        <div className="fixed top-5 right-5 z-50 animate-in fade-in duration-300 pointer-events-auto">
          <button
            onClick={handleClose}
            className="bg-black/90 hover:bg-[#8a0303] text-white border border-[#3b5998] hover:border-red-500 px-4 py-2.5 rounded shadow-2xl font-mono text-xs tracking-widest uppercase flex items-center gap-2 cursor-pointer transition-all duration-200 backdrop-blur-md group"
            title="Alejarse de la pantalla (o presiona ESC)"
          >
            <span className="text-sm font-bold text-blue-300 group-hover:text-white">✕</span>
            <span>ALEJARSE DEL MONITOR (ESC)</span>
          </button>
        </div>
      )}

      {/* Botón discreto en la esquina superior izquierda para regresar al Menú Principal */}
      {!isInMainMenu && activeOverlay === 'none' && animatingTo === 'none' && !isCamcorderActive && (
        <div className="fixed top-5 left-5 z-50 animate-in fade-in duration-300 pointer-events-auto">
          <button
            onClick={() => setIsInMainMenu(true)}
            className="bg-black/80 hover:bg-white/15 text-white/70 hover:text-white border border-white/20 px-3.5 py-1.5 rounded-sm font-typewriter text-xs tracking-widest uppercase flex items-center gap-2 cursor-pointer transition-all duration-200 backdrop-blur-sm shadow-lg"
            title="Abrir Menú Principal (o pulsa ESC)"
          >
            <span className="text-sm font-bold">◀</span>
            <span>MENÚ PRINCIPAL</span>
          </button>
        </div>
      )}

      {/* Overlays */}
      <div className={`${isJumpscarePlaying ? 'fixed' : 'hidden'} inset-0 z-[100] overflow-hidden bg-black`}>
        <video
          ref={jumpscareRef}
          preload="auto"
          playsInline
          src={assetPath('assets/animations/jumpscare.mp4')}
          onCanPlayThrough={() => setIsJumpscareReady(true)}
          onEnded={() => { setIsJumpscarePlaying(false); isScareSequenceRef.current = false; }}
          onError={() => { setIsJumpscarePlaying(false); setIsJumpscareReady(true); isScareSequenceRef.current = false; }}
          aria-label="Jumpscare"
          className="h-full w-full scale-[1.03] object-cover"
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at center, transparent 42%, rgba(0,0,0,0.32) 68%, #000 100%)' }}
        />
      </div>
      <div
        aria-hidden="true"
        className={`pointer-events-none fixed inset-0 z-[120] bg-black transition-opacity duration-500 ${isTransitionBlack ? 'opacity-100' : 'opacity-0'}`}
      />

      {activeOverlay === 'document' && <ProfileOverlay onClose={handleClose} />}
      {activeOverlay === 'investigation' && <InvestigationFiles onClose={closeInvestigation} />}

      {/* Menú de Inicio Auténtico de Outlast */}
      {isInMainMenu && (
        <MainMenu
          onStartGame={startGame}
          onOpenInvestigation={() => {
            setIsInMainMenu(false);
            setActiveOverlay('investigation');
          }}
          onResetGame={() => {
            handleClose();
          }}
        />
      )}
      {(!sceneReady || !isJumpscareReady) && <SceneLoading />}
    </div>
  );
}

