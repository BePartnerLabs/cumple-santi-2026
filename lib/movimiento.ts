"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

// Inclinación del teléfono (giroscopio), suavizada y normalizada entre -1 y 1.
// En iPhone hay que pedir permiso con un toque; en Android funciona directo.
// Sin giroscopio (computador) todo queda en 0 y nada se rompe.

type Inclinacion = { x: number; y: number };
const QUIETO: Inclinacion = { x: 0, y: 0 };

let actual = QUIETO;
let objetivo = QUIETO;
let escuchando = false;
let cuadro = 0;
const avisos = new Set<() => void>();

type ConPermiso = typeof DeviceOrientationEvent & { requestPermission?: () => Promise<"granted" | "denied"> };

function alInclinar(e: DeviceOrientationEvent) {
  const lado = Math.max(-1, Math.min(1, (e.gamma ?? 0) / 35)); // izquierda / derecha
  const frente = Math.max(-1, Math.min(1, ((e.beta ?? 45) - 45) / 35)); // hacia ti / lejos
  objetivo = { x: lado, y: frente };
  if (!cuadro) cuadro = requestAnimationFrame(suavizar);
}

function suavizar() {
  actual = { x: actual.x + (objetivo.x - actual.x) * 0.15, y: actual.y + (objetivo.y - actual.y) * 0.15 };
  avisos.forEach((a) => a());
  const quieto = Math.abs(objetivo.x - actual.x) < 0.002 && Math.abs(objetivo.y - actual.y) < 0.002;
  cuadro = quieto ? 0 : requestAnimationFrame(suavizar);
}

function escuchar() {
  if (escuchando || typeof window === "undefined") return;
  escuchando = true;
  window.addEventListener("deviceorientation", alInclinar);
}

export const necesitaPermiso = () =>
  typeof window !== "undefined" &&
  typeof DeviceOrientationEvent !== "undefined" &&
  typeof (DeviceOrientationEvent as ConPermiso).requestPermission === "function";

export const hayMovimiento = () => typeof window !== "undefined" && "DeviceOrientationEvent" in window;

// Llamar dentro de un toque del usuario (iPhone lo exige).
export async function activarMovimiento(): Promise<boolean> {
  try {
    if (necesitaPermiso()) {
      const r = await (DeviceOrientationEvent as ConPermiso).requestPermission!();
      if (r !== "granted") return false;
    }
    escuchar();
    return true;
  } catch {
    return false;
  }
}

// En Android no hace falta permiso: se activa solo.
if (typeof window !== "undefined" && hayMovimiento() && !necesitaPermiso()) escuchar();

function suscribir(aviso: () => void) {
  avisos.add(aviso);
  return () => avisos.delete(aviso);
}

export function useInclinacion() {
  return useSyncExternalStore(suscribir, () => actual, () => QUIETO);
}

// Lee la inclinación sin re-renderizar (para bucles de animación como Three.js).
export const leerInclinacion = () => actual;

// ¿Hay que mostrar el botón para activar el movimiento?
export function usePideMovimiento() {
  const [pide, setPide] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- depende del navegador
    setPide(necesitaPermiso());
  }, []);
  return [pide, setPide] as const;
}

// Vibración corta (solo Android; en iPhone no hace nada).
export function vibrar(patron: number | number[]) {
  try {
    navigator.vibrate?.(patron);
  } catch {}
}
