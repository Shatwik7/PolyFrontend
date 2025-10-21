import { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { Loader2 } from 'lucide-react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';

interface ModelViewerProps {
  modelUrl?: string;
  className?: string;
  autoRotate?: boolean;
}

const RemoteGLBModel = ({ url, autoRotate = false }: { url: string; autoRotate?: boolean }) => {
  const [scene, setScene] = useState<THREE.Group | null>(null);
  const groupRef = useRef<THREE.Group>(null);

  //unconventional but works trust me!!
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    let mounted = true;

    const loadModel = async () => {
      try {
        const response = await fetch(url);
        const buffer = await response.arrayBuffer();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const loader= new GLTFLoader() as any;
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
        loader.setDRACOLoader(dracoLoader);

        loader.parse(
          buffer,
          '',
          (gltf) => {
            if (mounted) {
              const model = gltf.scene;

              // 🔑 Step 1: Center the model's geometry
              const box = new THREE.Box3().setFromObject(model);
              const center = box.getCenter(new THREE.Vector3());
              model.position.sub(center);

              // Step 2: Get the new dimensions after centering
              const newBox = new THREE.Box3().setFromObject(model);
              const size = newBox.getSize(new THREE.Vector3());
              const maxDim = Math.max(size.x, size.y, size.z);

              // Step 3: Position the camera based on the new dimensions
              const fov = 35;
              const cameraDistance = maxDim / (2 * Math.tan(THREE.MathUtils.degToRad(fov / 2)));

              const camera = groupRef.current?.parent?.getObjectByProperty('isCamera', true);
              if (camera) {
                camera.position.set(0, 0, cameraDistance * 1.5);
                camera.lookAt(0, 0, 0);
              }

              // Step 4: Set orbit controls target to the new center (the origin)
              if (controlsRef.current) {
                controlsRef.current.target.set(0, 0, 0);
                controlsRef.current.update();
              }

              setScene(model);
            }
          },
          (error) => console.error('Error parsing GLB:', error)
        );
      } catch (err) {
        console.error('Error loading model:', err);
      }
    };

    loadModel();
    return () => {
      mounted = false;
    };
  }, [url]);



  return (
    <>
      <OrbitControls
        ref={controlsRef}
        enablePan={true}
        enableZoom={true}
        enableRotate
        autoRotate={autoRotate}
        autoRotateSpeed={1}
      />
      {scene ? <primitive ref={groupRef} object={scene} /> : null}
    </>
  );
};

const LoadingSpinner = () => (
  <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
    <div className="flex flex-col items-center gap-2">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="text-sm text-muted-foreground">Loading 3D model...</span>
    </div>
  </div>
);

export const ModelViewer = ({
  modelUrl = "https://polycrate-assets.s3.ap-south-1.amazonaws.com/preview/output.glb.gz",
  className = "w-full h-96",
  autoRotate = true,
}: ModelViewerProps) => {
  return (
    <div
      className={`relative ${className} bg-gradient-to-br from-background to-muted rounded-lg overflow-hidden border border-border`}
    >
      <Canvas
        shadows
        camera={{ position: [0, 0, 5], fov: 35 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          {/* Lights */}
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
          <pointLight position={[-5, 5, 5]} intensity={0.5} color="#8b5cf6" />
          <pointLight position={[5, -5, -5]} intensity={0.3} color="#06b6d4" />

          {/* Environment */}
          <Environment preset="city" />
          <color attach="background" args={["#18181b"]} />

          {/* 🔑 Remote model */}
          <RemoteGLBModel url={modelUrl} autoRotate={autoRotate} />
        </Suspense>
      </Canvas>

      <Suspense fallback={<LoadingSpinner />} />

      {/* Hint */}
      <div className="absolute bottom-2 left-2 bg-background/80 backdrop-blur-sm rounded px-2 py-1 text-xs text-muted-foreground">
        Rotating preview
      </div>
    </div>
  );
};