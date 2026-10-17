import type { MetadataRoute } from "next";
import { publico } from "@/lib/config";

// La invitación se puede instalar como app: al abrirla desde el inicio del
// teléfono entra directo a la Tarjeta de Agente (el código queda guardado).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${publico.festejado} cumple ${publico.edad} · Expediente TS-51`,
    short_name: `${publico.festejado} ${publico.edad}`,
    description: "Tu Tarjeta de Agente: fecha, hora, lugar y tu puerta.",
    start_url: "/?desde=app",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#080e19",
    theme_color: "#0d1626",
    lang: "es-CL",
    icons: [
      { src: "/icons/icono-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icono-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icono-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Mi tarjeta", short_name: "Tarjeta", url: "/?desde=atajo", icons: [{ src: "/icons/icono-192.png", sizes: "192x192" }] },
      { name: "Cómo llegar", short_name: "Mapa", url: "/llegar", icons: [{ src: "/icons/icono-192.png", sizes: "192x192" }] },
      { name: "Agregar al calendario", short_name: "Calendario", url: "/calendario", icons: [{ src: "/icons/icono-192.png", sizes: "192x192" }] },
    ],
  };
}
