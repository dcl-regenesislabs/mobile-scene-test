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
  PBParticleSystem_Burst
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
  const parcelsZ = 4

  createPlatform(
    Vector3.create(24, 0.05, -16),
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
    points.forEach(([rotation, simulationSpace, gravity], index) => {
      let transform: TransformTypeWithOptionals = {
        position: Vector3.create(6 + 4 * index, 1, row1Z),
        rotation
      }
      const color = Color4.fromColor3(Color3.Random())

      createParticleSystem(
        transform,
        {
          shape: pointShape,
          lifetime: 2,
          initialSize: { start: 0.1, end: 0.1 },
          simulationSpace,
          initialColor: { start: color, end: color },
          gravity
        },
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
    spheres.forEach(([rotation, simulationSpace, gravity], index) => {
      let transform: TransformTypeWithOptionals = {
        position: Vector3.create(6 + 4 * index, 1, row2Z),
        rotation
      }
      const color = Color4.fromColor3(Color3.Random())

      createParticleSystem(
        transform,
        {
          shape: sphereShape,
          lifetime: 2,
          initialSize: { start: 0.1, end: 0.1 },
          simulationSpace,
          initialColor: { start: color, end: color },
          gravity
        },
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
    boxes.forEach(([rotation, simulationSpace, gravity], index) => {
      let transform: TransformTypeWithOptionals = {
        position: Vector3.create(6 + 4 * index, 1, row3Z),
        rotation
      }
      const color = Color4.fromColor3(Color3.Random())

      createParticleSystem(
        transform,
        {
          shape: boxShape,
          lifetime: 2,
          initialSize: { start: 0.1, end: 0.1 },
          simulationSpace,
          initialColor: { start: color, end: color },
          gravity
        },
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
    cones.forEach(([rotation, simulationSpace, gravity], index) => {
      let transform: TransformTypeWithOptionals = {
        position: Vector3.create(6 + 4 * index, 1, row4Z),
        rotation
      }
      const color = Color4.fromColor3(Color3.Random())

      createParticleSystem(
        transform,
        {
          shape: coneShape,
          lifetime: 2,
          initialSize: { start: 0.1, end: 0.1 },
          simulationSpace,
          initialColor: { start: color, end: color },
          gravity
        },
      )
    });
  }

  const row5Z = row4Z - 8
  {
    createFloorLabel(
      'Row 5: Huge Cones',
      Vector3.create(3, 0.15, row5Z),
      3
    )
    const cones: [Quaternion, PBParticleSystem_SimulationSpace, number][] = [
      [Quaternion.fromEulerDegrees(90, 0, 0), PBParticleSystem_SimulationSpace.PSS_WORLD, 0],
      [Quaternion.fromEulerDegrees(90, 0, 0), PBParticleSystem_SimulationSpace.PSS_LOCAL, 0],
    ]
    const coneShape: AnyShape = {
      $case: "cone",
      cone: { angle: 45, radius: 3 }
    }
    cones.forEach(([rotation, simulationSpace, gravity], index) => {
      let transform: TransformTypeWithOptionals = {
        position: Vector3.create(10 + 8 * index, 1, row5Z),
        rotation
      }
      const color = Color4.fromColor3(Color3.Random())

      createParticleSystem(
        transform,
        {
          shape: coneShape,
          lifetime: 2,
          initialSize: { start: 0.1, end: 0.1 },
          simulationSpace,
          initialColor: { start: color, end: color },
          gravity
        },
      )
    });
  }

  const row6Z = row5Z - 8
  {
    createFloorLabel(
      'Row 6: Cones Angles',
      Vector3.create(3, 0.15, row6Z),
      3
    )
    const cones: [Quaternion, PBParticleSystem_SimulationSpace, number][] = [
      [Quaternion.Identity(), PBParticleSystem_SimulationSpace.PSS_WORLD, 0],
      [Quaternion.Identity(), PBParticleSystem_SimulationSpace.PSS_WORLD, 15],
      [Quaternion.Identity(), PBParticleSystem_SimulationSpace.PSS_WORLD, 30],
      [Quaternion.Identity(), PBParticleSystem_SimulationSpace.PSS_WORLD, 45],
      [Quaternion.Identity(), PBParticleSystem_SimulationSpace.PSS_WORLD, 60],
      [Quaternion.Identity(), PBParticleSystem_SimulationSpace.PSS_WORLD, 90],
    ]
    cones.forEach(([rotation, simulationSpace, angle], index) => {
      const coneShape: AnyShape = {
        $case: "cone",
        cone: { angle: angle, radius: 0.5 }
      }
      let transform: TransformTypeWithOptionals = {
        position: Vector3.create(6 + 4 * index, 1, row6Z),
        rotation
      }
      const color = Color4.fromColor3(Color3.Random())

      createParticleSystem(
        transform,
        {
          shape: coneShape,
          lifetime: 2,
          initialSize: { start: 0.1, end: 0.1 },
          simulationSpace,
          initialColor: { start: color, end: color },
          gravity: 0
        },
        `Angle: ${angle}`
      )
    });
  }

  const row7Z = row6Z - 4
  {
    createFloorLabel(
      'Row 7: Initial Rotation\nBillboard OFF',
      Vector3.create(3, 0.15, row7Z),
      3
    )
    const cones: [Quaternion, PBParticleSystem_SimulationSpace, number, number, number][] = [
      [Quaternion.Identity(), PBParticleSystem_SimulationSpace.PSS_WORLD, 0, 0, 0],
      [Quaternion.Identity(), PBParticleSystem_SimulationSpace.PSS_WORLD, 30, 0, 0],
      [Quaternion.Identity(), PBParticleSystem_SimulationSpace.PSS_WORLD, 45, 0, 0],
      [Quaternion.Identity(), PBParticleSystem_SimulationSpace.PSS_WORLD, 0, 30, 0],
      [Quaternion.Identity(), PBParticleSystem_SimulationSpace.PSS_WORLD, 0, 45, 0],
      [Quaternion.Identity(), PBParticleSystem_SimulationSpace.PSS_WORLD, 0, 0, 30],
      [Quaternion.Identity(), PBParticleSystem_SimulationSpace.PSS_WORLD, 0, 0, 45],
      [Quaternion.Identity(), PBParticleSystem_SimulationSpace.PSS_WORLD, 45, 45, 45],
    ]
    cones.forEach(([rotation, simulationSpace, x, y, z], index) => {
      const boxShape: AnyShape = {
        $case: "box",
        box: { size: Vector3.create(4, 2, 2) }
      }
      let transform: TransformTypeWithOptionals = {
        position: Vector3.create(6 + 4 * index, 1, row7Z),
        rotation
      }
      const color = Color4.fromColor3(Color3.Random())

      createParticleSystem(
        transform,
        {
          shape: boxShape,
          lifetime: 2,
          initialSize: { start: 0.1, end: 0.1 },
          simulationSpace,
          initialColor: { start: color, end: color },
          gravity: 0,
          initialRotation: Quaternion.fromEulerDegrees(x, y, z),
          billboard: false
        },
        `Rotation: (${x}, ${y}, ${z})`
      )
    });
  }

  const row8Z = row7Z - 4
  {
    createFloorLabel(
      'Row 8: Initial Rotation\nBillboard ON',
      Vector3.create(3, 0.15, row8Z),
      3
    )
    const cones: [Quaternion, PBParticleSystem_SimulationSpace, number, number, number][] = [
      [Quaternion.Identity(), PBParticleSystem_SimulationSpace.PSS_WORLD, 0, 0, 0],
      [Quaternion.Identity(), PBParticleSystem_SimulationSpace.PSS_WORLD, 30, 0, 0],
      [Quaternion.Identity(), PBParticleSystem_SimulationSpace.PSS_WORLD, 45, 0, 0],
      [Quaternion.Identity(), PBParticleSystem_SimulationSpace.PSS_WORLD, 0, 30, 0],
      [Quaternion.Identity(), PBParticleSystem_SimulationSpace.PSS_WORLD, 0, 45, 0],
      [Quaternion.Identity(), PBParticleSystem_SimulationSpace.PSS_WORLD, 0, 0, 30],
      [Quaternion.Identity(), PBParticleSystem_SimulationSpace.PSS_WORLD, 0, 0, 45],
      [Quaternion.Identity(), PBParticleSystem_SimulationSpace.PSS_WORLD, 45, 45, 45],
    ]
    cones.forEach(([rotation, simulationSpace, x, y, z], index) => {
      const boxShape: AnyShape = {
        $case: "box",
        box: { size: Vector3.create(4, 2, 2) }
      }
      let transform: TransformTypeWithOptionals = {
        position: Vector3.create(6 + 4 * index, 1, row8Z),
        rotation
      }
      const color = Color4.fromColor3(Color3.Random())

      createParticleSystem(
        transform,
        {
          shape: boxShape,
          lifetime: 2,
          initialSize: { start: 0.1, end: 0.1 },
          simulationSpace,
          initialColor: { start: color, end: color },
          gravity: 0,
          initialRotation: Quaternion.fromEulerDegrees(x, y, z),
          billboard: true
        },
        `Rotation: (${x}, ${y}, ${z})`
      )
    });
  }

  const row9Z = row8Z - 4
  {
    createFloorLabel(
      'Row 9: Initial Rotation\nFace Travel Direction ON',
      Vector3.create(3, 0.15, row9Z),
      3
    )
    const cones: [Quaternion, PBParticleSystem_SimulationSpace, number, number, number][] = [
      [Quaternion.Identity(), PBParticleSystem_SimulationSpace.PSS_WORLD, 0, 0, 0],
      [Quaternion.Identity(), PBParticleSystem_SimulationSpace.PSS_WORLD, 30, 0, 0],
      [Quaternion.Identity(), PBParticleSystem_SimulationSpace.PSS_WORLD, 45, 0, 0],
      [Quaternion.Identity(), PBParticleSystem_SimulationSpace.PSS_WORLD, 0, 30, 0],
      [Quaternion.Identity(), PBParticleSystem_SimulationSpace.PSS_WORLD, 0, 45, 0],
      [Quaternion.Identity(), PBParticleSystem_SimulationSpace.PSS_WORLD, 0, 0, 30],
      [Quaternion.Identity(), PBParticleSystem_SimulationSpace.PSS_WORLD, 0, 0, 45],
      [Quaternion.Identity(), PBParticleSystem_SimulationSpace.PSS_WORLD, 45, 45, 45],
    ]
    cones.forEach(([rotation, simulationSpace, x, y, z], index) => {
      const boxShape: AnyShape = {
        $case: "box",
        box: { size: Vector3.create(4, 2, 2) }
      }
      let transform: TransformTypeWithOptionals = {
        position: Vector3.create(6 + 4 * index, 1, row9Z),
        rotation
      }
      const color = Color4.fromColor3(Color3.Random())

      createParticleSystem(
        transform,
        {
          shape: boxShape,
          lifetime: 2,
          initialSize: { start: 0.1, end: 0.1 },
          simulationSpace,
          initialColor: { start: color, end: color },
          gravity: 0,
          initialRotation: Quaternion.fromEulerDegrees(x, y, z),
          billboard: false,
          faceTravelDirection: true
        },
        `Rotation: (${x}, ${y}, ${z})`
      )
    });
  }

  const row10Z = row9Z - 4
  {
    createFloorLabel(
      'Row 10: Rotate Over Time',
      Vector3.create(3, 0.15, row10Z),
      3
    )
    const cones: [Quaternion, PBParticleSystem_SimulationSpace, number, number, number][] = [
      [Quaternion.Identity(), PBParticleSystem_SimulationSpace.PSS_WORLD, 0, 0, 0],
      [Quaternion.Identity(), PBParticleSystem_SimulationSpace.PSS_WORLD, 30, 0, 0],
      [Quaternion.Identity(), PBParticleSystem_SimulationSpace.PSS_WORLD, 45, 0, 0],
      [Quaternion.Identity(), PBParticleSystem_SimulationSpace.PSS_WORLD, 0, 30, 0],
      [Quaternion.Identity(), PBParticleSystem_SimulationSpace.PSS_WORLD, 0, 45, 0],
      [Quaternion.Identity(), PBParticleSystem_SimulationSpace.PSS_WORLD, 0, 0, 30],
      [Quaternion.Identity(), PBParticleSystem_SimulationSpace.PSS_WORLD, 0, 0, 45],
      [Quaternion.Identity(), PBParticleSystem_SimulationSpace.PSS_WORLD, 45, 45, 45],
    ]
    cones.forEach(([rotation, simulationSpace, x, y, z], index) => {
      const boxShape: AnyShape = {
        $case: "box",
        box: { size: Vector3.create(4, 2, 2) }
      }
      let transform: TransformTypeWithOptionals = {
        position: Vector3.create(6 + 4 * index, 1, row10Z),
        rotation
      }
      const color = Color4.fromColor3(Color3.Random())

      createParticleSystem(
        transform,
        {
          shape: boxShape,
          lifetime: 2,
          initialSize: { start: 0.1, end: 0.1 },
          simulationSpace,
          initialColor: { start: color, end: color },
          gravity: 0,
          rotationOverTime: Quaternion.fromEulerDegrees(x, y, z),
          billboard: false
        },
        `Rotation: (${x}, ${y}, ${z})`
      )
    });
  }

  const row11Z = row10Z - 4
  {
    createFloorLabel(
      'Row 11: Weird Values',
      Vector3.create(3, 0.15, row11Z),
      3
    )
    const boxShape: AnyShape = {
      $case: "box",
      box: { size: Vector3.create(4, 2, 2) }
    }
    const boxes: [PBParticleSystem_Burst, string][] = [
      [
        {
          time: 0.,
          count: 25,
          cycles: 10,
          interval: Number.NaN
        },
        "Burst with\nNaN intervals"
      ],
      [
        {
          time: 0.,
          count: 25,
          cycles: 10,
          interval: Number.POSITIVE_INFINITY
        },
        "Burst with\n+Infinite intervals"
      ],
      [
        {
          time: 0.,
          count: 25,
          cycles: 10,
          interval: Number.NEGATIVE_INFINITY
        },
        "Burst with\n-Infinite intervals"
      ],
    ]
    boxes.forEach(([burst, label], index) => {
      let transform: TransformTypeWithOptionals = {
        position: Vector3.create(6 + 4 * index, 1, row11Z),
      }
      const color = Color4.fromColor3(Color3.Random())

      createParticleSystem(
        transform,
        {
          shape: boxShape,
          rate: 0,
          lifetime: 2,
          initialColor: { start: color, end: color },
          initialSize: { start: 0.1, end: 0.1 },
          simulationSpace: PBParticleSystem_SimulationSpace.PSS_WORLD,
          gravity: 0,
          billboard: true,
          bursts: {
            values: [
              burst
            ]
          }
        },
        label
      )
    });
  }

  console.log('Test 25: Particle systems initialized')
}

function createParticleSystem(
  transform: TransformTypeWithOptionals,
  particle: PBParticleSystem,
  label: string | undefined = undefined
): Entity {
  const particleSystem = engine.addEntity();

  if (!particle.shape) {
    particle.shape = ParticleSystem.Shape.Point()
  }
  if (!particle.shape) {
    return particleSystem
  }

  Transform.create(particleSystem, transform)
  ParticleSystem.create(particleSystem, particle)
  const mesh = engine.addEntity()
  if (particle.shape.$case == "point") {
    Transform.create(mesh, { scale: Vector3.create(0.1, 0.1, 0.1), parent: particleSystem });
    MeshRenderer.setSphere(mesh)
  } else if (particle.shape.$case == "sphere") {
    Transform.create(mesh, { scale: Vector3.create(particle.shape.sphere.radius, particle.shape.sphere.radius, particle.shape.sphere.radius), parent: particleSystem });
    MeshRenderer.setSphere(mesh)
  } else if (particle.shape.$case == "box") {
    Transform.create(mesh, { scale: Vector3.create(particle.shape.box.size?.x, particle.shape.box.size?.y, particle.shape.box.size?.z), parent: particleSystem });
    MeshRenderer.setBox(mesh)
  } else if (particle.shape.$case == "cone") {
    Transform.create(mesh, {
      rotation: Quaternion.fromEulerDegrees(90, 0, 0),
      scale: Vector3.create(particle.shape.cone.radius, 1 / 256, particle.shape.cone.radius),
      parent: particleSystem
    });
    MeshRenderer.setCylinder(mesh)
  }
  Material.setPbrMaterial(mesh, {
    albedoColor: Color4.create(1, 1, 1, 0.125)
  })

  let labelTransform = JSON.parse(JSON.stringify(transform.position))
  labelTransform.y = 0.15
  if (!label) {
    let simulationSpaceText;
    if (particle.simulationSpace == PBParticleSystem_SimulationSpace.PSS_WORLD) {
      simulationSpaceText = "World"
    } else {
      simulationSpaceText = "Local"
    }
    let rotationText;
    if (!transform.rotation) {
      rotationText = "Undefined"
    } else if (Quaternion.dot(transform.rotation, Quaternion.Identity()) >= 1.) {
      rotationText = "Identity"
    } else {
      rotationText = "Rotated"
    }
    label = `${particle.shape.$case}\n${simulationSpaceText}\nRotation: ${rotationText}\nGravity: ${particle.gravity}`;
  }
  createFloorLabel(label, labelTransform)

  return particleSystem
}
