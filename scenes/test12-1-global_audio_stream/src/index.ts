import {
  engine,
  Transform,
  MeshRenderer,
  AudioStream
} from '@dcl/sdk/ecs'
import { Vector3, Color4 } from '@dcl/sdk/math'
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

  let global_stream = engine.addEntity();
  AudioStream.create(global_stream, {
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    playing: true,
    spatial: false,
    volume: 0.25
  });
  Transform.create(global_stream, {
    position: Vector3.create(baseX, 1, baseZ)
  });
  MeshRenderer.setSphere(global_stream);
  createLabel('Global Audio Source', Vector3.create(baseX, 2, baseZ), 1.5);

}
