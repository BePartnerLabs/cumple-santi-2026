"use client";

import { useEffect, useRef } from "react";
import { leerInclinacion } from "@/lib/movimiento";
import { crearParticulas, useEscena3D } from "@/lib/tres";

// El matraz del laboratorio en 3D. Cada vez que se vierte un tubo cae un chorro
// de gotas y el líquido sube y cambia de color. Con `virus`, el líquido se vuelve
// morado, burbujea y la luz late como alarma. Si la mezcla está mal, explota.

export type EstadoMatraz = { color: string; nivel: number; virus: boolean; vertidos: number; explosiones: number };

const R_BASE = 1.05; // radio del fondo
const R_CUELLO = 0.32;
const ALTO_CUERPO = 1.5;

export function Matraz3D({ estado, respaldo }: { estado: EstadoMatraz; respaldo: React.ReactNode }) {
  const actual = useRef(estado);
  useEffect(() => {
    actual.current = estado;
  }, [estado]);

  const { caja, falla } = useEscena3D(
    ({ THREE, scene, camera, quieto }) => {
      camera.position.set(0, 1.6, 5.2);
      camera.lookAt(0, 0.9, 0);
      scene.fog = new THREE.Fog(0x0b1a17, 6, 14);

      scene.add(new THREE.HemisphereLight(0xcfe8dc, 0x0b1a17, 1.2));
      const clave = new THREE.DirectionalLight(0xffffff, 1.8);
      clave.position.set(3, 5, 4);
      scene.add(clave);
      const alarma = new THREE.PointLight(0x9b4dff, 0, 8);
      alarma.position.set(0, 1.2, 1.2);
      scene.add(alarma);

      // mesa
      const mesa = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, 0.12, 48), new THREE.MeshStandardMaterial({ color: 0x1d2b27, roughness: 0.8 }));
      mesa.position.y = -0.06;
      scene.add(mesa);

      // vidrio: perfil de un matraz Erlenmeyer girado (LatheGeometry)
      const perfil = [
        new THREE.Vector2(0.001, 0),
        new THREE.Vector2(R_BASE - 0.1, 0),
        new THREE.Vector2(R_BASE, 0.1),
        new THREE.Vector2(R_CUELLO, ALTO_CUERPO),
        new THREE.Vector2(R_CUELLO, 2.3),
        new THREE.Vector2(R_CUELLO + 0.06, 2.36),
      ];
      const vidrio = new THREE.Mesh(
        new THREE.LatheGeometry(perfil, 48),
        new THREE.MeshStandardMaterial({ color: 0xcfe8dc, transparent: true, opacity: 0.22, roughness: 0.05, metalness: 0.1, side: THREE.DoubleSide, depthWrite: false }),
      );
      scene.add(vidrio);

      // líquido: un cono truncado que crece con el nivel
      const matLiquido = new THREE.MeshStandardMaterial({ color: 0x5ec8ff, roughness: 0.25, emissive: 0x000000, transparent: true, opacity: 0.92 });
      const liquido = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 40), matLiquido);
      liquido.visible = false;
      scene.add(liquido);

      // gotas del chorro al verter
      const gotas = Array.from({ length: 10 }, () => {
        const g = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true }));
        g.visible = false;
        scene.add(g);
        return g;
      });

      const burbujas = crearParticulas(THREE, { cantidad: 14, color: 0xe6d1ff, tamano: 0.07, origen: new THREE.Vector3(0, 0.3, 0), dispersion: 1.2 });
      burbujas.activo = false;
      scene.add(burbujas.grupo);

      // explosión: esquirlas que salen disparadas, un fogonazo y una nube de humo
      const fogonazo = new THREE.PointLight(0xff8a3d, 0, 10);
      fogonazo.position.set(0, 1.2, 0.6);
      scene.add(fogonazo);
      const esquirlaGeo = new THREE.IcosahedronGeometry(0.08, 0);
      const esquirlas = Array.from({ length: 28 }, (_, i) => {
        const mat = new THREE.MeshStandardMaterial({ color: i % 3 ? 0xff8a3d : 0x9b4dff, emissive: i % 3 ? 0xff5a1a : 0x6a2bd6, emissiveIntensity: 1.4, transparent: true });
        const m = new THREE.Mesh(esquirlaGeo, mat);
        m.visible = false;
        scene.add(m);
        return { m, mat, v: new THREE.Vector3() };
      });
      const nube = crearParticulas(THREE, { cantidad: 12, color: 0x6b5a7a, tamano: 0.35, origen: new THREE.Vector3(0, 1.4, 0), dispersion: 2.6 });
      nube.activo = false;
      scene.add(nube.grupo);
      let boom = 1; // 0..1 avance de la explosión; 1 = nada
      let boomsVistos = actual.current.explosiones;

      let nivel = 0;
      let vistos = actual.current.vertidos;
      let chorro = 1; // 0..1 avance de la caída; 1 = sin chorro
      const color = new THREE.Color();
      const morado = new THREE.Color(0x9b4dff);

      return {
        cuadro: (t, dt) => {
          const e = actual.current;
          if (e.vertidos !== vistos) {
            vistos = e.vertidos;
            chorro = 0;
            gotas.forEach((g) => (g.material as import("three").MeshStandardMaterial).color.set(e.color));
          }
          // chorro de gotas desde arriba
          if (chorro < 1) {
            chorro = Math.min(1, chorro + dt * 1.6);
            gotas.forEach((g, i) => {
              const f = chorro * 1.6 - i * 0.06;
              g.visible = f > 0 && f < 1;
              g.position.set(Math.sin(i) * 0.04, 3.4 - f * 3, 0);
            });
          } else gotas.forEach((g) => (g.visible = false));

          if (e.explosiones !== boomsVistos) {
            boomsVistos = e.explosiones;
            boom = 0;
            nivel = 0;
            esquirlas.forEach((q) => {
              q.m.visible = true;
              q.m.position.set(0, 1, 0);
              q.v.set((Math.random() - 0.5) * 7, 2 + Math.random() * 5, (Math.random() - 0.5) * 7);
            });
            nube.activo = true;
          }
          if (boom < 1) {
            boom = Math.min(1, boom + dt * 0.9);
            fogonazo.intensity = 40 * Math.pow(1 - boom, 3);
            esquirlas.forEach((q) => {
              q.v.y -= 9.8 * dt;
              q.m.position.addScaledVector(q.v, dt);
              q.m.rotation.x += dt * 8;
              q.mat.opacity = 1 - boom;
              if (boom >= 1) q.m.visible = false;
            });
            const sacudida = (1 - boom) * 0.12;
            vidrio.position.set((Math.random() - 0.5) * sacudida, 0, (Math.random() - 0.5) * sacudida);
            vidrio.scale.setScalar(1 + Math.sin(Math.min(boom * 12, Math.PI)) * 0.08);
            if (boom > 0.35) nube.activo = false;
          }
          nube.avanzar(dt, 1.6, 2.4);

          // nivel y color se acercan suave a su objetivo
          const destino = e.virus ? 1 : e.nivel;
          nivel += (destino - nivel) * Math.min(1, dt * 3);
          color.set(e.virus ? morado : e.color);
          matLiquido.color.lerp(color, Math.min(1, dt * 4));
          liquido.visible = nivel > 0.02;
          if (liquido.visible) {
            const h = Math.max(0.05, nivel * (ALTO_CUERPO - 0.35));
            const rArriba = R_BASE - (R_BASE - R_CUELLO) * (h / ALTO_CUERPO) - 0.05;
            liquido.geometry.dispose();
            liquido.geometry = new THREE.CylinderGeometry(rArriba, R_BASE - 0.08, h, 40);
            liquido.position.y = 0.04 + h / 2;
          }

          // el virus: burbujas, brillo y alarma que late
          burbujas.activo = e.virus;
          burbujas.avanzar(dt, 1.4, 2.2);
          matLiquido.emissive.copy(e.virus ? morado : new THREE.Color(0x000000));
          matLiquido.emissiveIntensity = e.virus ? 0.6 + Math.sin(t * 8) * 0.3 : 0;
          alarma.intensity = e.virus ? 6 + Math.sin(t * 10) * 5 : 0;

          // cámara: gira despacio y sigue la inclinación del teléfono
          const inc = leerInclinacion();
          const angulo = (quieto ? 0 : Math.sin(t * 0.4) * 0.25) + inc.x * 0.5;
          const temblor = e.virus && !quieto ? Math.sin(t * 40) * 0.02 : 0;
          camera.position.set(Math.sin(angulo) * 5.2 + temblor, 1.6 - inc.y * 0.6, Math.cos(angulo) * 5.2);
          camera.lookAt(0, 0.9, 0);
        },
      };
    },
    { proporcion: 0.75, fov: 38 },
  );

  if (falla) return <>{respaldo}</>;
  return <div ref={caja} className="escena3d escena3d--matraz" role="img" aria-label="Matraz del laboratorio" />;
}
