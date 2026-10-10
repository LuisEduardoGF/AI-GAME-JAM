# Revisión de campaña con Claude

Fecha: 10 de octubre de 2026. Encargo autorizado por el equipo durante la sesión.
Herramienta: Claude en el navegador; la interfaz mostraba Sonnet 5.5, modo Máx.

## Trabajo asignado

Revisar un extracto de `loadGame()` y una descripción concreta de economía,
combate, tutorial y lugares. Solicitar problemas reproducibles, migración mínima
del JSON, recuperación justa de una pelea y cinco casos de prueba prioritarios.
No se entregaron credenciales, identificadores personales ni recursos gráficos.
Claude no tuvo acceso al repositorio, no modificó archivos y no ejecutó pruebas.

## Recomendaciones integradas por Codex

- Reanudar un combate con la vida del rival y los atributos guardados, sin volver
  a aplicar la noche. Conservar el contador de ataques de Rábano y derivar su
  segunda fase de su vida restante.
- Copiar únicamente campos admitidos del guardado, comprobar números finitos,
  limitar rangos y validar pantalla, lugar y rival. Mantener compatibilidad con
  partidas que aún no tenían campos del tutorial o de los lugares.
- Dar un breve margen antes del ataque del rival al continuar una pelea.
- Impedir daño ilimitado por pulsaciones rápidas: recuperación de 700 ms entre
  golpes, visible en el ring.
- Recuperar energía al recibir un golpe con guardia, una vez por golpe; levantar
  guardia o cargar una partida no concede energía.
- Aplicar la cadencia propia del rival después de su ataque y usar respuestas
  proporcionales a esa cadencia para golpe/guardia.
- Limitar la frecuencia de activación de la esquiva y conservar su pausa al
  abrir los menús. Cancelar explícitamente su temporizador al recuperar la partida.
- Conservar una copia local de un JSON inválido y mostrar un aviso en el título.

No se copió el ejemplo de código literalmente: el límite correcto de franjas es
6, se conservaron las pantallas finales y se utilizó validación de `unknown`.

## Comprobación

Codex realiza los chequeos de tipos, build y recorridos con `herramientas/probar.mjs`.
Las revisiones adicionales de código, TypeScript y seguridad son estáticas.
Los resultados de ejecución se registran en `PROGRESO.md` y `AI_TRACE.md`.

La captura de la respuesta se conserva en `.cache/version-final/claude-revision.png`
del espacio de trabajo, fuera del repositorio oficial. La economía y la duración
de los combates todavía necesitan valoración humana de diversión.
