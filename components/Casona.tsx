"use client";

import { useRef, useState } from "react";
import { salas } from "@/lib/config";
import { preguntasCasona } from "@/lib/preguntas";
import { sonar } from "@/lib/sonido";
import { Pregunta, Velas } from "./Pregunta";

// Posición de cada pista dentro de la escena, en porcentaje.
const PISTAS = [
  {
    id: "torre",
    x: 50,
    y: 24,
    titulo: "1908",
    texto:
      "El ingeniero francés Andrés Dubois llega a Santiago para instalar el alumbrado público y levanta esta casona para su familia.",
  },
  {
    id: "gargola",
    x: 14,
    y: 69,
    titulo: "La gárgola",
    texto: "Una bruja le aconsejó ponerla en el jardín. Desde ese día, nada volvió a salir bien en la casa.",
  },
  {
    id: "ventana",
    x: 32,
    y: 52,
    titulo: "La familia",
    texto: "Una noche se apagaron las luces de las ventanas. De los Dubois no se supo nunca más.",
  },
  {
    id: "sotano",
    x: 76,
    y: 87,
    titulo: "El sótano",
    texto: "Año 1963: la casona lleva décadas abandonada y los vecinos juran que algo se mueve ahí abajo.",
  },
] as const;

const ALCANCE = 62; // px desde el centro de la luz

export function Casona({ resuelto, onResuelto }: { resuelto: boolean; onResuelto: () => void }) {
  const escena = useRef<HTMLDivElement>(null);
  const tarjeta = useRef<HTMLDivElement>(null);
  const [encontradas, setEncontradas] = useState<string[]>([]);
  const [resueltas, setResueltas] = useState<string[]>([]);
  const [velas, setVelas] = useState(3);
  const todas = resuelto || resueltas.length === PISTAS.length;
  // La pista alumbrada queda con candado hasta responder su pregunta.
  const activa = todas ? undefined : PISTAS.find((p) => encontradas.includes(p.id) && !resueltas.includes(p.id));

  function alumbrar(px: number, py: number) {
    const el = escena.current;
    if (!el) return;
    el.style.setProperty("--x", `${px}px`);
    el.style.setProperty("--y", `${py}px`);
    if (todas || velas === 0) return;
    const { width, height } = el.getBoundingClientRect();
    const nuevas = PISTAS.filter(
      (p) => !encontradas.includes(p.id) && Math.hypot((p.x / 100) * width - px, (p.y / 100) * height - py) < ALCANCE,
    ).map((p) => p.id);
    if (!nuevas.length) return;
    setEncontradas([...encontradas, ...nuevas]);
    sonar("hallazgo");
    requestAnimationFrame(() => tarjeta.current?.scrollIntoView({ block: "nearest", behavior: "smooth" }));
  }

  function onPointer(e: React.PointerEvent) {
    const r = e.currentTarget.getBoundingClientRect();
    alumbrar(e.clientX - r.left, e.clientY - r.top);
  }

  function alEnfocar(p: (typeof PISTAS)[number]) {
    const el = escena.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    alumbrar((p.x / 100) * width, (p.y / 100) * height);
  }

  function acierto() {
    const nuevas = [...resueltas, activa!.id];
    setResueltas(nuevas);
    if (nuevas.length === PISTAS.length) {
      sonar("caso");
      onResuelto();
    } else sonar("acierto");
  }

  function fallo() {
    sonar("fallo");
    setVelas(velas - 1);
  }

  function reiniciar() {
    setEncontradas([]);
    setResueltas([]);
    setVelas(3);
  }

  return (
    <section className="sala sala--casona" aria-labelledby="casona-titulo">
      <div className="sala__cabecera">
        <h2 id="casona-titulo">{salas.casona.nombre}</h2>
        <p className="sala__lema">{salas.casona.lema}</p>
      </div>

      <div
        ref={escena}
        className={`escena${todas ? " escena--iluminada" : ""}`}
        onPointerMove={onPointer}
        onPointerDown={onPointer}
      >
        <Mansion />
        {PISTAS.map((p) => {
          const lista = todas || resueltas.includes(p.id);
          const pendiente = !lista && encontradas.includes(p.id);
          return (
            <button
              key={p.id}
              type="button"
              className={`marca${lista ? " marca--hallada" : pendiente ? " marca--hallada marca--pendiente" : ""}`}
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
              onFocus={() => alEnfocar(p)}
              aria-label={lista ? `Pista: ${p.titulo}` : "Pista con candado"}
            >
              {lista ? p.titulo : "?"}
            </button>
          );
        })}
        <div className="escena__oscuridad" aria-hidden="true" />
      </div>

      {!todas && <Velas quedan={velas} />}

      <div ref={tarjeta} aria-live="polite">
        {todas ? (
          <p className="sala__instruccion">Encontraste todo lo que se sabe de la casona.</p>
        ) : velas === 0 ? (
          <div className="pregunta">
            <p>
              <strong>Se apagaron tus tres velas.</strong>
              La casona volvió a quedar a oscuras y las pistas se escondieron de nuevo.
            </p>
            <button type="button" className="boton" onClick={reiniciar}>
              Encender las velas y empezar de nuevo
            </button>
          </div>
        ) : activa ? (
          <Pregunta
            key={activa.id}
            titulo="Esta pista tiene candado. Para abrirla:"
            pregunta={preguntasCasona[activa.id]}
            onAcierto={acierto}
            onFallo={fallo}
          />
        ) : (
          <p className="sala__instruccion">
            Está muy oscuro. Pasa el dedo por la casona para alumbrar con tu linterna: hay{" "}
            {PISTAS.length - resueltas.length} {resueltas.length === PISTAS.length - 1 ? "pista escondida" : "pistas escondidas"}.
          </p>
        )}
      </div>

      <ol className="libreta">
        {PISTAS.map((p) => {
          const vista = todas || resueltas.includes(p.id);
          return (
            <li key={p.id} className={vista ? "libreta__hallada" : undefined}>
              {vista ? (
                <>
                  <strong>{p.titulo}.</strong> {p.texto}
                </>
              ) : (
                "Pista sin encontrar"
              )}
            </li>
          );
        })}
      </ol>

      {todas && (
        <p className="mision">
          Caso resuelto. Tu misión el día de la fiesta: bajar al sótano, descubrir qué pasó con
          los Dubois y salir antes de que se acaben los 60 minutos.
        </p>
      )}
    </section>
  );
}

function Mansion() {
  return (
    <svg className="escena__dibujo" viewBox="0 0 360 480" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="360" height="480" fill="#14233d" />
      <circle cx="272" cy="86" r="50" fill="#dfe8f4" />
      <circle cx="256" cy="72" r="9" fill="#c3d0e2" />
      <circle cx="288" cy="102" r="6" fill="#c3d0e2" />
      <circle cx="280" cy="64" r="4" fill="#c3d0e2" />

      {/* árboles */}
      <g stroke="#0a1322" strokeWidth="5" strokeLinecap="round" fill="none">
        <path d="M22 400V250M22 300l-18-34M22 280l20-40M22 330l26-24M42 240l4-22M4 266l-2-20" />
        <path d="M338 400V230M338 290l-22-36M338 262l16-34M338 320l-28-20M316 254l-6-24" />
      </g>

      {/* casona */}
      <g fill="#223658" stroke="#0a1322" strokeWidth="3" strokeLinejoin="round">
        <rect x="152" y="96" width="56" height="100" />
        <path d="M144 98l36-66 36 66z" fill="#1a2a47" />
        <path d="M58 196l30-62h184l30 62z" fill="#1a2a47" />
        <rect x="70" y="196" width="220" height="200" />
        <rect x="150" y="386" width="60" height="12" />
        <rect x="140" y="398" width="80" height="12" />
      </g>
      <path d="M180 32v-18" stroke="#0a1322" strokeWidth="3" />

      {/* placa de la torre */}
      <rect x="162" y="104" width="36" height="22" rx="2" fill="#0d1728" stroke="#3b527b" strokeWidth="2" />

      {/* ventanas */}
      <g fill="#0b1424" stroke="#3b527b" strokeWidth="2">
        <path d="M172 186v-34a8 8 0 0116 0v34z" />
        <path d="M232 280v-48a12 12 0 0124 0v48z" />
        <path d="M232 370v-48a12 12 0 0124 0v48z" />
        <path d="M104 370v-48a12 12 0 0124 0v48z" />
        <path d="M166 396v-66a14 14 0 0128 0v66z" />
        <path d="M110 176v-22a8 8 0 0116 0v22zM234 176v-22a8 8 0 0116 0v22z" />
      </g>
      <path d="M104 280v-48a12 12 0 0124 0v48z" fill="#fdb713" stroke="#3b527b" strokeWidth="2" />
      <path d="M116 222v58M104 254h24" stroke="#8a5d00" strokeWidth="2" />

      {/* suelo */}
      <path d="M0 404c60-10 120-4 180-2s120-8 180 0v78H0z" fill="#0a1322" />

      {/* gárgola sobre su pedestal */}
      <g fill="#52688f" stroke="#0a1322" strokeWidth="2.5" strokeLinejoin="round">
        <rect x="32" y="356" width="38" height="50" />
        <rect x="26" y="348" width="50" height="10" />
        <path d="M38 348c-2-14 2-24 12-28l-6-12 12 8c8-2 14 2 16 10l-8 2c2 8 0 14-4 20z" />
        <path d="M46 322c-14-8-20-2-24 10 8-4 14-2 20 4z" />
      </g>

      {/* entrada al sótano */}
      <g stroke="#3b527b" strokeWidth="2.5" strokeLinejoin="round">
        <path d="M246 432l10-30h40l10 30z" fill="#182841" />
        <path d="M276 402v30M258 412h44" fill="none" />
      </g>
    </svg>
  );
}
