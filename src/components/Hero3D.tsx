import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Hero3DProps {
  reducedMotion?: boolean;
}

export const Hero3D: React.FC<Hero3DProps> = ({ reducedMotion = false }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Dimensions
    const width = container.clientWidth || 500;
    const height = container.clientHeight || 500;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 240;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Group for globe and nodes
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // 1. Central Cyber Globe Wireframe
    const sphereRadius = 75;
    const sphereGeo = new THREE.IcosahedronGeometry(sphereRadius, 3);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      wireframe: true,
      transparent: true,
      opacity: 0.18,
    });
    const globeMesh = new THREE.Mesh(sphereGeo, sphereMat);
    globeGroup.add(globeMesh);

    // 2. Point cloud surface dots
    const pointCount = 600;
    const pointPositions = new Float32Array(pointCount * 3);
    for (let i = 0; i < pointCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / pointCount);
      const theta = Math.sqrt(pointCount * Math.PI) * phi;
      const x = sphereRadius * Math.cos(theta) * Math.sin(phi);
      const y = sphereRadius * Math.sin(theta) * Math.sin(phi);
      const z = sphereRadius * Math.cos(phi);
      pointPositions[i * 3] = x;
      pointPositions[i * 3 + 1] = y;
      pointPositions[i * 3 + 2] = z;
    }
    const pointGeo = new THREE.BufferGeometry();
    pointGeo.setAttribute('position', new THREE.BufferAttribute(pointPositions, 3));
    const pointMat = new THREE.PointsMaterial({
      color: 0x22d3ee,
      size: 1.5,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    const pointsMesh = new THREE.Points(pointGeo, pointMat);
    globeGroup.add(pointsMesh);

    // 3. Telemetry Security Nodes (AI Applications & MCP Endpoints)
    const nodeCoords = [
      { lat: 40, lon: -73, type: 'Cursor IDE', color: 0x06b6d4 },
      { lat: 51, lon: 0, type: 'MCP Filesystem', color: 0xf59e0b }, // warning node
      { lat: 35, lon: 139, type: 'Claude Desktop', color: 0x14b8a6 },
      { lat: -33, lon: 151, type: 'Ollama Runtime', color: 0x8b5cf6 },
      { lat: 37, lon: -122, type: 'MCP Database Bridge', color: 0xef4444 }, // high risk node
      { lat: 48, lon: 2, type: 'Watchdog Monitor', color: 0x10b981 },
      { lat: 1.3, lon: 103, type: 'Audit Core', color: 0x06b6d4 }
    ];

    const nodesGroup = new THREE.Group();
    const nodeSpheres: THREE.Mesh[] = [];

    nodeCoords.forEach(item => {
      const phi = (90 - item.lat) * (Math.PI / 180);
      const theta = (item.lon + 180) * (Math.PI / 180);
      const r = sphereRadius + 3;
      const x = -(r * Math.sin(phi) * Math.cos(theta));
      const z = r * Math.sin(phi) * Math.sin(theta);
      const y = r * Math.cos(phi);

      // Node marker
      const nGeo = new THREE.SphereGeometry(2.4, 16, 16);
      const nMat = new THREE.MeshBasicMaterial({ color: item.color });
      const nMesh = new THREE.Mesh(nGeo, nMat);
      nMesh.position.set(x, y, z);
      nodesGroup.add(nMesh);
      nodeSpheres.push(nMesh);

      // Outer glowing ring
      const ringGeo = new THREE.RingGeometry(3.5, 4.2, 16);
      const ringMat = new THREE.MeshBasicMaterial({
        color: item.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.set(x, y, z);
      ringMesh.lookAt(0, 0, 0);
      nodesGroup.add(ringMesh);

      // Beam connecting node to globe center
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(x, y, z),
        new THREE.Vector3(x * 0.7, y * 0.7, z * 0.7)
      ]);
      const lineMat = new THREE.LineBasicMaterial({
        color: item.color,
        transparent: true,
        opacity: 0.4
      });
      const beam = new THREE.Line(lineGeo, lineMat);
      nodesGroup.add(beam);
    });

    globeGroup.add(nodesGroup);

    // 4. Arc Lines connecting AI nodes
    for (let i = 0; i < nodeSpheres.length; i++) {
      const nextIdx = (i + 1) % nodeSpheres.length;
      const p1 = nodeSpheres[i].position;
      const p2 = nodeSpheres[nextIdx].position;

      // Create quadratic bezier curve above surface
      const mid = p1.clone().add(p2).multiplyScalar(0.5);
      const midLen = mid.length();
      mid.normalize().multiplyScalar(midLen + 18);

      const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
      const points = curve.getPoints(30);
      const arcGeo = new THREE.BufferGeometry().setFromPoints(points);
      const arcMat = new THREE.LineBasicMaterial({
        color: 0x06b6d4,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending,
      });
      const arc = new THREE.Line(arcGeo, arcMat);
      globeGroup.add(arc);
    }

    // Interactive mouse drag rotation
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      globeGroup.rotation.y += deltaX * 0.005;
      globeGroup.rotation.x += deltaY * 0.005;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Animation loop
    let reqId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      reqId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      if (!reducedMotion) {
        if (!isDragging) {
          globeGroup.rotation.y += 0.0025;
          globeGroup.rotation.x = Math.sin(elapsedTime * 0.3) * 0.08;
        }
      }

      // Pulse node rings
      nodesGroup.children.forEach((child, idx) => {
        if (child instanceof THREE.Mesh && child.geometry instanceof THREE.RingGeometry) {
          const scale = 1 + Math.sin(elapsedTime * 3 + idx) * 0.15;
          child.scale.set(scale, scale, scale);
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(reqId);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      sphereGeo.dispose();
      sphereMat.dispose();
      pointGeo.dispose();
      pointMat.dispose();
    };
  }, [reducedMotion]);

  return (
    <div className="relative w-full h-[400px] md:h-[500px] flex items-center justify-center cursor-grab active:cursor-grabbing select-none">
      <div ref={mountRef} className="w-full h-full" />
      {/* HUD overlay labels */}
      <div className="absolute top-4 left-4 bg-slate-900/80 border border-cyan-500/30 rounded px-3 py-1.5 backdrop-blur-sm pointer-events-none flex items-center space-x-2">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
        <span className="text-xs font-mono text-cyan-300">TELEMETRY_GRID: ACTIVE</span>
      </div>
      <div className="absolute bottom-4 right-4 bg-slate-900/80 border border-slate-700/60 rounded px-3 py-1.5 backdrop-blur-sm pointer-events-none text-right">
        <div className="text-[10px] font-mono text-slate-400">NODES MONITORED</div>
        <div className="text-xs font-mono text-emerald-400">7 SENSORS DISPATCHED</div>
      </div>
    </div>
  );
};
