# components/: escenas del juego

Para trabajo en Three.js, usar la skill del proyecto `.claude/skills/threejs-skills` (patrones, materiales y rendimiento).

## Escenas (en orden)

| Archivo | Qué es | Notas |
| --- | --- | --- |
| `Gate.tsx` | Puerta de acero con el código de agente | Escribir BAUER o BRANDT activa un secreto y no llama al servidor |
| `Cuartel.tsx` | Mensaje del Director con efecto de máquina de escribir y mapa que se inclina | Secretos: 11 toques al título, 5 toques a la pelota de fútbol |
| `Laboratorio.tsx` | Acertijo 1 (teclado, respuesta 11) y acertijo 2 (mezcla) | `Mezcla` sortea la fórmula con `sortearFormula()`, explota si la mezcla está mal y crea el virus si está bien. Secreto: Na y luego Cl da sal de mesa |
| `Matraz3D.tsx` | Matraz Three.js (LatheGeometry) | Recibe `estado {color, nivel, virus, vertidos, explosiones}`; los contadores disparan el chorro y la explosión |
| `Estacion.tsx` | Acertijo 3: maletín y boletos; el tren parte | Botón «Ya lo vi: elegir mi boleto ↓» porque el maletín roba gestos |
| `Tren3D.tsx` | Andén y Budapest Express en Three.js | `partiendo` acelera el tren; la luna se detecta con un raycast (secreto: 3 toques) |
| `Maletin3D.tsx` | Maletín Three.js con datos en sus caras (CanvasTexture) | **Solo el arrastre horizontal gira**: el vertical queda libre para el scroll (`touch-action: pan-y`). No volver a capturar el puntero |
| `Final.tsx` | Tarjeta de Agente, tip, elección de puerta, guardar y pie para papás | Es lo que ve directo quien vuelve |
| `Rsvp.tsx` | Confirmar y elegir puerta (Antídoto, Budapest o «me da lo mismo») | Las puertas en arco se dibujan con CSS (`.puertas`) |
| `Guardar.tsx` | Instalar como app (beforeinstallprompt, pasos para iPhone) y calendario | Enlaza a `/calendario` (.ics) y a Google Calendar |
| `Invitation.tsx` | Orquesta las etapas, la música, el aviso de secretos, el service worker y `santi()` en la consola | Etapa actual = progreso local salvo que se esté rejugando |

## 3D: reglas

- Toda escena usa `useEscena3D(montar, {proporcion, fov})` de `lib/tres.ts`. Esa función carga three en diferido, mide el contenedor, corre el bucle y limpia todo.
- Las props cambian por `useRef` y se leen dentro de `cuadro()`. **No** se remonta la escena por cada cambio.
- Siempre se pasa un `respaldo` (SVG/CSS) para cuando no hay WebGL o falla el import.
- La inclinación se lee con `leerInclinacion()` dentro del bucle (no provoca renders). En React, `useInclinacion()`.
- Con `quieto` (prefers-reduced-motion): sin auto-giro, temblores ni oscilaciones.
- Rendimiento móvil: `pixelRatio` de 2 como máximo, pocas luces, sin sombras, geometrías simples y partículas con `crearParticulas`.

## Estilo visual

Agencia secreta de noche: azul tinta, oro para Budapest, verde tóxico para el laboratorio y morado para el virus. Títulos en Special Elite (máquina de escribir) y texto en Figtree. Los tokens están en `app/juego.css` (`--oro`, `--toxico`, `--virus`, `--acero`).
