"use client";

import { useRef, useState } from "react";
import { BOLETO_CORRECTO, BOLETOS, estacion, type Boleto } from "@/lib/historia";
import { encontrarHuevo } from "@/lib/huevos";
import { sonar } from "@/lib/sonido";

// Acto II: antes de subir al tren. Acertijo 3: el maletín 3D y el boleto correcto.
export function Estacion({ onTerminado }: { onTerminado: () => void }) {
  const [errado, setErrado] = useState<string[]>([]);
  const [partiendo, setPartiendo] = useState(false);
  const lunas = useRef(0);

  function elegir(b: Boleto) {
    if (partiendo || errado.includes(b.id)) return;
    if (b.id !== BOLETO_CORRECTO) {
      sonar("fallo");
      setErrado([...errado, b.id]);
      return;
    }
    sonar("silbato");
    setPartiendo(true);
  }

  return (
    <section className={`escena-juego escena-juego--estacion${partiendo ? " escena-juego--partida" : ""}`} aria-labelledby="estacion-titulo">
      <p className="juego__sello">Acto II · Acertijo 3 de 3</p>
      <h2 id="estacion-titulo" className="juego__titulo">
        {estacion.titulo}
      </h2>

      <div className="anden">
        <svg className="anden__cielo" viewBox="0 0 360 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <rect width="360" height="200" fill="#141a33" />
          <path d="M0 150l60-50 50 34 70-64 80 70 50-28 50 36v52H0z" fill="#1d2546" />
        </svg>
        <button
          type="button"
          className="anden__luna"
          aria-label="Luna"
          onClick={() => {
            lunas.current += 1;
            if (lunas.current === 3) encontrarHuevo("luna");
          }}
        />
        <div className="anden__tren" aria-hidden="true">
          <Tren />
        </div>
        <div className="anden__niebla" aria-hidden="true" />
      </div>

      {!partiendo ? (
        <>
          <p className="juego__texto">{estacion.intro}</p>
          <Maletin />
          <p className="juego__instruccion">{estacion.maletin}</p>
          <div className="boletos" role="group" aria-label="Elige el boleto correcto">
            {BOLETOS.map((b) => (
              <button
                key={b.id}
                type="button"
                className={`boleto${errado.includes(b.id) ? " boleto--errado" : ""}`}
                onClick={() => elegir(b)}
                disabled={errado.includes(b.id)}
              >
                <span className="boleto__linea">Budapest Express</span>
                <span className="boleto__datos">
                  <span>
                    Andén <b>{b.anden}</b>
                  </span>
                  <span>
                    Sale <b>{b.hora}</b>
                  </span>
                  <span>
                    Vagón <b>{b.vagon}</b>
                  </span>
                </span>
              </button>
            ))}
          </div>
          {errado.length > 0 && (
            <p className="juego__pista" role="alert">
              {estacion.revisor}
            </p>
          )}
        </>
      ) : (
        <div className="partida">
          <div className="pasajeros" aria-hidden="true">
            {[0, 1, 2, 3, 4].map((i) => (
              <span key={i} className="pasajero" style={{ animationDelay: `${0.4 + i * 0.35}s` }} />
            ))}
          </div>
          <p className="juego__texto">{estacion.partida}</p>
          <p className="gancho">{estacion.gancho}</p>
          <button type="button" className="boton juego__accion" onClick={onTerminado}>
            Ver mi misión
          </button>
        </div>
      )}
    </section>
  );
}

// Un maletín en 3D (CSS): se gira arrastrando el dedo. Cada cara guarda un dato.
function Maletin() {
  const [giro, setGiro] = useState({ x: -18, y: -28 });
  const arrastre = useRef<{ x: number; y: number; gx: number; gy: number } | null>(null);

  function empezar(e: React.PointerEvent) {
    e.currentTarget.setPointerCapture(e.pointerId);
    arrastre.current = { x: e.clientX, y: e.clientY, gx: giro.x, gy: giro.y };
  }

  function mover(e: React.PointerEvent) {
    const a = arrastre.current;
    if (!a) return;
    setGiro({
      x: Math.max(-80, Math.min(80, a.gx - (e.clientY - a.y) * 0.6)),
      y: a.gy + (e.clientX - a.x) * 0.6,
    });
  }

  function girar(dy: number) {
    sonar("tecla");
    setGiro({ x: -18, y: giro.y + dy });
  }

  return (
    <div className="maletin">
      <div
        className="maletin__escena"
        onPointerDown={empezar}
        onPointerMove={mover}
        onPointerUp={() => (arrastre.current = null)}
        onPointerCancel={() => (arrastre.current = null)}
      >
        <div className="maletin__caja" style={{ transform: `rotateX(${giro.x}deg) rotateY(${giro.y}deg)` }}>
          <div className="cara cara--frente">
            <span className="cara__asa" />
            <span className="cara__etiqueta">Budapest</span>
          </div>
          <div className="cara cara--atras">
            <small>Andén</small>3
          </div>
          <div className="cara cara--der">
            <small>Vagón</small>11
          </div>
          <div className="cara cara--izq">
            <small>Sale</small>22:00
          </div>
          <div className="cara cara--arriba">Laboratorio Brandt</div>
          <div className="cara cara--abajo">TS-51</div>
        </div>
      </div>
      <div className="maletin__botones">
        <button type="button" className="enlace" onClick={() => girar(-90)} aria-label="Girar a la izquierda">
          ← Girar
        </button>
        <button type="button" className="enlace" onClick={() => girar(90)} aria-label="Girar a la derecha">
          Girar →
        </button>
      </div>
    </div>
  );
}

function Tren() {
  return (
    <svg viewBox="0 0 520 110" aria-hidden="true">
      <g stroke="#0b0f20" strokeWidth="3" strokeLinejoin="round">
        <rect x="0" y="30" width="90" height="62" rx="6" fill="#1f2a1f" />
        <rect x="28" y="6" width="22" height="28" fill="#1f2a1f" />
        <rect x="96" y="22" width="200" height="72" rx="8" fill="#5a1626" />
        <rect x="302" y="22" width="200" height="72" rx="8" fill="#4a1220" />
      </g>
      <rect x="96" y="38" width="200" height="5" fill="#c9a24a" />
      <rect x="302" y="38" width="200" height="5" fill="#c9a24a" />
      <g fill="#fdb713" stroke="#0b0f20" strokeWidth="2">
        <rect x="112" y="52" width="30" height="26" rx="3" />
        <rect x="156" y="52" width="30" height="26" rx="3" fill="#0b1020" />
        <rect x="200" y="52" width="30" height="26" rx="3" />
        <rect x="244" y="52" width="30" height="26" rx="3" fill="#0b1020" />
        <rect x="318" y="52" width="30" height="26" rx="3" />
        <rect x="362" y="52" width="30" height="26" rx="3" fill="#0b1020" />
        <rect x="406" y="52" width="30" height="26" rx="3" />
        <rect x="450" y="52" width="30" height="26" rx="3" fill="#0b1020" />
      </g>
      <g fill="#0b0f20">
        <circle cx="22" cy="98" r="11" />
        <circle cx="66" cy="98" r="11" />
        <circle cx="126" cy="100" r="9" />
        <circle cx="266" cy="100" r="9" />
        <circle cx="332" cy="100" r="9" />
        <circle cx="472" cy="100" r="9" />
      </g>
    </svg>
  );
}
