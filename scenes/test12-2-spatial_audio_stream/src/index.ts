import {
  engine,
  Transform,
  MeshRenderer,
  AudioStream
} from '@dcl/sdk/ecs'
import { Vector3, Color4, Vector2 } from '@dcl/sdk/math'
import { createPlatform, createLabel } from '../../../utils/helpers'
import { teleportUi } from '../../../utils/ui';

/**
 * TEST 12: AudioStream
 * Testing AudioStream
 */
export function main() {
  const baseX = 8
  const baseZ = 8

  teleportUi()

  // Platform floor for texture tween test area
  createPlatform(
    Vector3.create(baseX, 0.05, baseZ),
    Vector3.create(16, 0.1, 16),
    Color4.create(0.2, 0.35, 0.25, 1)
  )

  let spatial_stream = engine.addEntity();
  AudioStream.create(spatial_stream, {
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    playing: true,
    spatial: true,
    volume: 0.25
  });
  Transform.create(spatial_stream, {
    position: Vector3.create(baseX, 1, baseZ)
  });
  MeshRenderer.setSphere(spatial_stream);
  createLabel('Spatial Audio Source', Vector3.create(baseX, 2, baseZ), 1.5);
}
