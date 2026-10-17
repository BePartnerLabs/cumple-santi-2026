import { publico } from "@/lib/config";
import { fiesta, inicioISO } from "@/lib/fiesta";

// Evento de calendario (.ics) con dos recordatorios: el día antes y 2 horas antes.
// Funciona en iPhone, Android y Outlook. Google Calendar tiene además su link propio (Final.tsx).
const utc = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const escapar = (s: string) => s.replace(/\\/g, "\\\\").replace(/([,;])/g, "\\$1").replace(/\n/g, "\\n");

export function GET() {
  if (!inicioISO) return new Response("La fecha todavía no está confirmada.", { status: 404 });
  const inicio = new Date(inicioISO);
  const fin = new Date(inicio.getTime() + 75 * 60 * 1000);
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Cumple Santi//Expediente TS-51//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:cumple-${publico.festejado.toLowerCase()}-${publico.edad}@expediente-ts51`,
    `DTSTAMP:${utc(new Date())}`,
    `DTSTART:${utc(inicio)}`,
    `DTEND:${utc(fin)}`,
    `SUMMARY:${escapar(`Cumple ${publico.edad} de ${publico.festejado} · Escape room`)}`,
    `LOCATION:${escapar(`${fiesta.lugar}, ${fiesta.direccion}`)}`,
    `DESCRIPTION:${escapar(`Llegar 15 minutos antes (14:25). Las dos salas parten a las 14:40 y duran 60 minutos.\n${fiesta.mapa}`)}`,
    `URL:${fiesta.mapa}`,
    "BEGIN:VALARM",
    "TRIGGER:-P1D",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escapar(`Mañana es la misión del Director ${publico.festejado}`)}`,
    "END:VALARM",
    "BEGIN:VALARM",
    "TRIGGER:-PT2H",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escapar("En 2 horas parte la misión. Llega a las 14:25")}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="cumple-${publico.festejado.toLowerCase()}.ics"`,
    },
  });
}
