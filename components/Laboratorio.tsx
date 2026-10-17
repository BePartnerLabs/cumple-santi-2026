"use client";

import { useState } from "react";
import { laboratorio } from "@/lib/historia";
import { encontrarHuevo } from "@/lib/huevos";
import { vibrar } from "@/lib/movimiento";
import { sonar } from "@/lib/sonido";

const TUBOS = [
  { id: "agua", simbolo: "H₂O", nombre: "Agua", color: "#5ec8ff" },
  { id: "sodio", simbolo: "Na", nombre: "Sodio", color: "#fdb713" },
  { id: "cloro", simbolo: "Cl", nombre: "Cloro", color: "#a6f24a" },
] as const;
const RECETA = ["agua", "sodio", "cloro"];

type Paso = "puerta" | "mezcla" | "virus";

// Acto I: antes de que exista el virus. Acertijos 1 (la puerta) y 2 (la mezcla).
export function Laboratorio({ onTerminado }: { onTerminado: () => void }) {
  const [paso, setPaso] = useState<Paso>("puerta");

  return (
    <section
      className={`escena-juego escena-juego--lab${paso === "virus" ? " escena-juego--alarma" : ""}`}
      aria-labelledby="lab-titulo"
    >
      <p className="juego__sello">Acto I · Acertijo {paso === "puerta" ? "1" : "2"} de 3</p>
      <h2 id="lab-titulo" className="juego__titulo">
        {laboratorio.titulo}
      </h2>
      {paso === "puerta" && <Puerta onAbierta={() => setPaso("mezcla")} />}
      {paso === "mezcla" && <Mezcla onVirus={() => setPaso("virus")} />}
      {paso === "virus" && (
        <div className="virus">
          <Matraz color="#9b4dff" burbujas />
          <p className="virus__alerta" role="alert">
            TS-51 · secuencia completa
          </p>
          <p className="juego__texto">{laboratorio.climax}</p>
          <Maletita />
          <button type="button" className="boton juego__accion" onClick={onTerminado}>
            Seguir el maletín
          </button>
        </div>
      )}
    </section>
  );
}

function Puerta({ onAbierta }: { onAbierta: () => void }) {
  const [valor, setValor] = useState("");
  const [fallos, setFallos] = useState(0);
  const [temblor, setTemblor] = useState(false);
  const [abierta, setAbierta] = useState(false);

  function teclear(d: string) {
    if (abierta || valor.length >= 4) return;
    sonar("tecla");
    setValor(valor + d);
  }

  function probar() {
    if (valor === laboratorio.puerta.respuesta) {
      setAbierta(true);
      sonar("acierto");
      window.setTimeout(onAbierta, 700);
      return;
    }
    sonar("fallo");
    vibrar(90);
    setFallos(fallos + 1);
    setValor("");
    setTemblor(true);
    window.setTimeout(() => setTemblor(false), 450);
  }

  return (
    <>
      <p className="juego__texto">{laboratorio.intro}</p>
      <div className={`lector${temblor ? " lector--error" : ""}${abierta ? " lector--ok" : ""}`}>
        <p className="lector__pregunta">{laboratorio.puerta.texto}</p>
        <output className="lector__pantalla" aria-live="polite">
          {abierta ? "ACCESO OK" : valor || "_ _"}
        </output>
        <div className="teclado">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "⌫", "0", "OK"].map((t) => (
            <button
              key={t}
              type="button"
              className={`tecla${t === "OK" ? " tecla--ok" : ""}`}
              onClick={() => (t === "OK" ? probar() : t === "⌫" ? setValor(valor.slice(0, -1)) : teclear(t))}
              disabled={abierta || (t === "OK" && !valor)}
              aria-label={t === "⌫" ? "Borrar" : t}
            >
              {t}
            </button>
          ))}
        </div>
        {fallos > 0 && !abierta && <p className="juego__pista">Pista: {laboratorio.puerta.pista}</p>}
      </div>
    </>
  );
}

function Mezcla({ onVirus }: { onVirus: () => void }) {
  const [mezcla, setMezcla] = useState<string[]>([]);
  const [fallos, setFallos] = useState(0);
  const [ultimoFallo, setUltimoFallo] = useState<string | null>(null);
  const [puf, setPuf] = useState(false);

  function verter(id: string) {
    if (mezcla.includes(id)) return;
    const nueva = [...mezcla, id];
    if (RECETA[nueva.length - 1] !== id) {
      // Sodio y después cloro: no es la fórmula, pero es sal de mesa.
      if (id === "cloro" && ultimoFallo === "sodio") {
        encontrarHuevo("sal");
        setUltimoFallo(null);
        return setMezcla([]);
      }
      setUltimoFallo(id);
      sonar("fallo");
      vibrar([40, 30, 40]);
      setFallos(fallos + 1);
      setMezcla([]);
      setPuf(true);
      window.setTimeout(() => setPuf(false), 700);
      return;
    }
    setMezcla(nueva);
    if (nueva.length === RECETA.length) {
      sonar("alarma");
      vibrar([200, 100, 200, 100, 400]);
      window.setTimeout(onVirus, 500);
    } else sonar("burbuja");
  }

  const colorMezcla = mezcla.length ? TUBOS.find((t) => t.id === mezcla.at(-1))!.color : "transparent";

  return (
    <>
      <blockquote className="pizarra">{laboratorio.pizarra}</blockquote>
      <div className={`mesa${puf ? " mesa--puf" : ""}`}>
        <Matraz color={colorMezcla} nivel={mezcla.length / RECETA.length} />
        <div className="tubos">
          {TUBOS.map((t) => {
            const usado = mezcla.includes(t.id);
            return (
              <button
                key={t.id}
                type="button"
                className={`tubo${usado ? " tubo--usado" : ""}`}
                onClick={() => verter(t.id)}
                aria-pressed={usado}
                aria-label={`Verter ${t.nombre}`}
                style={{ "--liquido": t.color } as React.CSSProperties}
              >
                <span className="tubo__vidrio">
                  <span className="tubo__liquido" />
                  <span className="tubo__simbolo">{t.simbolo}</span>
                </span>
                <span className="tubo__nombre">{t.nombre}</span>
              </button>
            );
          })}
        </div>
      </div>
      <p className="juego__instruccion" aria-live="polite">
        {puf
          ? "¡Puf! Humo morado. Lee la pizarra otra vez."
          : mezcla.length
            ? `Van ${mezcla.length} de 3. Sigue la fórmula.`
            : "Toca los tubos en el orden de la pizarra para verterlos en el matraz."}
      </p>
      {fallos > 1 && <p className="juego__pista">Pista: {laboratorio.pistaMezcla}</p>}
    </>
  );
}

function Matraz({ color, nivel = 1, burbujas = false }: { color: string; nivel?: number; burbujas?: boolean }) {
  const alto = 46 * nivel;
  return (
    <svg className={`matraz${burbujas ? " matraz--burbujas" : ""}`} viewBox="0 0 120 150" aria-hidden="true">
      <defs>
        <clipPath id="matraz-forma">
          <path d="M48 14v40L14 118a14 14 0 0012 22h68a14 14 0 0012-22L72 54V14z" />
        </clipPath>
      </defs>
      <rect clipPath="url(#matraz-forma)" x="0" y={140 - alto} width="120" height={alto} fill={color} style={{ transition: "y .5s, height .5s, fill .5s" }} />
      {burbujas && (
        <g fill="#e6d1ff">
          <circle className="burbuja" cx="50" cy="128" r="4" />
          <circle className="burbuja burbuja--2" cx="68" cy="124" r="3" />
          <circle className="burbuja burbuja--3" cx="60" cy="132" r="5" />
        </g>
      )}
      <path d="M48 14v40L14 118a14 14 0 0012 22h68a14 14 0 0012-22L72 54V14z" fill="rgba(255,255,255,.06)" stroke="#cfe8dc" strokeWidth="3" strokeLinejoin="round" />
      <rect x="42" y="6" width="36" height="10" rx="3" fill="#b98a4a" />
    </svg>
  );
}

function Maletita() {
  return (
    <svg className="maletita" viewBox="0 0 120 80" aria-hidden="true">
      <rect x="10" y="20" width="100" height="56" rx="8" fill="#c9ced8" stroke="#0b0f20" strokeWidth="3" />
      <path d="M44 20v-10h32v10" fill="none" stroke="#0b0f20" strokeWidth="3" />
      <rect x="34" y="40" width="52" height="18" rx="2" fill="#efe3c4" stroke="#0b0f20" strokeWidth="2" />
      <text x="60" y="53" textAnchor="middle" fontSize="11" fontWeight="700" fill="#5a1626">
        Budapest
      </text>
    </svg>
  );
}
