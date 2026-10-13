
import { useState } from 'react';

export default function OutlastDocumentOverlay({ onClose }) {
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-300 select-none overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl md:max-w-2xl my-auto transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* SELECTOR DE DOCUMENTOS */}
        <div className="flex justify-between items-center mb-3 px-2 text-white/60 font-mono text-xs tracking-widest uppercase">
          <span className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            PORTAFOLIO // {currentPage === 1 ? 'EXPEDIENTE PROFESIONAL' : 'BITÁCORA DE DESARROLLO'}
          </span>

          <div className="flex items-center gap-2 bg-black/60 px-3 py-1 rounded border border-white/10">
            <button
              onClick={() => setCurrentPage(1)}
              className={`px-2 py-0.5 rounded transition-colors ${currentPage === 1
                ? 'text-white font-bold bg-white/15'
                : 'text-white/40 hover:text-white'
                }`}
            >
              1. PERFIL
            </button>

            <span className="text-white/20">|</span>

            <button
              onClick={() => setCurrentPage(2)}
              className={`px-2 py-0.5 rounded transition-colors ${currentPage === 2
                ? 'text-white font-bold bg-white/15'
                : 'text-white/40 hover:text-white'
                }`}
            >
              2. NOTAS
            </button>
          </div>
        </div>

        {/* PÁGINA 1: EXPEDIENTE PROFESIONAL */}
        {currentPage === 1 && (
          <div
            className="relative bg-[#ebe6dc] text-[#242424] p-8 sm:p-12 md:p-14 shadow-[0_25px_70px_rgba(0,0,0,0.85)] rounded-xs font-typewriter leading-relaxed"
            style={{
              backgroundImage:
                'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.4) 0%, rgba(210,202,188,0.3) 100%), linear-gradient(rgba(30,20,10,0.02) 1px, transparent 1px)',
              backgroundSize: '100% 100%, 100% 4px',
              boxShadow:
                '0 20px 60px rgba(0,0,0,0.9), inset 0 0 40px rgba(120,95,60,0.12)',
            }}
          >
            {/* CABECERA */}
            <div className="space-y-1 text-sm md:text-base text-[#222222] mb-8 font-typewriter">
              <p>Fecha de actualización: octubre de 2026</p>
              <p>Profesional: Cristóbal A. Rojas Pérez</p>
              <p>Formación: Ingeniería en Programación</p>
              <p>Especialidad: Desarrollo de software y análisis de datos</p>
            </div>

            {/* CUERPO DEL DOCUMENTO */}
            <div className="space-y-6 text-sm md:text-base text-[#262626] leading-relaxed text-justify">
              <p>
                Mi enfoque profesional se centra en el análisis,
                diseño y desarrollo de soluciones tecnológicas
                capaces de responder a necesidades reales,
                combinando funcionalidad, eficiencia y una
                experiencia de usuario cuidadosamente diseñada.
              </p>

              <p>
                Cuento con conocimientos en desarrollo de
                aplicaciones web mediante React, Astro y Three.js,
                además de herramientas de programación, procesamiento
                y análisis de datos como Python, SQL y Power BI.
              </p>

              <p>
                Entiendo el desarrollo de software como un proceso
                integral que abarca desde la identificación de
                requerimientos y el diseño de arquitecturas hasta
                la implementación, las pruebas y la mejora continua.
                Priorizo la calidad del código, la mantenibilidad
                y la capacidad de adaptación de cada solución.
              </p>

              <p>
                Este portafolio representa mi interés por integrar
                ingeniería, creatividad y tecnología. Cada proyecto
                refleja una oportunidad para explorar nuevos
                enfoques, resolver desafíos técnicos y transformar
                ideas en experiencias digitales funcionales.
              </p>

              <p className="font-bold pt-2">
                (Solanum-Outer Wilds)
                «El universo es, y nosotros somos»
              </p>
            </div>

            {/* CERRAR */}
            <div className="flex justify-center mt-12 pt-2">
              <button
                onClick={onClose}
                className="group relative rounded-full bg-black/10 hover:bg-black/20 border border-black/20 px-10 py-1.5 text-[#222222] font-mono text-sm tracking-[0.35em] uppercase transition-all duration-200 shadow-sm backdrop-blur-xs hover:scale-105 active:scale-95 flex items-center justify-center cursor-pointer"
                title="Cerrar documento"
              >
                <span>A t r á s</span>
              </button>
            </div>
          </div>
        )}

        {/* PÁGINA 2: BITÁCORA DE DESARROLLO */}
        {currentPage === 2 && (
          <div
            className="relative bg-[#f4f1e8] text-[#1e3a8a] p-8 sm:p-12 md:p-14 shadow-[0_25px_70px_rgba(0,0,0,0.85)] rounded-xs font-handwriting leading-[30px]"
            style={{
              backgroundImage:
                'repeating-linear-gradient(transparent, transparent 29px, #93c5fd 30px)',
              backgroundSize: '100% 30px',
              boxShadow:
                '0 20px 60px rgba(0,0,0,0.9), inset 0 0 45px rgba(130,105,70,0.15)',
            }}
          >
            <div className="text-xl sm:text-2xl text-[#1e3a8a] space-y-7 leading-[30px] pt-1">
              <p>
                Todo proyecto comienza con una idea. A veces clara,
                otras veces sin saber muy bien cómo llevarla a cabo.
              </p>

              <p>
                Este portafolio nació de las ganas de experimentar,
                aprender cosas nuevas y crear algo diferente a
                lo habitual.
              </p>

              <p>
                Durante el proceso hubo errores, cambios de planes
                y muchas pruebas. No siempre supe cómo resolver
                cada problema, pero cada intento me permitió
                entender un poco más y seguir avanzando.
              </p>

              <p>
                Todavía queda mucho por aprender y mejorar.
                Al final, creo que de eso se trata la programación:
                tener curiosidad, probar, equivocarse y encontrar
                nuevas formas de hacer las cosas.
              </p>

              <p>
                Ahora te invito a explorar este pequeño proyecto
                que fui construyendo a mi manera.
              </p>

              <p className="font-bold">
                Espero que disfrutes la experiencia.
              </p>
            </div>
            {/* CERRAR */}
            <div className="flex justify-center mt-12 pt-4">
              <button
                onClick={onClose}
                className="group relative rounded-full bg-black/10 hover:bg-black/20 border border-black/20 px-10 py-1.5 text-[#222222] font-mono text-sm tracking-[0.35em] uppercase transition-all duration-200 shadow-sm backdrop-blur-xs hover:scale-105 active:scale-95 flex items-center justify-center cursor-pointer"
                title="Cerrar notas"
              >
                <span>A t r á s</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
