// Las preguntas del reto. Se pueden cambiar libremente (¡Santi puede dar ideas!):
// - `respuestas`: todas las formas válidas de contestar. No importan mayúsculas ni tildes.
// - `pista`: aparece después del primer error.
// - `numerica`: abre el teclado de números en el teléfono.
export type Pregunta = { texto: string; respuestas: string[]; pista: string; numerica?: boolean };

// Una por cada pista escondida en el tren.
export const preguntasBudapest: Record<"boleto" | "comedor" | "maleta" | "reloj", Pregunta> = {
  boleto: {
    texto: "El boleto dice: sale de París a las 19:00 y llega a Budapest a las 07:00 del día siguiente. ¿Cuántas horas dura el viaje?",
    respuestas: ["12", "doce"],
    pista: "De 19:00 a medianoche son 5 horas. Súmale las de la madrugada.",
    numerica: true,
  },
  comedor: {
    texto: "En el vagón comedor hay 8 mesas con 4 asientos cada una. Esa noche quedaron 27 asientos vacíos. ¿Cuántos pasajeros estaban cenando?",
    respuestas: ["5", "cinco"],
    pista: "Primero calcula cuántos asientos hay en total: 8 × 4.",
    numerica: true,
  },
  maleta: {
    texto: "El candado de la maleta de Sir Clarence pide un número: el doble de 9, menos 3. ¿Cuál es?",
    respuestas: ["15", "quince"],
    pista: "El doble de 9 es 18.",
    numerica: true,
  },
  reloj: {
    texto: "El reloj de bolsillo se detuvo a las 21:45. El tren llega a la próxima estación a las 22:30. ¿Cuántos minutos quedan para atrapar al asesino?",
    respuestas: ["45", "cuarenta y cinco"],
    pista: "De 21:45 a 22:00 son 15 minutos.",
    numerica: true,
  },
};

// Una por cada tubo de ensayo del laboratorio, en orden.
export const preguntasAntidoto: Pregunta[] = [
  {
    texto: "La puerta del laboratorio solo se abre si sabes a quién vienes a celebrar. ¿Cuántos años cumple Santi?",
    respuestas: ["11", "once"],
    pista: "Está escrito en la portada de esta invitación.",
    numerica: true,
  },
  {
    texto: "Santi cumple el 19 de octubre. El año pasado cayó domingo. ¿Qué día de la semana cae este año?",
    respuestas: ["lunes"],
    pista: "De un año al siguiente, la fecha se corre un día de la semana.",
  },
  {
    texto: "El virus TS-51 se duplica cada hora. Si ahora hay 3 muestras, ¿cuántas habrá en 3 horas?",
    respuestas: ["24", "veinticuatro"],
    pista: "3 → 6 → 12 → …",
    numerica: true,
  },
];

const normalizar = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

export const esCorrecta = (p: Pregunta, respuesta: string) =>
  p.respuestas.some((r) => normalizar(r) === normalizar(respuesta));
