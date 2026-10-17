"use client";

import { useEffect, useState } from "react";
import { type Vista } from "@/lib/config";
import { encontrarHuevo, EVENTO_HUEVO, HUEVOS, type HuevoId } from "@/lib/huevos";
import { ErrorDeCodigo, guardarProgreso, olvidarProgreso, pedir, useProgreso } from "@/lib/progreso";
import { enSilencio, musica, ponerSilencio, sonar } from "@/lib/sonido";
import { Cuartel } from "./Cuartel";
import { Estacion } from "./Estacion";
import { Final } from "./Final";
import { Gate } from "./Gate";
import { Laboratorio } from "./Laboratorio";

type Etapa = "cuartel" | "lab" | "estacion";

export function Invitation() {
  const local = useProgreso();
  const [vista, setVista] = useState<Vista | null>(null);
  const [silencio, setSilencio] = useState(false);
  const [etapa, setEtapa] = useState<Etapa>("cuartel");
  const [rejugando, setRejugando] = useState(false);
  const [error, setError] = useState("");
  const [huevo, setHuevo] = useState<HuevoId | null>(null);

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
    console.log("%c¿Investigando el código, agente? Escribe santi() y presiona Enter.", "color:#e8c46a;font-size:14px;font-weight:bold");
  }, []);

  const reto = vista?.invitado.reto ?? false;
  // Sin rejugar, se retoma donde quedó este teléfono.
  const actual: Etapa = rejugando ? etapa : local.lab && etapa !== "estacion" ? "estacion" : etapa;
  const enFinal = reto && !rejugando;

  function ir(e: Etapa) {
    setEtapa(e);
    window.scrollTo({ top: 0 });
  }

  async function terminarEstacion() {
    guardarProgreso({ estacion: true });
    setError("");
    if (!reto) {
      try {
        setVista(await pedir({ codigo: local.codigo, accion: "reto" }));
      } catch (e) {
        return setError((e as Error).message);
      }
    }
    sonar("reto");
    setRejugando(false);
    window.scrollTo({ top: 0 });
  }

  function rejugar() {
    setRejugando(true);
    ir("cuartel");
  }

  function salir() {
    olvidarProgreso();
    setVista(null);
    setRejugando(false);
    setEtapa("cuartel");
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

      <main inert={!local.codigo} className="juego">
        {!vista ? (
          <p className="juego__cargando">Abriendo el expediente…</p>
        ) : enFinal ? (
          <Final vista={vista} onVista={setVista} huevos={local.huevos.length} onRejugar={rejugar} onSalir={salir} />
        ) : actual === "cuartel" ? (
          <Cuartel key="cuartel" nombre={vista.invitado.nombre} onAceptar={() => ir("lab")} />
        ) : actual === "lab" ? (
          <Laboratorio
            key="lab"
            onTerminado={() => {
              guardarProgreso({ lab: true });
              ir("estacion");
            }}
          />
        ) : (
          <>
            <Estacion key="estacion" onTerminado={terminarEstacion} />
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
          </>
        )}
      </main>
    </>
  );
}
