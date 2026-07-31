"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import Link from "next/link";
import { useMemo } from "react";
import { bloom } from "three/addons/tsl/display/BloomNode.js";
import {
  emissive,
  Fn,
  mix,
  mrt,
  normalLocal,
  output,
  pass,
  positionLocal,
  sin,
  time,
  uniform,
  vec4,
} from "three/tsl";
import * as THREE from "three/webgpu";

export default function Home() {
  return (
    <div className="w-full h-full grid grid-cols-3 grid-rows-[auto_auto_1fr] gap-px">
      <div className="col-span-3 text-foreground bg-background p-2 text-sm">
        Stokhastik est un espace à multiple fonction. Il est à la fois un outil
        de recherche et un outil de retranscription de cette dernière. Un espace
        pour penser et pour communiquer. Un espace vivant.
      </div>
      <div className="text-foreground bg-background flex items-center justify-center">
        <Link
          href="/shrine"
          className="text-blue-400 hover:underline font-mono font-bold uppercase"
        >
          SHRINE
        </Link>
      </div>
      <div className="text-foreground bg-background flex items-center justify-center">
        <Link
          href="/garden"
          className="text-green-400 hover:underline font-mono font-bold uppercase"
        >
          GARDEN
        </Link>
      </div>
      <div className="text-foreground bg-background flex items-center justify-center">
        <Link
          href="/store"
          className="text-orange-400 hover:underline font-mono font-bold uppercase"
        >
          STORE
        </Link>
      </div>
      <div className="col-span-3 bg-background">
        <Canvas
          camera={{ position: [2, 2, 2] }}
          gl={async (props) => {
            const renderer = new THREE.WebGPURenderer(
              props as unknown as THREE.WebGPURendererParameters,
            );
            await renderer.init();
            return renderer;
          }}
        >
          <color attach="background" args={["black"]} />
          <ambientLight />
          <Cube />
          <OrbitControls />
          <EmissiveBloom />
        </Canvas>
      </div>
    </div>
  );
}

function Cube() {
  const material = useMemo(() => {
    const mat = new THREE.MeshPhysicalNodeMaterial();

    mat.metalness = 0;
    mat.roughness = 0;
    mat.transmission = 0.5;
    mat.thickness = 1;
    mat.ior = 1.5;
    mat.transparent = true;
    mat.opacity = 0.6;
    mat.side = THREE.DoubleSide;

    const color1 = uniform(new THREE.Color(0x6366f1));
    const color2 = uniform(new THREE.Color(0xec4899));

    const wave = sin(positionLocal.y.mul(3).add(time));
    const factor = wave.mul(0.5).add(0.5);

    mat.colorNode = mix(color1, color2, factor);

    mat.emissiveNode = mix(color1, color2, factor);

    const gradientFactor = sin(positionLocal.length().mul(3.0).add(time))
      .mul(-0.5)
      .add(0.5);
    const pulse = sin(time.mul(2.0)).mul(0.3).add(0.7);
    const finalColor = mix(color1, color2, gradientFactor);

    mat.emissiveNode = finalColor.mul(pulse);

    mat.positionNode = Fn(() => {
      const pos = positionLocal; // Original vertex position
      const norm = normalLocal; // Vertex normal direction

      // Calculate displacement amount (changes over time and position)
      const displacement = sin(time.mul(3.0).add(pos.y.mul(5.0))).mul(0.075);

      // Move vertex along its normal
      return pos.add(norm.mul(displacement));
    })();

    return mat;
  }, []);

  return (
    <mesh material={material}>
      <boxGeometry args={[1, 1, 1]} />
    </mesh>
  );
}

function EmissiveBloom() {
  const { gl, scene, camera } = useThree();

  const renderPipeline = useMemo(() => {
    const renderer = gl as unknown as THREE.WebGPURenderer;
    const pipeline = new THREE.RenderPipeline(renderer);

    const scenePass = pass(scene, camera);
    scenePass.setMRT(mrt({ output, emissive }));

    const colorTexture = scenePass.getTextureNode("output");
    const emissiveTexture = scenePass.getTextureNode("emissive");

    const bloomPass = bloom(emissiveTexture);
    bloomPass.threshold.value = 0.0;
    bloomPass.strength.value = 1.5;
    bloomPass.radius.value = 0.5;

    pipeline.outputNode = vec4(
      colorTexture.rgb.add(bloomPass.rgb),
      colorTexture.a,
    );

    return pipeline;
  }, [gl, scene, camera]);

  useFrame(() => {
    renderPipeline.render();
  }, 1);

  return null;
}
