"use client";

import { useEffect, useRef, useState } from "react";
import { leerInclinacion } from "@/lib/movimiento";

// El maletín del Dr. Brandt en 3D (Three.js). Se gira con el dedo y también
// inclinando el teléfono. Cada cara guarda un dato del boleto.
// Si el teléfono no tiene WebGL, se usa el maletín de CSS (`respaldo`).

type Cara = { titulo?: string; texto: string; tinta?: string; etiqueta?: boolean };

// Orden de caras de BoxGeometry: derecha, izquierda, arriba, abajo, frente, atrás.
const CARAS: Cara[] = [
  { titulo: "Vagón", texto: "11" },
  { titulo: "Sale", texto: "22:00" },
  { texto: "LABORATORIO BRANDT", tinta: "#1b2030" },
  { texto: "TS-51", tinta: "#7b2fd6" },
  { texto: "Budapest", etiqueta: true },
  { titulo: "Andén", texto: "3" },
];

function textura(THREE: typeof import("three"), cara: Cara, ancho: number, alto: number) {
  const lienzo = document.createElement("canvas");
  lienzo.width = ancho;
  lienzo.height = alto;
  const c = lienzo.getContext("2d")!;
  const metal = c.createLinearGradient(0, 0, ancho, alto);
  metal.addColorStop(0, "#eef1f6");
  metal.addColorStop(0.5, "#b8bfcc");
  metal.addColorStop(1, "#8d95a6");
  c.fillStyle = metal;
  c.fillRect(0, 0, ancho, alto);
  // líneas de aluminio cepillado
  c.globalAlpha = 0.08;
  for (let y = 0; y < alto; y += 6) {
    c.fillStyle = y % 12 ? "#ffffff" : "#000000";
    c.fillRect(0, y, ancho, 2);
  }
  c.globalAlpha = 1;
  c.textAlign = "center";
  c.textBaseline = "middle";
  if (cara.etiqueta) {
    const w = ancho * 0.56;
    const h = alto * 0.3;
    c.fillStyle = "#efe3c4";
    c.fillRect((ancho - w) / 2, (alto - h) / 2, w, h);
    c.strokeStyle = "#0b0f20";
    c.lineWidth = 6;
    c.strokeRect((ancho - w) / 2, (alto - h) / 2, w, h);
    c.fillStyle = "#5a1626";
    c.font = `700 ${alto * 0.13}px Georgia, serif`;
    c.fillText(cara.texto, ancho / 2, alto / 2);
  } else if (cara.titulo) {
    c.fillStyle = "#1b2030";
    c.font = `700 ${Math.min(ancho, alto) * 0.14}px system-ui, sans-serif`;
    c.fillText(cara.titulo.toUpperCase(), ancho / 2, alto * 0.3);
    c.font = `800 ${Math.min(ancho, alto) * 0.36}px ui-monospace, monospace`;
    c.fillText(cara.texto, ancho / 2, alto * 0.62);
  } else {
    c.fillStyle = cara.tinta ?? "#1b2030";
    c.font = `800 ${alto * 0.36}px ui-monospace, monospace`;
    c.fillText(cara.texto, ancho / 2, alto / 2, ancho * 0.9);
  }
  const t = new THREE.CanvasTexture(lienzo);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

export function Maletin3D({ respaldo }: { respaldo: React.ReactNode }) {
  const caja = useRef<HTMLDivElement>(null);
  const [falla, setFalla] = useState(false);

  useEffect(() => {
    const el = caja.current;
    if (!el) return;
    let limpiar = () => {};
    let vivo = true;

    import("three")
      .then((THREE) => {
        if (!vivo) return;
        let renderer: import("three").WebGLRenderer;
        try {
          renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        } catch {
          return setFalla(true);
        }
        const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        el.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
        camera.position.set(0, 0.3, 5.4);

        scene.add(new THREE.HemisphereLight(0xdfe8f4, 0x2a1020, 1.6));
        const clave = new THREE.DirectionalLight(0xffffff, 2.2);
        clave.position.set(3, 4, 5);
        scene.add(clave);
        const contraluz = new THREE.PointLight(0xe8c46a, 18, 12);
        contraluz.position.set(-3, 1.5, -2.5);
        scene.add(contraluz);

        const W = 2.4, H = 1.6, D = 0.7;
        const grupo = new THREE.Group();
        const tamanos: [number, number][] = [
          [D, H], [D, H], [W, D], [W, D], [W, H], [W, H],
        ];
        const materiales = CARAS.map((cara, i) => {
          const [a, b] = tamanos.at(i)!;
          return new THREE.MeshStandardMaterial({
            map: textura(THREE, cara, Math.round(512 * a / 2.4), Math.round(512 * b / 2.4)),
            metalness: 0.55,
            roughness: 0.32,
          });
        });
        const cuerpo = new THREE.Mesh(new THREE.BoxGeometry(W, H, D), materiales);
        grupo.add(cuerpo);

        const dorado = new THREE.MeshStandardMaterial({ color: 0xc9a24a, metalness: 0.9, roughness: 0.25 });
        const asa = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.07, 14, 32, Math.PI), new THREE.MeshStandardMaterial({ color: 0x1b2030, roughness: 0.6 }));
        asa.position.y = H / 2;
        grupo.add(asa);
        for (const x of [-0.75, 0.75]) {
          const cierre = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.16, 0.06), dorado);
          cierre.position.set(x, H / 2 - 0.16, D / 2 + 0.03);
          grupo.add(cierre);
        }
        scene.add(grupo);

        // Giro: el dedo fija el objetivo, la inclinación suma un poco, y todo se suaviza.
        const giro = { x: -0.25, y: -0.5 };
        const objetivo = { ...giro };
        let arrastre: { x: number; y: number; gx: number; gy: number } | null = null;
        let tocado = false;

        const canvas = renderer.domElement;
        canvas.style.touchAction = "pan-y";
        const abajo = (e: PointerEvent) => {
          arrastre = { x: e.clientX, y: e.clientY, gx: objetivo.x, gy: objetivo.y };
          tocado = true;
        };
        const mover = (e: PointerEvent) => {
          if (!arrastre) return;
          // Solo el arrastre horizontal gira el maletín: el vertical queda para hacer scroll.
          objetivo.y = arrastre.gy + (e.clientX - arrastre.x) * 0.012;
        };
        const arriba = () => (arrastre = null);
        canvas.addEventListener("pointerdown", abajo);
        canvas.addEventListener("pointermove", mover);
        canvas.addEventListener("pointerup", arriba);
        canvas.addEventListener("pointercancel", arriba);

        const medir = () => {
          const { width } = el.getBoundingClientRect();
          const alto = Math.round(width * 0.62);
          renderer.setSize(width, alto);
          camera.aspect = width / alto;
          camera.updateProjectionMatrix();
        };
        medir();
        const observador = new ResizeObserver(medir);
        observador.observe(el);

        const reloj = new THREE.Timer();
        renderer.setAnimationLoop(() => {
          reloj.update();
          const t = reloj.getElapsed();
          if (!tocado && !quieto) objetivo.y += reloj.getDelta() * 0.5;
          const inclinacion = leerInclinacion();
          giro.x += (objetivo.x + inclinacion.y * 0.6 - giro.x) * 0.12;
          giro.y += (objetivo.y + inclinacion.x * 0.9 - giro.y) * 0.12;
          grupo.rotation.set(giro.x, giro.y, 0);
          grupo.position.y = quieto ? 0 : Math.sin(t * 1.6) * 0.06;
          renderer.render(scene, camera);
        });

        limpiar = () => {
          renderer.setAnimationLoop(null);
          observador.disconnect();
          canvas.removeEventListener("pointerdown", abajo);
          canvas.removeEventListener("pointermove", mover);
          canvas.removeEventListener("pointerup", arriba);
          canvas.removeEventListener("pointercancel", arriba);
          grupo.traverse((o) => {
            if (o instanceof THREE.Mesh) o.geometry.dispose();
          });
          materiales.forEach((m) => {
            m.map?.dispose();
            m.dispose();
          });
          dorado.dispose();
          renderer.dispose();
          canvas.remove();
        };
      })
      .catch(() => vivo && setFalla(true));

    return () => {
      vivo = false;
      limpiar();
    };
  }, []);

  if (falla) return <>{respaldo}</>;
  return <div ref={caja} className="maletin3d" aria-label="Maletín plateado. Arrástralo o inclina el teléfono para girarlo." role="img" />;
}
