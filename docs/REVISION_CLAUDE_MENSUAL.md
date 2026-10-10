# Diseño mensual contrastado con Claude

El usuario autorizó delegar mecánicas en su cuenta de Claude. Se envió la descripción del juego y requisitos, sin credenciales ni archivos personales. La respuesta se recibió y leyó en la conversación `https://claude.ai/chat/324ef91c-261c-4e8e-bd6b-22b4bfd71130`; interfaz: Sonnet 5.5, modo Máx. Claude no tuvo acceso al repositorio ni ejecutó simulaciones.

## Recomendaciones utilizadas

- Un mismo motor con configuraciones independientes de demo y mes.
- Combate determinista en pasos de 100 ms; pausa y pestaña oculta detienen el avance.
- Tres técnicas automáticas equipadas, eventos legibles y límite de 60 segundos.
- Demanda finita y coste de franjas para limitar compra/venta; precios visibles y mejoras financiadas por el puesto.
- Recuperación tras derrota y guardados saneados para evitar bloqueos de progreso.
- Decaimiento más suave que perder todos los atributos cada noche.

Estos criterios se implementaron y verificaron por Codex. Los valores publicados en MODELO_MENSUAL.md corresponden al código y a simulaciones propias; no se afirma que las fórmulas exactas sugeridas por Claude estén implementadas.

## Propuestas reservadas para otra iteración

Claude propuso cinco atributos, inventario con edades individuales, deuda acumulada, revanchas y habilidades con condiciones adicionales. La versión actual usa tres atributos, deterioro nocturno simple y un cobro resuelto por encuentro. Incorporar esos sistemas requiere nuevas pruebas y ajustes de la interfaz.

La duración de 8–12 minutos para demo y 35–50 para el mes fue un objetivo de diseño enviado a Claude; todavía no está validada por jugadores humanos. Las simulaciones muestran dinero acumulado en la etapa final y diferencias defensivas entre estilos, registradas como límites de balance.

Evidencia visual de la respuesta: `.cache/claude-mecanicas.png`. No hubo commits ni publicación automática.
