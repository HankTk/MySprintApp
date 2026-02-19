import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { ThreeSceneContext } from '@ui/components';

export function createBasicScene(context: ThreeSceneContext): void {
  const { scene } = context;
  
  // Add a sample cube
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
  const cube = new THREE.Mesh(geometry, material);
  cube.castShadow = true;
  cube.receiveShadow = true;
  scene.add(cube);

  // Add a plane
  const planeGeometry = new THREE.PlaneGeometry(10, 10);
  const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc });
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = -1;
  plane.receiveShadow = true;
  scene.add(plane);

  // Animate cube
  context.update = (delta: number) => {
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
  };
}

export function createMinimalScene(context: ThreeSceneContext): void {
  const { scene } = context;
  
  // Add a simple rotating sphere (minimal scene - no grid, no axes)
  const geometry = new THREE.SphereGeometry(1, 32, 32);
  const material = new THREE.MeshStandardMaterial({ 
    color: 0x4a90e2,
    metalness: 0.7,
    roughness: 0.3
  });
  const sphere = new THREE.Mesh(geometry, material);
  sphere.castShadow = true;
  sphere.receiveShadow = true;
  scene.add(sphere);

  // Animate sphere
  context.update = (delta: number) => {
    sphere.rotation.x += 0.005;
    sphere.rotation.y += 0.01;
  };
}

export function createSimpleWalkingPerson(context: ThreeSceneContext): void {
  // Using XBot model from Three.js official examples
  createGLTFAnimationBlending(context, 'https://threejs.org/examples/models/gltf/XBot.glb', false);
}

export function createDetailedWalkingPerson(context: ThreeSceneContext): void {
  // Using XBot model with animation blending from Three.js official examples
  createGLTFAnimationBlending(context, 'https://threejs.org/examples/models/gltf/XBot.glb', true);
}

export function createGLTFWalkingPerson(context: ThreeSceneContext, modelUrl: string): void {
  createGLTFAnimationBlending(context, modelUrl, true);
}

function createGLTFAnimationBlending(
  context: ThreeSceneContext,
  modelUrl: string,
  enableBlending: boolean
): void {
  const { scene, camera } = context;
  const loader = new GLTFLoader();
  let animationMixer: THREE.AnimationMixer | undefined;
  const actions: THREE.AnimationAction[] = [];
  let activeAction: THREE.AnimationAction | undefined;
  let previousAction: THREE.AnimationAction | undefined;
  let currentBaseAction = 'Idle';
  const baseActions: { [key: string]: THREE.AnimationAction } = {};
  const additiveActions: { [key: string]: THREE.AnimationAction } = {};

  loader.load(
    modelUrl,
    (gltf) => {
      console.log('GLTF model loading started:', modelUrl);
      const model = gltf.scene;
      
      // Calculate bounding box and center the model (like official example)
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      
      // Scale model to fit nicely in scene
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 1.5 / maxDim;
      model.scale.multiplyScalar(scale);
      
      // Center the model
      const offset = center.multiplyScalar(-scale);
      model.position.copy(offset);
      
      // Adjust camera position based on model size
      if (camera) {
        const distance = Math.max(size.x, size.y, size.z) * 2;
        camera.position.set(0, size.y * scale * 0.5, distance);
        camera.lookAt(0, size.y * scale * 0.5, 0);
      }

      model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          
          // Enable skinning for SkinnedMesh
          if (child instanceof THREE.SkinnedMesh) {
            if (child.material instanceof THREE.Material) {
              // Ensure material has skinning enabled
              if ('skinning' in child.material) {
                (child.material as any).skinning = true;
              }
            }
            // Disable frustum culling for skinned meshes
            child.frustumCulled = false;
          }
          
          console.log('Mesh found:', child.name || 'unnamed', 'Type:', child.constructor.name);
        }
      });

      scene.add(model);
      console.log('GLTF model added to scene:', modelUrl);
      console.log('Model position:', model.position);
      console.log('Model scale:', model.scale);
      console.log('Model children count:', model.children.length);
      console.log('Animations count:', gltf.animations.length);
      if (gltf.animations.length > 0) {
        console.log('Animation names:', gltf.animations.map(clip => clip.name));
      }

      if (gltf.animations && gltf.animations.length > 0) {
        animationMixer = new THREE.AnimationMixer(model);

        if (animationMixer) {
          // Base animations (like official example)
          const baseAnimationNames = ['Idle', 'Walking', 'Running', 'Jump'];
          
          // Additive animations (gestures)
          const additiveAnimationNames = ['Yes', 'No', 'Wave', 'Punch', 'ThumbsUp'];

          // Create base actions
          baseAnimationNames.forEach((name) => {
            const clip = THREE.AnimationClip.findByName(gltf.animations, name);
            if (clip && animationMixer) {
              const action = animationMixer.clipAction(clip);
              baseActions[name] = action;
              actions.push(action);
            }
          });

          // Create additive actions (like official example)
          // Note: makeClipAdditive is not available in this Three.js version,
          // so we use the original clips directly
          additiveAnimationNames.forEach((name) => {
            const clip = THREE.AnimationClip.findByName(gltf.animations, name);
            if (clip && animationMixer) {
              const additiveAction = animationMixer.clipAction(clip);
              // Set up additive action properties
              additiveAction.setLoop(THREE.LoopOnce, 1);
              additiveAction.clampWhenFinished = true;
              // Set weight to 0 initially (will be set when played)
              additiveAction.setEffectiveWeight(0);
              additiveActions[name] = additiveAction;
              actions.push(additiveAction);
            }
          });

          // Fallback: if no specific animations found, use all available animations
          if (Object.keys(baseActions).length === 0 && gltf.animations.length > 0) {
            gltf.animations.forEach((clip) => {
              if (animationMixer) {
                const action = animationMixer.clipAction(clip);
                baseActions[clip.name] = action;
                actions.push(action);
              }
            });
          }
        }

        // Activate base action (like official example)
        if (enableBlending) {
          // Start with Idle animation
          activeAction = baseActions['Idle'] || baseActions['Walking'] || Object.values(baseActions)[0];
          if (activeAction) {
            activeAction.play();
            currentBaseAction = activeAction.getClip().name;
            console.log('Playing base action:', currentBaseAction);
          } else if (gltf.animations.length > 0 && animationMixer) {
            // Fallback: play first animation
            const firstClip = gltf.animations[0];
            activeAction = animationMixer.clipAction(firstClip);
            activeAction.play();
            baseActions[firstClip.name] = activeAction;
            currentBaseAction = firstClip.name;
            console.log('Playing fallback animation:', firstClip.name);
          }
        } else {
          // Play all animations if blending is disabled
          if (animationMixer) {
            gltf.animations.forEach((clip) => {
              if (animationMixer) {
                const action = animationMixer.clipAction(clip);
                action.play();
                console.log('Playing animation:', clip.name);
                if (!actions.includes(action)) {
                  actions.push(action);
                }
              }
            });
          }
        }
        
        // Set up animation mixer update
        context.update = (delta: number) => {
          if (animationMixer) {
            animationMixer.update(delta);
          }
        };

        // Add a plane (like official example)
        const planeGeometry = new THREE.PlaneGeometry(20, 20);
        const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc });
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.rotation.x = -Math.PI / 2;
        plane.position.y = 0;
        plane.receiveShadow = true;
        scene.add(plane);

        // Auto-cycle through base animations if blending is enabled (like official example)
        if (enableBlending && Object.keys(baseActions).length > 1) {
          let animationIndex = 0;
          const baseAnimationNames = Object.keys(baseActions).filter(name => 
            ['Idle', 'Walking', 'Running', 'Jump'].includes(name)
          );
          
          if (baseAnimationNames.length > 0) {
            setInterval(() => {
              if (baseAnimationNames.length > 0) {
                const nextName = baseAnimationNames[animationIndex % baseAnimationNames.length];
                fadeToAction(nextName, 0.5);
                animationIndex++;
              }
            }, 3000);
          }
        }
      } else {
        // Add a plane even if no animations
        const planeGeometry = new THREE.PlaneGeometry(20, 20);
        const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc });
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.rotation.x = -Math.PI / 2;
        plane.position.y = 0;
        plane.receiveShadow = true;
        scene.add(plane);
      }
    },
    (progress) => {
      // Loading progress
      if (progress.total > 0) {
        const percent = (progress.loaded / progress.total * 100).toFixed(2);
        console.log(`Loading progress: ${percent}%`);
      }
    },
    (error) => {
      console.error('Error loading GLTF model:', error);
      console.error('Model URL:', modelUrl);
      // Fallback: create a simple human-like placeholder when model fails to load
      const person = new THREE.Group();
      const material = new THREE.MeshStandardMaterial({ color: 0x4a90e2 });
      
      // Head
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.3), material);
      head.position.set(0, 1.1, 0);
      person.add(head);
      
      // Body
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.6, 0.3), material);
      body.position.set(0, 0.6, 0);
      person.add(body);
      
      // Arms
      const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.5, 0.15), material);
      leftArm.position.set(-0.35, 0.5, 0);
      person.add(leftArm);
      
      const rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.5, 0.15), material);
      rightArm.position.set(0.35, 0.5, 0);
      person.add(rightArm);
      
      // Legs
      const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.6, 0.2), material);
      leftLeg.position.set(-0.15, -0.3, 0);
      person.add(leftLeg);
      
      const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.6, 0.2), material);
      rightLeg.position.set(0.15, -0.3, 0);
      person.add(rightLeg);
      
      person.position.set(0, 0, 0);
      person.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      scene.add(person);

      // Add a plane
      const planeGeometry = new THREE.PlaneGeometry(20, 20);
      const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc });
      const plane = new THREE.Mesh(planeGeometry, planeMaterial);
      plane.rotation.x = -Math.PI / 2;
      plane.position.y = -1;
      plane.receiveShadow = true;
      scene.add(plane);

      // Simple rotation animation as fallback
      context.update = (delta: number) => {
        person.rotation.y += 0.01;
      };
      
      console.log('Fallback placeholder created');
    }
  );

  function fadeToAction(name: string, duration: number): void {
    if (!enableBlending || !animationMixer) return;

    previousAction = activeAction;

    if (baseActions[name]) {
      activeAction = baseActions[name];
      currentBaseAction = name;
    } else if (additiveActions[name]) {
      // For additive actions, play on top of current base action (like official example)
      const additiveAction = additiveActions[name];
      if (additiveAction) {
        additiveAction.reset();
        additiveAction.setEffectiveWeight(1);
        additiveAction.setEffectiveTimeScale(1);
        additiveAction.play();
      }
      return;
    } else {
      return;
    }

    // Fade between base actions (like official example)
    if (previousAction && previousAction !== activeAction) {
      previousAction.fadeOut(duration);
    }
    if (activeAction) {
      activeAction.reset();
      activeAction.setEffectiveTimeScale(1);
      activeAction.setEffectiveWeight(1);
      activeAction.fadeIn(duration);
      activeAction.play();
    }
  }

  // Set up default update function if not set in success callback
  if (!context.update) {
    context.update = (delta: number) => {
      if (animationMixer) {
        animationMixer.update(delta);
      }
    };
  }
}
