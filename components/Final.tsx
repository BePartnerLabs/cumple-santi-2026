"use client";

import { publico, salas, type Vista } from "@/lib/config";
import { final } from "@/lib/historia";
import { TOTAL_HUEVOS } from "@/lib/huevos";
import { useInclinacion } from "@/lib/movimiento";
import { Guardar } from "./Guardar";
import { Rsvp } from "./Rsvp";

// Final: la tarjeta de agente con fecha, lugar y puerta elegida. Es lo que ve
// directo quien vuelve a abrir el link.
export function Final({
  vista,
  onVista,
  huevos,
  onRejugar,
  onSalir,
}: {
  vista: Vista;
  onVista: (v: Vista) => void;
  huevos: number;
  onRejugar: () => void;
  onSalir: () => void;
}) {
  const { invitado, fiesta } = vista;
  const inc = useInclinacion();
  const puerta = invitado.asiste && invitado.sala && invitado.sala !== "igual" ? invitado.sala : null;

  return (
    <section className="escena-juego escena-juego--final" aria-labelledby="final-titulo">
      <p className="juego__sello">Misión cumplida</p>
      <h2 id="final-titulo" className="juego__titulo">
        Tarjeta de agente
      </h2>

      <article
        className={`tarjeta${puerta ? ` tarjeta--${puerta}` : ""}`}
        style={{ "--ix": inc.x, "--iy": inc.y } as React.CSSProperties}
      >
        <header className="tarjeta__cabecera">
          <span>Agencia del Director {publico.festejado}</span>
          <span className="tarjeta__codigo">{invitado.codigo}</span>
        </header>
        <p className="tarjeta__nombre">Agente {invitado.nombre}</p>
        <p className="tarjeta__puerta">
          {invitado.asiste === false
            ? "Esta vez no puedes ir"
            : puerta
              ? `Puerta: ${salas[puerta].nombre}`
              : invitado.asiste
                ? "Puerta: donde falte gente"
                : "Puerta: elígela abajo"}
        </p>
        {fiesta && (
          <dl className="datos">
            <div>
              <dt>Cuándo</dt>
              <dd>
                {fiesta.dia}
                <small>{fiesta.hora}</small>
              </dd>
            </div>
            <div>
              <dt>Dónde</dt>
              <dd>
                <a href={fiesta.mapa} target="_blank" rel="noreferrer">
                  {fiesta.lugar}
                </a>
                <small>{fiesta.direccion}</small>
              </dd>
            </div>
          </dl>
        )}
        {fiesta && (
          <a className="boton tarjeta__mapa" href={fiesta.mapa} target="_blank" rel="noreferrer">
            Abrir en el mapa
          </a>
        )}
      </article>

      <p className="tip">
        <strong>Tip del Director:</strong> {final.tip}
      </p>

      {invitado.asiste === null && <p className="juego__texto">{final.mensaje}</p>}

      <Rsvp vista={vista} onVista={onVista} />

      {invitado.asiste !== false && <Guardar />}

      <footer className="pie">
        <h2>Para papás y mamás</h2>
        <p>
          Las dos salas parten al mismo tiempo, a las 14:40, y duran {publico.duracion}. Los amigos se
          dividen en dos equipos de hasta 6, y entra un adulto con cada equipo.
        </p>
        <p>
          Escapology recomienda sus salas desde los 12 años. Budapest Express es un misterio de
          detectives en un tren y es la más difícil. Antídoto es de científicos y laboratorio, y no
          asusta.
        </p>
        <p className="pie__huevos">
          Hay {TOTAL_HUEVOS} secretos escondidos en esta invitación.{" "}
          {huevos ? `Llevas ${huevos} de ${TOTAL_HUEVOS}.` : "¿Encontrarás alguno?"}
        </p>
        <button type="button" className="enlace" onClick={onRejugar}>
          Volver a jugar la historia
        </button>{" "}
        <button type="button" className="enlace" onClick={onSalir}>
          ¿No eres {invitado.nombre}? Entrar con otro código
        </button>
        <p className="pie__credito">
          Música: «Investigations», de Kevin MacLeod (incompetech.com), licencia CC BY 4.0.
        </p>
      </footer>
    </section>
  );
}
