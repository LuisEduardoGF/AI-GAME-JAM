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

Los hashes y la comprobación del remoto se añaden después de crear los commits.
