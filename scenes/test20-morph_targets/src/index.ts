import {
  engine,
  Transform,
  GltfContainer
} from '@dcl/sdk/ecs'
import { Vector3, Color4 } from '@dcl/sdk/math'
import { ReactEcsRenderer } from '@dcl/sdk/react-ecs';
import { createPlatform, createLabel } from '../../../utils/helpers'
import { uiMenu } from '../../../utils/ui';

/**
 * TEST 20: Morph Targets
 * Display models with morph target (blend shape) animations
 */
export function main() {
  // Grid position: Row 1, Column 2
  const baseX = 8
  const baseZ = 8
  const yPos = 1
  const labelSize = 1.2
  const labelSizeBig = 1.5

  // Platform
  createPlatform(
    Vector3.create(baseX, 0.05, baseZ),
    Vector3.create(16, 0.1, 16),
    Color4.create(0.2, 0.22, 0.2, 1)
  )

  createLabel('TEST 20: MORPH TARGETS\n(Blend Shape Animations)', Vector3.create(baseX, 5, baseZ - 10), labelSizeBig)

  ReactEcsRenderer.setUiRenderer(uiMenu, { virtualWidth: 1920, virtualHeight: 1080 })

  // AnimatedCubeMorph
  const cubeMorph = engine.addEntity()
  Transform.create(cubeMorph, {
    position: Vector3.create(baseX - 6, yPos, baseZ),
    scale: Vector3.create(1.5, 1.5, 1.5)
  })
  GltfContainer.create(cubeMorph, { src: 'assets/models/animated/AnimatedCubeMorph.glb' })
  createLabel('GltfContainer:\nAnimatedCubeMorph.glb\n(morphing cube shape)', Vector3.create(baseX - 6, yPos + 2.5, baseZ), labelSize)

  // AnimatedSphereMorph
  const sphereMorph = engine.addEntity()
  Transform.create(sphereMorph, {
    position: Vector3.create(baseX + 6, yPos, baseZ),
    scale: Vector3.create(1.5, 1.5, 1.5)
  })
  GltfContainer.create(sphereMorph, { src: 'assets/models/animated/AnimatedSphereMorph.glb' })
  createLabel('GltfContainer:\nAnimatedSphereMorph.glb\n(morphing sphere shape)', Vector3.create(baseX + 6, yPos + 2.5, baseZ), labelSize)

  // Explanation label
  createLabel(
    'Morph targets (blend shapes)\nallow smooth vertex transitions\nbetween mesh shapes using\nweights from 0.0 to 1.0',
    Vector3.create(baseX, yPos + 1, baseZ + 6),
    labelSize
  )

  console.log('Test 20: Morph Targets initialized at X:', baseX, 'Z:', baseZ)
}
