# Tutorial y ayuda ampliados

La introducción y la ayuda comparten ocho temas: primeros pasos; rutina y lugares; mercado y mejoras; atributos y descanso; estilos y habilidades; combate automático; cobros y jefes; controles y guardado. Cada tema contiene tres explicaciones breves y un consejo.

## Acceso y navegación

- Portada: GUÍA DEL JUEGO. Partida: AYUDA. Combate: Esc → AYUDA.
- El índice abre cualquier tema; ANTERIOR/SIGUIENTE recorre la guía.
- La introducción permite empezar sin leer todos los temas. Enter conserva su acción de empezar o volver.
- Esc y VOLVER cierran la guía; si se abrió desde pausa, regresan a pausa.
- Leer y paginar no consume recursos ni franjas ni modifica la campaña. Durante una pelea mantiene detenida la simulación.
- Objetivo y fechas de encuentros se adaptan a demo de tres días o campaña mensual.

Los textos explican precios por unidad/lotes, demanda limitada, despensa, desgaste de atributos, energía frente a estamina, aprender frente a equipar, prioridad de técnicas coincidentes, calor a partir de 85, cobros, derrotas, vínculo y guardado local. Corresponden al modelo actual; no prometen funciones futuras.

## Verificación

Tipos y ambas builds pasan. Ocho páginas verificadas en desarrollo y producción demo, con geometría sin desbordamientos de textos/etiquetas. Capturas inspeccionadas en `guia-corregida` y `guia-demo-produccion`. La primera prueba detectó que Esc no cerraba la guía desde portada; corregido y repetido sin errores.

Ayuda durante combate mediante fixture mensual: estado completo idéntico mientras se consulta, vuelta a pausa, reanudación y guardar/cargar comprobados. Capturas: `guia-combate-produccion`.

Demo real completa hasta victoria contra Yuca, sin errores de navegador; captura final en `guia-demo-completa`. Pantalla vertical 720×1280 verificada en `guia-vertical`; el tamaño de lectura sigue siendo más cómodo en horizontal. Revisiones estáticas de código y TypeScript sin hallazgos pendientes.

Pendiente: valoración de comprensión por un jugador nuevo. Esta guía es consultable; no obliga a realizar ejercicios ni resalta automáticamente acciones del tutorial.
