import type { Equipos, Preferencia, Vista } from "@/lib/config";
import { fiesta } from "@/lib/fiesta";
import { limpiarCodigo, listInvitados, saveInvitado, type Invitado } from "@/lib/store";

export const dynamic = "force-dynamic";

const PREFERENCIAS: Preferencia[] = ["casona", "alquimago", "igual"];

// Nombre de pila; si se repite, con la inicial del apellido ("León P.").
function nombresCortos(todos: Invitado[]) {
  const pila = (i: Invitado) => i.nombre.split(" ")[0];
  return new Map(
    todos.map((i) => {
      const repetido = todos.some((o) => o.id !== i.id && pila(o) === pila(i));
      const apellido = i.nombre.split(" ").at(-1)!;
      return [i.id, repetido && apellido !== pila(i) ? `${pila(i)} ${apellido[0]}.` : pila(i)];
    }),
  );
}

// La fecha, la dirección y los equipos solo salen del servidor si ya superó el reto.
function vista(yo: Invitado, todos: Invitado[]): Vista {
  const cortos = nombresCortos(todos);
  const van = todos.filter((i) => i.asiste);
  const en = (sala: Preferencia) => van.filter((i) => i.sala === sala).map((i) => cortos.get(i.id)!);
  const equipos: Equipos = { casona: en("casona"), alquimago: en("alquimago"), igual: en("igual") };
  return {
    invitado: { codigo: yo.codigo, nombre: cortos.get(yo.id)!, reto: yo.reto, asiste: yo.asiste, sala: yo.sala, nota: yo.nota },
    fiesta: yo.reto ? fiesta : null,
    equipos: yo.reto ? equipos : null,
  };
}

const error = (mensaje: string, status: number) => Response.json({ error: mensaje }, { status });

// Una sola puerta para el invitado: entrar con su código, registrar el reto y responder.
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return error("No se pudo leer la solicitud.", 400);
  }

  try {
    const todos = await listInvitados();
    const codigo = limpiarCodigo(body.codigo);
    const yo = todos.find((i) => i.codigo === codigo);
    if (!codigo || !yo) return error("Ese código no existe. Pídele a Santi que te lo repita.", 404);

    if (body.accion === "reto") {
      yo.reto = true;
      await saveInvitado(yo);
    } else if (body.accion === "responder") {
      if (!yo.reto) return error("Primero resuelve los dos casos.", 403);
      yo.asiste = body.asiste === true;
      yo.sala = PREFERENCIAS.includes(body.sala as Preferencia) ? (body.sala as Preferencia) : "igual";
      yo.nota = String(body.nota ?? "").trim().slice(0, 200);
      await saveInvitado(yo);
    }
    return Response.json(vista(yo, todos));
  } catch (e) {
    return error((e as Error).message, 503);
  }
}
