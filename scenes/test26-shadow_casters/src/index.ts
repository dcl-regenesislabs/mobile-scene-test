import {
  engine,
  Transform,
  Entity,
  TransformTypeWithOptionals,
  ParticleSystem,
  PBParticleSystem_Point,
  PBParticleSystem_Sphere,
  PBParticleSystem_Box,
  PBParticleSystem_Cone,
  PBParticleSystem_SimulationSpace,
  MeshRenderer,
  Material,
  PBParticleSystem,
  PBParticleSystem_Burst,
  PBParticleSystem_BurstConfiguration,
  MeshCollider,
  LightSource
} from '@dcl/sdk/ecs'
import { Vector3, Color4, Color3, Quaternion } from '@dcl/sdk/math'
import { createPlatform, createFloorLabel } from '../../../utils/helpers'
import { teleportUi } from '../../../utils/ui';

export function main() {
  const parcelsX = 2
  const parcelsZ = 2

  createPlatform(
    Vector3.create(16, 0.05, 0),
    Vector3.create(16 * parcelsX, 0.1, 16 * parcelsZ),
    Color4.create(0.1, 0.14, 0.1, 1)
  )

  createFloorLabel(
    'TEST 26: Shadow Casters',
    Vector3.create(3, 0.15, 15.5),
    4
  )

  teleportUi()

  createPlatform(
    Vector3.create(24, 7.95, 8),
    Vector3.create(16, 0.1, 16),
    Color4.create(0.1, 0.14, 0.1, 1)
  )

  let block = engine.addEntity()
  Transform.create(block, {
    position: Vector3.create(24, 4, 8),
    scale: Vector3.create(16, 8, 16)
  })
  MeshCollider.setBox(block)

  let sun_sphere = engine.addEntity()
  Transform.create(sun_sphere, {
    position: Vector3.create(24, 1.5, -8),
  })
  MeshRenderer.setSphere(sun_sphere)

  for (let i = 0; i < 15; i++) {
    for (let j = 0; j < 15; j++) {
      let sphere = engine.addEntity()
      Transform.create(sphere, {
        position: Vector3.create(17.5 + i, 3.5, 15.5 - j),
        scale: Vector3.create(0.2, 0.2, 0.2)
      })
      MeshRenderer.setSphere(sphere)

      let light = engine.addEntity()
      Transform.create(light, {
        position: Vector3.create(17.5 + i, 6.5, 15.5 - j),
        rotation: Quaternion.fromAngleAxis(90, Vector3.Right()),
        scale: Vector3.create(0.2, 0.2, 0.2),
      })
      LightSource.create(light, {
        active: true,
        type: LightSource.Type.Spot({ innerAngle: 10, outerAngle: 15 }),
        intensity: 32000,
        color: Color3.White(),
        shadow: true
      })
      MeshRenderer.setCylinder(light)
    }
  }

  console.log('Test 26: Shadow Casters initialized')
}
