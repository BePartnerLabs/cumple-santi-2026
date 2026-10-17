"use client";

import { guardarProgreso, leerProgreso } from "./progreso";
import { sonar, type Efecto } from "./sonido";

// Secretos escondidos en la invitación. No cambian nada del reto: son solo para
// quien explora. Se recuerdan en este teléfono.
export const HUEVOS = {
  luna: { mensaje: "¡Chuuu chuuu! El maquinista del Budapest Express te saluda desde la locomotora.", efecto: "silbato" },
  sal: { mensaje: "Sodio + cloro = ¡sal de mesa! Rica con papas fritas, pero no cura ningún virus.", efecto: "burbuja" },
  culpable: { mensaje: "Buen intento, detective: ese es un sospechoso, no un código.", efecto: "silbato" },
  once: { mensaje: "Once toques para once años. ¡Feliz cumpleaños, Santi!", efecto: "reto" },
  hacker: { mensaje: "Encontraste la consola secreta. Santi estaría orgulloso de este hackeo.", efecto: "caso" },
} as const satisfies Record<string, { mensaje: string; efecto: Efecto }>;

export type HuevoId = keyof typeof HUEVOS;
export const TOTAL_HUEVOS = Object.keys(HUEVOS).length;
export const EVENTO_HUEVO = "santi11-huevo";

export function encontrarHuevo(id: HuevoId) {
  const { huevos } = leerProgreso();
  if (!huevos.includes(id)) guardarProgreso({ huevos: [...huevos, id] });
  sonar(HUEVOS[id].efecto);
  window.dispatchEvent(new CustomEvent(EVENTO_HUEVO, { detail: id }));
}
