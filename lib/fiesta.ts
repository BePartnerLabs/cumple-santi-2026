import type { Fiesta } from "./config";

// Solo se importa desde el servidor: dentro de la página, la fecha y la dirección
// aparecen recién al superar el reto. (Sí salen en la vista previa al compartir el link.)
export const fiesta: Fiesta = {
  dia: "Sábado 24 de octubre (por confirmar)",
  hora: "Hora por confirmar",
  lugar: "Fuga Escape Room",
  direccion: "Rodó 1927, Providencia",
  mapa: "https://www.google.com/maps/search/?api=1&query=Fuga+Escape+Room+Rod%C3%B3+1927+Providencia",
};

// Para la vista previa de WhatsApp y los buscadores. Cuando haya reserva, poner
// la fecha y hora exactas en formato ISO, por ejemplo "2026-10-24T16:00:00-03:00".
export const inicioISO: string | null = null;

// Es la fiesta de un grupo de niños: por defecto el sitio NO aparece en Google.
// Cambiar a true para que los buscadores lo indexen.
export const indexar = false;
