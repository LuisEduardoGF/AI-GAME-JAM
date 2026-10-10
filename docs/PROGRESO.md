# Progreso

## Estado actual
- **Hora de la jam:** pase de dirección visual de la hora 7; inicio registrado: 2026-10-10 00:08 America/Bogota.
- **Fase:** Contenido; campaña mensual principal y demo independiente de tres días empaquetadas para distribución local.
- **Loop vigente:** título → introducción/ayuda → rutina de seis franjas → compra/venta con demanda, entrenamiento y técnicas → cobro cada dos días → combate automático → jefes días 7/14/21/30 → final.
- **Checkpoint:** el usuario autorizó esta subida por funcionalidad. Se publicaron seis ramas con commits de contenido y trazabilidad (AI-CASI-000035 a 000040); hashes en `ORDEN_COMMITS.md`. La configuración general `commitsAuto:false` se conserva; esta operación tiene autorización explícita.
- **Verificación del repo:** copia limpia del commit 539c621; instalación offline, tipos y ambas builds pasan. No necesita archivos no versionados del workspace. Capturas de arranque/tutorial/rutina/pausa inspeccionadas en `pre-subida-ramas`. Documentación de integración preparada para publicar junto al conjunto en main.

## Entrega mensual y demo de las 07:00

- Tutorial/ayuda ampliados: ocho temas con índice, páginas anterior/siguiente, consejos y textos específicos para demo/campaña. Acceso desde portada, rutina y pausa; Escape desde portada corregido. Consultar no modifica recursos, día ni combate. Documentación: `GUIA_DEL_JUEGO.md`.
- Check y ambas builds pasan. Ocho páginas, Enter/Escape, vuelta a pausa, estado intacto y encaje vertical comprobados; capturas inspeccionadas. Demo real hasta victoria y guardar/cargar vuelven a pasar. Lectura durante combate se comprobó con fixture declarada. Revisiones code/TS sin pendientes; falta comprobar comprensión con un jugador nuevo.
- Paquetes con guía: `entregas/patata-caliente-casi-demo-20261010-073838.zip` y `entregas/patata-caliente-casi-mes-20261010-073837.zip`; cada archivo comparado con build. Demo copiada a Descargas como `Patata-Caliente-Casi-Demo-Tutorial.zip`, hash verificado. Se conservan entregas previas.

- `src/mes/modelo.ts`: modelo puro de 30 días, cuatro jefes, cobradores, tres atributos, nueve habilidades, tres espacios de equipo, tienda secundaria con demanda, mejoras y guardado versión 2.
- `src/mes/escena.ts`: interfaz 960×540, cuatro lugares, árboles y calendario, combate automático, pausa, ayuda, teclado, velocidad 1×/2× y carga de combate pausada.
- Campaña mensual por defecto; `?clasico` y `?prueba` conservan modos previos. Demo independiente en 4174, con claves de guardado separadas.
- Tres pistas MusicGen, quince WAV retro y seis sprites adicionales integrados; registros reales en los manifiestos y créditos incluidos en las builds.
- Claude entregó propuesta de mecánicas; criterios contrastados con el modelo. Revisión estática de código, TypeScript y seguridad sin hallazgos bloqueantes pendientes. Se corrigió audio omitido al segundo combate, agenda de cobro inexistente y sonido de esquiva.
- Check y ambas compilaciones pasan. Ocho verificaciones del modelo pasan; tres simulaciones de 30 días alcanzan cuatro victorias (una por estilo).
- Demo completa mediante controles reales, tanto en desarrollo como en la build independiente: tres días, cobrador, Yuca, pausa/ayuda y guardar/cargar combate. Capturas inspeccionadas en `demo-mensual-cierre` y `demo-standalone-build`.
- Nueve pruebas de regresión mensual / 36 capturas revisadas: mercado, mejoras, deuda+jefe, derrota sin fondos, final Batata, reinicio, persistencia, JSON roto y resoluciones. Días lejanos usan fixtures declaradas; no equivalen a una partida humana completa.
- Build mensual servida bajo `/release/`; presentación vertical y navegación verificadas. Audio carga 18 archivos sin fallos; pendiente escucha humana.
- ZIP definitivo de demo: `entregas/patata-caliente-casi-demo-20261010-054117.zip`, 39 archivos, 2 662 504 bytes, SHA256 `004d9c54c108128dbb749a023f5417fc1e244c34a5a4c535cbe2d60d1d5d1ffc`. Reabierto y comprobado, con `index.html` y `CREDITOS.txt` en raíz.
- ZIP mensual: `entregas/patata-caliente-casi-mes-20261010-054328.zip`, 44 archivos, 2 682 700 bytes, SHA256 `ad6a2d1ce2ffced839fa26f1111d4e78eba057bc11b6f8a28271117f527f2b2f`. No publicado.
- Windows bloqueó carpetas durante la limpieza recursiva de salidas. Se conservan ignoradas; ambas configuraciones ahora sobrescriben sin borrar y copian solo imágenes/música/sonidos/favicon/créditos. El scaffold vacío de voces, también bloqueado, no se recorre. Dos builds consecutivas de cada modo pasan. Demo usa `dist-demo-final`; empaquetado lee manifiestos y excluye chunks viejos. Se añadió fflate desde caché al repositorio oficial.
- Patata tiene 24 cuadros propios vinculados a ataques, habilidades, daño, guardia, esquiva y resultado. Demo real hasta victoria, pausa y recuperación verificados; tres fixtures comprueban fuego avanzado, patadas y roca. Revisiones de código y TypeScript sin bloqueantes; detalles en `ANIMACION_PATATA.md`.
- Actualización de las 06:54: demo animada `entregas/patata-caliente-casi-demo-20261010-065449.zip` (40 archivos), copiada con hash verificado a Descargas como `Patata-Caliente-Casi-Demo-07AM-Animada.zip`. Campaña animada `entregas/patata-caliente-casi-mes-20261010-065534.zip` (45 archivos). Ruta real en build demo y técnicas mediante fixtures en build mensual pasan; ZIP comparados archivo por archivo con las builds. Se conservan las entregas previas.
- Dirección visual de la hora 7: paleta compartida, 20 iconos propios, paneles y sombras, HUD opaco, precios/requisitos de 12 px, ramas de habilidades con acentos, ring con perspectiva, destellos/partículas y pose del derrotado. Claude revisó cuatro capturas y su respuesta real está en `REVISION_CLAUDE_GRAFICA.md`; criterios en `DIRECCION_VISUAL.md`.
- Check y ambas builds pasan; ocho verificaciones del modelo pasan. Demo compilada recorrida mediante controles hasta final: fuerza 6/agilidad 5/resistencia 5, victoria contra Yuca, pausa visual y guardar/cargar correctos; doce cuadros observados y 18 audios cargados sin fallos. Capturas revisadas en `diseno-demo-produccion`.
- Tres fixtures en build mensual comprueban técnicas avanzadas flameante/ardiente/roca y geometría sin desbordamientos; final mensual comprobado por fixture, no partida humana de 30 días. Capturas revisadas en `diseno-tecnicas-produccion` y `diseno-final-mensual`. Encaje vertical 720×1280 confirmado en producción; nueve vistas de rutina inspeccionadas en desarrollo. Revisiones estáticas de código y TypeScript: sin hallazgos pendientes. Sigue el aviso de tamaño del bundle de Phaser.
- Nuevos paquetes gráficos: `entregas/patata-caliente-casi-demo-20261010-073053.zip` (40 archivos) y `entregas/patata-caliente-casi-mes-20261010-073054.zip` (45 archivos), comparados archivo por archivo con sus builds. Demo copiada a Descargas como `Patata-Caliente-Casi-Demo-Grafica.zip` y hash comprobado; entregas anteriores conservadas.
- Pendientes: balance humano y dinero acumulado al final del mes; animaciones de rivales y poses específicas de daño/derrota; borde cian residual de Rábano; deshabilitar compra antes de pulsarla con almacén lleno (la transacción ya rechaza sin cobrar); optimización del tamaño de Phaser. MusicGen requiere atribución y uso no comercial.

## Contenido del modo clásico conservado
- Nueva partida, continuar/guardado local, HUD de día/turno, monedas, existencias, vida, energía, fuerza, velocidad y vínculo.
- Cuatro lugares navegables: trabajar en el puesto, entrenar fuerza/velocidad en el gimnasio, descansar/cerrar día en casa y conversar/ver rivales en el barrio. Viajar no gasta franjas y el lugar queda guardado.
- Ficha de Patata con daño normal/en Llamas, ventana de esquiva, defensa, desgaste previsto y estimación de golpes para el próximo rival. Personaje en reposo y recibos de ganancias animados.
- Primer día guiado en cinco objetivos: venta, gimnasio de fuerza, descanso, diálogo de vínculo y vista previa de la noche; resalta la acción y deja omitir la guía. El avance persiste al recargar.
- Tarjetas del puesto con costes y beneficios visibles, consejos según energía/inventario/entrenamiento y recibos reales de descanso. Estar completamente descansado ya no gasta franja.
- Agenda de los tres rivales, preparación y requisito de vínculo; guía de cuatro páginas desde título, puesto y pausa. El gimnasio explica qué atributo se conserva por la noche.
- Cerrar día pide confirmar después de mostrar recuperación y desgaste exactos. Cancelar mantiene día, franjas y estadísticas; confirmar vuelve al puesto o al combate correspondiente.
- El primer asalto enseña golpe, bloqueo, esquiva y Llamas antes de iniciar ataques; también puede recuperarse desde el guardado. Las partidas antiguas sin campos de tutorial siguen cargando.
- Acciones de vender, reponer, entrenar fuerza, descansar, hablar y cerrar el día; validación de coste, inventario y turnos.
- Tres rivales (Yuca, Rábano y Batata), ataques temporizados, golpe normal, esquiva por movimiento del ratón, bloqueo, Modo en Llamas, victoria y derrota con penalización. Batata quedó en 8 HP y 2 de daño por golpe tras la ruta automatizada de prueba.
- Campaña de siete días; aviso de contenido; tres decisiones al final y desenlaces «Hermanos», «Mercado común», «Promesa» y derrota.
- La pantalla final permite reintentar desde el aviso de contenido o volver al título; la partida nueva reinicia estado y guardado.
- Esc abre una pausa desde el puesto o combate, detiene los temporizadores de pelea y ofrece continuar o guardar y salir.
- Las acciones del puesto comprueban la disponibilidad del turno antes de modificar recursos; los intentos tras seis franjas no generan beneficios.
- Los valores de campaña, economía, recuperación, vínculo y combate se concentran en `AJUSTES` para facilitar el balance.
- Cada día presenta una pista narrativa breve; las charlas del puesto ahora cambian según la jornada.
- Rábano cambia de fase al quedar a mitad de vida: anuncia el cambio y acelera sus ataques de 1700 a 1350 ms. Alterna golpes con lluvia de rábanos, anunciada y esquivable con el ratón.
- La esquiva acumula el desplazamiento del puntero: ventana base de 450 ms, ampliada por velocidad, y recuperación de 900 ms para evitar renovación continua. Su temporizador se pausa con los menús y se cancela explícitamente al cargar.
- Golpes separados por 700 ms, con indicador de recuperación. La guardia concede energía al recibir el golpe, una vez por ataque; activarla repetidamente o guardar/cargar no concede energía.
- Recuperación de combate conserva rival, vida, atributos y contador de Rábano, con margen antes del siguiente ataque. La carga valida campos y rangos; un JSON inválido se conserva también en una copia local y muestra un aviso.
- Hablar ahora abre tres respuestas: fortalecer el vínculo, aumentar fuerza o recuperar vida y energía. La decisión consume una franja y queda guardada; volver al puesto no consume turno.
- El gimnasio ofrece entrenamiento dirigido de fuerza o velocidad; la estadística entrenada no decae esa noche. La fuerza aumenta daño, la velocidad amplía la esquiva y reduce daño al alcanzar umbrales.
- Hay un prototipo jugable de tres días en `/?prueba`, aislado de la campaña completa; se probaron preparación, combate, esquiva, victoria, derrota y repetición.
- La entrada decide por URL qué escena carga: `?prueba` no importa la campaña; el botón final de la demo vuelve a la campaña normal.
- Interfaz adaptada al lienzo lógico 320×180, paleta cálida y fondos propios. Phaser realiza el centrado; se corrigió el doble margen vertical que causaban los grids CSS. Fondos y sprites usan rutas relativas para alojamiento bajo subcarpetas.

## Riesgos y pendientes
- Patata, Yuca y Rábano usan sprites propios del equipo y hay fondos de tienda, gimnasio y calle. Batata aún usa dibujo procedural; faltan animaciones, más interacción con los escenarios y retratos. El audio necesita escucha humana y ajuste de mezcla.
- La campaña y la demo ahora son módulos diferidos por separado. El chunk compartido de Phaser aún pesa ~1.2 MB minificado (~319 kB gzip) y Vite lo advierte; evaluar alternativas de carga antes de entrega.
- El balance necesita más rutas y juego humano; la ruta automatizada actual completó tres combates y «Hermanos» con 8/8 de vida. La fuerza gratis del diálogo y la corta duración de los asaltos requieren valoración de diversión.
- Los lugares ya son navegables. Pendientes: mayor profundidad del entrenamiento, progresión de habilidades y más interacción con el escenario. Se entrenan dos atributos, no los seis previstos en el alcance original.
- El repositorio remoto estaba vacío. La incorporación inicial se realizó mediante commits nuevos por funcionalidad, con fechas reales y ramas apiladas; las tareas anteriores siguen en AI_TRACE.md sin reescribirlas. La autorización automática general sigue desactivada.

## Identidad y stack
- Equipo/ID: Casi. Evento/ID: AI GAME JAM. Participantes: A00407796 (sesión), A00431524, A00429821.
- Inicio: 2026-10-10 00:08 America/Bogota; duración: 24 h; fin: 2026-10-11 00:08.
- Stack: Vite 8 + TypeScript 7 + Phaser 3.90.0; canvas lógico 320×180; juego 2D.
- Concepto: RPG de gestión y combate «Patata Caliente: Tiempo de barrio».

## Verificación
- `npm --prefix juego run check`: correcto tras los cambios.
- `npm --prefix juego run build`: correcto; Vite advierte chunk inicial >500 kB.
- `node herramientas/probar.mjs "http://127.0.0.1:5173/?timeout"`: sin errores de consola/recursos en pruebas de portada, puesto, venta y primer combate.
- Playthrough automatizado con los controles del navegador: `screen: "ending"`, `endingOutcome: "brothers"`, `wins: 3`, vínculo 5/5 y vida 4/8; captura `05-final-hermanos.png` revisada.
- La captura final confirma que el texto narrativo conserva márgenes laterales con ancho de ajuste 250 px.
- La campaña completa y el reinicio fueron probados en navegador; el caso de seis acciones + un séptimo clic mantiene sin cambios vínculo, monedas, stock y guardado.
- La campaña y el límite de franjas se repitieron después de centralizar `AJUSTES`; ambas verificaciones pasan.
- Campaña verificada con las pistas diarias; la captura del día 4 mantiene la información dentro del área útil.
- Pausa probada en puesto y combate; después de 1.8 s pausado no llega el golpe y Esc reanuda el asalto.
- La ruta completa se repitió después de añadir la segunda fase de Rábano: tres victorias y final «Hermanos», sin errores de navegador; captura `rabano-fase2/01-rabano-fase-dos.png` revisada.
- Tras corregir la esquiva se completó una partida nueva desde el título: siete días, tres victorias, vínculo 5 y final «Mercado común». Estado guardado comprobado y captura `campana-post-esquiva/1-final-mercado.png` revisada.
- La campaña se repitió tras incorporar opciones de diálogo: siete días, tres victorias, vínculo 0, fuerza 2 y final «Mercado común». La ruta comprobó que las elecciones entrenan sin coste de monedas/energía; captura `campana-dialogos/1-final.png` revisada.
- Tras auditar con Claude solo un extracto de `src/prueba.ts`, la demo sube a Rábano a 24 HP para que la preparación importe; la esquiva solo suma movimiento durante el telegráfico, los errores de acción informan al jugador y descansar al máximo no consume franja. La ruta entrenada gana con fuerza 4; otra captura confirma una esquiva limpia y victoria. Check/build y ruta normal de campaña sin errores; capturas en `.cache/capturas/demo-claude-adjustes/`, `.cache/capturas/demo-esquiva-final/` y `.cache/capturas/campana-completa-verificacion/`.
- `git -C juego diff --check`: correcto.
- Pase de tutoriales: check/build correctos; pruebas de los cinco pasos, vista previa/cancelación y regreso al puesto al dormir. Se detectó y corrigió que el cierre permanecía abierto después de cambiar de día.
- Ruta con tutorial completo, recarga antes del primer asalto y guía desde pausa: día 7, tres victorias, vínculo 3 y final «Hermanos», sin errores de navegador. Capturas revisadas en `.cache/capturas/onboarding-campana-final/`.
- Persistencia del tutorial, omitir, cuatro páginas de ayuda, descanso completo sin gastar turno y guardado antiguo sin los nuevos campos verificados sin errores. Capturas en `.cache/capturas/onboarding-guardados/`.
- Revisión estática de code-reviewer y typescript-reviewer: sin hallazgos pendientes tras corregir el regreso al puesto.
- Pase de lugares: tutorial con viaje explícito, cuatro espacios, ficha y campaña de siete días hasta «Hermanos», con tres victorias, vínculo 3 y vida 8/8. Recuperar el final conserva el desenlace y su texto. Capturas en `.cache/capturas/version-final-verificada/`.
- Recuperación de Rábano con 3/10 HP y fase dos mantiene atributos y alternancia normal/lluvia. Spam de Space no añade golpes antes de 700 ms; repetir guardia no da energía; pausa tras esquiva y guardados antiguos/malformados comprobados. Copias de `null`, `[]` y JSON truncado verificadas. Doble clic en venta ya no compra la siguiente actividad. Capturas en `.cache/capturas/version-final-regresiones/`.
- Check/build correctos. Build servida bajo `/release/` sin recursos fallidos; prueba vertical 720×1280 y centrado del lienzo comprobados tras corregir CSS. Capturas revisadas en `.cache/capturas/version-final-build-corregida/` y `.cache/capturas/version-final-vertical-corregida/`.
- Claude revisó un extracto y la descripción de mecánicas; recomendaciones integradas y límites documentados en `REVISION_CLAUDE.md`. Code-reviewer, typescript-reviewer y security-reviewer: sin hallazgos pendientes en el pase final, mediante lectura estática.
- Paquete candidato `entregas/patata-caliente-casi-20261010-0423.zip` creado y verificado: 17 archivos, 1 275 720 bytes, `index.html` en raíz y rutas compatibles. Hash y alcance en `BUILD_CANDIDATA.md`; sin publicación.

## Registro
| Hora | Hecho | Commit |
|---|---|---|
| 00:08 | Inicio solicitado; configuración, clon del remoto vacío y reloj 24 h. | — |
| 00:09 | GDD y scaffold Phaser; primera entrada de trazabilidad. | PENDING |
| 00:51 | Loop completo, UI, campaña, combate/guardia, guardado y recorrido de siete días verificado. | PENDING |
| 00:53 | Esquiva por movimiento del ratón; controles revisados y build/check/playtest correctos. | PENDING |
| 00:56 | HUD aclara vínculo y vida; chequeo y captura del puesto correctos. | PENDING |
| 01:20 | Aviso de contenido, decisión final de tres opciones y audio procedural por estado; rutas y efectos verificados en navegador. | PENDING |
| 01:20 | Batata ajustado a 8 HP y 2 de daño; la ruta completa alcanza «Hermanos» y se reduce el texto del final para mejorar el margen visual. | PENDING |
| 01:22 | Ajuste de ancho del texto final; captura revisada y campaña completa repetida sin errores. | PENDING |
| 01:35 | Se agrega reintento directo y se evita que acciones sin franja consuman o generen recursos; campaña y límite de turnos verificados. | PENDING |
| 01:36 | Se centralizan los parámetros de diseño en `AJUSTES`; campaña y caso de franjas agotadas vuelven a pasar. | PENDING |
| 01:41 | Se agregan avisos y diálogos breves por jornada sin cambiar el bucle ni invadir la interfaz. | PENDING |
| 01:45 | Se añade pausa reversible desde puesto y combate, con opción de guardar y salir; se anuncia Esc en el título. | PENDING |
| 01:48 | Rábano gana una segunda fase a mitad de vida, con aviso visible y ataques más rápidos; campaña completa verificada. | PENDING |
| 02:08 | La fase dos alterna lluvia anunciada; se corrigen la renovación del telegráfico y la detección de esquiva. Campaña nueva completa hasta «Mercado común». | PENDING |
| 02:14 | Se añade diálogo de tres respuestas con efectos; vuelta sin consumir franja, las tres ramas y una campaña completa verificadas. | PENDING |
| 02:24 | Se crea demo independiente de tres días en `/?prueba`: preparación del puesto, entrenamiento, descanso y duelo con Rábano. Build/check, victoria y esquiva verificados. | PENDING |
| 02:30 | Se validan las dos ramas del gimnasio, el desgaste selectivo y su efecto de combate: velocidad 5 reduce el golpe de Yuca a 1; se recoloca la ayuda Esc para que no quede cortada. | PENDING |
| 02:35 | La demo y la campaña cargan módulos separados; se comprueba que cada ruta omite el módulo ajeno y que el botón de la demo vuelve a la campaña. | PENDING |
| 02:49 | Pase visual inspirado por Punch Club con paleta cálida, barras segmentadas y assets propios del ZIP y del grupo Game jump: fondos de calle/tienda/gimnasio y sprites de Patata, Yuca y Rábano. | PENDING |
| 02:53 | Check, build, smoke de navegador y recorrido real hasta el asalto del día 3 pasan sin errores; se corrige el encaje del mensaje del puesto y se confirma en capturas el callejón, HUD y luchadores. | PENDING |
| 03:13 | Auditoría del extracto de demo con Claude; se hace que la preparación importe, se corrige la ventana de esquiva y se informan acciones sin efecto. Demo entrenada y campaña completa verificadas. | PENDING |
| 03:36 | Tutorial del primer día y primer asalto, guía consultable, agenda de rivales, costes visibles y cierre con previsión de noche. Campaña hasta «Hermanos» y guardados nuevos/antiguos verificados; dos revisiones de código sin pendientes. | PENDING |
| 04:16 | Puesto/gimnasio/casa/barrio navegables, ficha y recibos animados; recuperación de combate validada. Auditoría de Claude, límites de golpe/guardia/esquiva, ritmo real de Rábano y centrado vertical corregidos. Campaña completa y build bajo subcarpeta verificadas. | PENDING |







