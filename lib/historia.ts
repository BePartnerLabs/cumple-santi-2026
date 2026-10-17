// Todo el texto de la historia vive aquí: se puede cambiar sin tocar los componentes.
// Regla: la invitación cuenta solo lo que pasa ANTES de cada sala. No se nombra
// culpable del Budapest Express ni aparece la cura del Antídoto.

export const cuartel = {
  agencia: "Agencia del Director Santi",
  mensaje: [
    "Agente {nombre}: cumplo 11 y necesito a mi mejor equipo.",
    "Esta noche, el Dr. Walter Brandt termina una fórmula secreta en su laboratorio.",
    "Y el millonario Sir Clarence Hayden acaba de comprar un boleto para el Budapest Express.",
    "Creo que están conectados. Averigua cómo.",
  ],
  boton: "Aceptar misión",
};

export const laboratorio = {
  titulo: "Laboratorio Brandt",
  intro: "Entras como pasante del turno de noche. El Dr. Brandt salió apurado y dejó todo encendido.",
  puerta: {
    texto: "El lector de la puerta pide un número: ¿cuántos años cumple el Director?",
    respuesta: "11",
    pista: "Está escrito en la entrada de la agencia: «cumplo…».",
  },
  pizarra:
    "Primero, lo que tomas todos los días. Después, el metal que explota al tocar el agua. Al final, el gas verde con olor a piscina.",
  pistaMezcla: "Lo que tomas todos los días es el agua (H₂O).",
  climax: "No era una medicina: era un virus. El Dr. Brandt guarda el tubo en un maletín plateado con una etiqueta: «Budapest».",
};

export const estacion = {
  titulo: "Estación del Este",
  intro: "Seguiste el maletín hasta la estación. Sir Clarence lo recibe en el andén, entre la niebla. Tienes que subir a ese tren.",
  maletin: "Gira el maletín con el dedo: tiene tres números grabados.",
  revisor: "«Este no es su boleto, joven.» Mira otra vez el maletín.",
  partida: "El tren arranca. Por las ventanas pasan cinco pasajeros. Sir Clarence entra a su cabina con el maletín.",
  gancho: "Antes de llegar a Budapest, alguien va a intentar quedarse con ese maletín.",
};

export type Boleto = { id: string; anden: number; hora: string; vagon: number };
export const BOLETOS: Boleto[] = [
  { id: "a", anden: 3, hora: "21:15", vagon: 11 },
  { id: "b", anden: 3, hora: "22:00", vagon: 11 },
  { id: "c", anden: 8, hora: "22:00", vagon: 11 },
];
export const BOLETO_CORRECTO = "b";

export const final = {
  mensaje: "Misión cumplida, agente. Hay un virus suelto y un maletín en un tren. Nos dividimos en dos equipos.",
  tip: "Llega 15 minutos antes: la misión parte puntual y dura 60 minutos. Guarda este link: cuando vuelvas, verás directo tu tarjeta.",
};
