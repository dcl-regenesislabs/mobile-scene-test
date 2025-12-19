import {
  engine,
  Transform,
  MeshRenderer,
  Material,
  TextShape,
  Billboard,
  TriggerArea,
  triggerAreaEventsSystem,
  MaterialTransparencyMode
} from '@dcl/sdk/ecs'
import { Vector3, Color4, Color3 } from '@dcl/sdk/math'
import { createPlatform, createLabel, TRIGGER_COLOR_OUTSIDE, TRIGGER_COLOR_INSIDE } from '../utils/helpers'

/**
 * TEST 13: BOUNDARY TRIGGER TEST
 * Testing TriggerArea behavior at scene boundaries.
 *
 * A giant 48x48m trigger area placed at parcel -9,-9
 * to test if scene limits properly clip/handle oversized triggers.
 */
export function setupBoundaryTriggerTest() {
  // Position at parcel -9,-9 (each parcel = 16m, so -9 * 16 = -144)
  const baseX = -144
  const baseZ = -144

  createLabel('BOUNDARY TRIGGER TEST\n48x48m trigger at scene edge', Vector3.create(baseX + 8, 10, baseZ + 8), 3)

  // Small platform at the corner so player can stand
  createPlatform(
    Vector3.create(baseX + 4, 0.05, baseZ + 4),
    Vector3.create(8, 0.1, 8),
    Color4.create(0.3, 0.2, 0.2, 1)
  )

  // =========================================================================
  // GIANT TRIGGER AREA (48x48m) - extends well beyond scene limits
  // =========================================================================
  const giantTrigger = engine.addEntity()
  const triggerSize = 48
  const triggerHeight = 20

  // Position so it's centered near the corner but extends outside
  Transform.create(giantTrigger, {
    position: Vector3.create(baseX, triggerHeight / 2, baseZ),
    scale: Vector3.create(triggerSize, triggerHeight, triggerSize)
  })
  MeshRenderer.setBox(giantTrigger)
  Material.setPbrMaterial(giantTrigger, {
    albedoColor: TRIGGER_COLOR_OUTSIDE,
    transparencyMode: MaterialTransparencyMode.MTM_ALPHA_BLEND
  })
  TriggerArea.setBox(giantTrigger)

  // Status label
  const statusLabel = engine.addEntity()
  Transform.create(statusLabel, {
    position: Vector3.create(baseX + 8, 6, baseZ + 8)
  })
  TextShape.create(statusLabel, {
    text: 'TRIGGER STATUS:\nWaiting...',
    fontSize: 6,
    textColor: Color4.White(),
    outlineWidth: 0.2,
    outlineColor: Color3.Black()
  })
  Billboard.create(statusLabel)

  // Event counter
  let enterCount = 0
  let exitCount = 0

  triggerAreaEventsSystem.onTriggerEnter(giantTrigger, () => {
    enterCount++
    TextShape.getMutable(statusLabel).text = `TRIGGER STATUS:\nINSIDE\nEnters: ${enterCount} | Exits: ${exitCount}`
    TextShape.getMutable(statusLabel).textColor = Color4.Green()
    Material.setPbrMaterial(giantTrigger, {
      albedoColor: TRIGGER_COLOR_INSIDE,
      transparencyMode: MaterialTransparencyMode.MTM_ALPHA_BLEND
    })
    console.log(`BOUNDARY TRIGGER: ENTER #${enterCount}`)
  })

  triggerAreaEventsSystem.onTriggerExit(giantTrigger, () => {
    exitCount++
    TextShape.getMutable(statusLabel).text = `TRIGGER STATUS:\nOUTSIDE\nEnters: ${enterCount} | Exits: ${exitCount}`
    TextShape.getMutable(statusLabel).textColor = Color4.Red()
    Material.setPbrMaterial(giantTrigger, {
      albedoColor: TRIGGER_COLOR_OUTSIDE,
      transparencyMode: MaterialTransparencyMode.MTM_ALPHA_BLEND
    })
    console.log(`BOUNDARY TRIGGER: EXIT #${exitCount}`)
  })

  // Corner markers showing trigger boundaries
  const cornerPositions = [
    { x: baseX + 24, z: baseZ + 24, label: 'TRIGGER\nCENTER+24' },
    { x: baseX - 24, z: baseZ, label: 'OUTSIDE\nTRIGGER' },
    { x: baseX, z: baseZ - 24, label: 'OUTSIDE\nTRIGGER' },
    { x: baseX + 24, z: baseZ - 24, label: 'TRIGGER\nEDGE' }
  ]

  cornerPositions.forEach((corner) => {
    const marker = engine.addEntity()
    Transform.create(marker, {
      position: Vector3.create(corner.x, 0.5, corner.z),
      scale: Vector3.create(1, 1, 1)
    })
    MeshRenderer.setBox(marker)
    Material.setPbrMaterial(marker, {
      albedoColor: Color4.create(1, 0.5, 0.2, 1)
    })
    createLabel(corner.label, Vector3.create(corner.x, 2.5, corner.z), 1.4)
  })

  // Info text
  createLabel(
    `TEST: Giant 48x48m trigger at parcel -9,-9\nCentered at (${baseX}, ${baseZ})\nExtends 24m in each direction`,
    Vector3.create(baseX + 8, 1, baseZ + 12),
    1.4
  )

  // Boundary line markers around the trigger area
  for (let i = -24; i <= 24; i += 8) {
    // X-axis markers
    const xMarker = engine.addEntity()
    Transform.create(xMarker, {
      position: Vector3.create(baseX + i, 0.1, baseZ),
      scale: Vector3.create(0.5, 0.1, 0.5)
    })
    MeshRenderer.setBox(xMarker)
    Material.setPbrMaterial(xMarker, {
      albedoColor: Color4.Yellow()
    })

    // Z-axis markers
    const zMarker = engine.addEntity()
    Transform.create(zMarker, {
      position: Vector3.create(baseX, 0.1, baseZ + i),
      scale: Vector3.create(0.5, 0.1, 0.5)
    })
    MeshRenderer.setBox(zMarker)
    Material.setPbrMaterial(zMarker, {
      albedoColor: Color4.Yellow()
    })
  }

  createLabel('TEST 13: Boundary Trigger\n(Parcel -9,-9)', Vector3.create(baseX - 5, 3, baseZ + 4), 2)
}
