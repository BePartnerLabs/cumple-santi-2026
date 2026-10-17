"use client";

import { useEffect, useRef, useState } from "react";

// Base común para las escenas Three.js: carga three en diferido, crea el renderer,
// ajusta el tamaño al contenedor, corre el bucle y limpia todo al desmontar.
// Si no hay WebGL, `falla` queda en true y el componente muestra su respaldo.

export type THREEType = typeof import("three");

export type Contexto = {
  THREE: THREEType;
  renderer: import("three").WebGLRenderer;
  scene: import("three").Scene;
  camera: import("three").PerspectiveCamera;
  canvas: HTMLCanvasElement;
  quieto: boolean; // prefers-reduced-motion
};

// `montar` arma la escena y devuelve la función que se llama cada cuadro
// (con segundos transcurridos y delta) y, opcionalmente, su propia limpieza.
export type Montaje = (ctx: Contexto) => {
  cuadro: (t: number, dt: number) => void;
  limpiar?: () => void;
};

export function useEscena3D(montar: Montaje, opciones: { proporcion: number; fov?: number }) {
  const caja = useRef<HTMLDivElement>(null);
  const [falla, setFalla] = useState(false);
  const montarRef = useRef(montar);
  const { proporcion, fov = 40 } = opciones;

  useEffect(() => {
    const el = caja.current;
    if (!el) return;
    let vivo = true;
    let limpiar = () => {};

    import("three")
      .then((THREE) => {
        if (!vivo) return;
        let renderer: import("three").WebGLRenderer;
        try {
          renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        } catch {
          return setFalla(true);
        }
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        const canvas = renderer.domElement;
        el.appendChild(canvas);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(fov, 1, 0.1, 200);
        const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const { cuadro, limpiar: propia } = montarRef.current({ THREE, renderer, scene, camera, canvas, quieto });

        const medir = () => {
          const { width } = el.getBoundingClientRect();
          const alto = Math.round(width * proporcion);
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
          cuadro(reloj.getElapsed(), Math.min(reloj.getDelta(), 0.05));
          renderer.render(scene, camera);
        });

        limpiar = () => {
          renderer.setAnimationLoop(null);
          observador.disconnect();
          propia?.();
          scene.traverse((o) => {
            const m = o as import("three").Mesh;
            m.geometry?.dispose();
            const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
            mats.forEach((mat) => {
              (mat as import("three").MeshStandardMaterial).map?.dispose();
              mat.dispose();
            });
          });
          renderer.dispose();
          canvas.remove();
        };
      })
      .catch(() => vivo && setFalla(true));

    return () => {
      vivo = false;
      limpiar();
    };
  }, [proporcion, fov]);

  return { caja, falla };
}

// Partículas simples (humo, burbujas): un puñado de esferas que suben y se desvanecen.
export function crearParticulas(
  THREE: THREEType,
  opciones: { cantidad: number; color: number; tamano: number; origen: import("three").Vector3; dispersion: number },
) {
  const { cantidad, color, tamano, origen, dispersion } = opciones;
  const grupo = new THREE.Group();
  const geo = new THREE.SphereGeometry(tamano, 10, 8);
  const items = Array.from({ length: cantidad }, (_, i) => {
    const mat = new THREE.MeshStandardMaterial({ color, transparent: true, opacity: 0, roughness: 0.9 });
    const m = new THREE.Mesh(geo, mat);
    grupo.add(m);
    return { m, mat, vida: i / cantidad, dx: (Math.random() - 0.5) * dispersion, dz: (Math.random() - 0.5) * dispersion };
  });
  let activo = true;
  return {
    grupo,
    set activo(v: boolean) {
      activo = v;
    },
    avanzar(dt: number, velocidad = 1, subida = 1.2) {
      for (const p of items) {
        p.vida += dt * 0.6 * velocidad;
        if (p.vida > 1) {
          p.vida = activo ? 0 : 1;
          p.dx = (Math.random() - 0.5) * dispersion;
        }
        const v = p.vida;
        p.m.position.set(origen.x + p.dx * v, origen.y + v * subida, origen.z + p.dz * v);
        p.m.scale.setScalar(0.4 + v * 1.4);
        p.mat.opacity = activo || v < 1 ? Math.sin(Math.PI * Math.min(v, 1)) * 0.75 : 0;
      }
    },
  };
}
