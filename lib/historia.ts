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
  // La fórmula se sortea en cada partida: 3 elementos en orden + 1 de distracción.
  pizarra: "Primero, {1}. Después, {2}. Al final, {3}.",
  climax: "No era una medicina: era un virus. El Dr. Brandt guarda el tubo en un maletín plateado con una etiqueta: «Budapest».",
};

export type Elemento = { id: string; simbolo: string; nombre: string; color: string; pista: string };

// Pistas para niños de 10-11 años. Se pueden agregar más.
export const ELEMENTOS: Elemento[] = [
  { id: "agua", simbolo: "H₂O", nombre: "Agua", color: "#5ec8ff", pista: "lo que tomas todos los días" },
  { id: "sodio", simbolo: "Na", nombre: "Sodio", color: "#fdb713", pista: "el metal que explota al tocar el agua" },
  { id: "cloro", simbolo: "Cl", nombre: "Cloro", color: "#a6f24a", pista: "el gas verde con olor a piscina" },
  { id: "helio", simbolo: "He", nombre: "Helio", color: "#ff9ad5", pista: "el gas que hace flotar los globos y te pone voz chistosa" },
  { id: "oro", simbolo: "Au", nombre: "Oro", color: "#e8c46a", pista: "el metal de la medalla del primer lugar" },
  { id: "hierro", simbolo: "Fe", nombre: "Hierro", color: "#c2643a", pista: "el metal que se oxida y queda café" },
  { id: "carbono", simbolo: "C", nombre: "Carbono", color: "#8a8f99", pista: "lo que deja la marca negra de tu lápiz" },
  { id: "calcio", simbolo: "Ca", nombre: "Calcio", color: "#f2f2e9", pista: "lo que tiene la leche para tus huesos" },
  { id: "oxigeno", simbolo: "O₂", nombre: "Oxígeno", color: "#9fd8ff", pista: "lo que respiras ahora mismo" },
];

export function sortearFormula(azar = Math.random) {
  const bolsa = [...ELEMENTOS];
  for (let i = bolsa.length - 1; i > 0; i--) {
    const j = Math.floor(azar() * (i + 1));
    [bolsa[i], bolsa[j]] = [bolsa[j], bolsa[i]];
  }
  const receta = bolsa.slice(0, 3);
  const mesa = bolsa.slice(0, 4).sort(() => azar() - 0.5);
  const pizarra = laboratorio.pizarra
    .replace("{1}", receta[0].pista)
    .replace("{2}", receta[1].pista)
    .replace("{3}", receta[2].pista);
  return { receta: receta.map((e) => e.id), mesa, pizarra, pista: `Lo primero es ${receta[0].pista}: ${receta[0].nombre.toLowerCase()} (${receta[0].simbolo}).` };
}

export const estacion = {
  titulo: "Estación del Este",
  intro: "Seguiste el maletín hasta la estación. Sir Clarence lo recibe en el andén, entre la niebla. Tienes que subir a ese tren.",
  maletin: "Gira el maletín con el dedo o inclina el teléfono: tiene tres números grabados.",
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
