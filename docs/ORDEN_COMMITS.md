# Orden de incorporación al repositorio

El 10 de octubre de 2026 el usuario autorizó subir commits por funcionalidad en ramas separadas. El remoto y la rama local inicial estaban vacíos. Estos commits registran la incorporación actual del material; las tareas anteriores y sus fechas reales están en AI_TRACE.md. No se reconstruyen ni se cambian fechas de commits anteriores.

Los nombres al principio del mensaje identifican responsables de revisión indicados por el usuario. La autoría Git conserva la identidad configurada y la traza declara el trabajo con IA; no se añaden firmas ni coautores supuestos.

| Orden | Rama | Prefijo | Contenido |
|---|---|---|---|
| 01 | codex/luis-01-base | Luis | Configuración, dependencias, entradas, identidad y documentación general |
| 02 | codex/johan-mariana-02-arte | Johan y Mariana | Fondos, personajes, cuadros de Patata, iconos y dirección visual |
| 03 | codex/mariana-luis-03-sonido | Mariana y Luis | Mezclador, música, efectos y manifiestos de audio |
| 04 | codex/luis-04-modelo-mensual | Luis | Mercado, demanda, atributos, técnicas, deudas y combate automático |
| 05 | codex/luis-05-modos-clasicos | Luis | Prototipo, campaña anterior, lugares y orientación |
| 06 | codex/luis-06-interfaz-tutorial-demo | Luis | Presentación mensual, guía, demo y empaquetado |
| 07 | codex/luis-07-integracion | Luis | Registro de hashes y verificación del conjunto |

Las ramas se apilan en este orden: cada una incorpora el grupo anterior y añade su funcionalidad. Los grupos intermedios tienen referencias que se completan al integrar el conjunto; no se presentan como entregas jugables independientes. La última rama y main contienen el juego completo. Revisar el diff contra la rama anterior permite ver cada grupo separado.

Se usan commits normales, con fechas reales y entradas nuevas de trazabilidad. El helper oficial del entorno admite `--solo-index` para respetar los archivos preparados y `--prefijo` para incluir los nombres también en el commit de la traza. Los ZIP generados se conservan localmente y se excluyen de Git; se regeneran mediante los comandos del README.

## Commits verificados

| Grupo | Commit funcional | Commit de traza |
|---|---|---|
| Base | 726536006104d6671b214a464d7e301bc7f09acc | 349544b2748808d898e6c813dbf7f8b0d57ed87d |
| Arte | a61685664ce948dc4a4a2c780a7e4283a0e518cd | 0ac189f1c46e2133359b02769713225b8e1c9e42 |
| Sonido | 4d85a3ad67dce94066d0cfd0e298aa21ab9b1d50 | 57568de24beaa79ed16daba95b6b75c3b57bbc43 |
| Modelo mensual | c35d9c8e3001f2eeb00f440f8c0bdc881e671fc2 | b58aacffaa0eb5ba55f3725891114a12735d8570 |
| Modos clásicos | dff29c7113a874e28baba9f6e519142975794110 | 296c4ba3e8777730450363dc3a26e6c5d5a704c7 |
| Interfaz/tutorial/demo | 651c0da716b1118d6765040f8e9df9ae94a26c24 | 539c6211d8af965649eebeeb2af816d5a73c371e |

Las seis puntas remotas fueron consultadas con `git ls-remote --heads origin` y coinciden con los commits de traza de esta tabla. Se mantiene un commit de traza por grupo conforme al helper oficial.

Para revisar el orden real: `git log --reverse --oneline main`. Para aislar arte: `git diff codex/luis-01-base..codex/johan-mariana-02-arte`; para sonido: `git diff codex/johan-mariana-02-arte..codex/mariana-luis-03-sonido`. Aplicar el mismo patrón a los grupos siguientes.

## Comprobación de integración

Sobre el commit 539c6211d8af965649eebeeb2af816d5a73c371e se creó una copia limpia, sin archivos no versionados ni node_modules del workspace. `npm ci --offline`, `npm run check`, `npm run build` y `npm run build:demo` finalizaron correctamente. El aviso de tamaño de Phaser continúa. El arranque, tutorial, rutina y pausa se verificaron en navegador y sus capturas se inspeccionaron; las rutas completas previas están en PROGRESO.md.
