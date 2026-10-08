// Las preguntas del reto. Se pueden cambiar libremente (¡Santi puede dar ideas!):
// - `respuestas`: todas las formas válidas de contestar. No importan mayúsculas ni tildes.
// - `pista`: aparece después del primer error.
// - `numerica`: abre el teclado de números en el teléfono.
export type Pregunta = { texto: string; respuestas: string[]; pista: string; numerica?: boolean };

// Una por cada pista escondida en la casona.
export const preguntasCasona: Record<"torre" | "gargola" | "ventana" | "sotano", Pregunta> = {
  torre: {
    texto: "Dubois llegó a Santiago en 1908 y en 1963 la casona ya estaba abandonada. ¿Cuántos años pasaron entre una fecha y la otra?",
    respuestas: ["55", "cincuenta y cinco"],
    pista: "Es una resta: 1963 − 1908.",
    numerica: true,
  },
  gargola: {
    texto: "En el pedestal de la gárgola hay una inscripción: «x + 7 = 15». ¿Cuánto vale x?",
    respuestas: ["8", "ocho"],
    pista: "¿Qué número, sumado con 7, da 15?",
    numerica: true,
  },
  ventana: {
    texto: "La casona tiene 12 ventanas y solo en 1/4 de ellas se ve luz. ¿En cuántas ventanas hay luz?",
    respuestas: ["3", "tres"],
    pista: "Un cuarto de 12 es 12 dividido en 4.",
    numerica: true,
  },
  sotano: {
    texto: "La escalera al sótano tiene 3 tramos de 12 peldaños cada uno. ¿Cuántos peldaños hay que bajar?",
    respuestas: ["36", "treinta y seis"],
    pista: "Multiplica: 12 × 3.",
    numerica: true,
  },
};

// Una por cada frasco del laboratorio, en orden.
export const preguntasAlquimago: Pregunta[] = [
  {
    texto: "El Mago Chai solo le abre a quien conoce al festejado. ¿Cuántos años cumple Santi?",
    respuestas: ["11", "once"],
    pista: "Está escrito en la puerta de entrada.",
    numerica: true,
  },
  {
    texto: "Santi cumple el 19 de octubre. El año pasado cayó domingo. ¿Qué día de la semana cae este año?",
    respuestas: ["lunes"],
    pista: "De un año al siguiente, la fecha se corre un día de la semana.",
  },
  {
    texto: "La receta pide 0,5 litros de agua de luna y 1,5 litros de rocío. ¿Cuántos litros son en total?",
    respuestas: ["2", "dos", "2,0", "2.0"],
    pista: "Suma los decimales: 0,5 + 1,5.",
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
