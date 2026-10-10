# Prototipo corto: el puesto y el ring

## Pregunta de diseño

¿Se entiende y resulta satisfactoria la preparación del puesto cuando sus decisiones cambian directamente el combate?

## Cómo jugar

Abre la campaña con `/?prueba` para iniciar esta versión corta. Pulsa Enter o el botón para empezar. En cada uno de los dos días de preparación, usa tres acciones: vender un producto (+$5), entrenar fuerza (cuesta $3 y 2 de energía) o descansar (+vida y energía; si estás al máximo no consume una acción). Cierra el día cuando hayas gastado las tres acciones. El tercer día enfréntate a Rábano (24 de vida): clic izquierdo o Espacio ataca; mueve el ratón al aparecer el aviso para esquivar. Entrenar acorta el combate; la esquiva solo cuenta durante el aviso.

La victoria pregunta si la preparación se sintió útil y permite repetir o volver a la campaña completa. La derrota también permite repetir.

## Alcance deliberadamente recortado

- Dos jornadas de gestión y un combate contra un solo rival.
- Sin guardado, economía de reabastecimiento, historia ramificada ni audio.
- Gráficos de formas y la paleta del juego para probar el bucle antes de invertir en arte final.
- El modo se carga dinámicamente y no sustituye la campaña de siete días.

## Criterio de decisión

Conservar el bucle si una partida de pocos minutos permite entender que vender financia entrenar, que entrenar acorta el combate y que esquivar evita daño. Si el jugador no puede anticipar cómo una acción mejora sus posibilidades, ajustar los costes y las señales antes de ampliar contenido.

## Estado de esta prueba

Recorrido automatizado hasta la victoria, golpe recibido al fallar la esquiva y esquiva satisfactoria tras el aviso; capturas en `.cache/capturas/prueba-flujo/` y `.cache/capturas/prueba-esquiva-fix/`. El siguiente paso es recoger criterio humano sobre la sensación del combate y usarlo para decidir qué conservar en la campaña completa.
