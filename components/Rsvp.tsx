"use client";

import { useState } from "react";
import { publico, salas, type Preferencia, type Vista } from "@/lib/config";
import { pedir } from "@/lib/progreso";
import { sonar } from "@/lib/sonido";

const OPCIONES: { valor: Preferencia; titulo: string; detalle: string }[] = [
  { valor: "casona", titulo: salas.casona.nombre, detalle: "Fantasmas, una gárgola y un sótano. Da un poco de susto." },
  { valor: "alquimago", titulo: salas.alquimago.nombre, detalle: "Magia, pociones y un laboratorio secreto. Cero sustos." },
  { valor: "igual", titulo: "Me da lo mismo", detalle: "Pónganme en el equipo donde falte gente." },
];

export function Rsvp({ vista, onVista }: { vista: Vista; onVista: (v: Vista) => void }) {
  const { invitado, equipos } = vista;
  const respondio = invitado.asiste !== null;
  const [editando, setEditando] = useState(false);

  return (
    <section className="rsvp" id="confirmar" aria-labelledby="rsvp-titulo">
      <h2 id="rsvp-titulo">Elige tu sala</h2>

      {respondio && !editando ? (
        <div className="confirmado" role="status">
          <p className="confirmado__titulo">
            {invitado.asiste ? `¡Estás dentro, ${invitado.nombre}!` : `Te vamos a echar de menos, ${invitado.nombre}.`}
          </p>
          <p>
            {!invitado.asiste
              ? "Quedó anotado que no puedes ir. Si cambia el plan, corrige tu respuesta."
              : invitado.sala === "igual" || !invitado.sala
                ? "Te anotamos sin preferencia: irás al equipo donde falte gente."
                : `Anotamos que prefieres ${salas[invitado.sala].nombre}. Los equipos finales se arman cuando respondan todos.`}
          </p>
          <button type="button" className="enlace" onClick={() => setEditando(true)}>
            Cambiar mi respuesta
          </button>
        </div>
      ) : (
        <Formulario
          vista={vista}
          onConfirmado={(v) => {
            onVista(v);
            setEditando(false);
          }}
        />
      )}

      {equipos && (
        <div className="equipos">
          <h3>Así van los equipos</h3>
          <div className="equipos__dos">
            {(["casona", "alquimago"] as const).map((s) => (
              <div className={`equipo equipo--${s}`} key={s}>
                <h4>{salas[s].nombre}</h4>
                <p className="equipo__cuenta">
                  {equipos[s].length} de {salas[s].cupos}
                </p>
                {equipos[s].length ? (
                  <ul>
                    {equipos[s].map((n, i) => (
                      <li key={i}>{n}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="equipo__vacio">Nadie todavía. Sé el primero.</p>
                )}
              </div>
            ))}
          </div>
          {equipos.igual.length > 0 && (
            <p className="equipos__comodin">Sin preferencia: {equipos.igual.join(", ")}.</p>
          )}
        </div>
      )}
    </section>
  );
}

function Formulario({ vista, onConfirmado }: { vista: Vista; onConfirmado: (v: Vista) => void }) {
  const { invitado } = vista;
  const [asiste, setAsiste] = useState(invitado.asiste ?? true);
  const [sala, setSala] = useState<Preferencia | "">(invitado.sala ?? "");
  const [nota, setNota] = useState(invitado.nota);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  async function confirmar(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (asiste && !sala) {
      setError("Elige una sala (o marca «Me da lo mismo»).");
      return;
    }
    setEnviando(true);
    try {
      const v = await pedir({ codigo: invitado.codigo, accion: "responder", asiste, sala: sala || "igual", nota });
      if (asiste) sonar("acierto");
      onConfirmado(v);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={confirmar} noValidate>
      <p className="rsvp__intro">
        Somos unos 12 y hay dos salas, así que nos dividimos en dos equipos. Responde antes del{" "}
        {publico.responderAntesDe}.
      </p>

      <fieldset className="campo">
        <legend>{invitado.nombre}, ¿vienes?</legend>
        <div className="dupla">
          <label className="opcion">
            <input type="radio" name="asiste" checked={asiste} onChange={() => setAsiste(true)} />
            <span>Voy</span>
          </label>
          <label className="opcion">
            <input type="radio" name="asiste" checked={!asiste} onChange={() => setAsiste(false)} />
            <span>No puedo ir</span>
          </label>
        </div>
      </fieldset>

      {asiste && (
        <fieldset className="campo">
          <legend>¿Qué sala prefieres?</legend>
          {OPCIONES.map((o) => (
            <label className={`opcion opcion--${o.valor}`} key={o.valor}>
              <input type="radio" name="sala" checked={sala === o.valor} onChange={() => setSala(o.valor)} />
              <span>
                {o.titulo}
                <small>{o.detalle}</small>
              </span>
            </label>
          ))}
        </fieldset>
      )}

      <label className="campo">
        <span>Algo que debamos saber (opcional)</span>
        <textarea
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          maxLength={200}
          rows={2}
          placeholder="Alergias, quién te pasa a buscar…"
        />
      </label>

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      <button type="submit" className="boton" disabled={enviando}>
        {enviando ? "Confirmando…" : "Confirmar"}
      </button>
    </form>
  );
}
