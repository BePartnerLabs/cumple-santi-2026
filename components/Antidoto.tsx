"use client";

import { useState } from "react";
import { salas } from "@/lib/config";
import { preguntasAntidoto } from "@/lib/preguntas";
import { encontrarHuevo } from "@/lib/huevos";
import { sonar } from "@/lib/sonido";
import { Pregunta, Velas } from "./Pregunta";

const FRASCOS = [
  { id: "agua", nombre: "H₂O", etiqueta: "Agua", color: "#5ec8ff" },
  { id: "sodio", nombre: "Na", etiqueta: "Sodio", color: "#fdb713" },
  { id: "cloro", nombre: "Cl", etiqueta: "Cloro", color: "#a6f24a" },
] as const;

const RECETA = ["agua", "sodio", "cloro"];

export function Antidoto({ resuelto, onResuelto }: { resuelto: boolean; onResuelto: () => void }) {
  const [llenos, setLlenos] = useState(0);
  const [velas, setVelas] = useState(3);
  const [mezcla, setMezcla] = useState<string[]>([]);
  const [fallos, setFallos] = useState(0);
  const [ultimoFallo, setUltimoFallo] = useState<string | null>(null);
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
      // Sodio y después cloro: no es el antídoto, pero es sal de mesa.
      if (id === "cloro" && ultimoFallo === "sodio") {
        encontrarHuevo("sal");
        setUltimoFallo(null);
        setMezcla([]);
        return;
      }
      setUltimoFallo(id);
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
    <section className={`sala sala--antidoto${resuelto ? " sala--resuelta" : ""}`} aria-labelledby="antidoto-titulo">
      <div className="sala__cabecera">
        <p className="sala__numero">Caso 2</p>
        <h2 id="antidoto-titulo">{salas.antidoto.nombre}</h2>
        <p className="sala__lema">{salas.antidoto.lema}</p>
      </div>

      <p className="sala__texto">
        El Dr. Walter Brandt, experto en armas químicas, creó en secreto el virus TS-51 para venderlo
        al mejor postor. Antes de huir dejó en su laboratorio la única cura que existe, pero la
        escondió en tubos de ensayo sin rotular. Tu equipo de científicos tiene que prepararla primero.
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
              aria-label={lleno ? `Tubo ${f.nombre}` : "Tubo vacío"}
              style={{ "--liquido": f.color } as React.CSSProperties}
            >
              <Frasco simbolo={f.nombre} />
              <span>{lleno ? f.etiqueta : "Vacío"}</span>
            </button>
          );
        })}
      </div>

      {!listos && <Velas quedan={velas} />}

      <div aria-live="polite">
        {resuelto ? (
          <p className="sala__instruccion">¡El antídoto brilla verde! La cura está lista y la puerta del laboratorio se abre.</p>
        ) : !listos && velas === 0 ? (
          <div className="pregunta">
            <p>
              <strong>Se apagaron tus tres velas.</strong>
              Los tubos se derramaron. Hay que llenarlos otra vez.
            </p>
            <button type="button" className="boton" onClick={reiniciar}>
              Encender las velas y empezar de nuevo
            </button>
          </div>
        ) : !listos ? (
          <Pregunta
            key={llenos}
            titulo={`Los tubos de ensayo están vacíos. Para llenar el ${["primero", "segundo", "tercero"][llenos]}:`}
            pregunta={preguntasAntidoto[llenos]}
            onAcierto={acierto}
            onFallo={fallo}
          />
        ) : (
          <>
            <blockquote className="receta">
              En la pizarra del Dr. Brandt quedó la fórmula a medio borrar: «Primero, lo que tomas
              todos los días. Después, el metal que explota al tocar el agua. Al final, el gas verde
              con olor a piscina.»
            </blockquote>
            <p className="sala__instruccion">
              {mezcla.length === 0 && fallos > 0
                ? fallos > 1
                  ? "¡Puf! Se evaporó otra vez. Pista: lo que tomas todos los días es el agua (H₂O)."
                  : "¡Puf! Salió humo morado. Lee la pizarra otra vez y prueba de nuevo."
                : mezcla.length
                  ? `Van ${mezcla.length} de 3. Sigue mezclando.`
                  : "Tubos llenos. Tócalos en el orden de la fórmula para preparar el antídoto."}
            </p>
          </>
        )}
      </div>

      {resuelto && (
        <p className="mision">
          Caso resuelto. Tu misión el día de la fiesta: entrar al laboratorio del Dr. Brandt,
          encontrar la cura del TS-51 y escapar con ella antes de que caiga en manos enemigas. Tienes
          60 minutos.
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
        stroke="#cfe8dc"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path className="frasco__liquido" d="M22 66h36l10 22a8 8 0 01-7 12H19a8 8 0 01-7-12z" />
      <text className="frasco__simbolo" x="40" y="90" textAnchor="middle" fontSize="15" fontWeight="700" fill="#0b1a14">
        {simbolo}
      </text>
    </svg>
  );
}
