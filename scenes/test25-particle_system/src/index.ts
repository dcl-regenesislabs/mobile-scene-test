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
  PBParticleSystem_SimulationSpace
} from '@dcl/sdk/ecs'
import { Vector3, Color4, Color3, Quaternion } from '@dcl/sdk/math'
import { createPlatform, createFloorLabel } from '../../../utils/helpers'
import { teleportUi } from '../../../utils/ui';

type AnyShape = {
  $case: "point";
  point: PBParticleSystem_Point;
} | {
  $case: "sphere";
  sphere: PBParticleSystem_Sphere;
} | {
  $case: "cone";
  cone: PBParticleSystem_Cone;
} | {
  $case: "box";
  box: PBParticleSystem_Box;
}

export function main() {
  const parcelsX = 3
  const parcelsZ = 3

  createPlatform(
    Vector3.create(24, 0.05, -8),
    Vector3.create(16 * parcelsX, 0.1, 16 * parcelsZ),
    Color4.create(0.1, 0.14, 0.1, 1)
  )

  createFloorLabel(
    'TEST 25: Particle System',
    Vector3.create(3, 0.15, 15.5),
    4
  )

  teleportUi()

  const row1Z = 13.5
  {
    createFloorLabel(
      'Row 1: Points',
      Vector3.create(3, 0.15, row1Z),
      3
    )
    const points: [Quaternion, PBParticleSystem_SimulationSpace, number][] = [
      [Quaternion.Identity(), PBParticleSystem_SimulationSpace.PSS_WORLD, 0],
      [Quaternion.fromEulerDegrees(0, 0, 180), PBParticleSystem_SimulationSpace.PSS_WORLD, 0],
      [Quaternion.Identity(), PBParticleSystem_SimulationSpace.PSS_LOCAL, 0],
      [Quaternion.fromEulerDegrees(0, 0, 180), PBParticleSystem_SimulationSpace.PSS_LOCAL, 0],
      [Quaternion.Identity(), PBParticleSystem_SimulationSpace.PSS_WORLD, -1],
      [Quaternion.fromEulerDegrees(0, 0, 180), PBParticleSystem_SimulationSpace.PSS_WORLD, -1],
      [Quaternion.Identity(), PBParticleSystem_SimulationSpace.PSS_LOCAL, -1],
      [Quaternion.fromEulerDegrees(0, 0, 180), PBParticleSystem_SimulationSpace.PSS_LOCAL, -1]
    ]
    const pointShape: AnyShape = {
      $case: "point",
      point: PBParticleSystem_Point
    }
    points.forEach(([rotation, simulation, gravity], index) => {
      let transform: TransformTypeWithOptionals = {
        position: Vector3.create(6 + 4 * index, 1, row1Z),
        rotation
      }

      createParticleSystem(
        transform,
        pointShape,
        simulation,
        gravity
      )
    });
  }

  const row2Z = row1Z - 4
  {
    createFloorLabel(
      'Row 2: Spheres',
      Vector3.create(3, 0.15, row2Z),
      3
    )
    const spheres: [Quaternion, PBParticleSystem_SimulationSpace, number][] = [
      [Quaternion.Identity(), PBParticleSystem_SimulationSpace.PSS_WORLD, 0],
      [Quaternion.fromEulerDegrees(0, 0, 180), PBParticleSystem_SimulationSpace.PSS_WORLD, 0],
      [Quaternion.Identity(), PBParticleSystem_SimulationSpace.PSS_LOCAL, 0],
      [Quaternion.fromEulerDegrees(0, 0, 180), PBParticleSystem_SimulationSpace.PSS_LOCAL, 0],
      [Quaternion.Identity(), PBParticleSystem_SimulationSpace.PSS_WORLD, -1],
      [Quaternion.fromEulerDegrees(0, 0, 180), PBParticleSystem_SimulationSpace.PSS_WORLD, -1],
      [Quaternion.Identity(), PBParticleSystem_SimulationSpace.PSS_LOCAL, -1],
      [Quaternion.fromEulerDegrees(0, 0, 180), PBParticleSystem_SimulationSpace.PSS_LOCAL, -1]
    ]
    const sphereShape: AnyShape = {
      $case: "sphere",
      sphere: { radius: 0.5 }
    }
    spheres.forEach(([rotation, simulation, gravity], index) => {
      let transform: TransformTypeWithOptionals = {
        position: Vector3.create(6 + 4 * index, 1, row2Z),
        rotation
      }

      createParticleSystem(
        transform,
        sphereShape,
        simulation,
        gravity
      )
    });
  }

  const row3Z = row2Z - 4
  {
    createFloorLabel(
      'Row 3: Boxes',
      Vector3.create(3, 0.15, row3Z),
      3
    )
    const boxes: [Quaternion, PBParticleSystem_SimulationSpace, number][] = [
      [Quaternion.Identity(), PBParticleSystem_SimulationSpace.PSS_WORLD, 0],
      [Quaternion.fromEulerDegrees(0, 0, 180), PBParticleSystem_SimulationSpace.PSS_WORLD, 0],
      [Quaternion.Identity(), PBParticleSystem_SimulationSpace.PSS_LOCAL, 0],
      [Quaternion.fromEulerDegrees(0, 0, 180), PBParticleSystem_SimulationSpace.PSS_LOCAL, 0],
      [Quaternion.Identity(), PBParticleSystem_SimulationSpace.PSS_WORLD, -1],
      [Quaternion.fromEulerDegrees(0, 0, 180), PBParticleSystem_SimulationSpace.PSS_WORLD, -1],
      [Quaternion.Identity(), PBParticleSystem_SimulationSpace.PSS_LOCAL, -1],
      [Quaternion.fromEulerDegrees(0, 0, 180), PBParticleSystem_SimulationSpace.PSS_LOCAL, -1]
    ]
    const boxShape: AnyShape = {
      $case: "box",
      box: { size: Vector3.create(2, 1, 1) }
    }
    boxes.forEach(([rotation, simulation, gravity], index) => {
      let transform: TransformTypeWithOptionals = {
        position: Vector3.create(6 + 4 * index, 1, row3Z),
        rotation
      }

      createParticleSystem(
        transform,
        boxShape,
        simulation,
        gravity
      )
    });
  }

  const row4Z = row3Z - 4
  {
    createFloorLabel(
      'Row 4: Cones',
      Vector3.create(3, 0.15, row4Z),
      3
    )
    const cones: [Quaternion, PBParticleSystem_SimulationSpace, number][] = [
      [Quaternion.Identity(), PBParticleSystem_SimulationSpace.PSS_WORLD, 0],
      [Quaternion.fromEulerDegrees(0, 0, 180), PBParticleSystem_SimulationSpace.PSS_WORLD, 0],
      [Quaternion.Identity(), PBParticleSystem_SimulationSpace.PSS_LOCAL, 0],
      [Quaternion.fromEulerDegrees(0, 0, 180), PBParticleSystem_SimulationSpace.PSS_LOCAL, 0],
      [Quaternion.Identity(), PBParticleSystem_SimulationSpace.PSS_WORLD, -1],
      [Quaternion.fromEulerDegrees(0, 0, 180), PBParticleSystem_SimulationSpace.PSS_WORLD, -1],
      [Quaternion.Identity(), PBParticleSystem_SimulationSpace.PSS_LOCAL, -1],
      [Quaternion.fromEulerDegrees(0, 0, 180), PBParticleSystem_SimulationSpace.PSS_LOCAL, -1]
    ]
    const coneShape: AnyShape = {
      $case: "cone",
      cone: { angle: 45, radius: 0.5 }
    }
    cones.forEach(([rotation, simulation, gravity], index) => {
      let transform: TransformTypeWithOptionals = {
        position: Vector3.create(6 + 4 * index, 1, row4Z),
        rotation
      }

      createParticleSystem(
        transform,
        coneShape,
        simulation,
        gravity
      )
    });
  }

  console.log('Test 25: Particle systems initialized')
}

function createParticleSystem(
  transform: TransformTypeWithOptionals,
  shape: AnyShape,
  simulationSpace: PBParticleSystem_SimulationSpace,
  gravity: number
): Entity {
  const particleSystem = engine.addEntity();

  const color = Color4.fromColor3(Color3.Random())

  Transform.create(particleSystem, transform)
  ParticleSystem.create(particleSystem, {
    shape,
    lifetime: 2,
    initialSize: { start: 0.1, end: 0.1 },
    simulationSpace,
    initialColor: { start: color, end: color },
    gravity
  })

  let labelTransform = JSON.parse(JSON.stringify(transform.position))
  labelTransform.y = 0.15
  let simulationSpaceText;
  if (simulationSpace == PBParticleSystem_SimulationSpace.PSS_WORLD) {
    simulationSpaceText = "World"
  } else {
    simulationSpaceText = "Local"
  }
  createFloorLabel(`${shape.$case}\n${simulationSpaceText}\nGravity: ${gravity}`, labelTransform)

  return particleSystem
}