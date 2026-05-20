import { Vector3 } from '@dcl/sdk/math'
import { setAmbientStageOffset, TestSceneHandle } from './tracker'
import { SCENE_REGISTRY, SceneId, STAGE_POSITION } from './scene-registry'

let active: { id: SceneId, handle: TestSceneHandle } | null = null

export const sceneManager = {
  get activeId(): SceneId | null {
    return active?.id ?? null
  },
  load(id: SceneId): void {
    if (active?.id === id) return
    if (active) {
      active.handle.dispose()
      active = null
    }
    const entry = SCENE_REGISTRY[id]
    if (!entry) {
      console.error(`[scene] unknown scene id: ${id}`)
      return
    }
    console.log(`[scene] loading ${id}`)
    const offset = Vector3.subtract(STAGE_POSITION, entry.origin)
    setAmbientStageOffset(offset)
    try {
      const handle = entry.loader()
      active = { id, handle }
    } finally {
      setAmbientStageOffset(null)
    }
  },
  unload(): void {
    if (!active) return
    console.log(`[scene] unloading ${active.id}`)
    active.handle.dispose()
    active = null
  }
}
