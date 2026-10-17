import type { Fiesta } from "./config";

// Solo se importa desde el servidor: dentro de la página, la fecha y la dirección
// aparecen recién al superar el reto. (Sí salen en la vista previa al compartir el link.)
export const fiesta: Fiesta = {
  dia: "Sábado 24 de octubre",
  hora: "14:40 en punto (llegar 14:25)",
  lugar: "Escapology, Parque Araucano",
  direccion: "Presidente Riesco 5330, Las Condes",
  mapa: "https://www.google.com/maps/search/?api=1&query=Escapology+Presidente+Riesco+5330+Las+Condes",
};

// Para la vista previa de WhatsApp y los buscadores. Cuando haya reserva, poner
// la fecha y hora exactas en formato ISO, por ejemplo "2026-10-24T16:00:00-03:00".
export const inicioISO: string | null = "2026-10-24T14:40:00-03:00";

// Es la fiesta de un grupo de niños: por defecto el sitio NO aparece en Google.
// Cambiar a true para que los buscadores lo indexen.
export const indexar = false;
