import {
  engine,
  inputSystem,
  PointerEventType,
  InputAction,
  Material
} from '@dcl/sdk/ecs'
import { Vector3 } from '@dcl/sdk/math'
import {
  createLabel,
  createInputCube,
  INPUT_ACTIONS,
  CubeInputState,
  HoverState,
  DEFAULT_COLOR,
  getActionName,
  getActionColor,
  updateHoverText
} from '../utils/helpers'
import { createTracker, TestSceneHandle } from '../lobby/tracker'

/**
 * TEST 7: CONTROL MAPPING TEST - Testing input actions
 * Located in parcel 2,1 (X = 32 to 48, Z = 16 to 32)
 */
export function setupControlsTest(): TestSceneHandle {
  const t = createTracker()
  const controlCenterX = 40
  const controlCenterZ = 24

  t.track(createLabel('CONTROL MAPPING TEST\n(test all input actions)', Vector3.create(controlCenterX, 4, controlCenterZ - 6), 1.2))

  t.track(createInputCube(
    Vector3.create(controlCenterX, 1.5, controlCenterZ),
    Vector3.create(2, 2, 2),
    INPUT_ACTIONS.map(a => a.action),
    true
  ))
  t.track(createLabel('ALL ACTIONS', Vector3.create(controlCenterX, 4, controlCenterZ), 1.5))

  const radius = 5
  const angleStep = (Math.PI * 2) / INPUT_ACTIONS.length

  INPUT_ACTIONS.forEach((actionInfo, index) => {
    const angle = index * angleStep
    const x = controlCenterX + Math.cos(angle) * radius
    const z = controlCenterZ + Math.sin(angle) * radius

    t.track(createInputCube(
      Vector3.create(x, 0.5, z),
      Vector3.create(1, 1, 1),
      [actionInfo.action],
      false
    ))

    t.track(createLabel(
      `${actionInfo.name}\n${actionInfo.key}`,
      Vector3.create(x, 2, z),
      0.7
    ))
  })

  t.system(() => {
    for (const [entity] of engine.getEntitiesWith(CubeInputState, HoverState)) {
      const state = CubeInputState.get(entity)

      for (const action of state.actions) {
        const downCmd = inputSystem.getInputCommand(
          action,
          PointerEventType.PET_DOWN,
          entity
        )

        if (downCmd) {
          const mutableState = CubeInputState.getMutable(entity)
          mutableState.isPressed = true
          const colorIndex = INPUT_ACTIONS.findIndex(a => a.action === action)
          mutableState.currentColor = colorIndex

          Material.setPbrMaterial(entity, {
            albedoColor: getActionColor(action)
          })

          const hoverState = HoverState.getMutable(entity)
          hoverState.lastAction = getActionName(action)

          updateHoverText(entity, state.isMasterCube, getActionName(action), true)
        }
      }
    }
  })

  t.system(() => {
    for (const [entity] of engine.getEntitiesWith(CubeInputState, HoverState)) {
      const state = CubeInputState.get(entity)

      for (const action of state.actions) {
        const upCmd = inputSystem.getInputCommand(
          action,
          PointerEventType.PET_UP,
          entity
        )

        if (upCmd) {
          const mutableState = CubeInputState.getMutable(entity)
          mutableState.isPressed = false
          mutableState.currentColor = -1

          Material.setPbrMaterial(entity, {
            albedoColor: DEFAULT_COLOR
          })

          updateHoverText(entity, state.isMasterCube, '', false)
        }
      }
    }
  })

  t.system(() => {
    for (const [entity] of engine.getEntitiesWith(CubeInputState, HoverState)) {
      const state = CubeInputState.get(entity)

      const hoverEnter = inputSystem.getInputCommand(
        InputAction.IA_POINTER,
        PointerEventType.PET_HOVER_ENTER,
        entity
      )

      if (hoverEnter) {
        const hoverState = HoverState.getMutable(entity)
        hoverState.isHovered = true

        const cubeState = CubeInputState.get(entity)
        const currentColor = cubeState.currentColor >= 0
          ? INPUT_ACTIONS[cubeState.currentColor].color
          : DEFAULT_COLOR

        Material.setPbrMaterial(entity, {
          albedoColor: currentColor,
          emissiveColor: currentColor,
          emissiveIntensity: 0.6
        })

        updateHoverText(entity, state.isMasterCube, '', false)
      }
    }
  })

  t.system(() => {
    for (const [entity] of engine.getEntitiesWith(CubeInputState, HoverState)) {
      const hoverLeave = inputSystem.getInputCommand(
        InputAction.IA_POINTER,
        PointerEventType.PET_HOVER_LEAVE,
        entity
      )

      if (hoverLeave) {
        const hoverState = HoverState.getMutable(entity)
        hoverState.isHovered = false

        const cubeState = CubeInputState.get(entity)
        const currentColor = cubeState.currentColor >= 0
          ? INPUT_ACTIONS[cubeState.currentColor].color
          : DEFAULT_COLOR

        Material.setPbrMaterial(entity, {
          albedoColor: currentColor,
          emissiveIntensity: 0
        })
      }
    }
  })

  return t.handle
}
