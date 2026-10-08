import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { Pool } from "pg";
import { publico, type Preferencia } from "./config";

export type Invitado = {
  id: string;
  codigo: string;
  nombre: string;
  reto: boolean;
  asiste: boolean | null;
  sala: Preferencia | null;
  nota: string;
  ts: number;
};

// En Vercel se guarda en Postgres (Neon); la integración crea DATABASE_URL.
// Sin esa variable, en desarrollo, se guarda en un archivo local.
const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
const file = path.join(process.cwd(), ".data", "invitados.json");

let pool: Pool | undefined;
let lista: Promise<unknown> | undefined;

// La tabla se crea sola la primera vez; no hay migraciones que correr.
async function db() {
  if (!url) throw new Error("Falta conectar la base de datos (Neon) al proyecto.");
  pool ??= new Pool({ connectionString: url, max: 3 });
  lista ??= pool
    .query(
      `CREATE TABLE IF NOT EXISTS invitados (
        id uuid PRIMARY KEY,
        codigo text NOT NULL UNIQUE,
        nombre text NOT NULL,
        reto boolean NOT NULL DEFAULT false,
        asiste boolean,
        sala text,
        nota text NOT NULL DEFAULT '',
        ts bigint NOT NULL
      )`,
    )
    .catch((e) => {
      lista = undefined;
      throw e;
    });
  await lista;
  return pool;
}

const enArchivo = () => !url && !process.env.VERCEL;

async function readFile(): Promise<Record<string, Invitado>> {
  try {
    return JSON.parse(await fs.readFile(file, "utf8"));
  } catch {
    return {};
  }
}

async function writeFile(all: Record<string, Invitado>) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(all, null, 2));
}

export async function listInvitados(): Promise<Invitado[]> {
  if (enArchivo()) return Object.values(await readFile()).sort((a, b) => a.ts - b.ts);
  const { rows } = await (await db()).query(
    "SELECT id, codigo, nombre, reto, asiste, sala, nota, ts FROM invitados ORDER BY ts",
  );
  // bigint llega como texto desde Postgres
  return rows.map((r) => ({ ...r, ts: Number(r.ts) }));
}

export async function saveInvitado(i: Invitado) {
  if (enArchivo()) {
    const all = await readFile();
    all[i.id] = i;
    return writeFile(all);
  }
  await (await db()).query(
    `INSERT INTO invitados (id, codigo, nombre, reto, asiste, sala, nota, ts) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (id) DO UPDATE SET reto = $4, asiste = $5, sala = $6, nota = $7`,
    [i.id, i.codigo, i.nombre, i.reto, i.asiste, i.sala, i.nota, i.ts],
  );
}

export async function deleteInvitado(id: string) {
  if (enArchivo()) {
    const all = await readFile();
    delete all[id];
    return writeFile(all);
  }
  await (await db()).query("DELETE FROM invitados WHERE id = $1", [id]);
}

const letras = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[^a-zA-Z]/g, "")
    .toUpperCase();

// Fácil de recordar: el nombre de pila + la edad que cumple Santi (MATEO11).
// Si dos se llaman igual, se suma la inicial del apellido (LEONP11).
function crearCodigo(nombre: string, usados: Set<string>) {
  const partes = nombre.split(" ");
  const pila = letras(partes[0]) || "AGENTE";
  const inicial = partes.length > 1 ? letras(partes.at(-1)!)[0] ?? "" : "";
  const candidatos = [pila, pila + inicial];
  for (let n = 2; n < 100; n++) candidatos.push(pila + inicial + n + "X");
  return candidatos.map((c) => c + publico.edad).find((c) => !usados.has(c))!;
}

export async function addInvitados(nombres: string[]) {
  const usados = new Set((await listInvitados()).map((i) => i.codigo));
  let ts = Date.now();
  for (const nombre of nombres) {
    const codigo = crearCodigo(nombre, usados);
    usados.add(codigo);
    await saveInvitado({ id: randomUUID(), codigo, nombre, reto: false, asiste: null, sala: null, nota: "", ts: ts++ });
  }
}

// Tolera minúsculas, tildes y espacios: "mateo 11" vale igual que "MATEO11".
export const limpiarCodigo = (c: unknown) =>
  String(c ?? "")
    .normalize("NFD")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase();
