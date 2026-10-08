"use client";

// Efectos hechos con el sintetizador del navegador: no hay archivos de audio.
export type Efecto = "puerta" | "hallazgo" | "acierto" | "fallo" | "caso" | "reto";

const LLAVE = "santi11-silencio";
let ctx: AudioContext | undefined;

// Música de fondo: "Investigations", de Kevin MacLeod (incompetech.com), licencia CC BY 4.0.
let pista: HTMLAudioElement | undefined;
let conMusica = false;

// Los navegadores solo dejan sonar después de un toque del usuario,
// así que cada toque reintenta lo que esté pendiente.
function despertar() {
  try {
    ctx ??= new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    if (conMusica && !enSilencio() && pista?.paused) void pista.play().catch(() => {});
  } catch {}
}

export function musica(encender: boolean) {
  conMusica = encender;
  if (!encender || enSilencio()) return pista?.pause();
  if (!pista) {
    pista = new Audio("/audio/misterio.mp3");
    pista.loop = true;
    pista.volume = 0.22;
  }
  void pista.play().catch(() => {});
}

if (typeof window !== "undefined") {
  window.addEventListener("pointerdown", despertar, { passive: true });
  window.addEventListener("keydown", despertar, { passive: true });
}

export function enSilencio() {
  try {
    return localStorage.getItem(LLAVE) === "1";
  } catch {
    return false;
  }
}

export function ponerSilencio(silencio: boolean) {
  try {
    localStorage.setItem(LLAVE, silencio ? "1" : "0");
  } catch {}
  musica(conMusica);
}

type Nota = { f: number; a?: number; t: number; d: number; onda?: OscillatorType; v?: number };

function tocar(notas: Nota[]) {
  if (!ctx) return;
  const ahora = ctx.currentTime;
  for (const n of notas) {
    const osc = ctx.createOscillator();
    const gan = ctx.createGain();
    osc.type = n.onda ?? "sine";
    osc.frequency.setValueAtTime(n.f, ahora + n.t);
    if (n.a) osc.frequency.exponentialRampToValueAtTime(n.a, ahora + n.t + n.d);
    gan.gain.setValueAtTime(0.0001, ahora + n.t);
    gan.gain.exponentialRampToValueAtTime(n.v ?? 0.18, ahora + n.t + 0.02);
    gan.gain.exponentialRampToValueAtTime(0.0001, ahora + n.t + n.d);
    osc.connect(gan).connect(ctx.destination);
    osc.start(ahora + n.t);
    osc.stop(ahora + n.t + n.d + 0.05);
  }
}

const EFECTOS: Record<Efecto, Nota[]> = {
  // chirrido que baja y un golpe seco
  puerta: [
    { f: 190, a: 70, t: 0, d: 1.1, onda: "sawtooth", v: 0.07 },
    { f: 283, a: 96, t: 0.05, d: 1.0, onda: "sawtooth", v: 0.04 },
    { f: 60, a: 35, t: 1.15, d: 0.35, onda: "triangle", v: 0.3 },
  ],
  hallazgo: [{ f: 880, a: 1320, t: 0, d: 0.18, v: 0.1 }],
  acierto: [
    { f: 659, t: 0, d: 0.16 },
    { f: 988, t: 0.12, d: 0.3 },
  ],
  fallo: [
    { f: 150, a: 90, t: 0, d: 0.35, onda: "square", v: 0.08 },
    { f: 110, a: 70, t: 0.05, d: 0.35, onda: "square", v: 0.06 },
  ],
  caso: [
    { f: 523, t: 0, d: 0.18 },
    { f: 659, t: 0.14, d: 0.18 },
    { f: 784, t: 0.28, d: 0.18 },
    { f: 1047, t: 0.42, d: 0.5 },
  ],
  reto: [
    { f: 392, t: 0, d: 0.2, onda: "triangle" },
    { f: 523, t: 0.16, d: 0.2, onda: "triangle" },
    { f: 659, t: 0.32, d: 0.2, onda: "triangle" },
    { f: 784, t: 0.48, d: 0.3, onda: "triangle" },
    { f: 659, t: 0.74, d: 0.14, onda: "triangle" },
    { f: 1047, t: 0.88, d: 0.9, onda: "triangle", v: 0.22 },
    { f: 523, t: 0.88, d: 0.9, v: 0.12 },
  ],
};

export function sonar(efecto: Efecto) {
  if (enSilencio()) return;
  despertar();
  try {
    tocar(EFECTOS[efecto]);
  } catch {}
}
