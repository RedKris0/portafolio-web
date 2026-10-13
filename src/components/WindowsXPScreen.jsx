import { useState, useEffect, useRef } from 'react';
import { playSound, playKeyboardSound } from '../utils/audioManager.js';
import { assetPath } from '../utils/assetPath.js';

// Reproducción de efectos de sonido pre-cargados con latencia cero
const playXPChime = () => {
  playSound('xp_startup', 0.8);
};

const playXPClick = () => {
  playSound('xp_click', 0.55);
};

export const playKeySound = (key) => {
  playKeyboardSound(key === ' ' || key === 'Space' || key === 'Spacebar');
};

const playTerminalBeep = () => {
  playSound('terminal_beep', 0.45);
};

export const TERMINAL_PASSWORD = '1234';

export default function WindowsXPScreen({ isZoomedIn = false, onZoomIn = () => { }, onClose = () => { }, onLoginFailure = () => { }, onOpenInvestigation = () => { } }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [username, setUsername] = useState('crojas');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Estados de la consola interactiva (Foto de referencia Outlast)
  const [commandInput, setCommandInput] = useState('');
  const [consoleLogs, setConsoleLogs] = useState([
    { type: 'header', text: 'KRIS Analytics System Console {version 1.04}' },
    { type: 'sub', text: '2026 KRIS Corporation // Terminal: Cristóbal Rojas' },
    { type: 'spacer' },
    { type: 'prompt', text: '>SystemCheck  //Cristobal_Rojas' },
    { type: 'ok', text: '[OK] ENTORNO: KRIS DEV OS v3.1 ACTIVO' },
    { type: 'ok', text: '[OK] INGENIERO: CRISTÓBAL A. ROJAS PÉREZ' },
    { type: 'ok', text: '[OK] PERFIL: INGENIERÍA EN PROGRAMACIÓN' },
    { type: 'ok', text: '[OK] PIPELINE ACTIVO: CASO COLCHAGUA (PYMES) CONECTADO' },
    { type: 'ok', text: '[OK] STACK TÉCNICO: SQL, PYTHON, POWER BI, POSTGRESQL, ETL' },
    { type: 'info', text: 'Escribe /ayuda para ver los comandos disponibles.' },
  ]);

  const terminalScrollRef = useRef(null);
  const passwordInputRef = useRef(null);
  const commandInputRef = useRef(null);

  useEffect(() => {
    if (isLoggedIn && terminalScrollRef.current) {
      const terminal = terminalScrollRef.current;
      terminal.scrollTo({ top: terminal.scrollHeight, behavior: 'smooth' });
    }
  }, [consoleLogs, isLoggedIn]);

  useEffect(() => {
    if (!isZoomedIn) return;
    const input = isLoggedIn ? commandInputRef.current : passwordInputRef.current;
    input?.focus({ preventScroll: true });
  }, [isLoggedIn, isZoomedIn]);

  const handleLogin = (e) => {
    if (e) e.preventDefault();
    if (isLoggingIn || isLoggedIn) return;

    if (!password) {
      setLoginError('Escribe la contraseña para ingresar.');
      return;
    }

    if (password !== TERMINAL_PASSWORD) {
      setPassword('');
      setLoginError('Contraseña incorrecta.');
      onLoginFailure();
      return;
    }

    playXPClick();
    setLoginError('');
    setIsLoggingIn(true);

    setTimeout(() => {
      playXPChime();
      setIsLoggedIn(true);
      setIsLoggingIn(false);
    }, 950);
  };

  const handleLogoff = () => {
    playXPClick();
    setIsLoggedIn(false);
    setIsLoggingIn(false);
    setPassword('');
    setLoginError('');
  };

  const executeCommand = () => {
    const cleanCmd = commandInput.trim().toLowerCase().replace(/^\//, '');
    if (!cleanCmd) return;

    playTerminalBeep();
    const newLogs = [...consoleLogs, { type: 'input', text: `>${commandInput}` }];

    if (cleanCmd === 'ayuda' || cleanCmd === 'help') {
      newLogs.push(
        { type: 'info', text: 'COMANDOS DISPONIBLES EN TERMINAL KRIS:' },
        { type: 'text', text: '  /proyectos    - Abrir repositorios de RedKRIS0' },
        { type: 'text', text: '  /colchagua    - Abrir la investigación de Colchagua' },
        { type: 'text', text: '  /creditos     - Autores y licencias de los modelos 3D' },
        { type: 'text', text: '  /habilidades  - Listar stack técnico y tecnologías' },
        { type: 'text', text: '  /contacto     - Canales de comunicación directa' },
        { type: 'text', text: '  /limpiar      - Limpiar el búfer de la consola' },
        { type: 'text', text: '  /check        - Ejecutar diagnóstico del sistema' },
        { type: 'text', text: '  /salir        - Cerrar sesión y volver al login' }
      );
    } else if (cleanCmd === 'proyectos' || cleanCmd === 'projects') {
      newLogs.push(
        { type: 'highlight', text: '=== REPOSITORIOS DE REDKRIS0 ===' },
        ...['portafolio-web', 'KRISMusicManager', 'Verpelis'].map(name => ({
          type: 'link', text: name, href: `https://github.com/RedKRIS0/${name}`,
        })),
        { type: 'link', text: 'Ver todos los repositorios en GitHub', href: 'https://github.com/RedKRIS0?tab=repositories' }
      );
    } else if (cleanCmd === 'colchagua') {
      newLogs.push(
        { type: 'highlight', text: '=== INVESTIGACIÓN COLCHAGUA ===' },
        { type: 'ok', text: '[OK] ABRIENDO HISTORIA, EVIDENCIA Y DECISIONES...' },
        { type: 'link', text: 'Ver investigación en GitHub', href: 'https://github.com/rafajaque/Investigacion-Colchagua-' },
        { type: 'link', text: 'Descargar archivo Power BI (.pbix)', href: assetPath('downloads/Colchagua_Resiliencia.pbix'), download: 'Colchagua_Resiliencia.pbix' }
      );
      onOpenInvestigation();
    } else if (cleanCmd === 'habilidades' || cleanCmd === 'skills') {
      newLogs.push(
        { type: 'highlight', text: '=== STACK TECNOLÓGICO & COMPETENCIAS ===' },
        { type: 'text', text: '• Análisis de Datos: Power BI, DAX, Power Query, Excel Avanzado' },
        { type: 'text', text: '• Bases de Datos: SQL Server, PostgreSQL, MySQL, Modelado Dimensional' },
        { type: 'text', text: '• Programación & ETL: Python (Pandas, NumPy) Pipelines' },
        { type: 'text', text: '• Desarrollo Frontend & 3D: React, Three.js, Astro, Tailwind CSS' },
        { type: 'ok', text: '[NIVEL DE HABILIDAD: PROFESIONAL COMPROBADO]' }
      );
    } else if (cleanCmd === 'contacto' || cleanCmd === 'contact') {
      newLogs.push(
        { type: 'highlight', text: '=== CANALES DE CONTACTO OFICIALES ===' },
        { type: 'link', text: 'GitHub: RedKRIS0', href: 'https://github.com/RedKRIS0' },
        { type: 'link', text: 'Email: cristobalrp09@gmail.com', href: 'mailto:cristobalrp09@gmail.com' },
        { type: 'info', text: 'Disponible para contratación y proyectos de desarrollo de software.' }
      );
    } else if (cleanCmd === 'creditos' || cleanCmd === 'créditos') {
      newLogs.push(
        { type: 'highlight', text: '=== CRÉDITOS DE MODELOS 3D ===' },
        { type: 'link', text: 'Black Death (rigged) — Veterock (escala ajustada; animaciones adaptadas al rig)', href: 'https://skfb.ly/oLUyv' },
        { type: 'link', text: 'Licencia: Creative Commons Attribution 4.0', href: 'https://creativecommons.org/licenses/by/4.0/' },
        { type: 'text', text: 'Old Man Idle — Mixamo (movimiento adaptado a Black Death)' },
      );
    } else if (cleanCmd === 'limpiar' || cleanCmd === 'clear') {
      setConsoleLogs([
        { type: 'header', text: 'Analytics System Console {version 1.04}' },
        { type: 'prompt', text: '>SystemCheck  //Cristobal_Rojas' },
      ]);
      setCommandInput('');
      return;
    } else if (cleanCmd === 'check' || cleanCmd === 'systemcheck') {
      newLogs.push(
        { type: 'ok', text: '[OK] TODOS LOS SUBSISTEMAS OPERANDO AL 100%' },
        { type: 'ok', text: '[OK] TELEMETRÍA DE DATOS ESTABLE' }
      );
    } else if (cleanCmd === 'salir' || cleanCmd === 'exit' || cleanCmd === 'logout') {
      handleLogoff();
      return;
    } else {
      newLogs.push({
        type: 'error',
        text: `Error: Comando desconocido "${cleanCmd}". Escribe /ayuda para la lista de comandos.`,
      });
    }

    setConsoleLogs(newLogs);
    setCommandInput('');
  };

  const handleCommandSubmit = (e) => {
    e.preventDefault();
    executeCommand();
  };

  return (
    <div
      className="w-full h-full relative overflow-hidden select-none bg-[#00138c] text-white flex flex-col font-sans"
      style={{
        boxShadow: 'inset 0 0 40px rgba(0,0,0,0.85)',
      }}
      onClick={() => {
        if (!isZoomedIn) {
          onZoomIn();
        }
      }}
    >
      {/* Overlay CRT analógico de líneas de escaneo sobre el fósforo del monitor */}
      <div
        className="absolute inset-0 pointer-events-none z-30 opacity-35"
        style={{
          background: 'linear-gradient(rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 0.18) 50%)',
          backgroundSize: '100% 4px',
        }}
      />

      {!isLoggedIn ? (
        /* ================= PANTALLA DE INICIO DE SESIÓN WINDOWS XP ================= */
        <div className="flex-1 flex flex-col justify-between bg-gradient-to-b from-[#001384] via-[#002ca6] to-[#001384] relative z-10 w-full h-full">
          {/* Barra superior clásica de Windows XP */}
          <div className="h-20 bg-[#001584] border-b-[4px] border-[#d87c10] flex items-center justify-between px-10 shadow-lg shrink-0">
            <div className="flex items-center gap-4">
              {/* Logotipo de bandera Windows 4 colores */}
              <div className="w-10 h-10 flex flex-wrap gap-1 transform -rotate-12 filter drop-shadow">
                <div className="w-4 h-4 bg-[#f35325] rounded-tl-sm shadow-sm" />
                <div className="w-4 h-4 bg-[#81bc06] rounded-tr-sm shadow-sm" />
                <div className="w-4 h-4 bg-[#05a6f0] rounded-bl-sm shadow-sm" />
                <div className="w-4 h-4 bg-[#ffba08] rounded-br-sm shadow-sm" />
              </div>
              <div className="flex flex-col leading-tight">
                <div className="text-2xl font-bold tracking-tight text-white flex items-center gap-1.5">
                  <span className="font-light">Macrosoft</span>
                  <span className="font-black italic drop-shadow-[0_2px_3px_rgba(0,0,0,0.9)]">Systems</span>

                </div>
                <span className="text-xs text-blue-200 tracking-wider font-mono">Professional // KRIS Terminal v3.1</span>
              </div>
            </div>

            <div className="text-right text-xs text-blue-200/90 font-mono tracking-widest bg-black/30 px-4 py-1.5 rounded border border-white/10">
              ESTACIÓN: MT-MASSIVE // TERM-04
            </div>
          </div>

          {/* Área Central: Paneles divididos con la línea divisoria vertical brillante de XP */}
          <div className="flex-1 flex items-center justify-center px-10 py-6 relative">
            <div className="w-full max-w-4xl flex items-center justify-center gap-10">
              {/* Columna Izquierda: Mensaje de bienvenida oficial */}
              <div className="w-1/2 text-right pr-10 flex flex-col items-end justify-center select-none">
                <h2 className="text-3xl font-normal text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] mb-1">
                  Para comenzar,
                </h2>
                <p className="text-xl font-light text-blue-100 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] mb-6">
                  haga clic en su nombre de usuario
                </p>
                <div className="bg-black/30 border border-blue-400/30 rounded px-4 py-2 text-right">
                  <div className="text-xs text-blue-300 font-mono font-semibold">KRIS PSYCHIATRIC SYSTEMS</div>
                  <div className="text-[11px] text-blue-200/70 font-mono">AUTORIZACIÓN DE SEGURIDAD // NIVEL 3</div>
                </div>
              </div>

              {/* Divisor vertical con degradado blanco suave idéntico a XP */}
              <div className="w-[2px] h-64 bg-gradient-to-b from-transparent via-white/50 to-transparent shrink-0" />

              {/* Columna Derecha: Tarjeta de Usuario con avatar e inputs destacados */}
              <div className="w-1/2 pl-6 flex flex-col justify-center">
                <div className="bg-[#0022a8]/85 p-6 rounded-xl border-2 border-[#ff9015] shadow-[0_15px_40px_rgba(0,0,0,0.7)] backdrop-blur-md transition-all">
                  <div className="flex items-center gap-5 mb-4">
                    {/* Avatar con marco naranja clásico de Windows XP */}
                    <div className="w-20 h-20 rounded-lg border-2 border-[#ff9015] bg-gradient-to-tr from-[#1b3d73] to-[#4c7fd4] flex items-center justify-center shadow-lg overflow-hidden relative shrink-0">
                      <div className="w-10 h-10 rounded-full bg-white/95 mb-2 shadow" />
                      <div className="absolute bottom-0 w-16 h-8 rounded-t-full bg-white/90 shadow" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-xl text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] truncate">
                        Cristóbal A. Rojas Pérez
                      </div>
                      <div className="text-sm text-blue-200 font-medium mt-0.5">
                        Consultor de Software // Análisis BI
                      </div>
                      <div className="text-xs text-green-300 flex items-center gap-1.5 mt-1 font-mono">
                        <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        SESIÓN LISTA
                      </div>
                    </div>
                  </div>

                  {/* Formulario de Login */}
                  <form
                    onSubmit={handleLogin}
                    className="space-y-3 mt-3"
                    onClick={(e) => e.stopPropagation()}
                    autoComplete="off"
                    data-lpignore="true"
                  >
                    <div>
                      <label className="block text-xs text-blue-100 font-medium mb-1">Nombre de usuario:</label>
                      <input
                        type="text"
                        name="KRIS_user_token"
                        id="KRIS_user_token"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        onKeyDown={(e) => playKeySound(e.key)}
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck="false"
                        data-lpignore="true"
                        className="w-full px-3 py-1.5 bg-white text-black font-sans text-sm rounded-xs border-2 border-blue-400 focus:outline-none focus:ring-2 focus:ring-[#ff9015] shadow-inner font-medium"
                        placeholder="Nombre de usuario"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-blue-100 font-medium mb-1">Escriba su contraseña:</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          name="KRIS_auth_key"
                          id="KRIS_auth_key"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          onKeyDown={(e) => playKeySound(e.key)}
                          autoComplete="off"
                          autoCorrect="off"
                          autoCapitalize="off"
                          spellCheck="false"
                          data-lpignore="true"
                          data-1p-ignore="true"
                          data-form-type="other"
                          style={{
                            WebkitTextSecurity: 'disc',
                            MozTextSecurity: 'disc',
                            textSecurity: 'disc',
                          }}
                          className="flex-1 px-3 py-1.5 bg-white text-black font-sans text-sm rounded-xs border-2 border-blue-400 focus:outline-none focus:ring-2 focus:ring-[#ff9015] shadow-inner tracking-widest font-bold"
                          placeholder="••••••••"
                          ref={passwordInputRef}
                        />
                        {/* Botón verde de flecha clásico de Windows XP */}
                        <button
                          type="submit"
                          disabled={isLoggingIn}
                          className="w-10 h-10 bg-gradient-to-b from-[#3ed05e] to-[#24963e] hover:from-[#49e26b] hover:to-[#2cb048] active:from-[#1e7e34] active:to-[#176228] text-white rounded flex items-center justify-center border border-white/60 shadow-md cursor-pointer transition-transform hover:scale-105 shrink-0"
                          title="Iniciar sesión (o pulsa Enter)"
                        >
                          <span className="text-base font-black leading-none drop-shadow">➜</span>
                        </button>
                      </div>
                    </div>

                    {isLoggingIn ? (
                      <div className="text-sm text-[#ffba08] font-bold mt-2 animate-pulse flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded">
                        <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#ffba08]" />
                        Iniciando sesión en KRIS Systems...
                      </div>
                    ) : loginError ? (
                      <div role="alert" className="text-xs text-red-200 mt-2 bg-red-950/60 px-3 py-1.5 rounded border border-red-500/50">
                        {loginError}
                      </div>
                    ) : (
                      <div className="text-xs text-[#ffd15c] mt-2 bg-black/35 px-3 py-1.5 rounded border border-[#ff9015]/30 flex items-center gap-2">
                        <span>💡</span>
                        <span>Haz clic en <strong>[➜]</strong> o pulsa <strong>Enter</strong> para acceder a la consola</span>
                      </div>
                    )}
                  </form>
                </div>
              </div>
            </div>
          </div>

          {/* Barra inferior clásica con botón de apagado */}
          <div className="h-16 bg-[#001584] border-t-[4px] border-[#d87c10] flex items-center justify-between px-10 shadow-inner text-sm shrink-0">
            <button
              onClick={() => {
                playXPClick();
                onClose();
              }}
              className="flex items-center gap-3 px-4 py-2 rounded bg-black/20 hover:bg-white/15 text-white cursor-pointer transition-colors border border-white/20 shadow-sm"
              title="Apagar o volver a la vista del despacho"
            >
              <div className="w-7 h-7 bg-[#dc3545] rounded-sm flex items-center justify-center border border-white/60 text-xs font-black shadow">
                ⏻
              </div>
              <span className="font-bold text-sm">Apagar equipo</span>
            </button>

            <div className="text-blue-200/70 text-xs font-mono">
              (C) 2026 KRIS Systems. Todos los derechos reservados.
            </div>
          </div>
        </div>
      ) : (
        /* ================= CONSOLA ESTILO OUTLAST TRAS INICIAR SESIÓN (Referencia de la foto) ================= */
        <div
          className="flex-1 w-full h-full relative z-10 p-6 flex flex-col justify-between overflow-hidden select-none font-mono"
          style={{
            backgroundColor: '#2b475e', // Fondo de escritorio azul pizarra clásico de la captura
          }}
        >
          {/* 1. VENTANA DE FONDO: "Morphogenic Engine POD 2" con diagnósticos en rojo (como en la foto) */}
          <div
            className="absolute top-4 right-4 w-[480px] h-[480px] bg-[#060a0d] border-2 border-[#c0c0c0] shadow-2xl flex flex-col z-0 pointer-events-none opacity-85"
            style={{
              boxShadow: 'inset 1px 1px 0px #ffffff, inset -1px -1px 0px #808080, 5px 5px 25px rgba(0,0,0,0.8)',
            }}
          >
            {/* Barra de título clásica Windows gris */}
            <div className="h-6 bg-[#c0c0c0] text-black text-xs font-bold px-2 flex items-center justify-between border-b border-[#808080]">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px]">⚙️</span>
                <span className="tracking-wider">Morphogenic Engine POD 2 // Analytics</span>
              </div>
              <div className="flex items-center gap-0.5">
                <span className="w-3.5 h-3.5 bg-[#c0c0c0] border border-[#808080] text-[9px] flex items-center justify-center leading-none">_</span>
                <span className="w-3.5 h-3.5 bg-[#c0c0c0] border border-[#808080] text-[9px] flex items-center justify-center leading-none">⛶</span>
                <span className="w-3.5 h-3.5 bg-[#c0c0c0] border border-[#808080] text-[9px] flex items-center justify-center leading-none">✕</span>
              </div>
            </div>

            {/* Diagnóstico en rojo streaming idéntico a la imagen de Outlast */}
            <div className="flex-1 p-3 text-red-600 font-mono text-[11px] leading-snug overflow-hidden flex flex-col justify-end">
              <div className="text-xl font-black text-red-600 tracking-wider mb-2 animate-pulse">
                SYSTEM ERROR // ACTIVE
              </div>
              <div className="opacity-90 space-y-0.5 text-[10px]">
                <div>0:00 0EAC123:5F89A // MEM_INIT</div>
                <div>0:00 0EAC123:9B41C // ETL_STREAM</div>
                <div>2:00 AEEAC12:4409D // POD_ONLINE</div>
                <div>391F 34F542E1 // BUFFER_SYNC</div>
                <div>0:00 0EAC123:5F89A // DW_FACT_READY</div>
                <div>2:00 AEEAC12:8871B // PBI_LINKED</div>
                <div>0:00 0EAC123:5F89A // COLCHAGUA_OK</div>
                <div className="text-red-500 font-bold">system/developer/analytics</div>
                <div className="text-red-500 font-bold">system/developer/caso_colchagua</div>
                <div className="text-red-500 font-bold">system/developer/data_lake</div>
                <div className="text-red-500 font-bold">system/morphogenic/rojas_core</div>
                <div className="text-red-500 font-bold">system/developer/power_bi</div>
              </div>
            </div>
          </div>

          {/* 2. VENTANA PRINCIPAL DE PRIMER PLANO: "Console" (100% idéntica a la captura de Outlast) */}
          <div
            className="relative z-10 w-[640px] max-w-[95%] h-[490px] max-h-[80%] bg-black border-2 border-[#d4d0c8] shadow-[0_20px_60px_rgba(0,0,0,0.95)] flex flex-col"
            style={{
              boxShadow: 'inset 2px 2px 0px #ffffff, inset -2px -2px 0px #808080, 8px 8px 35px rgba(0,0,0,0.9)',
            }}
          >
            {/* Barra de Título Gris Clásica Windows con controles _ ⛶ ✕ */}
            <div className="h-7 bg-[#c0c0c0] text-black text-xs font-bold px-2 flex items-center justify-between border-b-2 border-[#808080] select-none shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="text-black font-mono text-sm leading-none">█</span>
                <span className="tracking-wider text-black text-sm">Console</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleLogoff}
                  className="w-4 h-4 bg-[#c0c0c0] hover:bg-[#d8d8d8] active:bg-[#a0a0a0] border border-[#808080] text-black text-[10px] font-bold flex items-center justify-center leading-none cursor-pointer"
                  title="Minimizar"
                >
                  _
                </button>
                <button
                  className="w-4 h-4 bg-[#c0c0c0] hover:bg-[#d8d8d8] active:bg-[#a0a0a0] border border-[#808080] text-black text-[10px] font-bold flex items-center justify-center leading-none cursor-pointer"
                  title="Maximizar"
                >
                  ⛶
                </button>
                <button
                  onClick={handleLogoff}
                  className="w-4 h-4 bg-[#c0c0c0] hover:bg-red-500 hover:text-white active:bg-red-700 border border-[#808080] text-black text-[11px] font-bold flex items-center justify-center leading-none cursor-pointer"
                  title="Cerrar sesión"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Cuerpo de la Consola: Fondo negro, texto blanco y scrollbar idéntica a la referencia */}
            <div ref={terminalScrollRef} className="flex-1 min-h-0 bg-black text-white p-4 overflow-y-auto overscroll-contain font-mono text-xs leading-relaxed flex flex-col justify-between">
              <div className="space-y-1.5">
                {consoleLogs.map((log, idx) => {
                  if (log.type === 'link') {
                    return (
                      <div key={idx}>
                        <a href={log.href} download={log.download} target={log.download ? undefined : '_blank'} rel="noopener noreferrer" className="text-sky-300 underline underline-offset-2 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-300">
                          {log.text} {log.download ? '↓' : '↗'}
                        </a>
                      </div>
                    );
                  }
                  if (log.type === 'header') {
                    return (
                      <div key={idx} className="font-bold text-white text-sm tracking-wide">
                        {log.text}
                      </div>
                    );
                  }
                  if (log.type === 'sub') {
                    return (
                      <div key={idx} className="text-white/80 text-xs">
                        {log.text}
                      </div>
                    );
                  }
                  if (log.type === 'prompt') {
                    return (
                      <div key={idx} className="text-white font-bold text-sm pt-2">
                        {log.text}
                      </div>
                    );
                  }
                  if (log.type === 'ok') {
                    return (
                      <div key={idx} className="text-green-400 font-medium">
                        {log.text}
                      </div>
                    );
                  }
                  if (log.type === 'highlight') {
                    return (
                      <div key={idx} className="text-[#38bdf8] font-bold pt-1">
                        {log.text}
                      </div>
                    );
                  }
                  if (log.type === 'info') {
                    return (
                      <div key={idx} className="text-yellow-300 font-medium pt-1">
                        {log.text}
                      </div>
                    );
                  }
                  if (log.type === 'error') {
                    return (
                      <div key={idx} className="text-red-400 font-medium">
                        {log.text}
                      </div>
                    );
                  }
                  if (log.type === 'input') {
                    return (
                      <div key={idx} className="text-white font-bold pt-1">
                        {log.text}
                      </div>
                    );
                  }
                  return (
                    <div key={idx} className="text-white/90">
                      {log.text}
                    </div>
                  );
                })}
              </div>

              {/* Entrada interactiva de comandos con cursor parpadeante */}
              <div className="pt-3 border-t border-white/20 mt-3">
                <form onSubmit={handleCommandSubmit} className="flex items-center gap-2">
                  <span className="text-white font-bold text-sm">{'>'}</span>
                  <input
                    type="text"
                    value={commandInput}
                    onChange={(e) => setCommandInput(e.target.value)}
                    onKeyDown={(e) => playKeySound(e.key)}
                    placeholder="/ayuda"
                    className="flex-1 bg-transparent text-white font-mono text-xs focus:outline-none placeholder:text-white/40"
                    ref={commandInputRef}
                  />
                  <button
                    type="submit"
                    className="px-2 py-0.5 bg-white/10 hover:bg-white/25 border border-white/30 text-[10px] text-white cursor-pointer uppercase font-mono"
                  >
                    EJECUTAR
                  </button>
                </form>

              </div>
            </div>
          </div>

          {/* 3. BARRA INFERIOR DEL SISTEMA (Botones para cerrar sesión o salir de la pantalla) */}
          <div className="relative z-10 w-full flex justify-between items-center bg-[#1e3447]/90 border border-white/20 px-4 py-2 rounded text-xs text-white shadow-lg backdrop-blur-sm mt-4">
            <div className="flex items-center gap-3">
              <button
                onClick={handleLogoff}
                className="px-3 py-1 bg-red-900/80 hover:bg-red-800 border border-red-500 text-white font-bold rounded-xs cursor-pointer transition-colors shadow"
                title="Cerrar sesión actual en el sistema"
              >
                ← CERRAR SESIÓN
              </button>
              <span className="text-white/60 text-[11px]">
                USUARIO: <strong>CRISTOBAL ROJAS</strong> // NIVEL 3
              </span>
            </div>

            <button
              onClick={() => {
                playXPClick();
                onClose();
              }}
              className="px-4 py-1 bg-black/60 hover:bg-white/15 border border-white/30 text-white font-bold rounded-xs cursor-pointer transition-colors shadow"
              title="Alejar la vista y volver al despacho 3D"
            >
              [⏻ SALIR DEL MONITOR]
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
