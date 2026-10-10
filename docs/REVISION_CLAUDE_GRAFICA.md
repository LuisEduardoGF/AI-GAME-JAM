# Revisión gráfica con Claude

Consulta autorizada con cuatro capturas propias anteriores al pase. Claude revisó imágenes estáticas, sin repositorio ni pruebas.

**Integración de Codex:** se incorporaron precios/requisitos de 12 px, paneles opacos, ring con suelo/cuerdas/sombras, señal visual de derrota, umbral de calor y etiqueta TIEMPO. La paleta se adaptó a los fondos del equipo. Criterios, contraste calculado y limitaciones en `DIRECCION_VISUAL.md`. La verificación del juego fue realizada por Codex y registrada en `PROGRESO.md`.

**Alcance:** capturas estáticas (px lógicos aprox., lienzo 960×540). Sin juicio de animación/hover; nada modificado ni probado.

## 1. Puntuación

| Factor | /10 | Observable |
|---|---|---|
| Composición/jerarquía | 6 | Portada clara (título→EMPEZAR→Patata). En el hub, cinco botones secundarios idénticos y COMPRA/VENDE pesan igual; "Cobro: día 2" queda enterrado. En combate, VS, cuerdas y "9s" compiten con las barras. |
| Legibilidad | 5 | Cifras principales bien (dorado 6.2:1, crema 9.6:1 sobre #493429); precios, demanda, requisitos y botones rondan ≈10–11 px; APRENDER inactivo casi invisible; "10.2." parece error. |
| Coherencia | 6 | Paleta y botones consistentes, pero fondo fino/pintado, sprite de píxel grueso y UI plana no comparten gramática; el borde dorado sirve para foco, selección y "En tu plan"; "BOOKSHOP" en inglés. |
| Profundidad | 4 | Rectángulos de un borde, sin sombra; panel de combate translúcido sobre arte ocupado; personajes sin sombra de contacto; cuerdas sin postes. |
| Respuesta visual | 5 | Bien: pestaña activa, "En tu plan", llamas al calentar. Mal: rival a 0 PV sigue intacto, golpe = dos chispas, sin banner ni medidor de calor. |

**Superposiciones y lectura (corregir primero)**
- Hub: franja "Cobro: día 2…" (y≈382–414) tapa las piernas de Patata.
- Portada: "DEMO • 3 DÍAS" (x≈677–790, y≈103–118) pisa el letrero, sin placa.
- Modal de habilidades: el HUD asoma atenuado sobre su borde y los botones inferiores quedan cortados bajo él (y≈508).
- Cards: en "Ráfaga de Sartén" el coste queda pegado a la descripción.
- Combate: VS sin placa, pegado a dos cuerdas; log y "CALOR 23" sobre arte ocupado; "9s" sin etiqueta; pies a 8–14 px del suelo, a alturas distintas.

## 2. Sistema

**Paleta**, conservando los 4 actuales:
- Superficies: overlay #241915; panel #493429; elevado #5a4132; pozo #3a2a22.
- Controles: botón #77513c; hover #8a5d43; pulsado #5a3d2c; foco/dinero #e8b65f.
- Texto: principal #f6e8cf; secundario #c9b393 (5.7:1); inactivo #8a7662 (3.2:1).
- Estado: vida #86c86f; peligro #e8604d (texto #f4836f); estamina #5aa9c9; calor #f08a3c.
- Estilos (solo franja+icono): Flameante #f08a3c; Ardiente #e8604d; Roca #8f8cab.

**Tipografía** (px lógicos): título Press Start 2P 48 (múltiplo de 8); panel 20/700; cifras HUD 22/700; nombre de card 14/600; **texto de decisión (precio, requisito, log) ≥12/500**; ayudas 11/400 arena; botón 12/600 mayúsculas.

**Espaciado:** base 4 (4/8/12/16/24); panel 16, card 12, gap 8, fila de producto 48; esquinas con muesca de 2 px.

## 3. Seis cambios, por impacto

1. **Helper `drawPanel`/`drawButton`** en todas las escenas (muesca = 2 `fillRect` cruzados; dibujar una vez, no en `update`). Backdrop de modales #241915 α0.88, depth sobre el HUD: elimina fantasmas.
2. **Combate.** Panel ink α0.78 tras log y calor; log 12 px, enteros solo visuales ("Patata golpea 10"), color por origen (golpe crema, skill estilo, quemadura calor, daño recibido tomate). CALOR como barra 120×8 con marca en 85. "VS" sobre placa; etiqueta para "9s" (p. ej. TIEMPO). Cuerdas 3 px #946548 con postes; sombra elíptica bajo cada luchador, misma base. Golpe: flash blanco 60 ms, empuje 4 px, cifra flotante. A 0 PV: rival α0.35 + banner "¡VICTORIA!" 1.2 s.
3. **HUD/hub.** Barras 96×4 bajo VIDA (verde→dorado <50 %→tomate <25 %) y ENERGÍA. "Cobro" y "Jefe" como chips en el extremo derecho de la franja superior de la escena (tomate si vence mañana); se quita la franja inferior. "Primero entrena…" en cinta con barra dorada 3 px.
4. **Cards de mercado.** Icono 24×24 (papa, tomate, zanahoria: mapas 12×12 con fillRect ×2); subtítulo 12 px: "Demanda n" arena, "−$5" dorado, "+$8" verde. COMPRA con borde dorado, VENDE con borde verde.
5. **Ramas de skills.** Cabeceras de columna sin aspecto de pestaña (barra 3 px de estilo + icono 24×24); franja izquierda de estilo en cada card; equipada = fondo elevado + etiqueta (foco = anillo doble); requisito en dos textos (PT y stat), verde/tomate según se cumpla; conector 2×8 px de estilo si la previa está aprendida; descripción con `wordWrap` = ancho−24 y 24 px reservados.
6. **Portada.** "CALIENTE" en #f08a3c con sombra 3 px; "DEMO • 3 DÍAS" en placa ink α0.9 con borde dorado 1 px; viñeta ink 0→0.5 en bordes (atenúa el letrero); sombra elíptica 120×14 bajo Patata.

## 4. Parámetros
- **Sombras:** panel (0,4) #1a110e α0.45; modal (0,6) α0.55; botón (0,2) α0.4.
- **Marco:** 2 px #241915; luz 1 px #6b4a39 arriba/izquierda; hundido 2 px #3a2a22 abajo. **Separador:** 1 px #2f221c + 1 px #5c4334, margen 12.
- **Botón:** reposo #77513c; hover #8a5d43 + contorno dorado 2 px (sin mover); pulsado #5a3d2c, texto +1 px; foco de teclado: anillo dorado 2 px + hueco ink 2 px; inactivo #3a2a22/#8a7662. Pestaña activa: #8a5d43 + barra dorada 3 px.
- **Efectos (solo visuales, sin tocar la simulación):** cifra sube 18 px en 450 ms con stroke ink 3 px; shake solo en skills (90 ms, 0.003, máx. 1/250 ms); ≤12 partículas.

## 5. Criterios antes/después
1. **Legibilidad:** recorrer los `Text` visibles de cada escena; 100 % de los de decisión ≥12 px y ≥4.5:1 contra su fondo.
2. **Colisiones:** `getBounds()` de textos, sprites y marcos; 0 intersecciones indebidas en las 4 escenas (hoy ≥4).
3. **Feedback:** captura a 60 fps de 6 eventos (golpe dado, recibido, skill, quemadura, umbral de calor, K.O.); respuesta visible en ≤6 cuadros en los 6.
