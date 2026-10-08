"use client";

import { useId, useState } from "react";
import { esCorrecta, type Pregunta as TPregunta } from "@/lib/preguntas";

export function Velas({ quedan }: { quedan: number }) {
  return (
    <p className="velas" aria-label={`Te quedan ${quedan} de 3 velas`}>
      {[0, 1, 2].map((i) => (
        <svg key={i} viewBox="0 0 20 40" className={i < quedan ? undefined : "velas__apagada"} aria-hidden="true">
          <path className="velas__llama" d="M10 2c4 5 5 8 5 11a5 5 0 01-10 0c0-3 1-6 5-11z" />
          <rect x="5" y="19" width="10" height="19" rx="2" />
        </svg>
      ))}
    </p>
  );
}

// Una pregunta con respuesta escrita. La pista aparece tras el primer error.
export function Pregunta({
  titulo,
  pregunta,
  onAcierto,
  onFallo,
}: {
  titulo: string;
  pregunta: TPregunta;
  onAcierto: () => void;
  onFallo: () => void;
}) {
  const id = useId();
  const [respuesta, setRespuesta] = useState("");
  const [fallos, setFallos] = useState(0);

  function responder(e: React.FormEvent) {
    e.preventDefault();
    if (esCorrecta(pregunta, respuesta)) return onAcierto();
    setFallos(fallos + 1);
    setRespuesta("");
    onFallo();
  }

  return (
    <form className="pregunta" onSubmit={responder}>
      <label htmlFor={id}>
        <strong>{titulo}</strong>
        {pregunta.texto}
      </label>
      <div className="pregunta__fila">
        <input
          id={id}
          type="text"
          inputMode={pregunta.numerica ? "decimal" : "text"}
          value={respuesta}
          onChange={(e) => setRespuesta(e.target.value)}
          autoComplete="off"
          autoCorrect="off"
          placeholder="Tu respuesta"
        />
        <button type="submit" className="boton" disabled={!respuesta.trim()}>
          Responder
        </button>
      </div>
      {fallos > 0 && (
        <p className="pregunta__pista" role="alert">
          No es esa: se apagó una vela. Pista: {pregunta.pista}
        </p>
      )}
    </form>
  );
}
