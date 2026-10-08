"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { Vista } from "./config";

// Lo que este teléfono recuerda: con qué código entró y qué casos lleva.
// Que el reto esté superado lo guarda el servidor, así vale en cualquier teléfono.
export type Progreso = { codigo: string | null; casona: boolean; alquimago: boolean };

const LLAVE = "santi11";
const EVENTO = "santi11-cambio";
const VACIO: Progreso = { codigo: null, casona: false, alquimago: false };

// Respaldo por si el navegador bloquea localStorage (modo privado).
let memoria: string | null = null;

function leer() {
  try {
    return localStorage.getItem(LLAVE) ?? memoria;
  } catch {
    return memoria;
  }
}

function interpretar(crudo: string | null): Progreso {
  try {
    return crudo ? { ...VACIO, ...JSON.parse(crudo) } : VACIO;
  } catch {
    return VACIO;
  }
}

function suscribir(avisar: () => void) {
  window.addEventListener(EVENTO, avisar);
  window.addEventListener("storage", avisar);
  return () => {
    window.removeEventListener(EVENTO, avisar);
    window.removeEventListener("storage", avisar);
  };
}

export function guardarProgreso(cambio: Partial<Progreso>) {
  memoria = JSON.stringify({ ...interpretar(leer()), ...cambio });
  try {
    localStorage.setItem(LLAVE, memoria);
  } catch {}
  window.dispatchEvent(new Event(EVENTO));
}

export const olvidarProgreso = () => guardarProgreso(VACIO);

export function useProgreso() {
  const crudo = useSyncExternalStore(suscribir, leer, () => null);
  return useMemo(() => interpretar(crudo), [crudo]);
}

export class ErrorDeCodigo extends Error {}

export async function pedir(datos: Record<string, unknown>): Promise<Vista> {
  let res: Response;
  try {
    res = await fetch("/api/invitado", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });
  } catch {
    throw new Error("No hay conexión. Revisa tu internet y prueba de nuevo.");
  }
  const json = await res.json().catch(() => ({}));
  if (res.status === 404) throw new ErrorDeCodigo(json.error);
  if (!res.ok) throw new Error(json.error ?? "Algo falló. Prueba de nuevo.");
  return json;
}
