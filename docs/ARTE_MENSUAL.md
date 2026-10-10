# Arte de jefes y cobradores

## Recursos terminados

Se añadieron dos jefes y cuatro cobradores. Todos son PNG RGBA con transparencia binaria 0/255, altura 48 px y paleta de 24 colores; la escena puede ampliarlos con pixelArt. El manifiesto `arte-mensual-manifest.json` guarda dimensiones, origen, prompts, semillas y SHA256 reales.

| Archivo en public/assets/img | Medidas | Origen |
|---|---:|---|
| batata-boxer.png | 30×48 | Hoja propia: 2026-10-09 11.28.31 PM, pose inicial con chaqueta púrpura |
| remolacha-boxer.png | 37×48 | Hoja propia: 2026-10-09 11.24.58 PM, Remolacha frontal con armadura |
| esbirro-yuca.png | 37×48 | SDXL calidad, semilla 510611 |
| esbirro-rabano.png | 42×48 | SDXL calidad, semilla 510711 |
| esbirro-remolacha.png | 34×48 | SDXL calidad, semilla 510811 |
| esbirro-batata.png | 33×48 | SDXL calidad, semilla 510911 |

Las dos hojas fueron entregadas por el usuario en Images.zip y autorizadas como assets propios. Se extrajeron cuadros completos sin etiquetas; procesamiento CPU `herramientas/ia procesar --transparente --fondo color --pixel 48 --colores 24`. Las cajas exactas y hashes originales constan en el manifiesto. No se inventa qué IA creó los originales del equipo.

## Generación y selección

SDXL 1.0 + Pixel Art XL, calidad 30 pasos y guía 6, una generación GPU a la vez. Lote con cuerpos de yuca/rabano/remolacha/batata, guantes por familia, contornos oscuros y paleta cálida. Prompts completos y negativo en `.cache/arte/cobradores-calidad.txt` y manifiesto; negativo: humanos, varias figuras, collages, hojas, texto y decorados.

Se generaron y miraron 16 candidatos en dos tandas. La primera tanda rápida (8 pasos) se descartó por producir humanos y collages. La segunda tanda produjo dos variantes de cada familia; se escogió la segunda de cada una por personaje individual, cuerpo visible y silueta legible. Se descartaron las primeras de Yuca, Remolacha y Batata por mostrar varias figuras. La primera de Rábano tenía una silueta más estrecha y menos legible. Los descartes se conservan en `.cache/arte/cobradores/` y `.cache/arte/cobradores-calidad/` y sus registros originales permanecen en `ia_assets.jsonl`.

No se afirma animación por cuadros: estas imágenes contienen una sola pose. La interfaz puede dar vida con balanceo, golpes y reacción al daño. La fidelidad de todas las familias podrá pulirse con nuevas poses coherentes después de la entrega de demo.

## Integración y comprobaciones

Jefes y cobradores usan las claves de textura de `src/mes/modelo.ts`; el preload vive en `src/mes/escena.ts`. Se probaron encuentros reales mediante funciones del modelo y el puente limitado a `?debug`, en un navegador aislado de pruebas, sin alterar el guardado del usuario. Capturas en `.cache/capturas/arte-mensual/`: preparación de General Remolacha y Batata, cobros de las cuatro familias. Los cinco primeros usan sus sprites y se inspeccionaron sin errores de consola, texto tapado ni figuras sobre botones. La primera captura de cobrador Batata mostró el fallback procedural: se añadió su preload y se repitió la prueba. Captura final inspeccionada `.cache/capturas/arte-mensual-cierre/06-cobrador-batata-integrado.png`, con el PNG de Batata cargado y sin errores. Los seis sprites están integrados y el check TypeScript pasó al cierre.

## Créditos propuestos

Originales de Batata y General Remolacha: equipo Casi, recursos propios enviados en Images.zip; recorte y normalización con asistencia de Codex. Cobradores: equipo Casi con asistencia de Codex, SDXL 1.0, Pixel Art XL, generación local y selección visual. SDXL usa OpenRAIL++ y Pixel Art XL OpenRAIL-M según la documentación de herramientas del proyecto. No se extrajeron imágenes del juego Punch Club.
