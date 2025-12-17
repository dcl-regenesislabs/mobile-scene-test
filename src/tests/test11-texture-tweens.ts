import {
  engine,
  Transform,
  MeshRenderer,
  Material,
  Tween,
  TextureWrapMode,
  tweenSystem,
  Entity,
  Schemas
} from '@dcl/sdk/ecs'
import { Vector3, Color4, Vector2 } from '@dcl/sdk/math'
import { createPlatform, createLabel } from '../utils/helpers'

// Custom component to track texture move tween data
const TextureMoveLoop = engine.defineComponent('TextureMoveLoop', {
  startX: Schemas.Float,
  startY: Schemas.Float,
  endX: Schemas.Float,
  endY: Schemas.Float,
  duration: Schemas.Float
})

/**
 * TEST 11: TEXTURE TWEENS TEST (ADR-255)
 * Testing TextureMove and TextureMoveContinuous
 */
export function setupTextureTweensTest() {
  const textureTweenBaseX = 56
  const textureTweenBaseZ = 136

  createLabel('TEXTURE TWEENS TEST (ADR-255)\nAnimated textures', Vector3.create(textureTweenBaseX, 8, textureTweenBaseZ - 10), 1.5)

  // Platform floor for texture tween test area
  createPlatform(
    Vector3.create(textureTweenBaseX, 0.05, textureTweenBaseZ),
    Vector3.create(64, 0.1, 32),
    Color4.create(0.2, 0.15, 0.25, 1)
  )

  // =========================================================================
  // ROW 1: TextureMoveContinuous - Continuous texture animation
  // =========================================================================
  const ttRow1Z = textureTweenBaseZ - 8

  createLabel('ROW 1: TextureMoveContinuous (continuous loop)', Vector3.create(textureTweenBaseX - 25, 3, ttRow1Z), 1)

  // T1.1 Scroll right continuously
  const texScrollRight = engine.addEntity()
  Transform.create(texScrollRight, {
    position: Vector3.create(textureTweenBaseX - 15, 2.5, ttRow1Z),
    scale: Vector3.create(4, 4, 0.2)
  })
  MeshRenderer.setPlane(texScrollRight)
  Material.setPbrMaterial(texScrollRight, {
    albedoColor: Color4.create(0.3, 0.5, 0.9, 1),
    texture: Material.Texture.Common({
      src: 'images/scene-thumbnail.png',
      wrapMode: TextureWrapMode.TWM_REPEAT
    })
  })
  Tween.setTextureMoveContinuous(texScrollRight, Vector2.create(0.5, 0), 5000)
  createLabel('Scroll Right\nContinuous', Vector3.create(textureTweenBaseX - 15, 6, ttRow1Z), 0.9)

  // T1.2 Scroll left continuously
  const texScrollLeft = engine.addEntity()
  Transform.create(texScrollLeft, {
    position: Vector3.create(textureTweenBaseX - 5, 2.5, ttRow1Z),
    scale: Vector3.create(4, 4, 0.2)
  })
  MeshRenderer.setPlane(texScrollLeft)
  Material.setPbrMaterial(texScrollLeft, {
    albedoColor: Color4.create(0.5, 0.5, 0.5, 1),
    texture: Material.Texture.Common({
      src: 'images/scene-thumbnail.png',
      wrapMode: TextureWrapMode.TWM_REPEAT
    })
  })
  Tween.setTextureMoveContinuous(texScrollLeft, Vector2.create(-0.5, 0), 5000)
  createLabel('Scroll Left\nContinuous', Vector3.create(textureTweenBaseX - 5, 6, ttRow1Z), 0.9)

  // T1.3 Scroll up continuously
  const texScrollUp = engine.addEntity()
  Transform.create(texScrollUp, {
    position: Vector3.create(textureTweenBaseX + 5, 2.5, ttRow1Z),
    scale: Vector3.create(4, 4, 0.2)
  })
  MeshRenderer.setPlane(texScrollUp)
  Material.setPbrMaterial(texScrollUp, {
    albedoColor: Color4.create(0.9, 0.7, 0.3, 1),
    texture: Material.Texture.Common({
      src: 'images/scene-thumbnail.png',
      wrapMode: TextureWrapMode.TWM_REPEAT
    })
  })
  Tween.setTextureMoveContinuous(texScrollUp, Vector2.create(0, 0.5), 5000)
  createLabel('Scroll Up\nContinuous', Vector3.create(textureTweenBaseX + 5, 6, ttRow1Z), 0.9)

  // T1.4 Scroll down continuously
  const texScrollDown = engine.addEntity()
  Transform.create(texScrollDown, {
    position: Vector3.create(textureTweenBaseX + 15, 2.5, ttRow1Z),
    scale: Vector3.create(4, 4, 0.2)
  })
  MeshRenderer.setPlane(texScrollDown)
  Material.setPbrMaterial(texScrollDown, {
    albedoColor: Color4.create(0.3, 0.9, 0.7, 1),
    texture: Material.Texture.Common({
      src: 'images/scene-thumbnail.png',
      wrapMode: TextureWrapMode.TWM_REPEAT
    })
  })
  Tween.setTextureMoveContinuous(texScrollDown, Vector2.create(0, -0.5), 5000)
  createLabel('Scroll Down\nContinuous', Vector3.create(textureTweenBaseX + 15, 6, ttRow1Z), 0.9)

  // T1.5 Diagonal scroll continuously
  const texScrollDiag = engine.addEntity()
  Transform.create(texScrollDiag, {
    position: Vector3.create(textureTweenBaseX + 25, 2.5, ttRow1Z),
    scale: Vector3.create(4, 4, 0.2)
  })
  MeshRenderer.setPlane(texScrollDiag)
  Material.setPbrMaterial(texScrollDiag, {
    albedoColor: Color4.create(0.9, 0.3, 0.5, 1),
    texture: Material.Texture.Common({
      src: 'images/scene-thumbnail.png',
      wrapMode: TextureWrapMode.TWM_REPEAT
    })
  })
  Tween.setTextureMoveContinuous(texScrollDiag, Vector2.create(0.3, 0.3), 5000)
  createLabel('Diagonal\nContinuous', Vector3.create(textureTweenBaseX + 25, 6, ttRow1Z), 0.9)

  // =========================================================================
  // ROW 2: TextureMove with looping via component tracking
  // =========================================================================
  const ttRow2Z = textureTweenBaseZ + 4

  createLabel('ROW 2: TextureMove (looping)', Vector3.create(textureTweenBaseX - 25, 3, ttRow2Z), 1)

  // Helper function to create a looping TextureMove entity
  function createLoopingTextureMove(
    position: Vector3,
    color: Color4,
    startUV: Vector2,
    endUV: Vector2,
    duration: number,
    labelText: string
  ): Entity {
    const entity = engine.addEntity()
    Transform.create(entity, {
      position: position,
      scale: Vector3.create(4, 4, 0.2)
    })
    MeshRenderer.setPlane(entity)
    Material.setPbrMaterial(entity, {
      albedoColor: color,
      texture: Material.Texture.Common({
        src: 'images/scene-thumbnail.png',
        wrapMode: TextureWrapMode.TWM_REPEAT
      })
    })

    // Add custom component to track loop data
    TextureMoveLoop.create(entity, {
      startX: startUV.x,
      startY: startUV.y,
      endX: endUV.x,
      endY: endUV.y,
      duration: duration
    })

    // Start the initial tween
    Tween.setTextureMove(entity, startUV, endUV, duration)

    // Create label
    createLabel(labelText, Vector3.create(position.x, 6, position.z), 0.9)

    return entity
  }

  // T2.1 TextureMove X
  createLoopingTextureMove(
    Vector3.create(textureTweenBaseX - 15, 2.5, ttRow2Z),
    Color4.create(0.7, 0.4, 0.9, 1),
    Vector2.create(0, 0),
    Vector2.create(1, 0),
    4000,
    'X: 0→1'
  )

  // T2.2 TextureMove Y
  createLoopingTextureMove(
    Vector3.create(textureTweenBaseX - 5, 2.5, ttRow2Z),
    Color4.create(0.4, 0.7, 0.9, 1),
    Vector2.create(0, 0),
    Vector2.create(0, 1),
    4000,
    'Y: 0→1'
  )

  // T2.3 TextureMove diagonal
  createLoopingTextureMove(
    Vector3.create(textureTweenBaseX + 5, 2.5, ttRow2Z),
    Color4.create(0.9, 0.9, 0.4, 1),
    Vector2.create(0, 0),
    Vector2.create(1, 1),
    4000,
    'Diagonal'
  )

  // T2.4 TextureMove X reverse
  createLoopingTextureMove(
    Vector3.create(textureTweenBaseX + 15, 2.5, ttRow2Z),
    Color4.create(0.4, 0.9, 0.4, 1),
    Vector2.create(1, 0),
    Vector2.create(0, 0),
    4000,
    'X: 1→0'
  )

  // T2.5 TextureMove Y reverse
  createLoopingTextureMove(
    Vector3.create(textureTweenBaseX + 25, 2.5, ttRow2Z),
    Color4.create(0.9, 0.5, 0.2, 1),
    Vector2.create(0, 1),
    Vector2.create(0, 0),
    4000,
    'Y: 1→0'
  )

  // System to restart TextureMove tweens when they complete
  engine.addSystem(() => {
    for (const [entity] of engine.getEntitiesWith(TextureMoveLoop, Tween)) {
      if (tweenSystem.tweenCompleted(entity)) {
        const loopData = TextureMoveLoop.get(entity)
        const start = Vector2.create(loopData.startX, loopData.startY)
        const end = Vector2.create(loopData.endX, loopData.endY)

        // Delete old tween and create new one
        Tween.deleteFrom(entity)
        Tween.setTextureMove(entity, start, end, loopData.duration)
      }
    }
  })
}
