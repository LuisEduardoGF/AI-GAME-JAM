# Cómo documentamos el uso de IA

`AI_TRACE.md` es un registro incremental, legible y asociado a commits. Cada tarea relevante añade una entrada al final mediante `node herramientas/traza.mjs`; no se corrigen ni se reemplazan entradas anteriores. La traza facilita la revisión, pero la evidencia técnica de archivos y cambios está en el commit de contenido y su diff.

## Qué registrar en cada tarea

Conservar los campos oficiales (`Task`, `Participant`, `Type`, `Files`, `Change`, `Commit`, `Notes`) y, dentro de `Notes`, añadir cuando haya evidencia:

- **IA y proveedor:** nombre del producto, organización y modelo/versión si la interfaz o el registro los muestra. No adivinar versiones ocultas.
- **Modalidad/coste conocido:** servicio web, API por uso, suscripción, modelo ejecutado localmente, herramienta procedural sin modelo, o `desconocido`. Plan y pago son datos distintos: saber que se usó Claude o ChatGPT no demuestra qué plan pagó el usuario.
- **Agentes:** nombre/rol de cada subagente realmente invocado y su tarea (por ejemplo, revisión de TypeScript). Distinguir los agentes que escribieron código, revisaron, probaron o solo dieron recomendaciones. Registrar también si no se encargó trabajo a agentes.
- **Archivos:** `Files` debe coincidir con los paths del commit. En `Notes`, explicar los reemplazos importantes: qué archivo existente se modificó o sustituyó, qué se añadió o retiró, y si hubo sobrescritura completa. No describir como sobrescrito un archivo solo porque fue editado.
- **Aporte humano y evidencia:** assets entregados/decisiones del equipo, comandos de verificación, límites de acceso, revisiones que no pudieron hacerse y resultados pendientes.

Ejemplo de notas, adaptado a la evidencia real de cada tarea:

```text
IA: Codex (OpenAI), modelo visible: <nombre o no expuesto>; plan/pago: desconocido.
Agentes: <nombre y rol/tarea, o ninguno>. Claude: <consulta/revisión concreta, si ocurrió>.
Archivos existentes editados: <paths>. Archivos nuevos: <paths>. Reemplazos completos: <path y motivo, solo si aplica>.
Humano: <decisión, asset o revisión>. Verificación: <comandos y resultado>. Límites: <lo que no se pudo confirmar>.
```

## Qué significa “archivos sobrescritos”

El campo `Files` enumera archivos incluidos en el commit; por sí solo no afirma que se reescribiera cada archivo completo. Usa `git show --name-status <commit>` para clasificar `A` (nuevo), `M` (modificado) y `D` (eliminado), y `git show --stat`/`git diff <commit>^ <commit> -- <ruta>` para ver cuánto cambió. Git conserva las versiones anteriores mientras los commits sigan disponibles. Para una imagen o audio reemplazado, registra además origen y hashes antes/después cuando existan. No alteres la traza previa para completar datos retrospectivos que no se conservaron.

Los assets generados tienen un registro complementario en `docs/ia_assets.jsonl`, con herramienta, modelo, prompt y, cuando aplica, semilla y hash. Créditos/licencias están en `docs/CREDITOS.md`. Una revisión de Claude se documenta como revisión, no como autoría del código revisado.

## Inventario verificable a la fecha

| Uso observado | Evidencia | Plan/pago |
|---|---|---|
| Codex (OpenAI), asistente de programación de esta sesión; modelo mostrado al agente: GPT-6 | Cambios del repositorio y esta entrada incremental | Desconocido; no se inspecciona la facturación privada |
| Agentes Codex `mes_code_review` y `mensual_typescript`: revisión de código y TypeScript del pase de rutina | Respuestas de revisión de esta tarea, sin cambios propios de esos revisores | No consta un cobro independiente ni el plan de la cuenta |
| Claude/Anthropic: revisiones de mecánicas y gráficas cuyo resultado se conserva en `REVISION_CLAUDE_MENSUAL.md` y `REVISION_CLAUDE_GRAFICA.md` | Informes guardados y citados por la documentación del juego | Modelo exacto y plan/coste no constan; no inferirlos |
| SDXL 1.0 y Pixel Art XL, ejecutados localmente para imágenes seleccionadas | `docs/ia_assets.jsonl` y manifiestos de arte | Ejecución local; sin prueba de un cargo de servicio por generación. Aplican licencias/modelos declarados |
| MusicGen para pistas incorporadas | `docs/ia_assets.jsonl`, manifiesto, créditos y documentación de audio | Modelo local; licencia CC-BY-NC 4.0 indicada en créditos. No equivale a conocer el plan de una cuenta |
| Generador local `herramientas/ia sfx` para efectos retro | `docs/AUDIO_EFECTOS.md` y trazas de integración | Síntesis procedural local, no atribuirla a un modelo generativo de pago |

Hay opciones declaradas o preparadas (por ejemplo, Ollama/gpt-oss y AudioLDM2) que no se deben presentar como uso efectivo de una tarea sin un resultado, log o asset que lo demuestre. Assets compartidos por el equipo se atribuyen a su procedencia humana, aunque después se procesen localmente.

## Límites de esta copia

El Prompt oficial pide que la traza de equipo contenga tarea, archivos, resumen y limitaciones. No se dispone aquí de un gateway organizador ni de su registro externo append-only; por tanto, los timestamps locales y `AI_TRACE.md` no sustituyen una marca de servidor. El hash del commit permite contrastar los archivos del repositorio. La traza no prueba por sí sola el plan comercial, quién manejó físicamente una cuenta externa ni cada prompt de chat que no se guardó.
