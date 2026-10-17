import type { Metadata, Viewport } from "next";
import { Figtree, Special_Elite } from "next/font/google";
import { publico } from "@/lib/config";
import { fiesta, indexar, inicioISO } from "@/lib/fiesta";
import "./globals.css";
import "./juego.css";

const titulos = Special_Elite({ weight: "400", subsets: ["latin"], variable: "--font-titulos" });
const texto = Figtree({ subsets: ["latin"], variable: "--font-texto" });

// El dominio que se comparte. Vercel a veces entrega el *.vercel.app como dominio
// de producción, y entonces la vista previa de WhatsApp apunta allá: por eso va fijo.
const DOMINIO = "https://cumple-santi.giorgiosaud.io";
const sitio =
  process.env.VERCEL_ENV === "production"
    ? DOMINIO
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";

const titulo = `${publico.festejado} cumple ${publico.edad}: Expediente TS-51`;
// Esto es lo que se ve al compartir el link (WhatsApp, etc.): cuándo y dónde.
const resumen = `${fiesta.dia}, ${fiesta.hora.toLowerCase()}. ${fiesta.lugar}, ${fiesta.direccion}. Entra con tu número de agente, resuelve 3 acertijos y elige tu puerta: Budapest Express o Antídoto.`;

export const metadata: Metadata = {
  metadataBase: new URL(sitio),
  title: titulo,
  description: resumen,
  alternates: { canonical: "/" },
  robots: indexar ? { index: true, follow: true } : { index: false, follow: false },
  openGraph: {
    type: "website",
    locale: "es_CL",
    url: "/",
    siteName: `Cumpleaños de ${publico.festejado}`,
    title: titulo,
    description: resumen,
  },
  twitter: { card: "summary_large_image", title: titulo, description: resumen },
  // Instalada en iPhone ("Agregar a inicio") se abre como app, sin barra del navegador.
  appleWebApp: { capable: true, title: `${publico.festejado} ${publico.edad}`, statusBarStyle: "black-translucent" },
  icons: { apple: "/icons/icono-192.png" },
};

export const viewport: Viewport = {
  themeColor: "#0d1626",
  width: "device-width",
  initialScale: 1,
};

// Datos estructurados del evento, para buscadores y asistentes de IA.
const evento = {
  "@context": "https://schema.org",
  "@type": "Event",
  name: `Cumpleaños ${publico.edad} de ${publico.festejado}`,
  description: resumen,
  ...(inicioISO ? { startDate: inicioISO } : {}),
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  location: {
    "@type": "Place",
    name: fiesta.lugar,
    address: { "@type": "PostalAddress", streetAddress: "Presidente Riesco 5330", addressLocality: "Las Condes", addressRegion: "Región Metropolitana", addressCountry: "CL" },
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-CL" className={`${titulos.variable} ${texto.variable}`}>
      <body>
        {children}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(evento) }} />
      </body>
    </html>
  );
}
