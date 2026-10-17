"use client";

import { useState } from "react";
import { publico, type Vista } from "@/lib/config";
import { encontrarHuevo } from "@/lib/huevos";
import { pedir } from "@/lib/progreso";

// Nombres de los villanos: escribirlos como código es un secreto.
const SOSPECHOSOS = ["BAUER", "CORONELBAUER", "BRANDT", "DRBRANDT", "WALTERBRANDT"];

export function Gate({ onOpen, onAbriendo }: { onOpen: (vista: Vista) => void; onAbriendo: () => void }) {
  const [codigo, setCodigo] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [abriendo, setAbriendo] = useState(false);
  const [error, setError] = useState("");

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (SOSPECHOSOS.includes(codigo.replace(/[^A-Z]/g, ""))) return encontrarHuevo("culpable");
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
          Agencia del Director {publico.festejado}. Acceso solo para agentes: la puerta se abre con
          tu número de agente, el código que te dio el Director.
        </p>

        <form className="gate__codigo" onSubmit={entrar}>
          <label htmlFor="codigo">Tu número de agente</label>
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
            {abriendo ? "Acceso concedido…" : buscando ? "Verificando…" : "Entrar a la agencia"}
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
