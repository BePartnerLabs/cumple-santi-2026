"use client";

import { useState } from "react";
import { salas } from "@/lib/config";
import { preguntasAlquimago } from "@/lib/preguntas";
import { sonar } from "@/lib/sonido";
import { Pregunta, Velas } from "./Pregunta";

const FRASCOS = [
  { id: "sol", nombre: "Sol", color: "#fdb713" },
  { id: "estrella", nombre: "Estrella fugaz", color: "#ff7ab8" },
  { id: "luna", nombre: "Luna", color: "#8df5c0" },
] as const;

const RECETA = ["luna", "sol", "estrella"];

export function Alquimago({ resuelto, onResuelto }: { resuelto: boolean; onResuelto: () => void }) {
  const [llenos, setLlenos] = useState(0);
  const [velas, setVelas] = useState(3);
  const [mezcla, setMezcla] = useState<string[]>([]);
  const [fallos, setFallos] = useState(0);
  const listos = resuelto || llenos === FRASCOS.length;

  function acierto() {
    sonar("acierto");
    setLlenos(llenos + 1);
  }

  function fallo() {
    sonar("fallo");
    setVelas(velas - 1);
  }

  function reiniciar() {
    setLlenos(0);
    setVelas(3);
  }

  function verter(id: string) {
    if (resuelto || mezcla.includes(id)) return;
    const nueva = [...mezcla, id];
    if (RECETA[nueva.length - 1] !== id) {
      sonar("fallo");
      setFallos(fallos + 1);
      setMezcla([]);
      return;
    }
    setMezcla(nueva);
    if (nueva.length === RECETA.length) {
      sonar("caso");
      onResuelto();
    } else sonar("hallazgo");
  }

  return (
    <section className={`sala sala--alquimago${resuelto ? " sala--resuelta" : ""}`} aria-labelledby="alquimago-titulo">
      <div className="sala__cabecera">
        <h2 id="alquimago-titulo">{salas.alquimago.nombre}</h2>
        <p className="sala__lema">{salas.alquimago.lema}</p>
      </div>

      <p className="sala__texto">
        El Mago Chai, el mago más famoso del país, hacía en vivo por televisión su mejor truco:
        escapar de un estanque lleno de agua y cerrado con cadenas. Abrieron el estanque… y no
        estaba. Nadie lo ha vuelto a ver.
      </p>

      <div className="frascos">
        {FRASCOS.map((f, i) => {
          const lleno = resuelto || i < llenos;
          const usado = resuelto || mezcla.includes(f.id);
          return (
            <button
              key={f.id}
              type="button"
              className={`frasco${!lleno ? " frasco--vacio" : usado ? " frasco--usado" : ""}`}
              onClick={() => verter(f.id)}
              disabled={!listos}
              aria-pressed={usado}
              aria-label={lleno ? `Frasco ${f.nombre}` : "Frasco vacío"}
              style={{ "--liquido": f.color } as React.CSSProperties}
            >
              <Frasco simbolo={f.id} />
              <span>{lleno ? f.nombre : "Vacío"}</span>
            </button>
          );
        })}
      </div>

      {!listos && <Velas quedan={velas} />}

      <div aria-live="polite">
        {resuelto ? (
          <p className="sala__instruccion">¡La mezcla brilla! Se abre la puerta del laboratorio.</p>
        ) : !listos && velas === 0 ? (
          <div className="pregunta">
            <p>
              <strong>Se apagaron tus tres velas.</strong>
              Los frascos se vaciaron solos. Hay que llenarlos otra vez.
            </p>
            <button type="button" className="boton" onClick={reiniciar}>
              Encender las velas y empezar de nuevo
            </button>
          </div>
        ) : !listos ? (
          <Pregunta
            key={llenos}
            titulo={`Los frascos están vacíos. Para llenar el ${["primero", "segundo", "tercero"][llenos]}:`}
            pregunta={preguntasAlquimago[llenos]}
            onAcierto={acierto}
            onFallo={fallo}
          />
        ) : (
          <>
            <blockquote className="receta">
              En su cuaderno, el mago dejó anotada una mezcla: «Primero lo que brilla de noche.
              Después lo que brilla de día. Al final, lo que cruza el cielo y concede un deseo.»
            </blockquote>
            <p className="sala__instruccion">
              {mezcla.length === 0 && fallos > 0
                ? fallos > 1
                  ? "¡Puf! Se evaporó otra vez. Pista: lo que brilla de noche es la luna."
                  : "¡Puf! Se evaporó todo. Lee el cuaderno otra vez y prueba de nuevo."
                : mezcla.length
                  ? `Van ${mezcla.length} de 3. Sigue mezclando.`
                  : "Frascos llenos. Tócalos en el orden correcto para preparar la mezcla."}
            </p>
          </>
        )}
      </div>

      {resuelto && (
        <p className="mision">
          Caso resuelto. Tu misión el día de la fiesta: eres aprendiz del Mago Chai. Entra a su
          laboratorio secreto, descubre qué pasó de verdad y tráelo de vuelta antes de que se
          acaben los 60 minutos.
        </p>
      )}
    </section>
  );
}

function Frasco({ simbolo }: { simbolo: string }) {
  return (
    <svg viewBox="0 0 80 110" aria-hidden="true">
      <rect x="29" y="2" width="22" height="9" rx="3" fill="#b98a4a" />
      <path
        d="M32 10v28L9 86a12 12 0 0011 18h40a12 12 0 0011-18L48 38V10z"
        fill="rgba(255,255,255,.07)"
        stroke="#d9c7f2"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path className="frasco__liquido" d="M22 66h36l10 22a8 8 0 01-7 12H19a8 8 0 01-7-12z" />
      <g className="frasco__simbolo">
        {simbolo === "sol" && (
          <g stroke="#3a2500" strokeWidth="3" strokeLinecap="round">
            <circle cx="40" cy="82" r="7" fill="#3a2500" />
            <path d="M40 68v-3M40 99v-3M26 82h-3M57 82h-3M30 72l-2-2M52 94l-2-2M50 72l2-2M28 94l2-2" />
          </g>
        )}
        {simbolo === "luna" && <path d="M46 70a13 13 0 100 24 10 10 0 010-24z" fill="#0d3a2a" />}
        {simbolo === "estrella" && (
          <path d="M40 69l4 9 10 1-8 6 3 10-9-6-9 6 3-10-8-6 10-1z" fill="#4d0b2b" />
        )}
      </g>
    </svg>
  );
}
