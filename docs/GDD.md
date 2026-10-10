# PATATA CALIENTE: Tiempo de barrio

> RPG de gestión y combate en tiempo real. Inspiración de género: Punch Club; mundo, personajes, diálogos y arte propios.

## Tema y concepto
- **Tema:** PAPA CALIENTE. La protagonista puede entrar en Modo en Llamas; cada noche el tiempo enfría las estadísticas que no entrenaste; la deuda abusiva es el problema que la Mafia de la Yuca pasó a la familia.
- **Gancho:** La Mafia de la Yuca te quitó todo. Reconstruye el puesto, entrena antes de que el tiempo te enfríe y rescata a tu hermano Batata, aunque tengas que pelear contra él.
- **Formato:** 2D, Vite + TypeScript + Phaser 3.90.0; campaña de siete días, objetivo de 15–25 minutos.
- **Bucle:** gastar seis franjas diarias entre vender, reponer, entrenar, descansar y hablar; cada charla permite fortalecer el vínculo, ganar fuerza o recuperar vida/energía. Prepararse para los asaltos; pelear moviéndose con el ratón; decidir el destino de Batata.
- **Historia de campaña:** avisos breves sitúan cada jornada: deuda de la Yuca, amenaza al puesto, pista de la guarida, entrada protegida por Rábano y localización de Batata.
- **Victoria/derrota:** al vencer a Batata, elegir entre reconciliarse (requiere Vínculo ≥ 3), convertir el puesto en cooperativa o dejarlo ir en paz. Con vínculo insuficiente, intentar reconciliarse termina en separación. Perder el combate final da el final de derrota; perder antes castiga la economía pero permite continuar.

## Controles y mecánicas
| Acción | Control |
|---|---|
| Menús, mercado, tienda y diálogos | Ratón; clic para elegir/confirmar |
| Combate | Mover ratón para esquivar; clic izquierdo golpea; clic derecho bloquea |
| Pausa | Esc abre/cierra la pausa; desde allí se puede seguir o guardar y salir |
| Audio | M silencia/activa música y efectos |
| Ayuda y calendario | GUÍA desde el puesto o la pausa; AGENDA muestra rivales y preparación |
| Lugares y atributos | PUESTO / GIMNASIO / CASA / BARRIO para viajar; FICHA explica fuerza y velocidad |

1. **Tiempo que quema:** cada día tiene seis franjas; las estadísticas no entrenadas bajan una unidad por noche, hasta el mínimo de 1. Cerrar abre una vista previa: desgaste, recuperación y combate de esa noche; volver no modifica recursos ni turnos.
2. **Puesto y preparación:** vender pedidos por clic genera monedas; reponer usa monedas y espacio; el gimnasio mejora una estadística y consume energía.
3. **Combate en llamas:** energía para entrenar/defender; mensajes de ataque legibles; el calor del puesto potencia temporalmente el daño y tiene un efecto sonoro propio. La velocidad amplía la ventana para esquivar y reduce el daño recibido al alcanzar ciertos umbrales.
4. **Balance del jefe final:** Batata tiene 8 HP y causa 2 de daño por ataque; estos valores permiten completar el combate sin depender de esquivas perfectas.
5. **Ajustes:** duración, economía, recuperación, requisito de vínculo y combate se configuran en `AJUSTES` dentro de `src/campana.ts`.
6. **Segunda fase de Rábano:** al llegar a la mitad de vida anuncia el cambio, acelera sus ataques y alterna golpes con una lluvia de rábanos más peligrosa. El ataque especial se anuncia y puede esquivarse moviendo el ratón.
7. **Primer día guiado:** cinco objetivos resaltan vender, entrenar fuerza, descansar, fortalecer el vínculo y revisar la noche. Las acciones siguen libres; se puede omitir el tutorial y su avance queda guardado. Las partidas anteriores no se fuerzan a repetirlo.
8. **Preparación legible:** cada tarjeta muestra coste y beneficio; el gimnasio informa qué atributos se conservarán. Descansar con vida y energía completas no consume franja y el recibo informa la recuperación real.
9. **Agenda y combate:** el calendario muestra Yuca (día 3), Rábano (día 5) y Batata (día 7), con consejos según recursos. El primer asalto explica controles y Llamas antes de activar al rival; la guía se consulta desde pausa sin recibir ataques.
10. **Lugares con propósito:** puesto para vender/reponer, gimnasio para fuerza/velocidad, casa para descansar y cerrar día, barrio para conversar y consultar rivales. Viajar y mirar la ficha son gratis; el tutorial indica el siguiente destino sin cambiar de lugar automáticamente.
11. **Combate con respuesta:** Patata recupera el golpe en 700 ms. Levantar guardia no da energía; recibir un golpe con guardia recupera una unidad. La esquiva tiene 900 ms de recuperación entre activaciones. La cadencia de cada rival se conserva entre ataques y las respuestas a golpe/guardia usan proporciones de su intervalo.
12. **Continuar una pelea:** se conserva la vida del rival, el progreso de su fase y los atributos; no se repite el desgaste de la noche. La carga da un breve margen de reacción, valida rangos y admite partidas anteriores. Un JSON inválido se conserva en una copia local y se informa al jugador.

## Alcance por fase
- **MVP (hora 10):** campaña completa de siete días; mercado, reposición, seis estadísticas, desgaste nocturno, asalto del día 3, jefe Rábano del día 5, Batata del día 7, Modo en Llamas, decisión final de tres opciones, cuatro desenlaces, menú, guardado y aviso de contenido.
- **Objetivo (hasta hora 16):** General Remolacha, seis habilidades, más clientes, retratos, Brotecito, idioma ES/EN, música por estado y efectos de combate. Congelar mecánicas nuevas en hora 16.
- **Recortes:** General Remolacha → árbol de habilidades → variedad de productos → segundas fases de jefes. Mantener tienda → economía → gimnasio → desgaste → pelea → decisión sobre Batata.

## Dirección audiovisual
- **Arte:** pixel art con siluetas gruesas y contornos oscuros, inspirado por RPGs de boxeo como Punch Club sin reutilizar sus personajes ni escenarios. Resolución lógica 320×180 y escalado nítido. La identidad propia combina callejones, ladrillo y madera cálidos con guantes por color, frutas rivales y fuego de Patata. Paleta UI: carbón cálido `#211916`, panel `#2D2522`, cuero `#554338`, latón `#B87946`, crema `#F5E5C8`, fuego `#D9533B`, vida roja `#B8423C` y energía azul `#59A9B8`.
- **Audio:** música chiptune sintetizada en Web Audio: menú, puesto, combate y final. Efectos sintetizados para venta, reposición, entrenamiento, charla, descanso, golpe, bloqueo, esquiva, llama, victoria y derrota. Se activa tras el primer clic y M silencia/activa el audio. Mostrar antes de la partida un aviso por violencia fantástica, amenazas, deuda y separación familiar; los combates no muestran gore explícito. Voces son extras.
- **Assets:** se integraron desde los recursos propios compartidos por el equipo los fondos `market-alley.jpg`, `shop-interior.jpg` y `gym-interior.jpg`, además de sprites recortados de Patata, Yuca y Rábano en `public/assets/img/`. Rábano usa el sprite compartido en el grupo Game jump. La interfaz aplica marcos dobles cálidos, medidores segmentados y cuerdas de ring. Siguen pendientes animaciones completas, retratos/arte de Batata y Brotecito, espíritus, más escenarios y el acabado final del ring.

## Riesgos y plan B
- Campaña demasiado grande: priorizar un combate sencillo y el ciclo de siete días; simplificar fases y cortar extras según el orden anterior.
- Economía o desgaste injustos: valores centralizados en `AJUSTES` y simulación de tres rutas antes de pulir.
- Contenido de IA/audio: registrar herramientas y prompts; comprobar licencias, en especial MusicGen (solo uso no comercial). No usar assets externos sin licencia.

## Evolución vigente: campaña mensual y demo de tres días

Esta sección actualiza el alcance de lanzamiento; las especificaciones anteriores describen el modo clásico conservado en `?clasico`.

- Campaña principal: 30 días, cuatro jefes (7/14/21/30), seis franjas por día y cobradores de cada familia cada dos días. Se puede pagar o combatir; una derrota permite continuar.
- Tienda secundaria: tres productos, inventario, precios diarios, compradores limitados y ventas que financian entrenamientos/mejoras. Usar 1–2 franjas al día permite priorizar la preparación.
- Tres atributos y nueve habilidades originales en Golpes Flameantes, Golpes Ardientes y Flujo de Roca. Se equipan hasta tres y se activan automáticamente; no hay botón de ataque en esta versión.
- Desgaste después de tres noches sin entrenar un atributo; recuperación, sobrecalentamiento, guardia, evasión y estamina. Parámetros y simulaciones actuales en MODELO_MENSUAL.md.
- Resolución lógica mensual 960×540, escalado FIT y controles con ratón, teclado y toque.
- Demo independiente de tres días: cobrador el día 2, Yuca el 3, mismo motor y guardado separado. Build distinta sin enlace a una campaña ausente.
- Tres pistas MusicGen y 15 efectos retro integrados con buses, controles de volumen y atenuación durante impactos. Batata, General Remolacha y cuatro cobradores ya tienen sprites; animaciones por cuadros siguen pendientes.

La revisión de mecánicas de Claude está documentada en REVISION_CLAUDE_MENSUAL.md. No se considera validado el tiempo objetivo de partida ni la diversión por las simulaciones automatizadas.

### Presentación actual

Patata usa 24 cuadros propios según ataques y habilidades. HUD opaco, tarjetas de mercado y gimnasio, ramas de habilidades con acentos, iconos propios y ring con perspectiva y sombras componen la nueva dirección visual. Destellos, partículas y etiquetas informan del combate; los rivales todavía no tienen cuadros animados. Criterios y límites en DIRECCION_VISUAL.md; colaboración de Claude en REVISION_CLAUDE_GRAFICA.md.




