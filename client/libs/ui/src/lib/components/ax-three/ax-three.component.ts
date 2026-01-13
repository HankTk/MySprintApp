import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export interface ThreeSceneContext {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls?: OrbitControls;
  clock: THREE.Clock;
  update: (delta: number) => void;
}

/**
 * Reusable Three.js component
 * Provides a 3D scene with customizable camera, lights, and basic setup
 */
@Component({
  selector: 'ax-three',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ax-three.component.html',
  styleUrls: ['./ax-three.component.scss'],
})
export class AxThreeComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() width?: number;
  @Input() height?: number;
  @Input() backgroundColor: string = '#000000';
  @Input() cameraPosition: [number, number, number] = [0, 0, 5];
  @Input() showGrid: boolean = true;
  @Input() showAxes: boolean = true;
  @Input() enableControls: boolean = true;
  @Output() sceneReady = new EventEmitter<ThreeSceneContext>();

  @ViewChild('canvasContainer', { static: false }) canvasContainer?: ElementRef<HTMLDivElement>;

  scene?: THREE.Scene;
  camera?: THREE.PerspectiveCamera;
  renderer?: THREE.WebGLRenderer;
  controls?: OrbitControls;
  private animationId?: number;
  private resizeObserver?: ResizeObserver;
  private clock: THREE.Clock = new THREE.Clock();
  private customUpdate?: (delta: number) => void;

  ngOnInit(): void {
    // Component initialization
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.initThree(), 0);
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  setCustomUpdate(updateFn: (delta: number) => void): void {
    this.customUpdate = updateFn;
  }

  private initThree(): void {
    if (!this.canvasContainer) return;

    const container = this.canvasContainer.nativeElement;
    const containerWidth = this.width || container.clientWidth || 800;
    const containerHeight = this.height || container.clientHeight || 600;

    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(this.backgroundColor);

    // Create camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      containerWidth / containerHeight,
      0.1,
      1000
    );
    this.camera.position.set(...this.cameraPosition);

    // Create renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(containerWidth, containerHeight);
    this.renderer.shadowMap.enabled = true;
    container.appendChild(this.renderer.domElement);

    // Setup resize observer to handle container size changes
    this.setupResizeObserver();

    // Setup OrbitControls for mouse interaction
    if (this.enableControls) {
      this.setupControls();
    }

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);

    // Add grid helper
    if (this.showGrid) {
      const gridHelper = new THREE.GridHelper(10, 10);
      this.scene.add(gridHelper);
    }

    // Add axes helper
    if (this.showAxes) {
      const axesHelper = new THREE.AxesHelper(5);
      this.scene.add(axesHelper);
    }

    // Emit scene ready event with context
    const context: ThreeSceneContext = {
      scene: this.scene,
      camera: this.camera,
      renderer: this.renderer,
      controls: this.controls,
      clock: this.clock,
      update: (delta: number) => {
        if (this.customUpdate) {
          this.customUpdate(delta);
        }
      }
    };
    this.sceneReady.emit(context);

    // Start animation loop
    this.animate();
  }

  private setupResizeObserver(): void {
    if (!this.canvasContainer || !this.renderer || !this.camera) return;

    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        const height = entry.contentRect.height;

        if (width > 0 && height > 0) {
          this.camera!.aspect = width / height;
          this.camera!.updateProjectionMatrix();
          this.renderer!.setSize(width, height);
        }
      }
    });

    this.resizeObserver.observe(this.canvasContainer.nativeElement);
  }

  private setupControls(): void {
    if (!this.camera || !this.renderer) return;

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true; // 慣性効果を有効にする
    this.controls.dampingFactor = 0.05; // 慣性の強さを設定
    this.controls.screenSpacePanning = false;
    this.controls.minDistance = 2;
    this.controls.maxDistance = 50;
    this.controls.maxPolarAngle = Math.PI; // 上下の回転制限を解除
    this.controls.enableZoom = true;
    this.controls.enablePan = true;
  }

  private animate = (): void => {
    if (!this.renderer || !this.scene || !this.camera) return;

    this.animationId = requestAnimationFrame(this.animate);

    const delta = this.clock.getDelta();

    // Update controls (required for damping)
    if (this.controls) {
      this.controls.update();
    }

    // Call custom update function if provided
    if (this.customUpdate) {
      this.customUpdate(delta);
    }

    this.renderer.render(this.scene, this.camera);
  };

  private cleanup(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = undefined;
    }

    if (this.controls) {
      this.controls.dispose();
      this.controls = undefined;
    }

    if (this.renderer) {
      this.renderer.dispose();
      if (this.canvasContainer?.nativeElement) {
        const canvas = this.renderer.domElement;
        if (canvas.parentNode) {
          canvas.parentNode.removeChild(canvas);
        }
      }
    }

    if (this.scene) {
      this.scene.traverse((object: THREE.Object3D) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (object.material instanceof THREE.Material) {
            object.material.dispose();
          }
        }
      });
    }
  }
}
