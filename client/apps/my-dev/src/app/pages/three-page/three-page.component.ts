import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AxThreeComponent, AxCardComponent, MatCardModule, ThreeSceneContext } from '@ui/components';
import { createBasicScene, createMinimalScene, createSimpleWalkingPerson, createDetailedWalkingPerson, createGLTFWalkingPerson } from './three-scene-helpers';

@Component({
  selector: 'app-three-page',
  standalone: true,
  imports: [CommonModule, AxThreeComponent, AxCardComponent, MatCardModule],
  templateUrl: './three-page.component.html',
  styleUrls: ['./three-page.component.scss']
})
export class ThreePageComponent {
  @ViewChild('basicThree') basicThree?: AxThreeComponent;
  @ViewChild('customThree') customThree?: AxThreeComponent;
  @ViewChild('minimalThree') minimalThree?: AxThreeComponent;
  @ViewChild('walkingSimpleThree') walkingSimpleThree?: AxThreeComponent;
  @ViewChild('walkingDetailedThree') walkingDetailedThree?: AxThreeComponent;
  @ViewChild('walkingGltfThree') walkingGltfThree?: AxThreeComponent;
  // Basic scene configuration
  basicConfig = {
    backgroundColor: '#000000',
    cameraPosition: [0, 0, 5] as [number, number, number],
    showGrid: true,
    showAxes: true,
  };

  // Custom scene with different background
  customConfig = {
    backgroundColor: '#1a1a2e',
    cameraPosition: [0, 2, 5] as [number, number, number],
    showGrid: true,
    showAxes: true,
  };

  // Minimal scene without helpers
  minimalConfig = {
    backgroundColor: '#0f0f23',
    cameraPosition: [0, 0, 5] as [number, number, number],
    showGrid: false,
    showAxes: false,
  };

  // Simple walking person
  walkingSimpleConfig = {
    backgroundColor: '#2c3e50',
    cameraPosition: [0, 1.6, 3] as [number, number, number],
    showGrid: true,
    showAxes: false,
  };

  // Detailed walking person
  walkingDetailedConfig = {
    backgroundColor: '#34495e',
    cameraPosition: [0, 1.6, 3] as [number, number, number],
    showGrid: true,
    showAxes: false,
  };

  // GLTF walking person (like three.js example)
  walkingGltfConfig = {
    backgroundColor: '#1a1a2e',
    cameraPosition: [0, 1.6, 3] as [number, number, number],
    showGrid: true,
    showAxes: false,
    modelUrl: 'https://threejs.org/examples/models/gltf/XBot.glb',
  };

  onBasicSceneReady(context: ThreeSceneContext): void {
    createBasicScene(context);
  }

  onCustomSceneReady(context: ThreeSceneContext): void {
    // Custom scene - same as basic for now
    createBasicScene(context);
  }

  onMinimalSceneReady(context: ThreeSceneContext): void {
    createMinimalScene(context);
  }

  onWalkingSimpleReady(context: ThreeSceneContext): void {
    createSimpleWalkingPerson(context);
  }

  onWalkingDetailedReady(context: ThreeSceneContext): void {
    createDetailedWalkingPerson(context);
  }

  onWalkingGltfReady(context: ThreeSceneContext): void {
    createGLTFWalkingPerson(context, this.walkingGltfConfig.modelUrl);
  }
}
