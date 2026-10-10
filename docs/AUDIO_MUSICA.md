# Música y mezcla — Patata Caliente

Tres bucles originales generados en el PC con MusicGen stereo medium (Meta), conservando semillas y prompts en `docs/ia_assets.jsonl`. Efectos retro: 15 WAV de `public/assets/sonidos/`; mediciones y candidatos anteriores están en `.cache/sfx/AUDIO_EFECTOS.md`.

## Mediciones finales

Medidas con `ffprobe` y `ffmpeg -af volumedetect` el 10 de octubre de 2026. MP3 estéreo, 32 kHz, 192 kbps. Los valores de media son RMS de volumedetect; no son LUFS.

| Archivo | Duración | Bytes | Pico dBFS | Media dBFS | Semilla | Uso |
|---|---:|---:|---:|---:|---:|---|
| barrio.mp3 | 14.607 s | 352556 | -4.4 | -18.4 | 410101 | Mercado, entrenamiento y descanso |
| ring.mp3 | 15.940 s | 384524 | -4.4 | -24.5 | 410201 | Combates |
| portada.mp3 | 13.940 s | 337004 | -4.3 | -22.5 | 510103 | Menú y desenlaces |

Prompts musicales completos, sin voces, en el registro. Portada: `calm retro boxing town introduction, warm muted electric piano, soft rounded bass, gentle brushed drum machine, 80 bpm, hopeful bittersweet neighborhood melody, instrumental without voices, seamless loop`.

La herramienta funde los últimos 2 segundos con el inicio del bucle. La duración final se reduce respecto a los 16 segundos pedidos a portada. No se ha validado la continuidad mediante escucha.

Procesado de portada: origen `.cache/musica/portada-510103.mp3`, FFmpeg `volume=-2.7dB`, recodificación libmp3lame 192k. Procesado de ring: original conservado `.cache/musica/ring-410201.mp3`, `volume=-2.8dB`, misma recodificación. Barrio se conserva tal como quedó en la tanda anterior. La compresión MP3 hace que el pico final difiera ligeramente de sumar la ganancia al pico original.

SHA256 finales:

- barrio: `4C671D15223266FEA90AD378B21CB0099B914223619B11FA2F3F6B2CD72A3F3C`
- ring: `996DE837A3760CD36F2A2544DC6E9BC9A8AD1850C5FECD631F7970E2294810A5`
- portada: `EE74BD0CD805428E0E5E9108A27F832D94C73E777E9EB9D52B0CE62F76A00632`

## Integración

`src/audio.ts`: un AudioContext tras el primer gesto, buses música/efectos/interfaz, maestro a -3 dB y compresor de protección. Música a -9 dB, pausa otros -9 dB; impactos y desenlaces atenúan temporalmente la música otros -7 dB. Los controles persistentes operan sobre grupos. Carga por rutas BASE_URL para alojamientos en subcarpetas; síntesis de respaldo mientras carga o ante un archivo fallido, con aviso por consola.

Fundido de entrada 450 ms y salida 400 ms. Máximo cuatro capas musicales durante cambios rápidos y 24 voces. Golpes/ventas alternan variantes sin repetir inmediatamente y varían tono ±6%. Intervalo mínimo por efecto 35 ms. Al ocultar la pestaña el maestro se atenúa a cero; al destruir el sistema se abortan peticiones, detienen fuentes y desconectan sus envolventes. La API sigue sirviendo al modo clásico y a la demo.

## Verificación real

`herramientas/probar.mjs` en Vite 5173: una instancia de GameAudio cargó y decodificó 18 archivos con cero fallos; nueve cambios rápidos conservaron ≤4 capas y, tras 700 ms, una capa. Se verificó pausa, silencio/reanudación y dispose dos veces, terminando sin contexto ni voces ni capas. Captura inspeccionada: `.cache/capturas/audio-cierre/01-audio-activo.png`. Esta comprobación valida el sistema de audio; no es una escucha ni una partida completa de la campaña mensual.

## Créditos y límites

MusicGen stereo medium — Meta / Facebook, modelo `facebook/musicgen-stereo-medium`, pesos con licencia CC-BY-NC 4.0 según el generador local. Selección y procesamiento: equipo Casi con asistencia de Codex; generación GPU local. Fuentes del modelo: https://huggingface.co/facebook/musicgen-stereo-medium y https://github.com/facebookresearch/audiocraft.

La licencia requiere atribución y limita el uso a no comercial. No se utilizaron sonidos o pistas de Punch Club. Pendiente: escuchar con auriculares/altavoces para valorar música, unión del bucle y balance percibido. Los picos medidos no garantizan el nivel de varias voces sumadas.
