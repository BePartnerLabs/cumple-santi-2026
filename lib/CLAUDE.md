# lib/: datos, historia y estado

| Archivo | Qué tiene |
| --- | --- |
| `fiesta.ts` | Fecha, hora, lugar, dirección, mapa e `inicioISO` (`2026-10-24T14:40:00-03:00`). **Solo se importa en el servidor**: el cliente lo recibe al superar el reto |
| `config.ts` | Festejado, edad, plazo para responder, salas (`budapest`, `antidoto`, 6 cupos cada una) y tipos `Vista`, `Preferencia` |
| `historia.ts` | **Todos los textos del juego**, el pool de 9 elementos químicos con pistas para niños, `sortearFormula()` y los boletos |
| `huevos.ts` | Los 6 secretos (culpable, once, fútbol, sal, luna, hacker), `encontrarHuevo()` y el evento para el aviso en pantalla |
| `progreso.ts` | Estado por teléfono en `localStorage.santi11`: `{codigo, lab, estacion, huevos}`. `pedir()` es el único cliente de `/api/invitado` |
| `store.ts` | Invitados en Postgres (Neon) o en `.data/invitados.json`. La tabla se crea sola |
| `sonido.ts` | Efectos sintetizados con WebAudio, sin archivos: puerta, acierto, fallo, alarma, explosión, silbato, etc. Música: `public/audio/misterio.mp3` (CC BY, el crédito va en el pie) |
| `movimiento.ts` | Giroscopio suavizado (`useInclinacion`, `leerInclinacion`), permiso para iPhone (`activarMovimiento`, se pide al aceptar la misión) y `vibrar()` (solo Android) |
| `tres.ts` | `useEscena3D` (base de todas las escenas Three.js) y `crearParticulas` |

## Servidor

- `app/api/invitado/route.ts`: entrar con el código, `accion: "reto"` (superó el juego) y `accion: "responder"` (asiste, sala, nota). Fecha, lugar y equipos solo salen si `reto` es true.
- `app/calendario/route.ts`: archivo .ics con avisos el día antes y 2 h antes. `app/llegar/route.ts`: redirige al mapa.
- `app/manifest.ts` y `public/sw.js`: app instalable con atajos (tarjeta, mapa, calendario) y caché para abrir sin señal. Los íconos están en `public/icons/`.
- `app/panel/page.tsx`: carga de invitados y resumen, protegido con `PANEL_KEY`.

## Para cambiar algo común

- **Otra pregunta, pista o elemento químico**: `historia.ts`. El acertijo del boleto depende de las caras del maletín en `components/Maletin3D.tsx` (andén 3, 22:00, vagón 11): si cambias una, cambia la otra.
- **Fecha, hora o lugar**: `fiesta.ts`. Los textos fijos «14:40» y «14:25» también aparecen en `Final.tsx`, `Guardar.tsx` y `app/calendario/route.ts`.
- **Plazo para responder**: `config.ts` → `responderAntesDe`.
