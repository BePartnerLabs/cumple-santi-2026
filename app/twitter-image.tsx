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
          background: "linear-gradient(120deg, #4a1220 0%, #141a33 50%, #0b2a24 100%)",
          color: "#dfe8f4",
        }}
      >
        <div style={{ display: "flex", fontSize: 38, color: "#9fb0c8" }}>Budapest Express o Antídoto: dos casos por resolver</div>
        <div style={{ display: "flex", fontSize: 132, fontWeight: 700, color: "#e8c46a", lineHeight: 1, whiteSpace: "nowrap" }}>
          {publico.festejado} cumple {publico.edad}
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 40, lineHeight: 1.3 }}>
          <div style={{ display: "flex" }}>
            {fiesta.dia}, {fiesta.hora.toLowerCase()}
          </div>
          <div style={{ display: "flex", color: "#a6f24a" }}>{fiesta.lugar}</div>
          <div style={{ display: "flex", color: "#c9a24a", fontSize: 32 }}>{fiesta.direccion}</div>
        </div>
      </div>
    ),
    size,
  );
}
