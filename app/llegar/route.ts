import { fiesta } from "@/lib/fiesta";

// Atajo de la app instalada: abre el mapa del lugar.
export function GET() {
  return Response.redirect(fiesta.mapa, 302);
}
