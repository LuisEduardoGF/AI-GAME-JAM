# Efectos retro — Patata Caliente

## Resultado

15 archivos WAV mono, PCM de 16 bits a 44.1 kHz. Peso total: 357,440 bytes. Producidos con el sintetizador CPU local `herramientas/ia sfx`, escogidos por tipo, envolvente, ausencia de repeticion, duracion y volumen. No se utilizaron modelos GPU y no se escucharon los resultados.

## Mediciones verificadas

Mediciones por archivo con `ffprobe` y `ffmpeg -af volumedetect`. Los picos se muestran con precision de 0.1 dB.

| Archivo | Duracion (s) | Pico (dBFS) | Media (dBFS) | Semilla | Evento | Escucha humana |
|---|---:|---:|---:|---:|---|---|
| `venta-1.wav` | 0.107 | -6.0 | -16.2 | 76300 | Venta completada; variante 1 | Prioritario (ventas) |
| `venta-2.wav` | 0.110 | -6.0 | -13.0 | 76303 | Venta completada; variante 2 | Prioritario (ventas) |
| `impacto-1.wav` | 0.207 | -6.0 | -17.8 | 76311 | Golpe conectado; variante de ruido 1 | Prioritario (golpes) |
| `impacto-2.wav` | 0.180 | -6.0 | -17.6 | 76412 | Golpe conectado; variante de ruido 2 | Prioritario (golpes) |
| `impacto-3.wav` | 0.070 | -6.0 | -17.8 | 76410 | Golpe conectado; variante tonal grave | Prioritario (golpes) |
| `guardia.wav` | 0.086 | -8.0 | -16.1 | 76413 | Golpe recibido con guardia | Recomendado |
| `esquiva.wav` | 0.196 | -8.0 | -11.9 | 76320 | Esquiva activada |  |
| `entrenar.wav` | 0.229 | -6.0 | -14.8 | 76330 | Atributo entrenado |  |
| `reponer.wav` | 0.140 | -8.0 | -19.7 | 76353 | Puesto repuesto |  |
| `confirmar.wav` | 0.057 | -12.0 | -18.6 | 76340 | Confirmacion y navegacion | Prioritario (interfaz) |
| `hablar.wav` | 0.047 | -12.0 | -19.5 | 76343 | Conversacion o decision |  |
| `descansar.wav` | 0.354 | -10.0 | -14.3 | 76403 | Recuperacion en casa |  |
| `fuego.wav` | 0.426 | -6.0 | -19.7 | 76363 | Modo en Llamas |  |
| `victoria.wav` | 0.619 | -6.0 | -16.5 | 76400 | Combate ganado | Recomendado |
| `derrota.wav` | 1.212 | -8.0 | -22.6 | 76362 | Combate perdido | Recomendado |

## Criterios y limites

- Golpes de 70–207 ms, sin repeticion; todos los sonidos frecuentes son inferiores a 0.6 s.
- Victoria dura 0.619 s y derrota 1.212 s, dentro del margen para finales breves.
- Fundido inicial de 2 ms y final de 15 ms; filtro de graves y filtro de agudos para reducir extremos.
- Picos finales entre -6 y -12 dBFS, con margen antes de la mezcla del juego. El pico del archivo no garantiza el pico de varias voces sumadas.
- Descanso baja el tono a 0.83 de la velocidad; derrota a 0.65 para una caida mas grave.
- La calidad percibida y el balance con musica requieren escucha humana. Priorizar golpes, confirmar y ventas, ademas de la musica principal.
- Aun no se afirmo que los archivos suenen dentro del juego: la integracion y la comprobacion de carga quedan a cargo del agente principal.

## Procedencia reproducible

Los 36 candidatos originales y sus semillas quedaron registrados incrementalmente por la herramienta en `juego/docs/ia_assets.jsonl`. No se edito ni reescribio el registro. La eleccion y los filtros de cada archivo final, ganancia exacta, duracion, canales, pico, media y SHA256 estan en `.cache/sfx/retro-casi/manifest-final.json`. Los archivos originales se conservan en `.cache/sfx/retro-casi/`.

Generaciones CPU realizadas (4 variantes por comando):

```powershell
herramientas\ia.cmd sfx moneda --variantes 4 --semilla 76300 --carpeta .cache/sfx/retro-casi/moneda
herramientas\ia.cmd sfx golpe --variantes 4 --semilla 76310 --carpeta .cache/sfx/retro-casi/golpe
herramientas\ia.cmd sfx salto --variantes 4 --semilla 76320 --carpeta .cache/sfx/retro-casi/salto
herramientas\ia.cmd sfx powerup --variantes 4 --semilla 76330 --carpeta .cache/sfx/retro-casi/powerup
herramientas\ia.cmd sfx seleccion --variantes 4 --semilla 76340 --carpeta .cache/sfx/retro-casi/seleccion
herramientas\ia.cmd sfx paso --variantes 4 --semilla 76350 --carpeta .cache/sfx/retro-casi/paso
herramientas\ia.cmd sfx explosion --variantes 4 --semilla 76360 --carpeta .cache/sfx/retro-casi/explosion
herramientas\ia.cmd sfx golpe --variantes 4 --semilla 76410 --carpeta .cache/sfx/retro-casi/golpe-b
herramientas\ia.cmd sfx powerup --variantes 4 --semilla 76400 --carpeta .cache/sfx/retro-casi/powerup-b
```

Para reconstruir cada archivo: primero aplicar `filters` al `source` con ffmpeg mono a 44.1 kHz PCM 16-bit; despues aplicar `volume=<gain_db>dB` al WAV intermedio. Ambos valores constan en el manifiesto.

## Creditos propuestos para integrar

Efectos retro: equipo Casi con asistencia de Codex, sintetizador CPU local `herramientas/sfx.py` inspirado en sfxr. Seleccion objetiva por duracion y volumen, filtros/fundidos/ganancia con FFmpeg. No se usaron samples de Punch Club ni descargas externas.

- `public/assets/sonidos/venta-1.wav`: tipo `moneda`, semilla 76300; evento Venta completada; variante 1.
- `public/assets/sonidos/venta-2.wav`: tipo `moneda`, semilla 76303; evento Venta completada; variante 2.
- `public/assets/sonidos/impacto-1.wav`: tipo `golpe`, semilla 76311; evento Golpe conectado; variante de ruido 1.
- `public/assets/sonidos/impacto-2.wav`: tipo `golpe`, semilla 76412; evento Golpe conectado; variante de ruido 2.
- `public/assets/sonidos/impacto-3.wav`: tipo `golpe`, semilla 76410; evento Golpe conectado; variante tonal grave.
- `public/assets/sonidos/guardia.wav`: tipo `golpe`, semilla 76413; evento Golpe recibido con guardia.
- `public/assets/sonidos/esquiva.wav`: tipo `salto`, semilla 76320; evento Esquiva activada.
- `public/assets/sonidos/entrenar.wav`: tipo `powerup`, semilla 76330; evento Atributo entrenado.
- `public/assets/sonidos/reponer.wav`: tipo `paso`, semilla 76353; evento Puesto repuesto.
- `public/assets/sonidos/confirmar.wav`: tipo `seleccion`, semilla 76340; evento Confirmacion y navegacion.
- `public/assets/sonidos/hablar.wav`: tipo `seleccion`, semilla 76343; evento Conversacion o decision.
- `public/assets/sonidos/descansar.wav`: tipo `powerup`, semilla 76403; evento Recuperacion en casa.
- `public/assets/sonidos/fuego.wav`: tipo `explosion`, semilla 76363; evento Modo en Llamas.
- `public/assets/sonidos/victoria.wav`: tipo `powerup`, semilla 76400; evento Combate ganado.
- `public/assets/sonidos/derrota.wav`: tipo `explosion`, semilla 76362; evento Combate perdido.

## Reproduccion sugerida

Mantener la API existente `GameAudio` al integrar:

```ts
audio.play('sell') // alternar venta-1.wav / venta-2.wav
audio.play('hit') // alternar impacto-1.wav / impacto-2.wav / impacto-3.wav
audio.play('block') // guardia.wav
audio.play('dodge') // esquiva.wav
audio.play('train') // entrenar.wav
audio.play('restock') // reponer.wav
audio.play('confirm') // confirmar.wav
audio.play('talk') // hablar.wav
audio.play('rest') // descansar.wav
audio.play('flame') // fuego.wav
audio.play('win') // victoria.wav
audio.play('lose') // derrota.wav
```

Resolver rutas desde `import.meta.env.BASE_URL`; cargar/decodificar despues del gesto de audio, controlar concurrencia y variar el tono de golpes/ventas ±6%. La implementacion queda en manos del agente principal.
