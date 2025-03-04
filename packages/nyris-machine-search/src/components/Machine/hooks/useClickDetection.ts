import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import * as THREE from 'three';
import { uniq } from 'lodash';

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader.js';
import useRequestStore from 'stores/request/requestStore';
import useMachineStore from 'stores/machine/machineStore';
import { NameMapping, SkuMapping, SpareParts, WearParts } from '../mapping';

export const useClickDetection = ({
  materialsMaster,
}: {
  materialsMaster: React.MutableRefObject<any>;
}) => {
  const { scene, camera, gl: renderer } = useThree();
  // Ensure the renderer's output encoding and tone mapping are correctly set
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const dPointer = new THREE.Vector2();
  const canvas = renderer.domElement;

  const xRayMaterial = new THREE.MeshBasicMaterial({
    color: 'rgb(71,71,71)',
    transparent: true,
    opacity: 0.22,
    depthWrite: false, // Ensures transparency is rendered correctly
    name: 'x-ray',
  });

  let prevClickTime = 0;
  let currentClickTime = 1;
  let isDragging = false;
  let isPointerDown = false;

  const composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  const outlinePass = new OutlinePass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    scene,
    camera,
  );

  outlinePass.edgeStrength = 2.0;
  outlinePass.edgeGlow = 0;
  outlinePass.edgeThickness = 1.0;
  outlinePass.visibleEdgeColor.set('#FFD700');
  outlinePass.hiddenEdgeColor.set('#FFD700');

  composer.addPass(renderPass);
  composer.addPass(outlinePass);

  // Add a gamma correction pass
  const gammaCorrectionPass = new ShaderPass(GammaCorrectionShader);
  composer.addPass(gammaCorrectionPass);

  const render = () => {
    requestAnimationFrame(render);
    composer.render();
  };

  useEffect(() => {
    const unsubscribeSelectedPartsName = useMachineStore.subscribe(
      state => state.selectedPartsName,
      (cur, prev) => {
        const partsView = useMachineStore.getState().partsView;
        const machineView = useMachineStore.getState().machineView;

        if (cur.length === 0) {
          clearSelection();
        } else {
          highlightSelected({
            partName: cur,
            xrayToggle: partsView === 'none' || machineView === 'solo',
          });
        }
      },
    );

    const unsubscribeReverseSelectionPartsName = useMachineStore.subscribe(
      state => state.reverseSelectedProduct,
      (cur, prev) => {
        const selectedPartsName = useMachineStore.getState().selectedPartsName;
        const partsView = useMachineStore.getState().partsView;
        const machineView = useMachineStore.getState().machineView;

        if (!cur && selectedPartsName.length === 0) {
          clearSelection();

          if (partsView === 'spare') {
            const partsName: string[] = [];
            SpareParts.forEach(sku => {
              partsName.push(SkuMapping[sku as keyof typeof SkuMapping]);
            });
            highlightSelected({ partName: partsName, partsView: true });
          }

          if (partsView === 'wear') {
            const partsName: string[] = [];
            WearParts.forEach(sku => {
              partsName.push(SkuMapping[sku as keyof typeof SkuMapping]);
            });
            highlightSelected({ partName: partsName, partsView: true });
          }
        } else if (!cur) {
          highlightSelected({
            partName: selectedPartsName,
            modelNumber: cur?.Modellnummer,
            reverse: false,
            xrayToggle: partsView === 'none' || machineView === 'solo',
          });
        } else if (cur) {
          highlightSelected({
            partName: [SkuMapping[cur?.sku as keyof typeof SkuMapping]],
            modelNumber: cur?.Modellnummer,
            reverse: true,
            xrayToggle: partsView === 'none' || machineView === 'solo',
          });
        }
      },
    );

    const unsubscribeMachineViewChange = useMachineStore.subscribe(
      state => state.machineView,
      (cur, prev) => {
        const selectedPartsName = useMachineStore.getState().selectedPartsName;
        const reverseSelectedProduct =
          useMachineStore.getState().reverseSelectedProduct;

        const partsView = useMachineStore.getState().partsView;
        const machineView = useMachineStore.getState().machineView;

        if (partsView === 'none') {
          const reverseSelectedProduct =
            useMachineStore.getState().reverseSelectedProduct;

          const parts = reverseSelectedProduct
            ? [
                SkuMapping[
                  reverseSelectedProduct?.sku as keyof typeof SkuMapping
                ],
              ]
            : selectedPartsName;

          highlightSelected({
            partName: parts,
            modelNumber: reverseSelectedProduct?.Modellnummer,
            reverse: !!reverseSelectedProduct,
          });
        } else {
          if (partsView === 'spare') {
            const partsName: string[] = [];
            SpareParts.forEach(sku => {
              partsName.push(SkuMapping[sku as keyof typeof SkuMapping]);
            });
            highlightSelected({ partName: partsName, partsView: true });
          }

          if (partsView === 'wear') {
            const partsName: string[] = [];
            WearParts.forEach(sku => {
              partsName.push(SkuMapping[sku as keyof typeof SkuMapping]);
            });
            highlightSelected({ partName: partsName, partsView: true });
          }
          if (selectedPartsName.length > 0) {
            highlightSelected({
              partName: selectedPartsName,
              reverse: false,
              xrayToggle: machineView === 'solo',
            });
          }
          if (reverseSelectedProduct) {
            highlightSelected({
              partName: [
                SkuMapping[
                  reverseSelectedProduct.sku as keyof typeof SkuMapping
                ],
              ],
              modelNumber: reverseSelectedProduct.Modellnummer,
              reverse: true,
              xrayToggle: machineView === 'solo',
            });
          }
        }
      },
    );

    const unsubscribeAutoFocus = useMachineStore.subscribe(
      state => state.autoFocusTriggered,
      (cur, prev) => {
        if (cur) {
          autoFocus();
        }
      },
    );

    const unsubscribePartsViewChange = useMachineStore.subscribe(
      state => state.partsView,
      (cur, prev) => {
        if (cur === 'spare') {
          const partsName: string[] = [];
          SpareParts.forEach(sku => {
            partsName.push(SkuMapping[sku as keyof typeof SkuMapping]);
          });
          highlightSelected({ partName: partsName, partsView: true });
          setAlgoliaFilterSkus(SpareParts);
        }

        if (cur === 'wear') {
          const partsName: string[] = [];
          WearParts.forEach(sku => {
            partsName.push(SkuMapping[sku as keyof typeof SkuMapping]);
          });
          highlightSelected({ partName: partsName, partsView: true });
          setAlgoliaFilterSkus(WearParts);
        }

        if (cur === 'none') {
          clearSelection();
          setAlgoliaFilterSkus([]);
        }
      },
    );

    // Cleanup on component unmount
    return () => {
      unsubscribeSelectedPartsName();
      unsubscribeReverseSelectionPartsName();
      unsubscribeMachineViewChange();
      unsubscribeAutoFocus();
      unsubscribePartsViewChange();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const autoFocus = () => {
    const initialPosition = [0, 0, 0.5];
    camera.position.set(
      initialPosition[0],
      initialPosition[1],
      initialPosition[2],
    );
    camera.lookAt(new THREE.Vector3(0, 0, 0));
  };

  useEffect(() => {
    render();
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);

    return () => {
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvas]);

  const setAlgoliaFilterSkus = (skus: string[]) => {
    const visualSearchSkus = useRequestStore.getState().visualSearchSkus;
    const setAlgoliaFilter = useRequestStore.getState().setAlgoliaFilter;

    if (visualSearchSkus.length > 0) {
      const filteredSkus = skus.filter(sku => visualSearchSkus.includes(sku));
      const filterSkus: any = filteredSkus
        .reverse()
        .map((sku: any, i: number) => `sku:'${sku}'<score=${i}> `);

      const filterSkusString = [...filterSkus].join('OR ');
      setAlgoliaFilter(filterSkusString);
    } else {
      const filterSkus: any = skus
        .reverse()
        .map((sku: any, i: number) => `sku:'${sku}'<score=${i}> `);

      const filterSkusString = [...filterSkus].join('OR ');

      setAlgoliaFilter(filterSkusString);
    }
  };

  const clearSelection = () => {
    outlinePass.selectedObjects = [];
    (Object.values(materialsMaster.current) as [any, any][]).forEach(
      ([item, oldMat]) => {
        item.material = oldMat;
      },
    );
  };

  const soloXrayToggle = () => {
    const machineView = useMachineStore.getState().machineView;

    scene.traverse(item => {
      if (item instanceof THREE.Mesh) {
        if (machineView === 'x-ray') {
          item.material = xRayMaterial;
          item.visible = true;
          item.layers.enable(0);
        } else if (machineView === 'solo') {
          item.visible = false;
          item.layers.disable(0);
        }
      }
    });
  };

  const highlightSelected = ({
    partName,
    reverse,
    modelNumber,
    partsView,
    xrayToggle = true,
  }: {
    partName: string[];
    reverse?: boolean;
    modelNumber?: string;
    partsView?: boolean;
    xrayToggle?: boolean;
  }) => {
    const meshName = partName;
    console.log({ meshName, modelNumber, xrayToggle, partsView });

    // Clear previously selected objects
    outlinePass.selectedObjects = [];

    if (xrayToggle) {
      soloXrayToggle();
    }

    if (!reverse && !partsView) {
      meshName.forEach(name => {
        const [item, oldMat] = materialsMaster.current[name] || [];

        if (oldMat) {
          item.material = oldMat;
          item.visible = true;
          item.layers.enable(0);
          outlinePass.selectedObjects.push(item);
        }
      });
    }

    if (reverse || partsView) {
      (Object.values(materialsMaster.current) as [any, any][]).forEach(
        ([item, oldMat]) => {
          if (item.isMesh && item.name.includes(modelNumber)) {
            item.material = oldMat;
            item.visible = true;
            item.layers.enable(0);

            if (!partsView) {
              outlinePass.selectedObjects.push(item);
            }
          }

          if (
            meshName.includes(item.name) ||
            (meshName.includes(item.userData?.name) && item.userData?.name)
          ) {
            if (!item?.isMesh) {
              const highlight = (object: THREE.Object3D) => {
                if (object instanceof THREE.Mesh) {
                  const [item, oldMat] =
                    materialsMaster.current[object.name] || [];
                  if (oldMat) {
                    item.material = oldMat;
                    item.visible = true;
                    item.layers.enable(0);
                    if (!partsView) {
                      outlinePass.selectedObjects.push(item);
                    }
                  }
                }
                object.children.forEach((child: any) => highlight(child));
              };
              item?.children.forEach((child: any) => highlight(child));
            } else {
              item.material = oldMat;
              item.visible = true;
              item.layers.enable(0);
              if (!partsView) {
                outlinePass.selectedObjects.push(item);
              }
            }
          }
        },
      );
    }
  };

  const onPointerUp = (event: PointerEvent) => {
    if (!event?.target) return;

    currentClickTime = performance.now();

    if (currentClickTime - prevClickTime > 100) {
      let shouldClick = false;

      const canvasBounds = (
        event.target as HTMLElement
      ).getBoundingClientRect();
      pointer.x =
        ((event.clientX - canvasBounds.left) / canvasBounds.width) * 2 - 1;
      pointer.y =
        -((event.clientY - canvasBounds.top) / canvasBounds.height) * 2 + 1;

      if (!isDragging) {
        shouldClick = true;
      } else if (dPointer.sub(pointer).length() < 0.005) {
        shouldClick = true;
      }

      if (shouldClick) {
        raycaster.setFromCamera(pointer, camera);
        const selectionPool = scene.children;
        const intersects = raycaster.intersectObjects(selectionPool, true);

        const isXray =
          intersects[0]?.object instanceof THREE.Mesh &&
          intersects[0].object.material.name === 'x-ray';
        const partsView = useMachineStore.getState().partsView;

        if (intersects[0] && !(partsView !== 'none' && isXray)) {
          const partName =
            intersects[0].object?.userData?.name ||
            intersects[0].object.parent?.userData?.name;
          const partParentName =
            intersects[0].object.parent?.parent?.userData?.name;

          console.log({
            'Selected part': intersects[0],
          });

          const machineView = useMachineStore.getState().machineView;
          let skus: string[] = [];
          const setSelectedPartsName =
            useMachineStore.getState().setSelectedPartsName;
          const setAlgoliaFilter = useRequestStore.getState().setAlgoliaFilter;

          if (machineView === 'solo' || partsView !== 'none') {
            setSelectedPartsName([intersects[0].object.name]);
            // highlightSelected({ partName: [partName] });
            if (NameMapping[partParentName as keyof typeof NameMapping]) {
              skus.push(
                NameMapping[partParentName as keyof typeof NameMapping],
              );
            }
            skus.push(NameMapping[partName as keyof typeof NameMapping]);

            const filterSkus: any = skus
              .reverse()
              .map((sku: any, i: number) => `sku:'${sku}'<score=${i}> `);

            const filterSkusString = [...filterSkus].join('OR ');

            setAlgoliaFilter(filterSkusString);

            return;
          }

          const siblings = intersects[0].object.parent?.parent?.children;
          const meshNames: string[] = [];
          if (NameMapping[partName as keyof typeof NameMapping]) {
            skus.push(NameMapping[partName as keyof typeof NameMapping]);
          }
          if (NameMapping[partParentName as keyof typeof NameMapping]) {
            skus.push(NameMapping[partParentName as keyof typeof NameMapping]);
          }

          if (siblings) {
            const collectMeshNames = (object: THREE.Object3D) => {
              const sku = NameMapping[object.name as keyof typeof NameMapping];
              if (sku) {
                skus.push(sku);
              }
              if (object instanceof THREE.Mesh) {
                meshNames.push(object.name);
                const sku =
                  NameMapping[object.name as keyof typeof NameMapping];
                if (sku) {
                  skus.push(sku);
                }
              }
              object.children.forEach(child => collectMeshNames(child));
            };

            siblings.forEach(sibling => collectMeshNames(sibling));
          }
          setSelectedPartsName(meshNames);

          skus = uniq(skus);

          setAlgoliaFilterSkus(skus);
        }
      }

      prevClickTime = currentClickTime;
    }
    isDragging = false;
  };

  const onPointerDown = (event: any) => {
    const canvasBounds = event.target.getBoundingClientRect();
    dPointer.x =
      ((event.clientX - canvasBounds.left) / canvasBounds.width) * 2 - 1;
    dPointer.y =
      -((event.clientY - canvasBounds.top) / canvasBounds.height) * 2 + 1;
    isPointerDown = true;
  };

  const onPointerMove = () => {
    if (isPointerDown) isDragging = true;
  };

  return null;
};
