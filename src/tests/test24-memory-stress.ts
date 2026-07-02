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
  Entity,
  TextureWrapMode
} from '@dcl/sdk/ecs'
import { Vector3, Color4, Color3 } from '@dcl/sdk/math'
import { createPlatform, createLabel } from '../utils/helpers'
import { runScoped, TestSceneHandle } from '../lobby/tracker'

/**
 * TEST 24: MEMORY STRESS
 *
 * Gradually pushes the device's memory up by continuously loading UNIQUE
 * textures. The engine caches textures by URL, so re-using a URL costs nothing
 * after the first load. To keep memory actually climbing, every texture here
 * uses a distinct URL (a monotonic counter + a per-load random salt), which
 * forces a real download and a fresh GPU/CPU allocation each time. Nothing is
 * ever freed while the test runs, so memory grows steadily until the scene is
 * unloaded (which disposes every entity created in this scope).
 *
 * Controls (click the coloured boxes):
 *   START  - begin auto-spawning one new texture every SPAWN_INTERVAL seconds
 *   STOP   - pause auto-spawning (already-loaded textures stay resident)
 *   BURST  - immediately spawn a batch of BURST_COUNT textures
 *
 * Textures come from a remote provider (picsum.photos) so each URL yields a
 * genuinely different image. Only the URL needs to differ to defeat the cache;
 * swap PROVIDER below if that host is unavailable in your target client.
 */

// Per-texture resolution. The in-memory (decoded RGBA) footprint is roughly
// SIZE * SIZE * 4 bytes plus ~33% for mipmaps, and is independent of the
// downloaded file size. Bump to 1024 for a ~4x faster climb.
const TEXTURE_SIZE = 512

// Seconds between automatic spawns while the test is RUNNING.
const SPAWN_INTERVAL = 0.35

// How many textures the BURST button loads at once.
const BURST_COUNT = 20

// Cap on spawns processed in a single frame, so a lag spike can't dump a huge
// batch all at once (the leftover time carries over to following frames).
const MAX_SPAWNS_PER_FRAME = 4

// Rough estimate of the memory each loaded texture holds (RGBA + mipmaps), MB.
const MB_PER_TEXTURE = (TEXTURE_SIZE * TEXTURE_SIZE * 4 * 1.34) / (1024 * 1024)

// Wall layout for the spawned texture planes. Tiles fill a WALL_COLS x WALL_ROWS
// grid, then start a new layer a bit further north so the wall keeps growing.
const WALL_COLS = 12
const WALL_ROWS = 8
const TILE_SPACING = 2.1
const TILE_SCALE = 2
const TILES_PER_LAYER = WALL_COLS * WALL_ROWS

/**
 * Builds a unique texture URL for the given index. The salt guarantees the URLs
 * never collide with a previous load of this scene (whose downloads may still
 * be cached by the client), and the index makes every texture within a run
 * distinct. picsum's /seed/ endpoint returns a different image per seed string.
 */
function textureSrc(index: number, salt: number): string {
  return `https://picsum.photos/seed/mem-${salt}-${index}/${TEXTURE_SIZE}/${TEXTURE_SIZE}`
}

export function setupMemoryStressTest(): TestSceneHandle {
  return runScoped(() => {
    // Content is authored around local origin; the stage offset renders it at
    // world origin. The player arrives from the south (lobby), so controls sit
    // at the near edge and the texture wall grows away to the north (+z).
    const baseZ = 0

    // Per-load salt so texture URLs are unique even across reloads within the
    // same client session. Math.random() is available in the scene runtime.
    const salt = Math.floor(Math.random() * 1_000_000_000)

    let running = false
    let spawned = 0
    let accumulator = 0

    // -----------------------------------------------------------------------
    // Environment
    // -----------------------------------------------------------------------
    createPlatform(
      Vector3.create(0, 0.05, baseZ + 14),
      Vector3.create(WALL_COLS * TILE_SPACING + 6, 0.1, 44),
      Color4.create(0.1, 0.1, 0.14, 1)
    )

    createLabel(
      'TEST 24: MEMORY STRESS\nLoads unique textures to grow device memory',
      Vector3.create(0, 9, baseZ - 2),
      1.4
    )

    // Live status readout, updated as textures are loaded.
    const statusLabel = createLabel('', Vector3.create(0, 5.5, baseZ), 0.9)
    function refreshStatus(): void {
      const usedMb = spawned * MB_PER_TEXTURE
      TextShape.getMutable(statusLabel).text =
        `${running ? '>> RUNNING <<' : '-- PAUSED --'}\n` +
        `Textures loaded: ${spawned}\n` +
        `Est. memory: ~${usedMb.toFixed(1)} MB\n` +
        `${TEXTURE_SIZE}px each  (~${MB_PER_TEXTURE.toFixed(2)} MB)`
    }

    // -----------------------------------------------------------------------
    // Texture spawning
    // -----------------------------------------------------------------------
    function spawnTexture(): void {
      const i = spawned
      const layer = Math.floor(i / TILES_PER_LAYER)
      const within = i % TILES_PER_LAYER
      const col = within % WALL_COLS
      const row = Math.floor(within / WALL_COLS)

      const tile = engine.addEntity()
      Transform.create(tile, {
        position: Vector3.create(
          (col - (WALL_COLS - 1) / 2) * TILE_SPACING,
          2 + row * TILE_SPACING,
          baseZ + 6 + layer * 2.5
        ),
        scale: Vector3.create(TILE_SCALE, TILE_SCALE, TILE_SCALE)
      })
      MeshRenderer.setPlane(tile)
      Material.setPbrMaterial(tile, {
        texture: Material.Texture.Common({
          src: textureSrc(i, salt),
          wrapMode: TextureWrapMode.TWM_CLAMP
        }),
        // Emissive keeps the tile bright so it renders (and uploads to the GPU)
        // regardless of scene lighting. Same URL as albedo => still one cached
        // texture, so memory accounting stays honest.
        emissiveColor: Color4.White(),
        emissiveIntensity: 0.5,
        emissiveTexture: Material.Texture.Common({
          src: textureSrc(i, salt),
          wrapMode: TextureWrapMode.TWM_CLAMP
        })
      })

      spawned++
    }

    // -----------------------------------------------------------------------
    // Control buttons
    // -----------------------------------------------------------------------
    type Button = { entity: Entity; onClick: () => void }
    const buttons: Button[] = []

    function createButton(
      x: number,
      label: string,
      color: Color4,
      hoverText: string,
      onClick: () => void
    ): void {
      const box = engine.addEntity()
      Transform.create(box, {
        position: Vector3.create(x, 1.2, baseZ),
        scale: Vector3.create(2.2, 1.4, 0.3)
      })
      MeshRenderer.setBox(box)
      MeshCollider.setBox(box)
      Material.setPbrMaterial(box, { albedoColor: color })
      PointerEvents.create(box, {
        pointerEvents: [
          {
            eventType: PointerEventType.PET_DOWN,
            eventInfo: { button: InputAction.IA_POINTER, hoverText }
          }
        ]
      })

      const text = engine.addEntity()
      Transform.create(text, { position: Vector3.create(0, 0, -0.7), parent: box })
      TextShape.create(text, {
        text: label,
        fontSize: 1.2,
        textColor: Color4.White(),
        outlineWidth: 0.2,
        outlineColor: Color3.Black()
      })

      buttons.push({ entity: box, onClick })
    }

    createButton(-3.2, 'START', Color4.create(0.2, 0.7, 0.25, 1), 'Start loading textures', () => {
      running = true
      refreshStatus()
    })
    createButton(0, 'STOP', Color4.create(0.75, 0.2, 0.2, 1), 'Pause loading', () => {
      running = false
      refreshStatus()
    })
    createButton(3.2, `BURST +${BURST_COUNT}`, Color4.create(0.85, 0.55, 0.15, 1), `Load ${BURST_COUNT} at once`, () => {
      for (let k = 0; k < BURST_COUNT; k++) spawnTexture()
      refreshStatus()
    })

    // -----------------------------------------------------------------------
    // System: handle button clicks + drive auto-spawning
    // -----------------------------------------------------------------------
    engine.addSystem((dt: number) => {
      for (const b of buttons) {
        if (inputSystem.isTriggered(InputAction.IA_POINTER, PointerEventType.PET_DOWN, b.entity)) {
          b.onClick()
        }
      }

      if (running) {
        accumulator += dt
        let budget = MAX_SPAWNS_PER_FRAME
        let didSpawn = false
        while (accumulator >= SPAWN_INTERVAL && budget-- > 0) {
          accumulator -= SPAWN_INTERVAL
          spawnTexture()
          didSpawn = true
        }
        // Drop any backlog beyond this frame's budget so we don't burst-catch-up.
        if (accumulator >= SPAWN_INTERVAL) accumulator = 0
        if (didSpawn) refreshStatus()
      }
    })

    refreshStatus()
    console.log('Test 24: Memory Stress initialized (click START to begin loading unique textures)')
  })
}
