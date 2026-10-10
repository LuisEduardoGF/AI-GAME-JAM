# Créditos y licencias

Equipo Casi: A00407796, A00431524 y A00429821. Evento: AI GAME JAM. Recursos originales del equipo y asistencia de IA documentados a continuación.

## Herramientas y modelos de IA

Herramientas disponibles en el entorno. Uso integrado confirmado: Codex, Claude, SDXL / Pixel Art XL, MusicGen y generador retro. Las filas de otras herramientas describen disponibilidad, sin atribuir generación de assets que no realizaron.

| Herramienta | Uso | Licencia / condiciones |
|---|---|---|
| Stable Diffusion XL 1.0 (Stability AI) | imágenes | CreativeML Open RAIL++-M |
| SDXL-Lightning (ByteDance) | imágenes rápidas | OpenRAIL++ |
| Pixel Art XL (nerijs) | estilo pixel art | CreativeML Open RAIL-M |
| SDXL VAE fp16 fix (madebyollin) | imágenes | MIT |
| ISNet (DIS) | recortar fondos | Apache 2.0 |
| MusicGen stereo medium (Meta) | música | **CC-BY-NC 4.0: solo uso no comercial** |
| AudioLDM2 (cvssp) | efectos de sonido realistas | **CC-BY-NC-SA 4.0: solo uso no comercial** |
| ChatGPT (OpenAI), si se usa | imágenes de personajes/arte | condiciones de OpenAI |
| Microsoft Edge TTS (edge-tts) | voces | servicio de Microsoft; uso personal/no comercial |
| Generador de efectos estilo sfxr (herramientas/sfx.py) | efectos de sonido | propio, basado en sfxr (DrPetter) |
| ChatGPT/Codex (OpenAI) | GDD, programación, pruebas, revisión e integración de assets | condiciones de OpenAI |
| Claude (Anthropic), interfaz Sonnet 5.5 | Auditoría del extracto de demo y propuesta de mecánicas / balance mensual | condiciones de Anthropic; revisión de propuestas por Codex |

## Skills de Claude de terceros (conocimiento, no código del juego)
| Origen | Skills | Licencia |
|---|---|---|
| awesome-gamedev-agent-skills (Abhishek Barali y colaboradores) | game-jam, game-feel, level-design, géneros, threejs-scene-setup… | Apache 2.0 |
| threejs-game-skills (Majid Manzarpour) | threejs-aaa-graphics-builder, threejs-qa-release, threejs-debug-profiler, threejs-game-ui-designer | MIT |
| Everything Claude Code (Affaan Mustafa) | agentes planner, code-reviewer, build-error-resolver, gan-*… y comandos ecc-* | MIT |

## Librerías
| Librería | Licencia |
|---|---|
| Phaser 3.90.0 | MIT |
| Fuentes (@fontsource) | SIL Open Font License |

## Assets del juego
| Archivo | Herramienta | Prompt / origen |
|---|---|---|
| Fondos y Patata / Yuca / Rábano; hojas de Batata y Remolacha | Recursos propios autorizados por el usuario | Images.zip e imágenes del equipo; no se atribuye una IA de origen desconocida |
| home-interior.jpg | Imagen propia proporcionada por el usuario para la habitación | Copia íntegra del adjunto; procedencia y SHA256 en habitacion-manifest.json; sin nueva generación IA |
| batata-boxer.png, remolacha-boxer.png | Recorte y normalización de hojas propias | Coordenadas y hashes: arte-mensual-manifest.json |
| patata-ataques.png (24 cuadros) | Hoja propia del equipo; recorte y normalización local | zip juego.zip; procedencia y hashes: patata-animacion-manifest.json; sin atribuir IA de origen desconocido |
| esbirro-yuca.png, esbirro-rabano.png, esbirro-remolacha.png, esbirro-batata.png | SDXL 1.0 + Pixel Art XL local | Prompts, semillas, variantes y selección: ARTE_MENSUAL.md, arte-mensual-manifest.json e ia_assets.jsonl |
| 15 WAV en public/assets/sonidos | Generador retro local herramientas/sfx.py | Semillas, parámetros y mediciones: AUDIO_EFECTOS.md y audio-efectos-manifest.json |
| barrio.mp3, ring.mp3, portada.mp3 | Meta MusicGen stereo medium local | Prompts, semillas y procesado: AUDIO_MUSICA.md e ia_assets.jsonl |

La música usa pesos CC-BY-NC 4.0 y requiere atribución a Meta / Facebook MusicGen; esta build se prepara para distribución no comercial. Modelo: https://huggingface.co/facebook/musicgen-stereo-medium. Los nuevos cobradores usan SDXL con Pixel Art XL según las licencias de la tabla. El juego no usa arte, música, nombres de habilidades ni código extraídos de Punch Club.

La escucha humana de la mezcla y la continuidad de los bucles permanece pendiente. El código sintetiza sonidos de respaldo mientras se cargan los archivos.

## Dirección visual del barrio

Veinte iconos, paneles y geometría del ring originales dibujados con código por Codex; sin recursos gráficos externos añadidos en este pase. Claude colaboró mediante revisión de capturas y recomendaciones de diseño, registradas en REVISION_CLAUDE_GRAFICA.md. Diseño aplicado y criterios en DIRECCION_VISUAL.md.

