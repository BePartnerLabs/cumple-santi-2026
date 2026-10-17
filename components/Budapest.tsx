"use client";

import { useRef, useState } from "react";
import { salas } from "@/lib/config";
import { preguntasBudapest } from "@/lib/preguntas";
import { encontrarHuevo } from "@/lib/huevos";
import { sonar } from "@/lib/sonido";
import { Pregunta, Velas } from "./Pregunta";

// Posición de cada pista dentro de la escena, en porcentaje.
// Tres de las pistas descartan sospechosos; juntas apuntan a uno solo.
const PISTAS = [
  {
    id: "reloj",
    x: 17,
    y: 20,
    titulo: "21:45",
    texto: "El reloj de Sir Clarence Hayden se rompió al caer. A esa hora había cinco pasajeros en el vagón comedor.",
  },
  {
    id: "boleto",
    x: 30,
    y: 86,
    titulo: "El boleto",
    texto: "Un boleto tirado en el andén, con una mancha de tinta: el asesino subió al tren en Viena, no en París.",
  },
  {
    id: "comedor",
    x: 57,
    y: 55,
    titulo: "El mesero",
    texto: "El mesero recuerda que la persona que salió corriendo del comedor llevaba guantes de cuero.",
  },
  {
    id: "maleta",
    x: 82,
    y: 79,
    titulo: "La maleta",
    texto: "Dentro de la maleta de Sir Clarence hay un pelo gris de bigote que no es suyo.",
  },
] as const;

type Sospechoso = { id: string; nombre: string; viene: "París" | "Viena"; guantes: string; bigote: boolean };

const SOSPECHOSOS: Sospechoso[] = [
  { id: "ilona", nombre: "Condesa Ilona", viene: "París", guantes: "de seda", bigote: false },
  { id: "varga", nombre: "Doctor Varga", viene: "Viena", guantes: "sin guantes", bigote: true },
  { id: "bauer", nombre: "Coronel Bauer", viene: "Viena", guantes: "de cuero", bigote: true },
  { id: "laurent", nombre: "Madame Laurent", viene: "Viena", guantes: "de cuero", bigote: false },
  { id: "petrov", nombre: "Señor Petrov", viene: "París", guantes: "de cuero", bigote: true },
];
const CULPABLE = "bauer";

const ALCANCE = 62; // px desde el centro de la luz

export function Budapest({ resuelto, onResuelto }: { resuelto: boolean; onResuelto: () => void }) {
  const escena = useRef<HTMLDivElement>(null);
  const tarjeta = useRef<HTMLDivElement>(null);
  const [encontradas, setEncontradas] = useState<string[]>([]);
  const [resueltas, setResueltas] = useState<string[]>([]);
  const [velas, setVelas] = useState(3);
  const [descartados, setDescartados] = useState<string[]>([]);
  const [acusado, setAcusado] = useState<string | null>(null);
  const lunas = useRef(0);
  const pistasListas = resuelto || resueltas.length === PISTAS.length;
  // La pista alumbrada queda con candado hasta responder su pregunta.
  const activa = pistasListas
    ? undefined
    : PISTAS.find((p) => encontradas.includes(p.id) && !resueltas.includes(p.id));

  function alumbrar(px: number, py: number) {
    const el = escena.current;
    if (!el) return;
    el.style.setProperty("--x", `${px}px`);
    el.style.setProperty("--y", `${py}px`);
    if (pistasListas || velas === 0) return;
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
    setResueltas([...resueltas, activa!.id]);
    sonar("acierto");
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

  function acusar(s: Sospechoso) {
    if (resuelto || descartados.includes(s.id)) return;
    setAcusado(s.id);
    if (s.id === CULPABLE) {
      sonar("caso");
      onResuelto();
    } else {
      sonar("fallo");
      setDescartados([...descartados, s.id]);
    }
  }

  const equivocado = acusado && acusado !== CULPABLE ? SOSPECHOSOS.find((s) => s.id === acusado) : undefined;

  return (
    <section className={`sala sala--budapest${resuelto ? " sala--resuelta" : ""}`} aria-labelledby="budapest-titulo">
      <div className="sala__cabecera">
        <p className="sala__numero">Caso 1</p>
        <h2 id="budapest-titulo">{salas.budapest.nombre}</h2>
        <p className="sala__lema">{salas.budapest.lema}</p>
      </div>

      <p className="sala__texto">
        Medianoche en el tren nocturno de París a Budapest. Sir Clarence Hayden, un millonario inglés,
        apareció tendido en el vagón comedor. El tren se detuvo en una estación perdida y nadie puede
        bajar. Eres el detective a bordo.
      </p>

      <div
        ref={escena}
        className={`escena${pistasListas ? " escena--iluminada" : ""}`}
        onPointerMove={onPointer}
        onPointerDown={onPointer}
      >
        <Tren />
        <button
          type="button"
          className="escena__secreto"
          style={{ left: "81%", top: "14.5%" }}
          tabIndex={-1}
          aria-hidden="true"
          onClick={() => {
            lunas.current += 1;
            if (lunas.current === 3) encontrarHuevo("luna");
          }}
        />
        {PISTAS.map((p) => {
          const lista = pistasListas || resueltas.includes(p.id);
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

      {!pistasListas && <Velas quedan={velas} />}

      <div ref={tarjeta} aria-live="polite">
        {pistasListas ? null : velas === 0 ? (
          <div className="pregunta">
            <p>
              <strong>Se apagaron tus tres velas.</strong>
              La estación quedó a oscuras y las pistas se perdieron en la niebla.
            </p>
            <button type="button" className="boton" onClick={reiniciar}>
              Encender las velas y empezar de nuevo
            </button>
          </div>
        ) : activa ? (
          <Pregunta
            key={activa.id}
            titulo="Esta pista tiene candado. Para abrirla:"
            pregunta={preguntasBudapest[activa.id]}
            onAcierto={acierto}
            onFallo={fallo}
          />
        ) : (
          <p className="sala__instruccion">
            Se cortó la luz del andén. Pasa el dedo por la escena para alumbrar con tu linterna: hay{" "}
            {PISTAS.length - resueltas.length}{" "}
            {resueltas.length === PISTAS.length - 1 ? "pista escondida" : "pistas escondidas"}.
          </p>
        )}
      </div>

      <ol className="libreta">
        {PISTAS.map((p) => {
          const vista = pistasListas || resueltas.includes(p.id);
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

      {pistasListas && (
        <div className="sospechosos">
          <h3>¿Quién fue?</h3>
          <p className="sala__instruccion">
            {resuelto
              ? "¡Atrapado! El Coronel Bauer subió en Viena, usa guantes de cuero y tiene bigote gris."
              : equivocado
                ? `${equivocado.nombre} no pudo ser. Revisa tu libreta: cada pista descarta a alguien.`
                : "Con tu libreta, toca a la persona que acusas."}
          </p>
          <ul className="sospechosos__lista">
            {SOSPECHOSOS.map((s) => {
              const fuera = descartados.includes(s.id);
              const atrapado = resuelto && s.id === CULPABLE;
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    className={`sospechoso${fuera ? " sospechoso--fuera" : ""}${atrapado ? " sospechoso--culpable" : ""}`}
                    onClick={() => acusar(s)}
                    disabled={resuelto || fuera}
                    aria-label={`Acusar a ${s.nombre}`}
                  >
                    <Retrato bigote={s.bigote} />
                    <span className="sospechoso__nombre">{s.nombre}</span>
                    <span className="sospechoso__datos">
                      Subió en {s.viene} · {s.guantes} · {s.bigote ? "con bigote" : "sin bigote"}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {resuelto && (
        <p className="mision">
          Caso resuelto. Tu misión el día de la fiesta: subir al Budapest Express, revisar cada vagón y
          descubrir la verdad antes de que el tren llegue a la próxima estación. Tienes 60 minutos.
        </p>
      )}
    </section>
  );
}

function Retrato({ bigote }: { bigote: boolean }) {
  return (
    <svg className="sospechoso__retrato" viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="24" cy="24" r="23" fill="#2a1420" stroke="#c9a24a" strokeWidth="2" />
      <circle cx="24" cy="19" r="8" fill="#c9a24a" />
      <path d="M10 42c2-9 8-13 14-13s12 4 14 13" fill="#c9a24a" />
      {bigote && <path d="M18 23c2 2 4 1 6 0 2 1 4 2 6 0" stroke="#2a1420" strokeWidth="2" fill="none" strokeLinecap="round" />}
    </svg>
  );
}

function Tren() {
  return (
    <svg className="escena__dibujo" viewBox="0 0 360 480" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="360" height="480" fill="#141a33" />
      <circle cx="292" cy="70" r="34" fill="#dfe8f4" />
      <circle cx="281" cy="62" r="6" fill="#c3d0e2" />

      {/* montañas */}
      <path d="M0 230l60-70 50 50 70-90 80 100 50-40 50 50v40H0z" fill="#1d2546" />

      {/* reloj de la estación */}
      <g stroke="#0b0f20" strokeWidth="3">
        <rect x="58" y="96" width="8" height="150" fill="#3a2a3a" />
        <circle cx="62" cy="96" r="24" fill="#efe3c4" />
      </g>
      <path d="M62 96V80M62 96l12 4" stroke="#2a1420" strokeWidth="3" strokeLinecap="round" />

      {/* tren */}
      <g stroke="#0b0f20" strokeWidth="3" strokeLinejoin="round">
        {/* locomotora */}
        <rect x="-10" y="236" width="80" height="80" rx="6" fill="#1f2a1f" />
        <rect x="20" y="206" width="22" height="34" fill="#1f2a1f" />
        {/* vagón comedor */}
        <rect x="76" y="226" width="150" height="92" rx="8" fill="#5a1626" />
        {/* vagón dormitorio */}
        <rect x="232" y="226" width="140" height="92" rx="8" fill="#4a1220" />
      </g>
      <rect x="76" y="246" width="150" height="6" fill="#c9a24a" />
      <rect x="232" y="246" width="140" height="6" fill="#c9a24a" />
      <g fill="#fdb713" stroke="#0b0f20" strokeWidth="2">
        <rect x="90" y="262" width="26" height="30" rx="3" />
        <rect x="126" y="262" width="26" height="30" rx="3" fill="#0b1020" />
        <rect x="162" y="262" width="26" height="30" rx="3" />
        <rect x="246" y="262" width="26" height="30" rx="3" fill="#0b1020" />
        <rect x="284" y="262" width="26" height="30" rx="3" />
        <rect x="322" y="262" width="26" height="30" rx="3" fill="#0b1020" />
      </g>
      <g fill="#0b0f20">
        <circle cx="16" cy="324" r="12" />
        <circle cx="50" cy="324" r="12" />
        <circle cx="104" cy="326" r="10" />
        <circle cx="198" cy="326" r="10" />
        <circle cx="260" cy="326" r="10" />
        <circle cx="344" cy="326" r="10" />
      </g>
      {/* humo */}
      <g fill="#3a4466" opacity="0.8">
        <circle cx="34" cy="192" r="12" />
        <circle cx="52" cy="172" r="16" />
        <circle cx="78" cy="150" r="20" />
      </g>

      {/* andén */}
      <rect y="336" width="360" height="144" fill="#0d1124" />
      <path d="M0 340h360" stroke="#c9a24a" strokeWidth="3" strokeDasharray="14 10" />

      {/* boleto */}
      <g transform="rotate(-12 108 412)">
        <rect x="92" y="402" width="34" height="20" rx="2" fill="#efe3c4" stroke="#0b0f20" strokeWidth="2" />
        <path d="M98 410h20M98 416h12" stroke="#5a1626" strokeWidth="2" />
      </g>

      {/* maleta */}
      <g stroke="#0b0f20" strokeWidth="3" strokeLinejoin="round">
        <rect x="270" y="364" width="56" height="40" rx="5" fill="#6b4a2a" />
        <path d="M288 364v-8h20v8" fill="none" />
        <rect x="292" y="378" width="12" height="10" fill="#c9a24a" />
      </g>
    </svg>
  );
}
