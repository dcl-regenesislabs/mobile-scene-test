import {
  engine,
  Transform,
  MeshRenderer,
  MeshCollider,
  Material,
  PointerEvents,
  PointerEventType,
  inputSystem,
  InputAction,
  Entity
} from '@dcl/sdk/ecs'
import { Vector3, Color4 } from '@dcl/sdk/math'
import { movePlayerTo } from '~system/RestrictedActions'
import { createPlatform, createLabel } from '../utils/helpers'

// Helper to get LOCAL player position (engine.PlayerEntity is the local player)
function getLocalPlayerPosition(): Vector3 | null {
  if (Transform.has(engine.PlayerEntity)) {
    const transform = Transform.get(engine.PlayerEntity)
    if (transform && transform.position) {
      return transform.position
    }
  }
  return null
}

/**
 * TEST 9: WALL TELEPORT TEST - Testing movePlayerTo into solid objects
 * Located in negative Z parcels
 */
export function setupTeleportTest() {
  const wallTestX = 8
  const wallTestZ = -40
  const wallSize = 6

  createLabel('WALL TELEPORT TEST\n(teleport into solid box)', Vector3.create(wallTestX, 8, wallTestZ), 1.5)

  // Platform for the test area
  createPlatform(
    Vector3.create(wallTestX + 10, 0.05, wallTestZ),
    Vector3.create(50, 0.1, 30),
    Color4.create(0.25, 0.25, 0.25, 1)
  )

  // The solid wall/box to teleport into
  const wallBox = engine.addEntity()
  Transform.create(wallBox, {
    position: Vector3.create(wallTestX, wallSize / 2, wallTestZ),
    scale: Vector3.create(wallSize, wallSize, wallSize)
  })
  MeshRenderer.setBox(wallBox)
  MeshCollider.setBox(wallBox)
  Material.setPbrMaterial(wallBox, {
    albedoColor: Color4.create(0.6, 0.2, 0.2, 1)
  })
  createLabel('SOLID BOX', Vector3.create(wallTestX, wallSize + 1, wallTestZ), 1)

  // Safe area marker
  const safeAreaPos = Vector3.create(wallTestX, 1, wallTestZ + 15)
  const safeMarker = engine.addEntity()
  Transform.create(safeMarker, {
    position: Vector3.create(safeAreaPos.x, 0.1, safeAreaPos.z),
    scale: Vector3.create(3, 0.1, 3)
  })
  MeshRenderer.setBox(safeMarker)
  Material.setPbrMaterial(safeMarker, {
    albedoColor: Color4.create(0.2, 0.8, 0.2, 1)
  })
  createLabel('SAFE AREA\n(return here)', Vector3.create(safeAreaPos.x, 1.5, safeAreaPos.z), 0.8)

  // 14 teleport depths: from 1m outside to 4m inside (past center)
  const teleportDepths = [
    { label: '-1.0m\nOUTSIDE', depth: -1.0 },
    { label: '-0.5m\nOUTSIDE', depth: -0.5 },
    { label: '0m\nEDGE', depth: 0 },
    { label: '0.25m', depth: 0.25 },
    { label: '0.5m', depth: 0.5 },
    { label: '0.75m', depth: 0.75 },
    { label: '1.0m', depth: 1.0 },
    { label: '1.5m', depth: 1.5 },
    { label: '2.0m', depth: 2.0 },
    { label: '2.5m', depth: 2.5 },
    { label: '3.0m\nCENTER', depth: 3.0 },
    { label: '3.5m', depth: 3.5 },
    { label: '4.0m', depth: 4.0 },
    { label: '5.0m\nTHROUGH', depth: 5.0 }
  ]

  // Store all button entities and their target positions
  const teleportButtons: { entity: Entity, targetX: number, targetY: number, targetZ: number }[] = []

  // Create teleport buttons arranged in a line on the +X side of the box
  const buttonStartX = wallTestX + wallSize / 2 + 2
  const buttonY = 0.5
  const buttonSpacing = 1.8

  teleportDepths.forEach((tp, index) => {
    const buttonX = buttonStartX + index * buttonSpacing
    const buttonZ = wallTestZ

    // Create button
    const button = engine.addEntity()
    Transform.create(button, {
      position: Vector3.create(buttonX, buttonY, buttonZ),
      scale: Vector3.create(1.2, 0.8, 1.2)
    })
    MeshRenderer.setBox(button)
    MeshCollider.setBox(button)

    // Color based on position: green outside, yellow at edge, red inside
    let buttonColor: Color4
    if (tp.depth < 0) {
      buttonColor = Color4.create(0.2, 0.7, 0.2, 1)  // Green - outside
    } else if (tp.depth === 0) {
      buttonColor = Color4.create(0.8, 0.8, 0.2, 1)  // Yellow - edge
    } else {
      buttonColor = Color4.create(0.7, 0.2, 0.2, 1)  // Red - inside
    }
    Material.setPbrMaterial(button, { albedoColor: buttonColor })

    // Calculate target position
    const targetX = wallTestX + wallSize / 2 - tp.depth
    const targetY = 1
    const targetZ = wallTestZ

    // Store button info
    teleportButtons.push({ entity: button, targetX, targetY, targetZ })

    // Add pointer events
    PointerEvents.create(button, {
      pointerEvents: [
        {
          eventType: PointerEventType.PET_DOWN,
          eventInfo: {
            button: InputAction.IA_POINTER,
            hoverText: `Teleport: ${tp.label.replace('\n', ' ')}`
          }
        }
      ]
    })

    // Label for the button
    createLabel(tp.label, Vector3.create(buttonX, buttonY + 1.5, buttonZ), 0.6)
  })

  // Single system to handle all teleport button clicks
  engine.addSystem(() => {
    for (const btn of teleportButtons) {
      const cmd = inputSystem.getInputCommand(
        InputAction.IA_POINTER,
        PointerEventType.PET_DOWN,
        btn.entity
      )

      if (cmd) {
        console.log(`Teleporting to X=${btn.targetX.toFixed(2)}...`)

        movePlayerTo({
          newRelativePosition: Vector3.create(btn.targetX, btn.targetY, btn.targetZ)
        })
      }
    }
  })

  // =========================================================================
  // BOX MOVES TO YOU TEST
  // Testing what happens when a solid box moves onto the player
  // (inverse of teleporting player into box)
  // =========================================================================
  const moveBoxTestZ = wallTestZ - 15
  const moveBoxSize = 4
  const moveBoxOriginalPos = Vector3.create(wallTestX - 10, moveBoxSize / 2, moveBoxTestZ)

  createLabel('BOX TELEPORTS ONTO YOU\n(instant teleport test)', Vector3.create(wallTestX, 6, moveBoxTestZ), 1.2)

  // Platform for this test area
  createPlatform(
    Vector3.create(wallTestX, 0.05, moveBoxTestZ),
    Vector3.create(30, 0.1, 15),
    Color4.create(0.25, 0.2, 0.3, 1)
  )

  // The movable solid box
  const moveBox = engine.addEntity()
  Transform.create(moveBox, {
    position: moveBoxOriginalPos,
    scale: Vector3.create(moveBoxSize, moveBoxSize, moveBoxSize)
  })
  MeshRenderer.setBox(moveBox)
  MeshCollider.setBox(moveBox)
  Material.setPbrMaterial(moveBox, {
    albedoColor: Color4.create(0.6, 0.3, 0.6, 1)
  })
  createLabel('MOVABLE BOX', Vector3.create(moveBoxOriginalPos.x, moveBoxSize + 1, moveBoxOriginalPos.z), 0.8)

  // Standing spot marker (where player should stand)
  const standSpot = Vector3.create(wallTestX + 5, 0.1, moveBoxTestZ)
  const standMarker = engine.addEntity()
  Transform.create(standMarker, {
    position: standSpot,
    scale: Vector3.create(2, 0.1, 2)
  })
  MeshRenderer.setBox(standMarker)
  Material.setPbrMaterial(standMarker, {
    albedoColor: Color4.create(0.8, 0.8, 0.2, 1)
  })
  createLabel('STAND HERE', Vector3.create(standSpot.x, 1, standSpot.z), 0.8)

  // Button to trigger box movement
  const moveBoxButton = engine.addEntity()
  Transform.create(moveBoxButton, {
    position: Vector3.create(wallTestX + 10, 0.5, moveBoxTestZ),
    scale: Vector3.create(2, 1, 2)
  })
  MeshRenderer.setBox(moveBoxButton)
  MeshCollider.setBox(moveBoxButton)
  Material.setPbrMaterial(moveBoxButton, {
    albedoColor: Color4.create(0.8, 0.2, 0.2, 1)
  })
  PointerEvents.create(moveBoxButton, {
    pointerEvents: [
      {
        eventType: PointerEventType.PET_DOWN,
        eventInfo: {
          button: InputAction.IA_POINTER,
          hoverText: 'Teleport box onto you!'
        }
      }
    ]
  })
  createLabel('CLICK TO\nTELEPORT BOX\nONTO YOU', Vector3.create(wallTestX + 10, 2.5, moveBoxTestZ), 0.7)

  // State tracking for box teleport
  let boxTeleported = false
  let boxReturnTimer = 0

  // System to handle box teleport
  engine.addSystem((dt: number) => {
    // Check for button click
    const moveCmd = inputSystem.getInputCommand(
      InputAction.IA_POINTER,
      PointerEventType.PET_DOWN,
      moveBoxButton
    )

    if (moveCmd && !boxTeleported) {
      // Get LOCAL player position and TELEPORT box there instantly
      const playerPos = getLocalPlayerPosition()
      if (playerPos) {
        console.log(`TELEPORTING box onto player at: ${playerPos.x.toFixed(2)}, ${playerPos.z.toFixed(2)}`)

        // Instantly teleport box to player position
        const transform = Transform.getMutable(moveBox)
        transform.position = Vector3.create(playerPos.x, moveBoxSize / 2, playerPos.z)

        boxTeleported = true
        boxReturnTimer = 0

        // Change button color to indicate active
        Material.setPbrMaterial(moveBoxButton, {
          albedoColor: Color4.create(0.4, 0.4, 0.4, 1)
        })

        // Change box color to indicate teleported
        Material.setPbrMaterial(moveBox, {
          albedoColor: Color4.create(0.9, 0.3, 0.3, 1)
        })
      }
    }

    // Handle return timer
    if (boxTeleported) {
      boxReturnTimer += dt

      // After 2 seconds, teleport box back to original position
      if (boxReturnTimer >= 2) {
        console.log('Teleporting box back to original position')

        // Instantly teleport box back
        const transform = Transform.getMutable(moveBox)
        transform.position = Vector3.create(moveBoxOriginalPos.x, moveBoxOriginalPos.y, moveBoxOriginalPos.z)

        boxTeleported = false
        boxReturnTimer = 0

        // Reset button color
        Material.setPbrMaterial(moveBoxButton, {
          albedoColor: Color4.create(0.8, 0.2, 0.2, 1)
        })

        // Reset box color
        Material.setPbrMaterial(moveBox, {
          albedoColor: Color4.create(0.6, 0.3, 0.6, 1)
        })
      }
    }
  })

  // Instructions
  createLabel(
    'TEST: Stand on yellow marker,\nclick button, box TELEPORTS onto you.\nDo you get stuck inside? Pushed out?',
    Vector3.create(wallTestX, 0.5, moveBoxTestZ + 6),
    0.7
  )
}
