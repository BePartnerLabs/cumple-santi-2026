import { timingSafeEqual } from "node:crypto";
import type { Metadata } from "next";
import { revalidatePath } from "next/cache";
import { salas, type Preferencia } from "@/lib/config";
import { addInvitados, deleteInvitado, listInvitados } from "@/lib/store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Panel de invitados", robots: { index: false } };

function claveValida(clave: unknown) {
  const real = process.env.PANEL_KEY;
  if (!real || typeof clave !== "string") return false;
  const a = Buffer.from(clave);
  const b = Buffer.from(real);
  return a.length === b.length && timingSafeEqual(a, b);
}

async function agregar(formData: FormData) {
  "use server";
  if (!claveValida(formData.get("clave"))) return;
  const nombres = String(formData.get("nombres") ?? "")
    .split("\n")
    .map((n) => n.replace(/\s+/g, " ").trim().slice(0, 40))
    .filter((n) => n.length >= 2)
    .slice(0, 40);
  if (nombres.length) await addInvitados(nombres);
  revalidatePath("/panel");
}

async function borrar(formData: FormData) {
  "use server";
  if (!claveValida(formData.get("clave"))) return;
  await deleteInvitado(String(formData.get("id")));
  revalidatePath("/panel");
}

const etiqueta: Record<Preferencia, string> = {
  casona: salas.casona.nombre,
  alquimago: salas.alquimago.nombre,
  igual: "Sin preferencia",
};

export default async function Panel({ searchParams }: PageProps<"/panel">) {
  const { clave } = await searchParams;
  if (!claveValida(clave)) {
    return (
      <main className="panel">
        <h1>Panel</h1>
        <p>
          {process.env.PANEL_KEY
            ? "Abre esta página con tu clave: /panel?clave=TU_CLAVE"
            : "Falta definir la variable PANEL_KEY para poder abrir el panel."}
        </p>
      </main>
    );
  }

  const todos = await listInvitados();
  const van = todos.filter((i) => i.asiste);
  const cuenta = (s: Preferencia) => van.filter((i) => i.sala === s).length;
  const sinResponder = todos.filter((i) => i.asiste === null).length;

  return (
    <main className="panel">
      <h1>Invitados</h1>
      {todos.length === 0 ? (
        <p>Todavía no hay invitados. Agrégalos abajo: cada uno recibe su código para entrar.</p>
      ) : (
        <>
          <p>
            Vienen {van.length}: {cuenta("casona")} a la Casona, {cuenta("alquimago")} al Alquimago y{" "}
            {cuenta("igual")} sin preferencia. No pueden {todos.length - van.length - sinResponder}. Faltan por
            responder {sinResponder}.
          </p>
          <ul className="panel__lista">
            {todos.map((i) => (
              <li key={i.id}>
                <div>
                  <strong>
                    {i.nombre} <code>{i.codigo}</code>
                  </strong>
                  <span>
                    {i.asiste === null
                      ? i.reto
                        ? "Superó el reto, falta que responda"
                        : "Aún no supera el reto"
                      : i.asiste
                        ? `Viene: ${etiqueta[i.sala ?? "igual"]}`
                        : "No puede ir"}
                  </span>
                  {i.nota && <em>{i.nota}</em>}
                </div>
                <form action={borrar}>
                  <input type="hidden" name="id" value={i.id} />
                  <input type="hidden" name="clave" value={clave as string} />
                  <button type="submit" className="enlace">
                    Borrar
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </>
      )}

      <h2>Agregar invitados</h2>
      <form action={agregar}>
        <input type="hidden" name="clave" value={clave as string} />
        <label htmlFor="nombres">Un nombre por línea, con apellido si hay nombres repetidos</label>
        <textarea id="nombres" name="nombres" rows={6} placeholder={"Mateo Yáñez\nEmma Vidal"} required />
        <button type="submit" className="boton">
          Agregar y crear códigos
        </button>
      </form>
    </main>
  );
}
