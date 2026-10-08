// Datos visibles para cualquiera que abra el link.
// La fecha y la dirección NO van aquí: viven en lib/fiesta.ts y solo se
// entregan desde el servidor a quien ya superó el reto.
export const publico = {
  festejado: "Santi",
  edad: 11,
  duracion: "60 minutos",
  responderAntesDe: "domingo 11 de octubre",
} as const;

export type SalaId = "casona" | "alquimago";
export type Preferencia = SalaId | "igual";

export const salas: Record<SalaId, { nombre: string; lema: string; cupos: number }> = {
  casona: {
    nombre: "La Casona Dubois",
    lema: "A los espíritus no se les debe perturbar, a menos que no tengas otra opción.",
    cupos: 6,
  },
  alquimago: {
    nombre: "El Alquimago",
    lema: "Ahora es él quien necesita un poco de tu magia.",
    cupos: 6,
  },
};

// Lo que el servidor le muestra a un invitado según su avance.
export type Fiesta = { dia: string; hora: string; lugar: string; direccion: string; mapa: string };
export type Equipos = Record<Preferencia, string[]>;
export type Vista = {
  invitado: {
    codigo: string;
    nombre: string;
    reto: boolean;
    asiste: boolean | null;
    sala: Preferencia | null;
    nota: string;
  };
  fiesta: Fiesta | null;
  equipos: Equipos | null;
};
