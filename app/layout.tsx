import type { Metadata, Viewport } from "next";
import { Figtree, Jolly_Lodger } from "next/font/google";
import { publico } from "@/lib/config";
import { fiesta, indexar, inicioISO } from "@/lib/fiesta";
import "./globals.css";

const titulos = Jolly_Lodger({ weight: "400", subsets: ["latin"], variable: "--font-titulos" });
const texto = Figtree({ subsets: ["latin"], variable: "--font-texto" });

const sitio = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

const titulo = `${publico.festejado} cumple ${publico.edad}: misión escape room`;
// Esto es lo que se ve al compartir el link (WhatsApp, etc.): cuándo y dónde.
const resumen = `${fiesta.dia}, ${fiesta.hora.toLowerCase()}. ${fiesta.lugar}, ${fiesta.direccion}. Entra con tu código, resuelve los dos casos y elige tu sala.`;

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
    address: { "@type": "PostalAddress", streetAddress: "Rodó 1927", addressLocality: "Providencia", addressRegion: "Región Metropolitana", addressCountry: "CL" },
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
