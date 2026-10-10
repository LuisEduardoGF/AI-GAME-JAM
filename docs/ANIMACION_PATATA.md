# Patata: animación de combate

Se integran 24 cuadros del material propio `zip juego.zip`, autorizado por el usuario. No se atribuye una IA de origen desconocido ni se generaron imágenes nuevas. Procedencia, recortes y hashes en `patata-animacion-manifest.json`.

La hoja transparente mide 1536×55: 24 celdas de 64×55. Se retiró el fondo desde los bordes y se normalizaron los recortes con la herramienta local, conservando detalle blanco del personaje. Inspección visual realizada por Codex.

| Acción | Cuadros |
|---|---|
| Golpe directo / Brasa Directa | 1, 2, 2, 5, 0 |
| Gancho / Horno Abierto | 7, 8, 9, 11, 6 |
| Golpes Ardientes | 13, 14, 15, 17, 12 |
| Flujo de Roca | 1, 3, 4, 5, 0 |
| Sol de Barrio | 19, 20, 21, 22, 23, 18 |

Cada cuadro dura 85 ms. Las habilidades tienen prioridad visual si coinciden con daño o esquiva en el mismo lote. Los golpes normales alternan directo y gancho. Hay avance al atacar, retroceso al recibir daño/esquivar, tintes de daño/guardia, respiración y poses de resultado. Son efectos de presentación: no modifican daño, atributos, dinero ni guardado.

Pausa y pestaña oculta detienen el reloj visual. Cambiar ritmo o abrir/cerrar menús conserva pose y tiempo. Un combate nuevo reinicia la reproducción; recuperar una partida comienza en reposo y pausa.

Verificación: recorrido real de la demo hasta victoria, pausa y guardar/cargar; doce cuadros distintos registrados. Tres fixtures declaradas del día 30 verifican fuego avanzado, patadas y roca, incluyendo los seis cuadros de la técnica de fuego. Capturas en `.cache/capturas/patata-animada` y `patata-estilos-final`; no equivalen a jugar el mes completo. La primera prueba detectó prioridad incorrecta y se corrigió antes de repetirla sin errores. Revisiones de código y TypeScript sin bloqueantes.

Pendientes: animar rivales; poses específicas de daño y derrota (se reutilizan cuadros de la hoja); balance y apreciación visual con jugadores humanos. El modo clásico conserva sus sprites anteriores.
