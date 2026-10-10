# Dirección visual — barrio y ring

Pase del 10 de octubre de 2026, equipo Casi. Se mantienen los recursos propios y el combate existente. Claude revisó cuatro capturas; respuesta real en `REVISION_CLAUDE_GRAFICA.md`. Codex aplicó y comprobó los cambios.

## Factores de calidad

| Factor | Criterio aplicado | Implementación |
|---|---|---|
| Composición | Separar escena, información y acción principal | HUD opaco sobre el fondo, tarjetas y una acción principal ámbar |
| Legibilidad | Decisiones con texto de al menos 12 px lógicos y margen | Precios, requisitos y registro ampliados; textos cortos de habilidades |
| Coherencia | Repetir paleta, bordes, espaciado y símbolos | Carbón y crema, acentos por estilo, 20 iconos propios dibujados con código |
| Profundidad | Anclar personajes y distinguir planos | Sombras de contacto, halos discretos, suelo y cuerdas en perspectiva |
| Respuesta visual | Identificar golpe, técnica y resultado | Destellos, partículas breves, números, nombres de técnica y pose del derrotado |

Paleta: carbón `#17151c`, panel `#29232a`, elevado `#3b3034`, crema `#fff0d2`, texto secundario `#cfbda7`, ámbar `#f0b45b`. Acentos: flameante `#efaa55`, ardiente `#d97561`, roca `#81afa7`. Los fondos cálidos del equipo siguen siendo protagonistas.

## Evidencia y límites

- Contraste calculado mediante luminancia sRGB: crema/panel 13.63:1; secundario/panel 8.40:1; deshabilitado/elevado 5.54:1; carbón/ámbar 9.81:1. Son pares de colores sólidos; no una auditoría completa de todos los píxeles.
- Diagnóstico de geometría de texto y botones disponible únicamente en `?debug`. Las nueve vistas de rutina inspeccionadas no muestran textos fuera del lienzo ni etiquetas mayores que sus botones. No detecta todas las posibles superposiciones entre elementos.
- Revisión visual de un agente: valoración orientativa anterior 6/6/6/4/6 y posterior 8/8/8/8/7 para los cinco factores. Son juicios sobre capturas, no métricas objetivas ni una prueba de animación.
- Claude recomendó precios/requisitos legibles, ring con profundidad, señal de K.O., umbral de calor y etiqueta TIEMPO. Se incorporaron esos puntos; su propuesta de paleta se adaptó a los fondos existentes.
- Los iconos, paneles y geometría son originales generados con código; este pase no generó imágenes nuevas con IA. Patata conserva sus 24 cuadros propios. Los rivales reaccionan por destello, desplazamiento y pose de derrota, pero no tienen animación por cuadros.
- Quedan pendientes la valoración humana del acabado, una casa con arte más detallado, legibilidad práctica en teléfono vertical y escucha humana de la mezcla. No se afirma una garantía de 60 FPS en todos los equipos.

Capturas de desarrollo: `.cache/capturas/diseno-legibilidad-final/`, `diseno-paneles/` y `diseno-segundo-pase/`. La verificación final de producción se registra en `PROGRESO.md`.
