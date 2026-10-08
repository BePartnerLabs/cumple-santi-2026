# Cumple de Santi 2026

Invitación móvil para el cumpleaños 11 de Santi en Fuga Escape Room (La Casona Dubois y El Alquimago).

## Cómo funciona

1. En `/panel?clave=…` se cargan los invitados. Cada uno recibe un código fácil: su nombre + 11 (`MATEO11`).
2. El invitado abre el link y entra con su código.
3. Resuelve los dos casos (pistas con preguntas). Al terminar se revelan fecha, lugar y la elección de sala.
4. El servidor recuerda que ya superó el reto: al volver con su código, desde cualquier teléfono, ve los datos directo.

## Dónde se cambia cada cosa

- `lib/fiesta.ts`: fecha, hora, lugar y dirección. También `inicioISO` (para buscadores) e `indexar`.
- `lib/preguntas.ts`: las preguntas de cada caso, sus respuestas válidas y sus pistas.
- `lib/config.ts`: nombre, edad, cupos por sala y fecha límite para responder.
- `public/audio/misterio.mp3`: música de fondo («Investigations», Kevin MacLeod, CC BY 4.0; el crédito va en el pie).

## Desarrollo

```
pnpm dev
```

Sin base de datos conectada, los invitados se guardan en `.data/invitados.json`.
La clave local del panel está en `.env.local` (`PANEL_KEY`).

## Producción (Vercel)

1. Crear el proyecto en Vercel y conectarle una base Neon desde Storage (deja `DATABASE_URL` lista).
2. Agregar la variable `PANEL_KEY` con la clave que quieras para el panel.
3. Desplegar. La tabla `invitados` se crea sola con la primera visita.
4. Entrar a `/panel?clave=…` y cargar los invitados.
