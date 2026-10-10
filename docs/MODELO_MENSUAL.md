# Modelo mensual de Patata Caliente

Implementación pura: `src/mes/modelo.ts`. La interfaz de Phaser consume las transacciones y anima el resultado. El módulo no abre archivos, no toca `localStorage` y no usa azar ni reloj del sistema.

## Modos y calendario

| Modo | Duración | Jefes | Cobros |
|---|---:|---|---|
| Demo | 3 días | Don Yuca, día 3 | Día 2 |
| Mes | 30 días | Yuca 7, Rábano 14, Remolacha 21, Batata 30 | Cada día par |

Cada día tiene 6 franjas. Cerrar el día permite reservar franjas sin usarlas. Cuando un cobro coincide con un jefe, primero se resuelve el cobrador y después el jefe, sin aplicar dos noches.

Los esbirros pertenecen al jefe de la semana. Cobran `max(4, 8 + semana × 3 − jefes vencidos)`. Si hay dinero se puede pagar; también se puede combatir. Sin dinero queda disponible el combate. Un pago o resultado ya resuelto no puede cobrarse otra vez en la misma fase.

Una derrota no borra atributos, habilidades ni mejoras. El barrio recupera a Patata al 55% de su vida máxima, se pierden como máximo las monedas del cobro o $6 ante un jefe y la campaña continúa. Se conceden 2 XP por derrota. No hay revancha dentro de ese día: evita quedar atrapado repitiendo una pelea sin recursos. En el último día siempre hay un final válido, incluso perdiendo contra Batata.

## Tienda secundaria

Víveres: papa, tomate y zanahoria. Comprar o vender un lote usa una franja; la cantidad por defecto es 3. Se admiten cantidades enteras positivas, hasta 9 por operación; cantidades negativas, cero, fraccionarias o no finitas se rechazan sin gastar recursos. Una venta parcial puede atender la demanda restante.

Los precios base cambian de forma determinista con el día y el producto:

- Base diaria: `4 + ((día × 3 + índice × 2) % 4)`.
- Compra: base − 2.
- Venta: base + nivel del puesto + `min(2, floor(compradores restantes / 3))`.
- Demanda: 3–5 unidades por producto y día, +2 por nivel del puesto.
- Cada venta consume compradores: la prima de demanda baja y se acaba la venta de ese producto al agotarse.

El inventario empieza con 9 papas, 6 tomates y 6 zanahorias, y $22. Los compradores se reponen al día siguiente. El objetivo es dedicar 1–2 franjas al mercado y emplear el resto en preparar el combate.

| Mejora | Nivel 1 | Nivel 2 |
|---|---|---|
| Gimnasio | Entrenar cuesta $3 en lugar de $4 | Entrenar añade 2 puntos en lugar de 1 |
| Puesto | +$1 por unidad; +2 compradores por producto | +$2 por unidad; +4 compradores por producto |
| Despensa | Evita deterioro; capacidad total 45 | Capacidad total 60 |

Cada nivel cuesta $25 × el nuevo nivel. Sin despensa se pierde una unidad de cada producto durante la noche. Capacidad inicial total: 30 unidades. Las mejoras usan una franja.

## Preparación y progreso

Tres atributos: fuerza, agilidad y resistencia, entre 2 y 12. Entrenar cuesta $4 y 2 energía, otorga +1 atributo y 2 XP. Las mejoras del gimnasio modifican coste y crecimiento. Descansar devuelve 5 energía, 12 vida y reduce 25 calor. Conversar aumenta vínculo y otorga 1 XP; no otorga fuerza gratuita.

Cada atributo no entrenado pierde 1 punto después de tres noches consecutivas sin entrenarlo, con mínimo 2. Entrenarlo reinicia su contador de abandono. La noche recupera 8 vida, 4 energía y reduce 25 calor. Estos efectos ocurren una sola vez después de resolver los encuentros del día.

## Combate automático

El jugador escoge estilo y equipa hasta tres habilidades antes de comenzar. Durante la pelea no se pulsan golpes ni guardias. La simulación avanza en pasos fijos de 100 ms y conserva un acumulador para que distintos ritmos de fotogramas produzcan los mismos resultados.

| Variable | Fórmula / regla |
|---|---|
| Vida máxima | 24 + resistencia × 4 |
| Daño básico | 2 + fuerza × 0,9; Flameante suma 0,8 |
| Cadencia | `max(850, 1800 − agilidad × 75)` ms |
| Estamina máxima | 10 + resistencia × 0,6 |
| Estamina inicial | Máximo × `(0,55 + energía × 0,045)` |
| Regeneración propia | 1,9 + resistencia × 0,12 por segundo |
| Coste de golpe | 2; con habilidad añade nivel × 0,6 |
| Recuperación sin estamina | Espera 500 ms y vuelve a evaluar, sin atacar ni avanzar el contador de golpes |
| Guardia base | Resistencia × 0,2; Roca añade 0,7 |
| Evasión Ardiente | Cada `max(3, 7 − floor(agilidad / 3))` ataques enemigos |
| Evasión otros estilos | Cada `max(4, 10 − floor(agilidad / 3))` ataques enemigos |
| Calor | +5 por golpe; −2,5 por segundo |
| Sobrecalentamiento | A 85 o más, cada golpe propio también causa 1 daño a Patata |

El rival tiene 12 estamina, consume 2 por golpe y recupera 2 por segundo. Si le falta estamina también espera 500 ms. El daño mínimo recibido tras la guardia es 0,6. Una guardia de habilidad se consume al recibir un golpe; esquivar conserva esa guardia.

En un mismo paso Patata tiene iniciativa. Al quedar sin vida se decide el KO; un doble KO favorece al enemigo. La pelea termina como máximo a los 60 segundos: gana quien conserva el mayor porcentaje de vida y un empate de porcentaje favorece a Patata.

### Árboles originales

Todos los primeros nodos empiezan aprendidos. Equiparlos sigue siendo una decisión. Los nodos de nivel 2 requieren 4 puntos en su atributo, el nodo anterior y 6 XP. Los de nivel 3 requieren 7 puntos, el anterior y 12 XP.

| Estilo y atributo | Nivel 1, cada 2 golpes | Nivel 2, cada 4 golpes | Nivel 3, cada 6 golpes |
|---|---|---|---|
| Golpes Flameantes / fuerza | Brasa Directa: +2 daño y quemadura | Horno Abierto: +4 daño, quemadura y +10 calor | Sol de Barrio: +7 daño; +2 adicionales a 85 calor |
| Golpes Ardientes / agilidad | Paso Ardiente: +2 daño y +1 estamina | Ráfaga de Sartén: +4 daño y siguiente golpe 300 ms antes | Danza del Comal: +6 daño y guardia de 4 |
| Flujo de Roca / resistencia | Raíz Firme: +1 daño y guardia de 2 | Roca que Fluye: +3 daño y guardia de 4 | Roca Aplastante: +6 daño, guardia de 4 y cura 3 vida |

Una quemadura dura 3 segundos y causa 1 daño por segundo. Si varias habilidades cumplen condición, se usa la del nivel más alto. Entre habilidades del mismo nivel se rota de forma determinista. Equipar tres nodos de nivel 1 permite que se activen los tres; ninguno queda anulado por orden alfabético. Se pueden mezclar árboles. Una habilidad aprendida cuyo atributo cayó por debajo del requisito queda equipada pero no se activa hasta recuperarlo.

### Jefes

| Rival | Vida | Daño | Cadencia |
|---|---:|---:|---:|
| Yuca demo | 68 | 4 | 1750 ms |
| Yuca mensual | 82 | 5 | 1650 ms |
| Rábano | 150 | 7 | 1500 ms |
| General Remolacha | 220 | 9 | 1400 ms |
| Batata | 280 | 9 | 1400 ms |

Al bajar de media vida, los jefes reducen su intervalo en 150 ms. Rábano suma 2 daño cada tercer ataque. La guardia de Remolacha absorbe 2 daño adicional durante un tramo de su ciclo. Batata suma 1 daño en su segunda fase.

Los esbirros usan 22/29/36/43 vida, daño 3/4/5/6 y cadencia 1800/1730/1660/1590 según la semana. Ganar entrega 3 XP y un pequeño premio de monedas. Los jefes entregan 8 XP y $24/$30/$36/$42.

## Contrato de integración

- `newCampaign(mode)` crea estado versión 2.
- `applyAction(state, action)` aplica compra, venta, entrenamiento, descanso, charla o mejora.
- `endDay`, `payDebt`, `startBattle`, `settleBattle`, `learnSkill`, `equipSkill` y `chooseStyle` devuelven `{ state, message, ok }`.
- `tickBattle(state, deltaMs)` devuelve directamente el nuevo estado. No avanza si no hay pelea activa o el tiempo es inválido.
- `marketPrices`, `deriveStats`, `inventoryCapacity`, `nextEvent` y `skillStatus` producen datos para la interfaz.
- `restoreCampaign(raw: unknown)` devuelve estado saneado o `null` cuando no es un formato reconocido.
- `PRODUCTS`, `STYLES`, `SKILLS`, `BOSSES` y `AJUSTES` son las definiciones del contenido.

Fases: `hub → debt/prepare → fight → result → hub/prepare/ending`. El botón de resultado invoca `settleBattle` una sola vez. El controlador de interfaz conserva pausa, guardado y confirmación de cierre. Guardar una demo y un mes en claves distintas evita mezclar campañas.

El guardado reconstruye estadísticas derivadas, precios, demanda y rivales desde las definiciones. Conserva vida, estamina, calor, próximo ataque, quemadura, guardia, contadores, tiempo y acumulador fraccionario del combate. Los mensajes y eventos visuales antiguos se reemplazan al recuperar. Los resultados se verifican mediante KO o el porcentaje de vida al agotarse el tiempo, sin aceptar un ganador arbitrario del JSON.

## Verificación realizada del modelo

Comandos ejecutados con Node 24 importando directamente el TypeScript, sin dependencias nuevas ni archivos de pruebas permanentes:

- Comprobación de tipos del proyecto: `npm --prefix juego run check`, sin errores.
- Recuperación tras 2354,7 ms y continuación de 2345,8 ms: mismos actores, vida, calor, contadores, acumulador y fase.
- Formatos `null`, array y modo inválido rechazados; NaN, infinito, inventarios excesivos y habilidades desconocidas saneados.
- Transacciones no mutan el estado anterior. Cantidades inválidas no gastan dinero ni franjas.
- Vender disminuye tanto compradores como la prima de precio de demanda.
- Día 14: cobro primero, después Rábano; segundo pago y segundo cierre durante preparación rechazados.
- Derrota de cobrador con $0 y 1 vida: conserva progreso y avanza al día 3 con recuperación.
- Tres habilidades equipadas de igual nivel: activación comprobada de las tres.

### Demo: comparación controlada

Patata con vida y energía completas; solo habilidades de su árbol. Atributos 2/2/2 utilizan el primer nodo. Atributos 4/4/4 utilizan los dos primeros.

| Preparación | Flameante | Ardiente | Roca |
|---|---|---|---|
| 2/2/2 | Derrota a 15 s; Yuca conserva 6,6 vida | Derrota a 17 s; Yuca conserva 20 vida | Victoria a 26,3 s; Patata conserva 5,4 vida |
| 4/4/4 | Victoria a 11,3 s; 20,8 vida | Victoria a 13,7 s; 17,6 vida | Victoria a 15,8 s; 27,6 vida |

### Mes: ruta de preparación completa

Tres simulaciones de 30 días: una por estilo. Estrategia: vender un lote disponible con buen precio; comprar si el inventario baja; adquirir despensa el día 1; dos entrenamientos diarios rotando atributos cuando es posible; descansar; conversar con la franja sobrante; aprender y equipar los nodos del estilo. Combate contra cobradores, excepto los días 14 y 30 en que se paga para llegar al jefe descansado.

Las tres rutas llegan al final con las cuatro victorias, 55 operaciones de mercado en 30 días (1,83 por día), atributos finales 12/12/12 y $552. No hubo pérdidas ni recursos negativos. Tiempos de jefes:

| Estilo | Yuca | Rábano | Remolacha | Batata |
|---|---:|---:|---:|---:|
| Flameante | 9,9 s | 9,8 s | 12,5 s | 16,1 s |
| Ardiente | 10,6 s | 11,2 s | 13,7 s | 17 s |
| Roca | 12,5 s | 11,8 s | 14,3 s | 17,9 s |

Estas son simulaciones de una ruta informada, no una prueba humana de diversión. En esta ruta no se compraron gimnasio ni puesto: el saldo alto muestra margen para financiar mejoras y la economía tardía puede requerir ajuste. Flameante acaba contra Batata con 1 vida: conviene llegar descansado o combinar una habilidad defensiva. La escena, los assets y el empaquetado se verifican por separado en el hilo principal.
