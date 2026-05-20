import {
  engine,
  Transform,
  MeshRenderer,
  MeshCollider,
  Material,
  TextShape,
  Billboard,
  PointerEvents,
  PointerEventType,
  InputAction,
  inputSystem,
  Entity
} from '@dcl/sdk/ecs'
import { Vector3, Color4, Color3, Quaternion } from '@dcl/sdk/math'
import { SCENE_IDS, SCENE_REGISTRY, SceneId } from './scene-registry'
import { sceneManager } from './scene-manager'
import { SCENE_VERSION } from '../version'

const SIGN_COLOR_IDLE = Color4.create(0.2, 0.45, 0.85, 1)
const SIGN_COLOR_ACTIVE = Color4.create(0.95, 0.75, 0.15, 1)
const SIGN_COLOR_UNLOAD = Color4.create(0.75, 0.2, 0.2, 1)

// Parcel (0, -4) -> world (0 * 16, 0, -4 * 16) = (0, 0, -64). Stage is at
// world origin, so the player spawns at the lobby and walks north to reach
// the active scene.
const LOBBY_CENTER = Vector3.create(0, 0, -64)
const COLS = 6
const SPACING = 2.5

type SignBinding = {
  entity: Entity
  onClick: () => void
  isActiveFor: SceneId | null  // null for the "unload" sign
}

export function setupLobby() {
  const signs: SignBinding[] = []

  // Lobby floor + welcome label at the spawn area
  createLobbyFloor()
  createWelcome()

  // Scene signs laid out in a grid
  SCENE_IDS.forEach((id, idx) => {
    const col = idx % COLS
    const row = Math.floor(idx / COLS)
    const pos = gridCell(col, row)
    signs.push(createSceneSign(pos, id, SCENE_REGISTRY[id].label))
  })

  // Unload sign in the next cell after the last scene
  const lastIdx = SCENE_IDS.length
  const unloadPos = gridCell(lastIdx % COLS, Math.floor(lastIdx / COLS))
  signs.push(createUnloadSign(unloadPos))

  // System: highlight the currently-active sign
  engine.addSystem(() => {
    const activeId = sceneManager.activeId
    for (const s of signs) {
      let color: Color4
      if (s.isActiveFor === null) {
        color = SIGN_COLOR_UNLOAD
      } else if (s.isActiveFor === activeId) {
        color = SIGN_COLOR_ACTIVE
      } else {
        color = SIGN_COLOR_IDLE
      }
      Material.setPbrMaterial(s.entity, { albedoColor: color })
    }
  })

  // Pointer-down handler for all signs
  engine.addSystem(() => {
    for (const s of signs) {
      if (inputSystem.isTriggered(InputAction.IA_POINTER, PointerEventType.PET_DOWN, s.entity)) {
        s.onClick()
      }
    }
  })
}

function gridCell(col: number, row: number): Vector3 {
  return Vector3.create(
    LOBBY_CENTER.x + (col - (COLS - 1) / 2) * SPACING,
    0,
    LOBBY_CENTER.z + row * SPACING
  )
}

function createLobbyFloor() {
  const floor = engine.addEntity()
  Transform.create(floor, {
    position: Vector3.create(LOBBY_CENTER.x, 0.05, LOBBY_CENTER.z + 2.5),
    scale: Vector3.create(COLS * SPACING + 2, 0.1, 12)
  })
  MeshRenderer.setBox(floor)
  MeshCollider.setBox(floor)
  Material.setPbrMaterial(floor, {
    albedoColor: Color4.create(0.18, 0.18, 0.22, 1)
  })
}

function createWelcome() {
  const title = engine.addEntity()
  Transform.create(title, {
    position: Vector3.create(LOBBY_CENTER.x, 3.5, LOBBY_CENTER.z - 2.5),
    rotation: Quaternion.fromEulerDegrees(0, 0, 0)
  })
  TextShape.create(title, {
    text: `MOBILE TEST LOBBY  v${SCENE_VERSION}\nClick a sign to load a scene`,
    fontSize: 3,
    textColor: Color4.White(),
    outlineWidth: 0.2,
    outlineColor: Color3.Black()
  })
  Billboard.create(title)
}

function createSceneSign(position: Vector3, id: SceneId, label: string): SignBinding {
  const sign = engine.addEntity()
  Transform.create(sign, {
    position: Vector3.create(position.x, 1, position.z),
    scale: Vector3.create(1.6, 1.6, 0.2)
  })
  MeshRenderer.setBox(sign)
  MeshCollider.setBox(sign)
  Material.setPbrMaterial(sign, { albedoColor: SIGN_COLOR_IDLE })
  PointerEvents.create(sign, {
    pointerEvents: [
      {
        eventType: PointerEventType.PET_DOWN,
        eventInfo: { button: InputAction.IA_POINTER, hoverText: `Load: ${label}` }
      }
    ]
  })

  const text = engine.addEntity()
  Transform.create(text, {
    position: Vector3.create(0, 0, -0.6),
    parent: sign
  })
  TextShape.create(text, {
    text: label,
    fontSize: 1.4,
    textColor: Color4.White(),
    outlineWidth: 0.2,
    outlineColor: Color3.Black()
  })

  return {
    entity: sign,
    isActiveFor: id,
    onClick: () => sceneManager.load(id)
  }
}

function createUnloadSign(position: Vector3): SignBinding {
  const sign = engine.addEntity()
  Transform.create(sign, {
    position: Vector3.create(position.x, 1, position.z),
    scale: Vector3.create(1.6, 1.6, 0.2)
  })
  MeshRenderer.setBox(sign)
  MeshCollider.setBox(sign)
  Material.setPbrMaterial(sign, { albedoColor: SIGN_COLOR_UNLOAD })
  PointerEvents.create(sign, {
    pointerEvents: [
      {
        eventType: PointerEventType.PET_DOWN,
        eventInfo: { button: InputAction.IA_POINTER, hoverText: 'Unload current scene' }
      }
    ]
  })

  const text = engine.addEntity()
  Transform.create(text, {
    position: Vector3.create(0, 0, -0.6),
    parent: sign
  })
  TextShape.create(text, {
    text: 'UNLOAD',
    fontSize: 1.6,
    textColor: Color4.White(),
    outlineWidth: 0.2,
    outlineColor: Color3.Black()
  })

  return {
    entity: sign,
    isActiveFor: null,
    onClick: () => sceneManager.unload()
  }
}
