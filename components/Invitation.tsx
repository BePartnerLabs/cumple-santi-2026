"use client";

import { useEffect, useRef, useState } from "react";
import { publico, type Vista } from "@/lib/config";
import { encontrarHuevo, EVENTO_HUEVO, HUEVOS, TOTAL_HUEVOS, type HuevoId } from "@/lib/huevos";
import { ErrorDeCodigo, guardarProgreso, olvidarProgreso, pedir, useProgreso } from "@/lib/progreso";
import { enSilencio, musica, ponerSilencio, sonar } from "@/lib/sonido";
import { Antidoto } from "./Antidoto";
import { Budapest } from "./Budapest";
import { Gate } from "./Gate";
import { Rsvp } from "./Rsvp";

export function Invitation() {
  const local = useProgreso();
  const [vista, setVista] = useState<Vista | null>(null);
  const [errorReto, setErrorReto] = useState("");
  const [silencio, setSilencio] = useState(false);
  const revelado = useRef<HTMLElement>(null);
  const [huevo, setHuevo] = useState<HuevoId | null>(null);
  const toques = useRef(0);

  // Avisa cada secreto encontrado con un mensaje que se va solo.
  useEffect(() => {
    let reloj: number | undefined;
    function mostrar(e: Event) {
      setHuevo((e as CustomEvent<HuevoId>).detail);
      window.clearTimeout(reloj);
      reloj = window.setTimeout(() => setHuevo(null), 5000);
    }
    window.addEventListener(EVENTO_HUEVO, mostrar);
    return () => {
      window.removeEventListener(EVENTO_HUEVO, mostrar);
      window.clearTimeout(reloj);
    };
  }, []);

  // Para los curiosos que abren la consola del navegador.
  useEffect(() => {
    const w = window as typeof window & { santi?: () => string };
    w.santi = () => {
      encontrarHuevo("hacker");
      return "Acceso concedido, agente. Mira la invitación.";
    };
    console.log(
      "%c¿Investigando el código? Escribe santi() y presiona Enter.",
      "color:#e8c46a;font-size:14px;font-weight:bold",
    );
  }, []);

  function tocarTitulo() {
    toques.current += 1;
    if (toques.current === publico.edad) encontrarHuevo("once");
  }

  // Quien vuelve con su código guardado entra directo: el servidor dice si ya superó el reto.
  useEffect(() => {
    if (!local.codigo || vista) return;
    let vigente = true;
    pedir({ codigo: local.codigo })
      .then((v) => vigente && setVista(v))
      .catch((e) => e instanceof ErrorDeCodigo && olvidarProgreso());
    return () => {
      vigente = false;
    };
  }, [local.codigo, vista]);

  // La música acompaña desde que se abre la puerta.
  useEffect(() => {
    musica(!!local.codigo);
    return () => musica(false);
  }, [local.codigo]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- la preferencia vive en el navegador
    setSilencio(enSilencio());
  }, []);

  const reto = vista?.invitado.reto ?? false;
  const budapest = reto || local.budapest;
  const antidoto = reto || local.antidoto;
  const resueltos = Number(budapest) + Number(antidoto);

  async function registrarReto() {
    setErrorReto("");
    try {
      setVista(await pedir({ codigo: local.codigo, accion: "reto" }));
      sonar("reto");
      requestAnimationFrame(() => revelado.current?.scrollIntoView({ behavior: "smooth" }));
    } catch (e) {
      setErrorReto((e as Error).message);
    }
  }

  function casoResuelto(caso: "budapest" | "antidoto") {
    guardarProgreso({ [caso]: true });
    const otro = caso === "budapest" ? antidoto : budapest;
    if (otro) window.setTimeout(registrarReto, 900); // deja sonar el final del caso
  }

  function salir() {
    olvidarProgreso();
    setVista(null);
    window.scrollTo(0, 0);
  }

  function alternarSonido() {
    ponerSilencio(!silencio);
    setSilencio(!silencio);
  }

  return (
    <>
      {!local.codigo && (
        <Gate
          onAbriendo={() => sonar("puerta")}
          onOpen={(v) => {
            setVista(v);
            guardarProgreso({ codigo: v.invitado.codigo });
          }}
        />
      )}

      {huevo && (
        <div className="huevo" role="status" key={huevo}>
          <strong>¡Secreto encontrado!</strong>
          {HUEVOS[huevo].mensaje}
        </div>
      )}

      <button type="button" className="sonido" onClick={alternarSonido} aria-pressed={!silencio}>
        {silencio ? "Sonido apagado" : "Sonido prendido"}
      </button>

      <main inert={!local.codigo}>
        <header className="portada">
          <p className="portada__sobre">
            {vista ? `${vista.invitado.nombre}, estás` : "Estás"} invitado al cumpleaños de
          </p>
          <h1 onClick={tocarTitulo}>
            {publico.festejado} cumple {publico.edad}
          </h1>
          <p className="portada__bajada">
            {reto
              ? "Ya superaste el reto: aquí abajo están los datos de la fiesta y tu sala. Los casos siguen más abajo por si quieres repasarlos."
              : "Un asesinato en un tren nocturno y un virus que hay que detener. Antes de la fiesta hay un reto: resuelve los dos casos y se revela dónde y cuándo nos juntamos."}
          </p>
        </header>

        <section ref={revelado} className={`revelado${reto ? "" : " revelado--cerrado"}`} aria-live="polite">
          {reto && vista?.fiesta ? (
            <>
              <h2>Reto superado</h2>
              <dl className="datos">
                <div>
                  <dt>Cuándo</dt>
                  <dd>
                    {vista.fiesta.dia}
                    <small>{vista.fiesta.hora}</small>
                  </dd>
                </div>
                <div>
                  <dt>Dónde</dt>
                  <dd>
                    <a href={vista.fiesta.mapa} target="_blank" rel="noreferrer">
                      {vista.fiesta.lugar}
                    </a>
                    <small>{vista.fiesta.direccion}</small>
                  </dd>
                </div>
              </dl>
            </>
          ) : (
            <>
              <h2>Datos bajo llave</h2>
              <p>
                Aquí aparecen el lugar, la hora y la lista para elegir tu sala. Llevas {resueltos} de 2
                casos resueltos.
              </p>
              {resueltos === 2 && (
                <>
                  {errorReto && (
                    <p className="error" role="alert">
                      {errorReto}
                    </p>
                  )}
                  <button type="button" className="boton" onClick={registrarReto}>
                    Revelar los datos
                  </button>
                </>
              )}
            </>
          )}
        </section>

        {reto && vista && <Rsvp vista={vista} onVista={setVista} />}

        <Budapest resuelto={budapest} onResuelto={() => casoResuelto("budapest")} />
        <Antidoto resuelto={antidoto} onResuelto={() => casoResuelto("antidoto")} />

        <footer className="pie">
          <h2>Para papás y mamás</h2>
          <p>
            Es una fiesta en un escape room: cada sala dura {publico.duracion} y el grupo se divide
            en dos equipos de hasta 6. El lugar y la hora aparecen al resolver los dos casos, que
            toman unos minutos; después basta el código para volver a verlos.
          </p>
          <p>
            El local recomienda sus salas desde los 12 años; los menores entran acompañados por un
            adulto. Budapest Express es un misterio de detectives (un crimen en un tren) y es la más
            difícil; Antídoto es de científicos y laboratorio, y no asusta. Si tu hijo o hija prefiere
            algo más tranquilo, marquen Antídoto.
          </p>
          <p className="pie__huevos">
            Hay {TOTAL_HUEVOS} secretos escondidos en esta invitación.{" "}
            {local.huevos.length
              ? `Llevas ${local.huevos.length} de ${TOTAL_HUEVOS}.`
              : "¿Encontrarás alguno?"}
          </p>
          {vista && (
            <button type="button" className="enlace" onClick={salir}>
              ¿No eres {vista.invitado.nombre}? Entrar con otro código
            </button>
          )}
          <p className="pie__credito">
            Música: «Investigations», de Kevin MacLeod (incompetech.com), licencia CC BY 4.0.
          </p>
        </footer>
      </main>
    </>
  );
}
