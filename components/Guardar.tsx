"use client";

import { useEffect, useState } from "react";
import { publico } from "@/lib/config";
import { fiesta, inicioISO } from "@/lib/fiesta";

type EventoInstalar = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

// Guardar la invitación en el teléfono (app instalable) y agregarla al calendario.
export function Guardar() {
  const [instalar, setInstalar] = useState<EventoInstalar | null>(null);
  const [instalada, setInstalada] = useState(false);
  const [esIphone, setEsIphone] = useState(false);
  const [ayudaIphone, setAyudaIphone] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- depende del navegador
    setInstalada(standalone);
    setEsIphone(/iPhone|iPad|iPod/.test(navigator.userAgent));
    const guardar = (e: Event) => {
      e.preventDefault();
      setInstalar(e as EventoInstalar);
    };
    const lista = () => setInstalada(true);
    window.addEventListener("beforeinstallprompt", guardar);
    window.addEventListener("appinstalled", lista);
    return () => {
      window.removeEventListener("beforeinstallprompt", guardar);
      window.removeEventListener("appinstalled", lista);
    };
  }, []);

  async function guardarApp() {
    if (instalar) {
      await instalar.prompt();
      const { outcome } = await instalar.userChoice;
      if (outcome === "accepted") setInstalada(true);
      setInstalar(null);
    } else if (esIphone) setAyudaIphone(true);
  }

  const google = inicioISO
    ? (() => {
        const ini = new Date(inicioISO);
        const fin = new Date(ini.getTime() + 75 * 60 * 1000);
        const f = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
        const q = new URLSearchParams({
          action: "TEMPLATE",
          text: `Cumple ${publico.edad} de ${publico.festejado} · Escape room`,
          dates: `${f(ini)}/${f(fin)}`,
          location: `${fiesta.lugar}, ${fiesta.direccion}`,
          details: "Llegar 15 minutos antes (14:25). Las dos salas parten a las 14:40.",
        });
        return `https://calendar.google.com/calendar/render?${q}`;
      })()
    : null;

  const puedeInstalar = !instalada && (instalar || esIphone);

  return (
    <div className="guardar">
      <h3>Guarda tu misión</h3>
      {puedeInstalar && (
        <button type="button" className="boton" onClick={guardarApp}>
          Guardar invitación en el teléfono
        </button>
      )}
      {instalada && <p className="guardar__ok">Invitación guardada en tu teléfono. Ábrela desde el inicio.</p>}
      {ayudaIphone && (
        <p className="guardar__ayuda">
          En iPhone: toca <b>Compartir</b> (el cuadrado con la flecha) y luego <b>Agregar a inicio</b>.
        </p>
      )}
      {inicioISO && (
        <div className="guardar__calendario">
          <a className="boton boton--secundario" href="/calendario">
            Agregar al calendario
          </a>
          {google && (
            <a className="enlace" href={google} target="_blank" rel="noreferrer">
              o en Google Calendar
            </a>
          )}
          <small>Te avisa el día antes y 2 horas antes.</small>
        </div>
      )}
    </div>
  );
}
