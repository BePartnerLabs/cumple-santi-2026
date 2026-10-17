"use client";

import { guardarProgreso, leerProgreso } from "./progreso";
import { sonar, type Efecto } from "./sonido";

// Secretos escondidos en la invitación. No cambian nada del reto: son solo para
// quien explora. Se recuerdan en este teléfono.
export const HUEVOS = {
  culpable: { mensaje: "Buen intento, agente: ese es un nombre de la historia, no tu código.", efecto: "silbato" },
  once: { mensaje: "Once toques para once años. ¡Feliz cumpleaños, Director!", efecto: "reto" },
  futbol: { mensaje: "¡Gooool del Director! Hasta los agentes secretos entrenan dominadas.", efecto: "caso" },
  sal: { mensaje: "Sodio + cloro = ¡sal de mesa! Rica con papas fritas, pero no es ningún virus.", efecto: "burbuja" },
  luna: { mensaje: "¡Chuuu chuuu! El maquinista del Budapest Express te saluda desde la locomotora.", efecto: "silbato" },
  hacker: { mensaje: "Encontraste la consola secreta. El Director estaría orgulloso de este hackeo.", efecto: "caso" },
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
