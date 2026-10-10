# Patata Caliente — equipo Casi

Juego de gestión y combate automático, hecho con Phaser y TypeScript para AI GAME JAM.

## Jugar y compilar

```powershell
npm install --offline
npm run dev
npm run check
npm run build
npm run preview
node tools/empaquetar-demo.mjs --mes
```

La entrada principal abre una campaña de 30 días. Las rutas `?demo` (tres días), `?clasico` (campaña anterior) y `?prueba` (prototipo anterior) conservan sus guardados separados. `?timeout` evita el aviso de tiempo de desarrollo. `?debug` habilita un puente de inspección para pruebas; no es necesario para jugar.

## Demo independiente

```powershell
npm run build:demo
npm run preview:demo
node tools/empaquetar-demo.mjs
```

La vista previa de demo usa `http://127.0.0.1:4174/`. El ZIP HTML5 tiene `index.html` en raíz y rutas relativas; requiere un servidor web o la opción HTML5 de itch.io. Abrir el HTML mediante `file://` no es el flujo de distribución. El empaquetador no publica nada.

## Controles y objetivo

Elige lugares, entrena fuerza/agilidad/resistencia, usa las ventas para pagar mejoras y equipa hasta tres técnicas automáticas. Descansa antes de cerrar la jornada. Cada dos días llega un cobrador: paga o pelea. Los jefes de la campaña llegan en los días 7, 14, 21 y 30.

- Ratón / toque: botones.
- Flechas o Tab; Enter / Espacio: navegar y confirmar.
- Esc: pausa; M: silencio.
- En combate, el personaje actúa solo; puedes pausar o cambiar ritmo 1× / 2×.

Ver `docs/DEMO_0700.md`, `docs/MODELO_MENSUAL.md`, `docs/CREDITOS.md` y `AI_TRACE.md`. MusicGen limita las pistas a uso no comercial y requiere atribución. La mezcla necesita escucha humana; el balance final se sigue afinando.

## Ramas y revisión por funcionalidades

El orden, responsables de revisión y hashes están en [docs/ORDEN_COMMITS.md](docs/ORDEN_COMMITS.md). Las ramas `codex/` se apilan por dependencias; `main` reúne el conjunto. El historial registra la subida actual con fechas reales; AI_TRACE.md conserva las tareas anteriores.

Los prefijos Johan y Mariana (arte), Mariana y Luis (sonido) y Luis (programación) siguen la asignación del equipo. Los commits conservan la identidad Git configurada y declaran la generación con IA. Los paquetes de entrega y node_modules no se versionan; se regeneran con los comandos anteriores.
