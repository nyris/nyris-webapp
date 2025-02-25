import { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';

import { Environment, OrbitControls, useGLTF } from '@react-three/drei';
import { useClickDetection } from '../hooks/useClickDetection';
import Loading from 'components/Loading';

const Model = ({ filePath }: { filePath: string }) => {
  const gltf = useGLTF(filePath, true);
  const materialsMaster = useRef<any>([]);

  gltf.scene.traverse(item => {
    const oldMat = (item as THREE.Mesh).material;
    materialsMaster.current[item.name] = [item, oldMat];
  });

  useClickDetection({ materialsMaster });

  return <primitive object={gltf.scene} />;
};

const Machine = () => {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Suspense
        fallback={
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
            }}
          >
            <Loading />
          </div>
        }
      >
        <Canvas className="bg-white" camera={{ position: [0, 0, 0.5] }}>
          {/* Add lighting */}
          <ambientLight intensity={1} />
          <directionalLight position={[5, 5, 5]} />
          <Environment files={'autoshop_01_1k.hdr'} path={'/envMap/'} />
          {/* <Environment
          // files={"autoshop.hdr"}
          files={"autoshop.hdr"}
          path={"/envMap/"}
          background="only"
        /> */}
          {/* Load 3D model */}
          {/* <Model filePath="models/10224497_TSC_55_KEB.glb" /> */}
          <Model filePath="models/festool.glb" />
          {/* <Model filePath="models/drucker_preserved_heirarchies.glb" /> */}
          {/* Add controls for interaction */}
          <OrbitControls
            enableZoom={true}
            enableRotate={true}
            enablePan={false}
          />
        </Canvas>
      </Suspense>
    </div>
  );
};

export default Machine;
