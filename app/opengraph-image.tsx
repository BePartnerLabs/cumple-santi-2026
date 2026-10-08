import { ImageResponse } from "next/og";
import { publico } from "@/lib/config";
import { fiesta } from "@/lib/fiesta";

export const alt = `Invitación: ${publico.festejado} cumple ${publico.edad}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// La imagen que aparece al compartir el link.
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(120deg, #0d1626 0%, #0d1626 45%, #25103a 100%)",
          color: "#dfe8f4",
        }}
      >
        <div style={{ display: "flex", fontSize: 38, color: "#9fb0c8" }}>Misión escape room: dos salas, dos misterios</div>
        <div style={{ display: "flex", fontSize: 132, fontWeight: 700, color: "#fdb713", lineHeight: 1, whiteSpace: "nowrap" }}>
          {publico.festejado} cumple {publico.edad}
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 40, lineHeight: 1.3 }}>
          <div style={{ display: "flex" }}>
            {fiesta.dia}, {fiesta.hora.toLowerCase()}
          </div>
          <div style={{ display: "flex", color: "#8df5c0" }}>
            {fiesta.lugar}, {fiesta.direccion}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
