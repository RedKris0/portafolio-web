import { useState } from 'react';
import { assetPath } from '../utils/assetPath.js';
import { playSound } from '../utils/audioManager.js';

const RESEARCH_URL = 'https://github.com/rafajaque/Investigacion-Colchagua-';
const NOTEBOOK_URL = `${RESEARCH_URL}/blob/main/Colchagua_Resiliencia.ipynb`;
const REPORT_URL = `${RESEARCH_URL}/blob/main/Informe_Colchagua.pdf`;

const files = [
  { id: 'story', name: '01_HISTORIA.txt' },
  { id: 'evidence', name: '02_EVIDENCIA_BI' },
  { id: 'notebook', name: '03_NOTEBOOK.ipynb' },
  { id: 'findings', name: '04_DECISIONES.txt' },
];

const priorities = [
  { commune: 'Chimbarongo', score: 86.5, detail: '8.455 hectareas frutales · 38,5% dependencia agro' },
  { commune: 'Placilla', score: 71.5, detail: '41,6% dependencia agro · 32,0% riego por gravedad' },
  { commune: 'Palmilla', score: 53.2, detail: '3.564 ha frutales · 226 PYMEs' },
  { commune: 'Chépica', score: 53.0, detail: '39,4% dependencia agro · 255 PYMEs' },
  { commune: 'San Fernando', score: 49.1, detail: 'Mayor red potencial: 695 empresas' },
];

const LinkButton = ({ href, children, download }) => (
  <a
    href={href}
    download={download}
    target={download ? undefined : '_blank'}
    rel={download ? undefined : 'noopener noreferrer'}
    className="inline-flex items-center justify-center border border-murkoff-glitch px-4 py-2 text-xs font-bold uppercase tracking-wider text-murkoff-glitch transition-colors hover:bg-murkoff-glitch hover:text-black focus:outline-none focus:ring-2 focus:ring-murkoff-glitch"
  >
    {children} ↗
  </a>
);

export default function InvestigationFiles({ onClose = () => { } }) {
  const [activeFile, setActiveFile] = useState('story');

  const openFile = (fileId) => {
    playSound('terminal_beep', 0.4);
    setActiveFile(fileId);
  };

  return (
    <div className="fixed inset-0 z-[130] overflow-y-auto bg-black/95 p-3 font-mono text-gray-200 backdrop-blur-md sm:p-6">
      <main className="mx-auto min-h-full w-full max-w-6xl border border-murkoff-dark bg-murkoff-black shadow-[0_0_35px_rgba(46,204,113,0.16)]">
        <header className="flex flex-col gap-3 border-b border-murkoff-dark bg-[#050505] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-murkoff-glitch"> Caso real</p>
            <h2 className="mt-1 text-xl font-bold text-murkoff-paper sm:text-2xl">Colchagua: resiliencia agrícola</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="self-start border border-white/25 px-4 py-2 text-xs uppercase tracking-widest text-white hover:border-red-500 hover:bg-red-950 sm:self-auto"
          >
            Volver a la terminal
          </button>
        </header>

        <nav aria-label="Secciones de la investigación" className="flex gap-2 overflow-x-auto border-b border-murkoff-dark bg-black p-2">
          {files.map((file) => (
            <button
              key={file.id}
              type="button"
              aria-pressed={activeFile === file.id}
              onClick={() => openFile(file.id)}
              className={`whitespace-nowrap border px-4 py-2 text-xs font-bold uppercase transition-colors ${activeFile === file.id
                ? 'border-murkoff-glitch bg-[#0a200a] text-murkoff-glitch'
                : 'border-murkoff-dark text-gray-500 hover:border-gray-500 hover:text-murkoff-paper'
                }`}
            >
              {file.name}
            </button>
          ))}
        </nav>

        <div className="p-4 sm:p-6 md:p-8">
          {activeFile === 'story' && (
            <section className="space-y-8" aria-labelledby="story-title">
              <div className="max-w-4xl">
                <p className="mb-2 text-xs uppercase tracking-[0.25em] text-murkoff-blood">La pregunta detrás de los datos</p>
                <h3 id="story-title" className="text-2xl font-bold text-murkoff-paper sm:text-4xl">
                  Ante una crisis agrícola, ¿qué territorios deberían recibir apoyo primero?                </h3>
                <p className="mt-4 text-sm leading-7 text-gray-300 sm:text-base">
                  Colchagua depende de una red agrícola expuesta al clima, al agua y a mercados concentrados. El proyecto cruza catastro frutícola, empresas, empleo, precipitaciones y comercio exterior para priorizar diagnósticos de continuidad productiva sin inventar pérdidas ni señalar empresas individuales.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {[
                  ['1. El territorio', '33.883 ha frutales y 11.479 bloques catastrales revelan una exposición productiva desigual entre diez comunas.'],
                  ['2. La presión', 'Agua, concentración de cultivos y dependencia agrícola se combinan con un mercado de cerezas altamente concentrado en China.'],
                  ['3. La decisión', 'El índice no predice una pérdida: ordena dónde conviene levantar información y preparar planes de continuidad primero.'],
                ].map(([title, description]) => (
                  <article key={title} className="border border-murkoff-dark bg-[#080b09] p-5">
                    <h4 className="font-bold text-murkoff-glitch">{title}</h4>
                    <p className="mt-3 text-sm leading-6 text-gray-400">{description}</p>
                  </article>
                ))}
              </div>

              <div className="border-l-4 border-murkoff-blood bg-[#100303] p-5 sm:p-6">
                <p className="text-lg leading-8 text-murkoff-paper">
                  La evidencia dirige la primera mirada hacia <strong>Chimbarongo</strong> y <strong>Placilla</strong>: ambas permanecen dentro del top 3 en los cinco escenarios de sensibilidad. El tercer territorio depende del objetivo del programa.
                </p>
              </div>

              <button type="button" onClick={() => openFile('evidence')} className="text-sm font-bold uppercase tracking-widest text-murkoff-glitch underline underline-offset-4">
                Abrir evidencia que sostiene la historia →
              </button>
            </section>
          )}

          {activeFile === 'evidence' && (
            <section className="space-y-8" aria-labelledby="evidence-title">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-murkoff-blood">Resumen verificable</p>
                <h3 id="evidence-title" className="mt-2 text-2xl font-bold text-murkoff-paper">Cinco comunas que concentran la decisión</h3>
              </div>

              <div className="space-y-4" aria-label="Índice relativo de prioridad territorial">
                {priorities.map(({ commune, score, detail }) => (
                  <div key={commune}>
                    <div className="mb-1 flex flex-wrap justify-between gap-2 text-sm">
                      <span className="font-bold text-white">{commune}</span>
                      <span className="text-gray-400">{detail}</span>
                    </div>
                    <div className="h-7 border border-murkoff-dark bg-black">
                      <div className="flex h-full items-center bg-gradient-to-r from-[#244b2f] to-murkoff-glitch px-2 font-bold text-black" style={{ width: `${score}%` }}>
                        {score.toFixed(1)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ['90,5%', 'del valor exportado de cerezas fue a China en 2024-25'],
                  ['-38,2%', 'cambio interanual del valor unitario de la cereza'],
                  ['0,379', 'silhouette del agrupamiento exploratorio en 2 perfiles'],
                  ['12 observaciones', 'bloque independiente usado para probar el forecast'],
                ].map(([value, label]) => (
                  <article key={label} className="border border-murkoff-dark bg-[#080b09] p-4">
                    <strong className="block text-2xl text-murkoff-glitch">{value}</strong>
                    <span className="mt-2 block text-xs leading-5 text-gray-400">{label}</span>
                  </article>
                ))}
              </div>

              <div className="border border-yellow-800/70 bg-yellow-950/20 p-4 text-sm leading-6 text-yellow-100/80">
                <strong>Lectura responsable:</strong> el índice es relativo y sus pesos representan preferencias de priorización. Las correlaciones climáticas usan solo 8–9 inviernos y no prueban causalidad. El forecast es regional y su prueba independiente contiene 12 observaciones solapadas.
              </div>

              <div className="flex flex-wrap gap-3">
                <LinkButton href={assetPath('downloads/Colchagua_Resiliencia.pbix')} download="Colchagua_Resiliencia.pbix">Descargar Power BI</LinkButton>
                <LinkButton href={REPORT_URL}>Leer informe completo</LinkButton>
              </div>

            </section>
          )}

          {activeFile === 'notebook' && (
            <section className="space-y-7" aria-labelledby="notebook-title">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-murkoff-blood">Pipeline reproducible</p>
                <h3 id="notebook-title" className="mt-2 text-2xl font-bold text-murkoff-paper">De las fuentes a una decisión defendible</h3>
              </div>
              <ol className="grid gap-4 md:grid-cols-2">
                {[
                  ['01 // Extraer', 'Fuentes oficiales de SII, catastro frutícola, DMC, empleo y comercio exterior, conservando originales y hashes.'],
                  ['02 // Transformar', 'Limpieza reproducible en Python, claves CUT como texto, tratamiento explícito de valores suprimidos y datamart consultable.'],
                  ['03 // Modelar', 'Índice 35/25/20/20, sensibilidad de pesos, K-means y forecast estacional comparado con un ingenuo.'],
                  ['04 // Verificar', 'Conciliaciones, diccionario de datos, manifiesto SHA-256 y prueba temporal separada antes de comunicar resultados.'],
                ].map(([title, description]) => (
                  <li key={title} className="border-l-2 border-murkoff-glitch bg-[#080b09] p-5">
                    <strong className="text-murkoff-glitch">{title}</strong>
                    <p className="mt-2 text-sm leading-6 text-gray-400">{description}</p>
                  </li>
                ))}
              </ol>
              <div className="flex flex-wrap gap-3">
                <LinkButton href={NOTEBOOK_URL}>Revisar notebook ejecutado</LinkButton>
                <LinkButton href={RESEARCH_URL}>Ver fuentes y código</LinkButton>
              </div>
            </section>
          )}

          {activeFile === 'findings' && (
            <section className="space-y-7" aria-labelledby="findings-title">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-murkoff-blood">Conclusiones accionables</p>
                <h3 id="findings-title" className="mt-2 text-2xl font-bold text-murkoff-paper">Qué haría un decisor con esta evidencia</h3>
              </div>
              <div className="space-y-4">
                <article className="border border-murkoff-blood bg-[#0a0000] p-5">
                  <h4 className="font-bold text-murkoff-blood">01 // Diagnosticar primero, no prometer pérdidas evitadas</h4>
                  <p className="mt-2 text-sm leading-6 text-gray-300">Iniciar en Chimbarongo y Placilla un levantamiento de riego, proveedores críticos y continuidad operativa. Son las prioridades más estables al cambiar los pesos del índice.</p>
                </article>
                <article className="border border-murkoff-dark bg-[#080b09] p-5">
                  <h4 className="font-bold text-murkoff-glitch">02 // Separar escala de dependencia</h4>
                  <p className="mt-2 text-sm leading-6 text-gray-300">San Fernando concentra la mayor red potencial de empresas, pero su dependencia agrícola es menor. Requiere una estrategia distinta a comunas pequeñas y más dependientes como Placilla o Palmilla.</p>
                </article>
                <article className="border border-murkoff-dark bg-[#080b09] p-5">
                  <h4 className="font-bold text-murkoff-glitch">03 // Vigilar el mercado sin atribuir causalidad</h4>
                  <p className="mt-2 text-sm leading-6 text-gray-300">La caída del valor unitario y la concentración del destino chino justifican monitoreo y diversificación comercial, pero no prueban por sí solas daño en una PYME específica.</p>
                </article>
              </div>
              <p className="border-l-4 border-white/20 pl-4 text-sm italic leading-6 text-gray-400">
                Faltan daños observados, red proveedor-cliente, cruce tamaño-sector, heladas, incendios y horas de frío. Esos vacíos se declaran: no se rellenan con datos inventados.
              </p>
            </section>
          )}

          <footer className="mt-10 border-t border-murkoff-dark pt-4 text-xs leading-5 text-gray-500">
            Fuente: proyecto Colchagua, revisión del 03-10-2026. Índice de prioridad, cifras territoriales, mercado, correlaciones y modelos disponibles en el repositorio y el notebook ejecutado.
          </footer>
        </div>
      </main>
    </div>
  );
}
