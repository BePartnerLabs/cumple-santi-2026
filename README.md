# Cumple de Santi 2026

Invitación móvil para el cumpleaños 11 de Santi en Escapology Santiago (Budapest Express y Antídoto).

## Cómo funciona

1. En `/panel?clave=…` se cargan los invitados. Cada uno recibe su número de agente: su nombre + 11 (`MATEO11`).
2. El invitado entra a la Agencia del Director Santi con su código.
3. Juega la precuela de las dos salas, con 3 acertijos: la puerta del laboratorio, la mezcla que crea el virus TS-51 y el maletín 3D con el boleto del Budapest Express.
4. Al terminar ve su Tarjeta de Agente (fecha, lugar y mapa) y elige su puerta: Antídoto o Budapest Express.
5. Al volver con su código, desde cualquier teléfono, entra directo a su tarjeta. También puede volver a jugar la historia.

## Secretos (Easter eggs)

Hay 6, definidos en `lib/huevos.ts`:

- Escribir `BAUER` o `BRANDT` como código en la puerta.
- Tocar 11 veces el título «Santi cumple 11».
- Patear 5 veces la pelota de fútbol del cuartel.
- En el laboratorio, verter Sodio y después Cloro: sal de mesa.
- Tocar 3 veces la luna de la estación.
- En la consola del navegador, escribir `santi()`.

## Dónde se cambia cada cosa

- `lib/fiesta.ts`: fecha, hora, lugar y dirección. También `inicioISO` (para buscadores) e `indexar`.
- `lib/historia.ts`: todos los textos de la historia, los acertijos y los boletos.
- `lib/config.ts`: nombre, edad, salas, cupos y fecha límite para responder.
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
