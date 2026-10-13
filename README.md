# Portafolio web — Cristóbal Rojas

Portafolio profesional interactivo desarrollado con Astro, React, React Three Fiber, Three.js y Tailwind CSS. La experiencia inspirada en *Outlast* presenta el perfil profesional y el caso de Business Intelligence **Colchagua: resiliencia agrícola y priorización de apoyo**.

## Sitio publicado

- Producción: <https://redkris0.github.io/portafolio-web/>
- Repositorio: <https://github.com/RedKris0/portafolio-web>
- Investigación y notebook: <https://github.com/rafajaque/Investigacion-Colchagua->

Cada `push` a `main` ejecuta el build y despliega automáticamente mediante GitHub Actions y GitHub Pages.

## Recorrido de evaluación

1. Seleccionar **Caso Colchagua** en el menú principal; este acceso directo está pensado para móvil, tablet y evaluación rápida.
2. Recorrer **Historia**, **Evidencia BI**, **Notebook** y **Decisiones**.
3. Descargar el archivo Power BI desde **Evidencia BI**. El dashboard se entrega como archivo `.pbix` por indicación docente.

La ruta narrativa completa sigue disponible en **Nueva partida** → monitor → `/colchagua`.

El comando `/ayuda` muestra todas las opciones disponibles.

## Caso Colchagua

La investigación pregunta qué comunas, sectores y grupos de PYMEs conviene priorizar para diagnosticar exposición ante amenazas agrícolas. El sitio comunica:

- problema, contexto y decisión;
- ranking territorial y sensibilidad del índice;
- indicadores de superficie, dependencia agrícola y mercado;
- pipeline ETL, modelo dimensional, clustering y forecast;
- conclusiones accionables, límites y advertencia de que correlación no implica causalidad;
- enlaces públicos al notebook ejecutado, informe, fuentes y código.

Los resultados no se presentan como probabilidades de pérdida ni identifican empresas vulnerables. Chimbarongo y Placilla son las prioridades más estables; el tercer territorio depende del objetivo del programa.

## Desarrollo local

Requisitos: Node.js 20 o superior.

```bash
npm install
npm run dev
```

Validación de tipos y build de producción:

```bash
npm run build
```

## Arquitectura

- `src/pages/index.astro`: documento principal y metadatos.
- `src/components/DesktopScene.jsx`: escena 3D, cámara y coordinación de overlays.
- `src/components/WindowsXPScreen.jsx`: login y terminal interactiva.
- `src/components/InvestigationFiles.jsx`: storytelling, evidencia y conclusiones del caso Colchagua.
- `src/components/OutlastDocumentOverlay.jsx`: perfil profesional.
- `src/utils/`: rutas de recursos, audio y preparación de modelos.
- `public/`: modelos, texturas, sonidos y archivo Power BI descargable.

## Despliegue

El workflow `.github/workflows/deploy.yml` se activa con cada push a `main`, construye el sitio con la acción oficial de Astro y publica el artefacto en GitHub Pages. `astro.config.mjs` configura la URL y el subdirectorio `/portafolio-web`.

## Accesibilidad y diseño responsivo

- Navegación principal y terminal utilizables con teclado.
- Etiquetas semánticas y estados accesibles en el expediente.
- Contraste alto y soporte para `prefers-reduced-motion`.
- Layouts adaptables para móvil, tablet y escritorio.
- Enlaces externos identificables y botón de descarga del PBIX.

## Uso de inteligencia artificial

ChatGPT/Codex se utilizó como apoyo para auditoría, programación, depuración y redacción. Las fuentes, métricas, decisiones y conclusiones fueron revisadas contra los archivos reproducibles del proyecto. 

## Créditos

Experiencia visual no comercial inspirada en *Outlast*, propiedad de Red Barrels. Los créditos de modelos y licencias están disponibles dentro del menú y mediante el comando `/creditos`.
