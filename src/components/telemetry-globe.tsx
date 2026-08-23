import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface MarkerData {
  id: string;
  name: string;
  category: string;
  status: "normal" | "urgent" | "resolved";
  lat: number;
  lng: number;
  details: string;
}

const SOCIETY_MARKERS: MarkerData[] = [
  {
    id: "1",
    name: "Tower A - Lift 1",
    category: "Elevator",
    status: "resolved",
    lat: 37.7749,
    lng: -122.4194,
    details: "Worn pulley replaced & certified safe",
  },
  {
    id: "2",
    name: "Tower C - Main Pump",
    category: "Plumbing",
    status: "urgent",
    lat: 40.7128,
    lng: -74.006,
    details: "Pressure anomaly detected on 14th floor",
  },
  {
    id: "3",
    name: "Clubhouse - HVAC",
    category: "Electrical",
    status: "normal",
    lat: 51.5074,
    lng: -0.1278,
    details: "Routine refrigerant cycle checked",
  },
  {
    id: "4",
    name: "Substation B",
    category: "Power",
    status: "normal",
    lat: 35.6762,
    lng: 139.6503,
    details: "Backup DG generator test completed",
  },
  {
    id: "5",
    name: "Tower B - Water Tank",
    category: "Sensors",
    status: "normal",
    lat: 1.3521,
    lng: 103.8198,
    details: "Water level sensor 94% full",
  },
  {
    id: "6",
    name: "Gate 1 - RFID Boom",
    category: "Access",
    status: "resolved",
    lat: 28.6139,
    lng: 77.209,
    details: "RFID barrier controller updated",
  },
  {
    id: "7",
    name: "Tower D - Solar Array",
    category: "Energy",
    status: "normal",
    lat: -33.8688,
    lng: 151.2093,
    details: "Peak output 42.8 kWh",
  },
  {
    id: "8",
    name: "Perimeter Security",
    category: "CCTV",
    status: "normal",
    lat: 48.8566,
    lng: 2.3522,
    details: "All 32 optical feeds operational",
  },
];

const ARCS_CONFIG = [
  { from: 0, to: 1, color: 0xffa500 }, // Tower A -> Tower C (urgent amber)
  { from: 1, to: 2, color: 0x10b981 }, // Tower C -> Clubhouse (green)
  { from: 2, to: 5, color: 0x38bdf8 }, // Clubhouse -> Gate 1 (cyan)
  { from: 5, to: 3, color: 0x34d399 }, // Gate 1 -> Substation (emerald)
  { from: 3, to: 4, color: 0x60a5fa }, // Substation -> Tank (blue)
  { from: 4, to: 6, color: 0x10b981 }, // Tank -> Solar (green)
  { from: 0, to: 7, color: 0x38bdf8 }, // Tower A -> CCTV (cyan)
  { from: 7, to: 5, color: 0xf59e0b }, // CCTV -> Gate 1 (amber)
];

function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

export function TelemetryGlobe({
  onSelectMarker,
}: {
  onSelectMarker?: (marker: MarkerData) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredMarker, setHoveredMarker] = useState<MarkerData | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 240;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Globe Group
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    const GLOBE_RADIUS = 75;

    // 3. Atmosphere Core Sphere
    const innerSphereGeo = new THREE.SphereGeometry(GLOBE_RADIUS * 0.99, 64, 64);
    const innerSphereMat = new THREE.MeshBasicMaterial({
      color: 0x050d08,
      transparent: true,
      opacity: 0.85,
    });
    const innerSphere = new THREE.Mesh(innerSphereGeo, innerSphereMat);
    globeGroup.add(innerSphere);

    // 4. Dot Grid Sphere (Hologram Continents & Fibonacci Points)
    const DOTS_COUNT = 3200;
    const dotPositions = new Float32Array(DOTS_COUNT * 3);
    const dotColors = new Float32Array(DOTS_COUNT * 3);

    const baseColor = new THREE.Color(0x274a2e);
    const landColor = new THREE.Color(0x34d399);

    for (let i = 0; i < DOTS_COUNT; i++) {
      // Golden Spiral distribution
      const phi = Math.acos(1 - (2 * (i + 0.5)) / DOTS_COUNT);
      const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);

      const x = GLOBE_RADIUS * Math.sin(phi) * Math.cos(theta);
      const y = GLOBE_RADIUS * Math.cos(phi);
      const z = GLOBE_RADIUS * Math.sin(phi) * Math.sin(theta);

      dotPositions[i * 3] = x;
      dotPositions[i * 3 + 1] = y;
      dotPositions[i * 3 + 2] = z;

      // Pseudo-continent clustering
      const lat = 90 - (phi * 180) / Math.PI;
      const lng = (((theta * 180) / Math.PI) % 360) - 180;
      const isLand =
        (lat > -10 && lat < 65 && lng > -20 && lng < 55) || // Europe/Africa
        (lat > 5 && lat < 70 && lng > 60 && lng < 150) || // Asia
        (lat > 15 && lat < 70 && lng > -165 && lng < -50) || // North America
        (lat > -55 && lat < 10 && lng > -85 && lng < -35) || // South America
        (lat > -40 && lat < -10 && lng > 110 && lng < 155); // Australia

      const c = isLand ? landColor : baseColor;
      dotColors[i * 3] = c.r;
      dotColors[i * 3 + 1] = c.g;
      dotColors[i * 3 + 2] = c.b;
    }

    const dotGeometry = new THREE.BufferGeometry();
    dotGeometry.setAttribute("position", new THREE.BufferAttribute(dotPositions, 3));
    dotGeometry.setAttribute("color", new THREE.BufferAttribute(dotColors, 3));

    const dotMaterial = new THREE.PointsMaterial({
      size: 1.6,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const globePoints = new THREE.Points(dotGeometry, dotMaterial);
    globeGroup.add(globePoints);

    // 5. Latitude & Longitude Wireframe Rings
    const ringMat = new THREE.LineBasicMaterial({
      color: 0x163821,
      transparent: true,
      opacity: 0.35,
    });

    for (let lat = -60; lat <= 60; lat += 30) {
      const radiusAtLat = GLOBE_RADIUS * Math.cos((lat * Math.PI) / 180);
      const y = GLOBE_RADIUS * Math.sin((lat * Math.PI) / 180);
      const ringGeo = new THREE.BufferGeometry();
      const points: THREE.Vector3[] = [];
      for (let j = 0; j <= 64; j++) {
        const angle = (j / 64) * Math.PI * 2;
        points.push(
          new THREE.Vector3(Math.cos(angle) * radiusAtLat, y, Math.sin(angle) * radiusAtLat),
        );
      }
      ringGeo.setFromPoints(points);
      const ring = new THREE.Line(ringGeo, ringMat);
      globeGroup.add(ring);
    }

    // Outer Orbit Wireframe Ring
    const outerRingGeo = new THREE.BufferGeometry();
    const outerPoints: THREE.Vector3[] = [];
    for (let j = 0; j <= 96; j++) {
      const angle = (j / 96) * Math.PI * 2;
      outerPoints.push(
        new THREE.Vector3(
          Math.cos(angle) * (GLOBE_RADIUS * 1.25),
          Math.sin(angle) * (GLOBE_RADIUS * 1.25),
          0,
        ),
      );
    }
    outerRingGeo.setFromPoints(outerPoints);
    const outerRing = new THREE.Line(
      outerRingGeo,
      new THREE.LineDashedMaterial({
        color: 0x34d399,
        dashSize: 3,
        gapSize: 2,
        transparent: true,
        opacity: 0.25,
      }),
    );
    outerRing.computeLineDistances();
    outerRing.rotation.x = Math.PI * 0.35;
    outerRing.rotation.y = Math.PI * 0.15;
    globeGroup.add(outerRing);

    // 6. Surface Markers & Glowing Beacons
    const markerObjects: { mesh: THREE.Mesh; marker: MarkerData; basePos: THREE.Vector3 }[] = [];

    SOCIETY_MARKERS.forEach((m) => {
      const pos = latLngToVector3(m.lat, m.lng, GLOBE_RADIUS);
      const colorHex =
        m.status === "urgent" ? 0xf59e0b : m.status === "resolved" ? 0x10b981 : 0x38bdf8;

      // Center glowing pin
      const pinGeo = new THREE.SphereGeometry(1.6, 16, 16);
      const pinMat = new THREE.MeshBasicMaterial({ color: colorHex });
      const pinMesh = new THREE.Mesh(pinGeo, pinMat);
      pinMesh.position.copy(pos);
      globeGroup.add(pinMesh);

      // Outer ripple ring
      const ringGeo = new THREE.RingGeometry(2.2, 2.9, 24);
      const ringMeshMat = new THREE.MeshBasicMaterial({
        color: colorHex,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7,
      });
      const rippleMesh = new THREE.Mesh(ringGeo, ringMeshMat);
      rippleMesh.position.copy(pos);
      rippleMesh.lookAt(pos.clone().multiplyScalar(2));
      globeGroup.add(rippleMesh);

      markerObjects.push({ mesh: pinMesh, marker: m, basePos: pos });
    });

    // 7. Telemetry Arcs (Great Circle Bezier Curves + Traveling Particles)
    const arcCurves: THREE.QuadraticBezierCurve3[] = [];
    const projectiles: {
      mesh: THREE.Mesh;
      curve: THREE.QuadraticBezierCurve3;
      progress: number;
      speed: number;
    }[] = [];

    ARCS_CONFIG.forEach((cfg) => {
      const startMarker = SOCIETY_MARKERS[cfg.from]!;
      const endMarker = SOCIETY_MARKERS[cfg.to]!;

      const p1 = latLngToVector3(startMarker.lat, startMarker.lng, GLOBE_RADIUS);
      const p2 = latLngToVector3(endMarker.lat, endMarker.lng, GLOBE_RADIUS);

      // Elevated midpoint
      const dist = p1.distanceTo(p2);
      const mid = p1.clone().add(p2).multiplyScalar(0.5);
      const altitude = GLOBE_RADIUS + dist * 0.35;
      const control = mid.normalize().multiplyScalar(altitude);

      const curve = new THREE.QuadraticBezierCurve3(p1, control, p2);
      arcCurves.push(curve);

      // Arc Line
      const curvePoints = curve.getPoints(40);
      const arcGeo = new THREE.BufferGeometry().setFromPoints(curvePoints);
      const arcMat = new THREE.LineBasicMaterial({
        color: cfg.color,
        transparent: true,
        opacity: 0.55,
      });
      const arcLine = new THREE.Line(arcGeo, arcMat);
      globeGroup.add(arcLine);

      // Traveling glowing projectile
      const projGeo = new THREE.SphereGeometry(1.2, 8, 8);
      const projMat = new THREE.MeshBasicMaterial({
        color: cfg.color,
      });
      const projMesh = new THREE.Mesh(projGeo, projMat);
      globeGroup.add(projMesh);

      projectiles.push({
        mesh: projMesh,
        curve,
        progress: Math.random(),
        speed: 0.005 + Math.random() * 0.004,
      });
    });

    // 8. Interaction: Raycasting & Drag Rotation
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let rotationVelocityX = 0;
    let rotationVelocityY = 0.0018;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      // Raycast for marker hover
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);

      const meshes = markerObjects.map((m) => m.mesh);
      const intersects = raycaster.intersectObjects(meshes);

      if (intersects.length > 0) {
        const hit = markerObjects.find((m) => m.mesh === intersects[0]!.object);
        if (hit) {
          setHoveredMarker(hit.marker);
          setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
          container.style.cursor = "pointer";
        }
      } else {
        setHoveredMarker(null);
        setTooltipPos(null);
        container.style.cursor = isDragging ? "grabbing" : "grab";
      }

      if (!isDragging) return;

      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;

      rotationVelocityY = deltaX * 0.003;
      rotationVelocityX = deltaY * 0.003;

      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onClick = () => {
      if (hoveredMarker && onSelectMarker) {
        onSelectMarker(hoveredMarker);
      }
    };

    container.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    container.addEventListener("click", onClick);

    // 9. Animation Loop
    let animationFrameId: number;
    let time = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      time += 0.015;

      // Apply rotation with dampening
      globeGroup.rotation.y += rotationVelocityY;
      globeGroup.rotation.x += rotationVelocityX;

      if (!isDragging) {
        rotationVelocityY = THREE.MathUtils.lerp(rotationVelocityY, 0.0015, 0.03);
        rotationVelocityX = THREE.MathUtils.lerp(rotationVelocityX, 0, 0.03);
      }

      // Animate Arcs Projectiles
      projectiles.forEach((p) => {
        p.progress += p.speed;
        if (p.progress > 1) p.progress = 0;
        const pos = p.curve.getPoint(p.progress);
        p.mesh.position.copy(pos);
      });

      // Animate Outer Orbit
      outerRing.rotation.z += 0.002;

      renderer.render(scene, camera);
    };

    animate();

    // 10. Resize handler
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      container.removeEventListener("click", onClick);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [hoveredMarker, onSelectMarker]);

  return (
    <div className="relative h-full w-full select-none">
      <div ref={containerRef} className="h-full w-full cursor-grab" />

      {/* Floating Hover Tooltip */}
      {hoveredMarker && tooltipPos && (
        <div
          className="pointer-events-none absolute z-30 -translate-x-1/2 -translate-y-full rounded-xl border border-emerald-500/40 bg-[#0B150F]/90 p-3.5 shadow-2xl backdrop-blur-md text-left transition-all"
          style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y - 14}px` }}
        >
          <div className="flex items-center gap-2">
            <span
              className={`size-2 rounded-full ${
                hoveredMarker.status === "urgent"
                  ? "bg-amber-400 animate-ping"
                  : hoveredMarker.status === "resolved"
                    ? "bg-emerald-400"
                    : "bg-cyan-400"
              }`}
            />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              {hoveredMarker.category}
            </span>
          </div>
          <div className="mt-1 text-sm font-semibold text-white">{hoveredMarker.name}</div>
          <p className="mt-1 max-w-[200px] text-xs text-emerald-200/70">{hoveredMarker.details}</p>
        </div>
      )}
    </div>
  );
}
