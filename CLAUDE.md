@AGENTS.md

# Cumple Santi 2026 · Expediente TS-51

Invitación móvil jugable para el cumpleaños 11 de Santi (hijo de Jorge Saud). Repo de Be Partner Labs.
Detalle por carpeta: `components/CLAUDE.md` (escenas y 3D) y `lib/CLAUDE.md` (datos, historia y estado).

## La fiesta (datos reales, confirmados)

- **Sábado 24 de octubre de 2026, 14:40.** Llegar a las 14:25. Las dos salas parten al mismo tiempo y duran 60 min.
- **Escapology, Parque Araucano**: Presidente Riesco 5330, Las Condes.
- **Dos salas reservadas, 6 cupos cada una**: *Antídoto* y *Budapest Express*. Los amigos se dividen en 2 equipos, y entra un papá por sala.
- **Responder antes del sábado 17 de octubre.** La invitación todavía no se envió, así que no hay respuestas antiguas que migrar.
- Escapology recomienda sus salas desde los 12 años, y Budapest Express es la más difícil. El pie para papás lo avisa.

## Ramas

- `main`: versión original (Fuga Escape Room). Obsoleta.
- `escapology`: respaldo **ya funcional** con el lugar nuevo (dos casos, linterna, sospechosos, tubos). Se puede enviar si el juego nuevo no llega.
- `expediente-ts51`: **la versión actual**. Es el juego en 3 actos con Three.js, giroscopio y app instalable. Todo el trabajo nuevo va aquí.

## La historia (no romper estas reglas)

La invitación es la **precuela** de las dos salas: cuenta lo que pasa *antes* de cada una y termina donde la sala empieza.
- **Nunca** se nombra al culpable del Budapest Express ni aparece la cura del Antídoto.
- El hilo: Sir Clarence Hayden (millonario) financia al Dr. Walter Brandt. Brandt crea el virus TS-51, lo guarda en un maletín «Budapest», y Clarence se lo lleva en el tren.
- El jugador es un agente reclutado por **el Director Santi**. El código de invitación (`NOMBRE11`) es su número de agente.
- Los 3 acertijos son fáciles a propósito (niños de 10-11 años): la puerta del lab (11), la mezcla química (fórmula aleatoria) y el boleto según los números del maletín (andén 3, 22:00, vagón 11).
- El guion completo vive en un Claude Doc del usuario: «Santi 11 — Expediente TS-51 (guion)».

## Flujo de pantallas

Gate (código) → Cuartel (mensaje del Director) → Laboratorio (acertijos 1 y 2) → Estación (acertijo 3) → Final (Tarjeta de Agente, elegir puerta, guardar en el teléfono).
Quien vuelve con su código entra **directo a la Tarjeta**, porque el servidor recuerda `reto: true`. «Volver a jugar» repite la historia sin tocar el servidor.

## Stack y comandos

- Next.js 16.3 (App Router, **ver AGENTS.md: APIs distintas a las que conoces**), React 19, TypeScript, pnpm 11.
- Postgres en Neon (`DATABASE_URL`) en Vercel. Sin base de datos, se guarda en `.data/invitados.json`.
- Three.js 0.183, cargado con `import("three")` dentro de efectos para no pesar en la primera carga.
- Sin librerías de UI ni de CSS: estilos a mano en `app/globals.css` (base) y `app/juego.css` (escenas).
- `pnpm dev` · `pnpm lint` · `pnpm exec tsc --noEmit` (antes, `pnpm exec next typegen` para los tipos `PageProps` y `LayoutProps`) · `pnpm build`.
- El build local puede fallar al descargar Google Fonts sin red. No es un error del código.
- Panel de invitados: `/panel?clave=PANEL_KEY`.

## Convenciones

- **Todo en español**: código, nombres, comentarios y textos de la interfaz. Términos técnicos en inglés solo cuando no hay traducción natural.
- Los textos de la historia van en `lib/historia.ts`, nunca escritos a mano en los componentes.
- Móvil primero (alrededor de 390 px). Respetar `prefers-reduced-motion` en toda animación y en las escenas 3D.
- Cada escena 3D tiene un **respaldo sin WebGL** (SVG/CSS) que no se borra.
- Commits en español, en imperativo y descriptivos.

## Probar

Con Playwright (Python) contra `pnpm dev`. Para WebGL headless: `chromium.launch(args=["--use-gl=swiftshader","--enable-unsafe-swiftshader"])`.
Invitados de prueba en `.data/invitados.json`: uno con `reto: true` (ve la Tarjeta directo) y otro con `reto: false` (juega desde el inicio).
Para saltar escenas, sembrar `localStorage.santi11` con `{codigo, lab: true}`.

## Pendiente / ideas acordadas

- **Dossier del Agente con Claude Haiku** (propuesto, sin aprobar): 3 preguntas de opción múltiple (sin texto libre, son niños), Haiku genera un alias y 2 líneas para la Tarjeta, una llamada por invitado guardada en la base, con un alias fijo si la API falla. Requiere `ANTHROPIC_API_KEY` en Vercel. **Descartado**: un chat abierto con personajes.
- **Notificaciones web push**: descartadas por ahora. Los avisos del calendario (`/calendario`, el día antes y 2 h antes) cubren el caso sin infraestructura.
- Hay una demo en un artifact de claude.ai, hecha con esbuild y el `pedir` simulado. No forma parte del repo.
