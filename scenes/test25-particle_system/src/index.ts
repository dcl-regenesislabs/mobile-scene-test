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
  PBParticleSystem_BurstConfiguration
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
  row1(row1Z)

  const row2Z = row1Z - 4
  row2(row2Z)

  const row3Z = row2Z - 4
  row3(row3Z)

  const row4Z = row3Z - 4
  row4(row4Z)

  const row5Z = row4Z - 8
  row5(row5Z)

  const row6Z = row5Z - 8
  row6(row6Z)

  const row7Z = row6Z - 4
  row7(row7Z)

  const row8Z = row7Z - 4
  row8(row8Z)

  const row9Z = row8Z - 4
  row9(row9Z)

  const row10Z = row9Z - 4
  row10(row10Z)

  const row11Z = row10Z - 4
  row11(row11Z)

  const row12Z = row11Z - 4
  row12(row12Z)

  const row13Z = row12Z - 4
  row13(row13Z)

  console.log('Test 25: Particle systems initialized')
}

function row1(z: number) {
  createFloorLabel(
    'Row 1: Points',
    Vector3.create(3, 0.15, z),
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
      position: Vector3.create(6 + 4 * index, 1, z),
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

function row2(z: number) {
  createFloorLabel(
    'Row 2: Spheres',
    Vector3.create(3, 0.15, z),
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
      position: Vector3.create(6 + 4 * index, 1, z),
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

function row3(z: number) {
  createFloorLabel(
    'Row 3: Boxes',
    Vector3.create(3, 0.15, z),
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
      position: Vector3.create(6 + 4 * index, 1, z),
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

function row4(z: number) {
  createFloorLabel(
    'Row 4: Cones',
    Vector3.create(3, 0.15, z),
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
      position: Vector3.create(6 + 4 * index, 1, z),
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

function row5(z: number) {
  createFloorLabel(
    'Row 5: Huge Cones',
    Vector3.create(3, 0.15, z),
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
      position: Vector3.create(10 + 8 * index, 1, z),
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

function row6(z: number) {
  createFloorLabel(
    'Row 6: Cones Angles',
    Vector3.create(3, 0.15, z),
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
      position: Vector3.create(6 + 4 * index, 1, z),
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

function row7(z: number) {
  createFloorLabel(
    'Row 7: Initial Rotation\nBillboard OFF',
    Vector3.create(3, 0.15, z),
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
  cones.forEach(([rotation, simulationSpace, rx, ry, rz], index) => {
    const boxShape: AnyShape = {
      $case: "box",
      box: { size: Vector3.create(4, 2, 2) }
    }
    let transform: TransformTypeWithOptionals = {
      position: Vector3.create(6 + 4 * index, 1, z),
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
        initialRotation: Quaternion.fromEulerDegrees(rx, ry, rz),
        billboard: false
      },
      `Rotation: (${rx}, ${ry}, ${rz})`
    )
  });
}

function row8(z: number) {
  createFloorLabel(
    'Row 8: Initial Rotation\nBillboard ON',
    Vector3.create(3, 0.15, z),
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
  cones.forEach(([rotation, simulationSpace, rx, ry, rz], index) => {
    const boxShape: AnyShape = {
      $case: "box",
      box: { size: Vector3.create(4, 2, 2) }
    }
    let transform: TransformTypeWithOptionals = {
      position: Vector3.create(6 + 4 * index, 1, z),
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
        initialRotation: Quaternion.fromEulerDegrees(rx, ry, rz),
        billboard: true
      },
      `Rotation: (${rx}, ${ry}, ${rz})`
    )
  });
}

function row9(z: number) {
  createFloorLabel(
    'Row 9: Initial Rotation\nFace Travel Direction ON',
    Vector3.create(3, 0.15, z),
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
  cones.forEach(([rotation, simulationSpace, rx, ry, rz], index) => {
    const boxShape: AnyShape = {
      $case: "box",
      box: { size: Vector3.create(4, 2, 2) }
    }
    let transform: TransformTypeWithOptionals = {
      position: Vector3.create(6 + 4 * index, 1, z),
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
        initialRotation: Quaternion.fromEulerDegrees(rx, ry, rz),
        billboard: false,
        faceTravelDirection: true
      },
      `Rotation: (${rx}, ${ry}, ${rz})`
    )
  });
}

function row10(z: number) {
  createFloorLabel(
    'Row 10: Rotate Over Time',
    Vector3.create(3, 0.15, z),
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
  cones.forEach(([rotation, simulationSpace, rx, ry, rz], index) => {
    const boxShape: AnyShape = {
      $case: "box",
      box: { size: Vector3.create(4, 2, 2) }
    }
    let transform: TransformTypeWithOptionals = {
      position: Vector3.create(6 + 4 * index, 1, z),
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
        rotationOverTime: Quaternion.fromEulerDegrees(rx, ry, rz),
        billboard: false
      },
      `Rotation: (${rx}, ${ry}, ${rz})`
    )
  });
}

function row11(z: number) {
  createFloorLabel(
    'Row 11: Weird Values',
    Vector3.create(3, 0.15, z),
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
      position: Vector3.create(6 + 4 * index, 1, z),
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

function row12(z: number) {
  createFloorLabel(
    'Row 12: Additional Force',
    Vector3.create(3, 0.15, z),
    3
  )
  const boxShape: AnyShape = {
    $case: "box",
    box: { size: Vector3.create(4, 2, 2) }
  }
  const boxes: [Vector3, PBParticleSystem_SimulationSpace][] = [
    [
      Vector3.create(1, 0, 0),
      PBParticleSystem_SimulationSpace.PSS_WORLD
    ],
    [
      Vector3.create(1, 0, 0),
      PBParticleSystem_SimulationSpace.PSS_LOCAL
    ],
    [
      Vector3.create(0, 1, 0),
      PBParticleSystem_SimulationSpace.PSS_WORLD
    ],
    [
      Vector3.create(0, 1, 0),
      PBParticleSystem_SimulationSpace.PSS_LOCAL
    ],
    [
      Vector3.create(0, 0, 1),
      PBParticleSystem_SimulationSpace.PSS_WORLD
    ],
    [
      Vector3.create(0, 0, 1),
      PBParticleSystem_SimulationSpace.PSS_LOCAL
    ],
  ]
  boxes.forEach(([additionalForce, simulationSpace], index) => {
    let transform: TransformTypeWithOptionals = {
      position: Vector3.create(6 + 4 * index, 1, z),
      rotation: Quaternion.fromEulerDegrees(90, 0, 0)
    }
    const color = Color4.fromColor3(Color3.Random())

    let simulationSpaceText;
    if (simulationSpace == PBParticleSystem_SimulationSpace.PSS_WORLD) {
      simulationSpaceText = "World"
    } else {
      simulationSpaceText = "Local"
    }

    createParticleSystem(
      transform,
      {
        shape: boxShape,
        rate: 10,
        lifetime: 2,
        maxParticles: 300,
        initialColor: { start: color, end: color },
        initialSize: { start: 0.1, end: 0.1 },
        initialVelocitySpeed: { start: 0, end: 0 },
        simulationSpace,
        additionalForce,
        gravity: 0,
        billboard: true,
      },
      `Aditional Force: ${JSON.stringify(additionalForce)}\n${simulationSpaceText}`
    )
  });
}

function row13(z: number) {
  createFloorLabel(
    'Row 13: Bursts',
    Vector3.create(3, 0.15, z),
    3
  )
  const coneShape: AnyShape = {
    $case: "cone",
    cone: { radius: 0.5, angle: 0 }
  }
  const cones: [PBParticleSystem_BurstConfiguration][] = [
    [{
      values: [{ time: 0, count: 10, cycles: 2, interval: 0.5 }]
    }],
    [{
      values: [{ time: 0, count: 10, cycles: 2, interval: 0.5 }, { time: 5, count: 50, cycles: 2, interval: 0.5 }]
    }],
    [{
      values: [{ time: 0, count: 10, cycles: 2, interval: 0.5 }, { time: 10, count: 50, cycles: 2, interval: 0.5 }]
    }],
    [{
      values: [{ time: 0, count: 10, cycles: 2, interval: 0.5 }, { time: 15, count: 50, cycles: 2, interval: 0.5 }]
    }],
    [{
      values: [
        { time: 0, count: 10, cycles: 2, interval: 0.5 },
        { time: 5, count: 50, cycles: 2, interval: 0.5 },
        { time: 10, count: 100, cycles: 2, interval: 0.5 },
        { time: 15, count: 500, cycles: 2, interval: 0.5 }
      ]
    }],
  ]
  cones.forEach(([bursts], index) => {
    let transform: TransformTypeWithOptionals = {
      position: Vector3.create(6 + 4 * index, 1, z),
      rotation: Quaternion.fromEulerDegrees(-90, 0, 0)
    }
    const color = Color4.fromColor3(Color3.Random())

    let label = ""
    bursts.values.forEach((element, index) => {
      if (index != 0) {
        label += `\n`
      }
      label += `Time: ${element.time}`
    });

    createParticleSystem(
      transform,
      {
        shape: coneShape,
        rate: 0,
        lifetime: 2,
        maxParticles: 1000,
        initialColor: { start: color, end: color },
        initialSize: { start: 0.1, end: 0.1 },
        initialVelocitySpeed: { start: 1, end: 1 },
        gravity: 0,
        billboard: true,
        bursts
      },
      label
    )
  });
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
