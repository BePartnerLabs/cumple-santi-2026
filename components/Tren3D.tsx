"use client";

import { useEffect, useRef } from "react";
import { leerInclinacion } from "@/lib/movimiento";
import { crearParticulas, useEscena3D } from "@/lib/tres";

// El Budapest Express en 3D: andén de noche con niebla, faroles y luna.
// Con `partiendo`, el tren acelera y se va echando humo. La luna se puede tocar.

export function Tren3D({ partiendo, onLuna, respaldo }: { partiendo: boolean; onLuna: () => void; respaldo: React.ReactNode }) {
  const estado = useRef({ partiendo, onLuna });
  useEffect(() => {
    estado.current = { partiendo, onLuna };
  }, [partiendo, onLuna]);

  const { caja, falla } = useEscena3D(
    ({ THREE, scene, camera, canvas, quieto }) => {
      scene.fog = new THREE.FogExp2(0x141a33, 0.06);
      camera.position.set(0.5, 1.6, 9);

      scene.add(new THREE.HemisphereLight(0x8fa3d0, 0x1a0c14, 0.9));
      const luzLuna = new THREE.DirectionalLight(0xdfe8f4, 1.2);
      luzLuna.position.set(6, 8, 3);
      scene.add(luzLuna);

      // luna y estrellas
      const luna = new THREE.Mesh(new THREE.SphereGeometry(0.7, 32, 24), new THREE.MeshBasicMaterial({ color: 0xeef3fb, fog: false }));
      luna.position.set(5, 5.2, -12);
      scene.add(luna);
      const estrellasGeo = new THREE.BufferGeometry();
      const pos = new Float32Array(300 * 3);
      for (let i = 0; i < 300; i++) {
        pos[i * 3] = (Math.random() - 0.5) * 60;
        pos[i * 3 + 1] = 3 + Math.random() * 14;
        pos[i * 3 + 2] = -18 - Math.random() * 6;
      }
      estrellasGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      scene.add(new THREE.Points(estrellasGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.06, fog: false })));

      // montañas al fondo
      const montanaMat = new THREE.MeshStandardMaterial({ color: 0x1d2546, roughness: 1, flatShading: true });
      [[-8, 3.2], [-2, 4.2], [5, 3.6], [11, 4.6]].forEach(([x, h]) => {
        const m = new THREE.Mesh(new THREE.ConeGeometry(4.5, h * 1.6, 5), montanaMat);
        m.position.set(x, h * 0.8 - 0.5, -14);
        scene.add(m);
      });

      // vías y andén
      const suelo = new THREE.Mesh(new THREE.PlaneGeometry(80, 30), new THREE.MeshStandardMaterial({ color: 0x0d1124, roughness: 1 }));
      suelo.rotation.x = -Math.PI / 2;
      scene.add(suelo);
      const rielMat = new THREE.MeshStandardMaterial({ color: 0x6a7080, metalness: 0.8, roughness: 0.3 });
      [-0.55, 0.55].forEach((z) => {
        const riel = new THREE.Mesh(new THREE.BoxGeometry(80, 0.06, 0.08), rielMat);
        riel.position.set(0, 0.04, z);
        scene.add(riel);
      });
      const durmiente = new THREE.InstancedMesh(new THREE.BoxGeometry(0.22, 0.05, 1.6), new THREE.MeshStandardMaterial({ color: 0x3a2a20 }), 80);
      const m4 = new THREE.Matrix4();
      for (let i = 0; i < 80; i++) durmiente.setMatrixAt(i, m4.makeTranslation(-40 + i, 0.01, 0));
      scene.add(durmiente);
      const anden = new THREE.Mesh(new THREE.BoxGeometry(80, 0.5, 2.6), new THREE.MeshStandardMaterial({ color: 0x232a3b, roughness: 0.9 }));
      anden.position.set(0, 0.25, 2.3);
      scene.add(anden);
      const borde = new THREE.Mesh(new THREE.BoxGeometry(80, 0.02, 0.12), new THREE.MeshStandardMaterial({ color: 0xe8c46a, emissive: 0x3a2a08 }));
      borde.position.set(0, 0.51, 1.1);
      scene.add(borde);

      // faroles
      [-4, 3, 10].forEach((x) => {
        const poste = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.6, 8), new THREE.MeshStandardMaterial({ color: 0x1b2030 }));
        poste.position.set(x, 1.8, 3.1);
        scene.add(poste);
        const foco = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 10), new THREE.MeshBasicMaterial({ color: 0xffd98a }));
        foco.position.set(x, 3.15, 3.1);
        scene.add(foco);
        const luz = new THREE.PointLight(0xffc066, 6, 6);
        luz.position.copy(foco.position);
        scene.add(luz);
      });

      // el tren
      const tren = new THREE.Group();
      const verde = new THREE.MeshStandardMaterial({ color: 0x1f2a1f, metalness: 0.4, roughness: 0.5 });
      const burdeo = new THREE.MeshStandardMaterial({ color: 0x5a1626, roughness: 0.55 });
      const oro = new THREE.MeshStandardMaterial({ color: 0xc9a24a, metalness: 0.9, roughness: 0.3 });
      const negro = new THREE.MeshStandardMaterial({ color: 0x0b0f20, roughness: 0.6 });
      const ventana = new THREE.MeshStandardMaterial({ color: 0xfdb713, emissive: 0xfdb713, emissiveIntensity: 1.2 });
      const apagada = new THREE.MeshStandardMaterial({ color: 0x0b1020 });

      // locomotora (mira hacia la izquierda, que es por donde se va)
      const caldera = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 2.2, 24), verde);
      caldera.rotation.z = Math.PI / 2;
      caldera.position.set(-1.2, 1.15, 0);
      const cabina = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.6, 1.3), verde);
      cabina.position.set(0.4, 1.35, 0);
      const chimenea = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 0.7, 16), negro);
      chimenea.position.set(-1.9, 1.95, 0);
      const farol = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 10), new THREE.MeshBasicMaterial({ color: 0xfff2c4 }));
      farol.position.set(-2.32, 1.3, 0);
      tren.add(caldera, cabina, chimenea, farol);

      // dos vagones
      [1.3, 5.3].forEach((x0, v) => {
        const vagon = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.5, 1.4), v ? burdeo : burdeo);
        vagon.position.set(x0 + 1.9, 1.3, 0);
        const techo = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 3.6, 20, 1, false, 0, Math.PI), negro);
        techo.rotation.z = Math.PI / 2;
        techo.rotation.y = Math.PI / 2;
        techo.scale.set(1, 1, 0.35);
        techo.position.set(x0 + 1.9, 2.05, 0);
        const franja = new THREE.Mesh(new THREE.BoxGeometry(3.62, 0.1, 1.42), oro);
        franja.position.set(x0 + 1.9, 1.75, 0);
        tren.add(vagon, techo, franja);
        for (let w = 0; w < 4; w++) {
          const vidrio = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.5), (w + v) % 2 ? apagada : ventana);
          vidrio.position.set(x0 + 0.55 + w * 0.9, 1.3, 0.71);
          tren.add(vidrio);
        }
      });

      // ruedas
      const ruedaGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.12, 20);
      const ruedas: import("three").Mesh[] = [];
      [-1.8, -0.9, 0.3, 1.8, 4.0, 5.8, 8.0].forEach((x) => {
        [-0.62, 0.62].forEach((z) => {
          const r = new THREE.Mesh(ruedaGeo, negro);
          r.rotation.x = Math.PI / 2;
          r.position.set(x, 0.38, z);
          tren.add(r);
          ruedas.push(r);
        });
      });
      tren.position.x = -1.5;
      scene.add(tren);

      const humo = crearParticulas(THREE, { cantidad: 16, color: 0x8a93b0, tamano: 0.22, origen: new THREE.Vector3(0, 0, 0), dispersion: 1.4 });
      scene.add(humo.grupo);

      // tocar la luna (raycast)
      const rayo = new THREE.Raycaster();
      const punto = new THREE.Vector2();
      const tocar = (e: PointerEvent) => {
        const r = canvas.getBoundingClientRect();
        punto.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
        rayo.setFromCamera(punto, camera);
        if (rayo.intersectObject(luna).length) estado.current.onLuna();
      };
      canvas.addEventListener("pointerdown", tocar);

      let velocidad = 0;
      return {
        cuadro: (t, dt) => {
          const { partiendo } = estado.current;
          if (partiendo) velocidad = Math.min(velocidad + dt * 2.2, 14);
          tren.position.x -= velocidad * dt;
          ruedas.forEach((r) => (r.rotation.y -= velocidad * dt * 3));
          if (!partiendo && !quieto) tren.position.y = Math.sin(t * 9) * 0.004; // motor en marcha

          // humo desde la chimenea, más denso al partir
          humo.grupo.position.set(tren.position.x - 1.9, 2.3, 0);
          humo.avanzar(dt, partiendo ? 2.2 : 0.8, partiendo ? 1.6 : 2.4);

          const inc = leerInclinacion();
          const objetivoX = partiendo ? Math.max(tren.position.x * 0.25, -6) : 0.5;
          camera.position.x += (objetivoX + inc.x * 1.2 - camera.position.x) * Math.min(1, dt * 2);
          camera.position.y = 1.6 - inc.y * 0.5;
          camera.lookAt(camera.position.x - 0.5, 1.3, 0);
          luna.position.x = 5 + camera.position.x * 0.6; // la luna acompaña de lejos
        },
        limpiar: () => canvas.removeEventListener("pointerdown", tocar),
      };
    },
    { proporcion: 0.62, fov: 42 },
  );

  if (falla) return <>{respaldo}</>;
  return <div ref={caja} className="escena3d escena3d--tren" role="img" aria-label="El Budapest Express en el andén, de noche" />;
}
