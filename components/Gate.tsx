"use client";

import { useState } from "react";
import { publico, type Vista } from "@/lib/config";
import { pedir } from "@/lib/progreso";

export function Gate({ onOpen, onAbriendo }: { onOpen: (vista: Vista) => void; onAbriendo: () => void }) {
  const [codigo, setCodigo] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [abriendo, setAbriendo] = useState(false);
  const [error, setError] = useState("");

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBuscando(true);
    try {
      const vista = await pedir({ codigo });
      setAbriendo(true);
      onAbriendo();
      const sinAnimacion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.setTimeout(() => onOpen(vista), sinAnimacion ? 0 : 1500);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBuscando(false);
    }
  }

  return (
    <div className={`gate${abriendo ? " gate--abriendo" : ""}`}>
      <div className="gate__hoja gate__hoja--izq" aria-hidden="true" />
      <div className="gate__hoja gate__hoja--der" aria-hidden="true" />

      <div className="gate__panel">
        <h1 className="gate__titulo">
          {publico.festejado} cumple {publico.edad}
        </h1>
        <p className="gate__bajada">
          y necesita a su equipo para escapar de dos salas. Tu invitación está detrás de esta
          puerta: se abre con el código secreto que te dio {publico.festejado}.
        </p>

        <form className="gate__codigo" onSubmit={entrar}>
          <label htmlFor="codigo">Tu código secreto</label>
          <input
            id="codigo"
            type="text"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.toUpperCase())}
            placeholder={`TUNOMBRE${publico.edad}`}
            autoCapitalize="characters"
            autoCorrect="off"
            autoComplete="off"
            spellCheck={false}
            maxLength={24}
          />
          <button type="submit" className="boton" disabled={buscando || abriendo || codigo.trim().length < 3}>
            {abriendo ? "¡Clic! La puerta se abre…" : buscando ? "Revisando…" : "Abrir la puerta"}
          </button>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
