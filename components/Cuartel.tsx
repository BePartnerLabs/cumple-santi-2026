"use client";

import { useEffect, useRef, useState } from "react";
import { publico } from "@/lib/config";
import { cuartel } from "@/lib/historia";
import { encontrarHuevo } from "@/lib/huevos";
import { sonar } from "@/lib/sonido";

// Escena 1: el mensaje del Director, con efecto de máquina de escribir.
export function Cuartel({ nombre, onAceptar }: { nombre: string; onAceptar: () => void }) {
  const texto = cuartel.mensaje.map((l) => l.replace("{nombre}", nombre)).join("\n\n");
  const [letras, setLetras] = useState(0);
  const toques = useRef(0);
  const botes = useRef(0);
  const listo = letras >= texto.length;

  useEffect(() => {
    // Con movimiento reducido, el texto aparece de una vez.
    const paso = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? texto.length : 2;
    const reloj = window.setInterval(() => setLetras((n) => Math.min(n + paso, texto.length)), 28);
    return () => window.clearInterval(reloj);
  }, [texto.length]);

  function tocarTitulo() {
    toques.current += 1;
    if (toques.current === publico.edad) encontrarHuevo("once");
  }

  function patear() {
    botes.current += 1;
    sonar("tecla");
    if (botes.current === 5) encontrarHuevo("futbol");
  }

  return (
    <section className="escena-juego escena-juego--cuartel" aria-labelledby="cuartel-titulo">
      <p className="juego__sello">{cuartel.agencia} · Expediente TS-51</p>
      <h1 id="cuartel-titulo" className="juego__titulo" onClick={tocarTitulo}>
        {publico.festejado} cumple {publico.edad}
      </h1>

      <Mapa />

      <div className="mensaje" onClick={() => setLetras(texto.length)}>
        <p className="mensaje__de">Mensaje del Director</p>
        <p className="mensaje__texto" aria-live="polite">
          {texto.slice(0, letras)}
          {!listo && <span className="mensaje__cursor" aria-hidden="true" />}
        </p>
      </div>

      <button type="button" className="pelota" onClick={patear} aria-label="Pelota de fútbol">
        <svg viewBox="0 0 40 40" aria-hidden="true">
          <circle cx="20" cy="20" r="18" fill="#f4f4f4" stroke="#0b0f20" strokeWidth="2" />
          <path d="M20 11l7 5-3 8h-8l-3-8z" fill="#0b0f20" />
          <path d="M20 11V3M27 16l8-3M24 24l5 7M16 24l-5 7M13 16l-8-3" stroke="#0b0f20" strokeWidth="1.5" />
        </svg>
      </button>

      <button type="button" className="boton juego__accion" onClick={onAceptar} disabled={!listo}>
        {cuartel.boton}
      </button>
    </section>
  );
}

function Mapa() {
  return (
    <svg className="mapa" viewBox="0 0 320 150" aria-hidden="true">
      <rect width="320" height="150" rx="10" fill="#14203a" />
      <path d="M0 40h320M0 80h320M0 120h320M60 0v150M140 0v150M220 0v150M290 0v150" stroke="#1f2e50" />
      <path d="M78 52C120 30 190 110 240 92" stroke="#e8c46a" strokeWidth="2" strokeDasharray="5 6" fill="none" />
      <g className="mapa__chinche mapa__chinche--lab">
        <circle cx="78" cy="52" r="9" fill="#a6f24a" />
        <text x="78" y="78" textAnchor="middle" fontSize="11" fill="#cfe8dc">Laboratorio</text>
      </g>
      <g className="mapa__chinche mapa__chinche--tren">
        <circle cx="240" cy="92" r="9" fill="#e8c46a" />
        <text x="240" y="118" textAnchor="middle" fontSize="11" fill="#efe3c4">Estación</text>
      </g>
    </svg>
  );
}
