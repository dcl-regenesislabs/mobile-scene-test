import {
  engine,
  Transform,
  MeshRenderer,
  MeshCollider,
  Material,
  GltfContainer,
  TextShape,
  PointerEvents,
  PointerEventType,
  InputAction,
  inputSystem,
  Entity,
  TextureWrapMode
} from '@dcl/sdk/ecs'
import { Vector3, Color4, Color3 } from '@dcl/sdk/math'
import { ReactEcsRenderer } from '@dcl/sdk/react-ecs';
import { createPlatform, createLabel } from '../../../utils/helpers'
import { teleportUi } from '../../../utils/ui';

/**
 * TEST 24: MEMORY STRESS LAB
 *
 * Three independent stressors you can toggle on/off, plus instant-burst
 * buttons. Watch the live status board and the client's memory graph.
 *
 *   HEAP  - The reliable crasher. Allocates large Uint8Array chunks and KEEPS
 *           references to them, growing the scene's JS-VM heap. This memory is
 *           NOT managed by the engine's texture/asset budget, so it can't be
 *           evicted and climbs unbounded until the runtime throws or the OS
 *           OOM-kills the client. Default rate ≈ 160 MB/s.
 *
 *   TEX   - Loads unique remote textures (distinct URL per tile so the engine's
 *           URL cache can't short-circuit the download). Stresses GPU/native
 *           texture memory, but the explorer may EVICT off-screen textures, so
 *           this tends to plateau rather than OOM on its own.
 *
 *   GLTF  - Instantiates the heavy pre-generated GLBs (see
 *           scripts/gen-stress-glb.mjs): each is a dense displaced mesh plus a
 *           4096² embedded texture (~86 MB decoded). Every file has unique bytes
 *           so the engine can't dedupe them; loading all of them is a big
 *           one-shot spike of mesh + GPU-texture memory. Extra instances beyond
 *           the file count re-use the cached assets (cheap), only adding
 *           entities/draw calls.
 */

// ---- HEAP stressor -------------------------------------------------------
const HEAP_CHUNK_MB = 16 // size of each retained allocation
const HEAP_INTERVAL = 0.1 // seconds between allocations while running (~160 MB/s)
const HEAP_BURST_MB = 256 // instant allocation from the burst button

// ---- TEX stressor --------------------------------------------------------
// Decoded RGBA footprint ≈ SIZE*SIZE*4 bytes (+~33% mipmaps), independent of
// file size. 1024 ≈ 5.6 MB each; bump to 2048 (~22 MB) for a faster climb.
const TEXTURE_SIZE = 1024
const TEX_INTERVAL = 0.25 // seconds between auto-spawned textures
const TEX_BURST = 12 // textures per burst
const MB_PER_TEXTURE = (TEXTURE_SIZE * TEXTURE_SIZE * 4 * 1.34) / (1024 * 1024)

// ---- GLTF stressor -------------------------------------------------------
// Heavy models produced by scripts/gen-stress-glb.mjs. Distinct bytes per file
// => the engine loads each as a separate asset (no dedupe).
const STRESS_GLBS = [
  'assets/models/stress/heavy-01.glb',
  'assets/models/stress/heavy-02.glb',
  'assets/models/stress/heavy-03.glb',
  'assets/models/stress/heavy-04.glb',
  'assets/models/stress/heavy-05.glb',
  'assets/models/stress/heavy-06.glb'
]
const GLTF_INTERVAL = 0.5 // seconds between auto-spawned models
const GLTF_BURST = STRESS_GLBS.length // burst loads all unique assets at once
// Rough resident cost of one unique asset: 4096² texture (RGBA + mips) + mesh.
const MB_PER_GLB = (4096 * 4096 * 4 * 1.34) / (1024 * 1024) + 1

// Cap on auto-spawns processed per frame so a lag spike can't dump a huge batch.
const MAX_SPAWNS_PER_FRAME = 6

// Texture wall layout.
const WALL_COLS = 12
const WALL_ROWS = 8
const TILE_SPACING = 2.1
const TILE_SCALE = 2
const TILES_PER_LAYER = WALL_COLS * WALL_ROWS

// GLTF cluster layout.
const GLTF_COLS = 4
const GLTF_SPACING = 12
const GLTF_SCALE = 1.5

function textureSrc(index: number, salt: number): string {
  return `https://picsum.photos/seed/mem-${salt}-${index}/${TEXTURE_SIZE}/${TEXTURE_SIZE}`
}

export function main() {
  // Content is authored around local origin; the stage offset renders it at
  // world origin. Player arrives from the south (-z), so controls sit near
  // and the texture/model fields grow away to the north (+z).
  const salt = Math.floor(Math.random() * 1_000_000_000)

  // Stressor run flags + timing accumulators.
  let heapOn = false
  let texOn = false
  let gltfOn = false
  let heapAccum = 0
  let texAccum = 0
  let gltfAccum = 0

  // Counters / retained memory.
  const heapBlocks: Uint8Array[] = [] // retained so the GC can never reclaim
  let heapMb = 0
  let heapFailed = false
  let texCount = 0
  let gltfCount = 0

  const uniqueGlbs = () => Math.min(gltfCount, STRESS_GLBS.length)

  // -----------------------------------------------------------------------
  // Environment
  // -----------------------------------------------------------------------
  createPlatform(
    Vector3.create(0, 0.05, 16),
    Vector3.create(32, 0.1, 64),
    Color4.create(0.1, 0.1, 0.14, 1)
  )

  createLabel(
    'TEST 24: MEMORY STRESS LAB\nToggle HEAP / TEX / GLTF — watch the client memory graph',
    Vector3.create(0, 10, -3),
    1.3
  )

  teleportUi()

  const statusLabel = createLabel('', Vector3.create(0, 6, 0), 0.85)
  function refreshStatus(): void {
    const texMb = texCount * MB_PER_TEXTURE
    const gltfMb = uniqueGlbs() * MB_PER_GLB
    const totalMb = heapMb + texMb + gltfMb
    TextShape.getMutable(statusLabel).text =
      `===== MEMORY STRESS =====\n` +
      `HEAP ${heapOn ? '[ON] ' : '[off]'}  ${heapMb} MB  (${heapBlocks.length} blocks)` +
      `${heapFailed ? '  <ALLOC FAILED>' : ''}\n` +
      `TEX  ${texOn ? '[ON] ' : '[off]'}  ${texCount} tex  ~${texMb.toFixed(0)} MB\n` +
      `GLTF ${gltfOn ? '[ON] ' : '[off]'}  ${gltfCount} inst / ${uniqueGlbs()} unique  ~${gltfMb.toFixed(0)} MB\n` +
      `Tracked total: ~${totalMb.toFixed(0)} MB`
  }

  // -----------------------------------------------------------------------
  // HEAP: allocate and RETAIN large buffers (eviction-proof JS-heap growth)
  // -----------------------------------------------------------------------
  function allocHeap(mb: number): void {
    if (heapFailed) return
    try {
      const bytes = mb * 1024 * 1024
      const buf = new Uint8Array(bytes)
      // Touch one byte per 4 KB page so the OS actually commits the memory,
      // and vary the value so zero-page dedup/compression can't reclaim it.
      for (let i = 0; i < bytes; i += 4096) buf[i] = (i + heapBlocks.length) & 0xff
      heapBlocks.push(buf)
      heapMb += mb
    } catch (e) {
      // Runtime refused the allocation — that ceiling is itself a useful
      // result. Stop trying and surface it on the status board.
      heapFailed = true
      heapOn = false
      console.error(`[mem-stress] heap allocation failed at ~${heapMb} MB`, e)
    }
  }

  // -----------------------------------------------------------------------
  // TEX: unique remote texture on a growing wall
  // -----------------------------------------------------------------------
  function spawnTexture(): void {
    const i = texCount
    const layer = Math.floor(i / TILES_PER_LAYER)
    const within = i % TILES_PER_LAYER
    const col = within % WALL_COLS
    const row = Math.floor(within / WALL_COLS)

    const tile = engine.addEntity()
    Transform.create(tile, {
      position: Vector3.create(
        (col - (WALL_COLS - 1) / 2) * TILE_SPACING,
        2 + row * TILE_SPACING,
        8 + layer * 2.5
      ),
      scale: Vector3.create(TILE_SCALE, TILE_SCALE, TILE_SCALE)
    })
    MeshRenderer.setPlane(tile)
    Material.setPbrMaterial(tile, {
      texture: Material.Texture.Common({
        src: textureSrc(i, salt),
        wrapMode: TextureWrapMode.TWM_CLAMP
      }),
      emissiveColor: Color4.White(),
      emissiveIntensity: 0.5,
      emissiveTexture: Material.Texture.Common({
        src: textureSrc(i, salt),
        wrapMode: TextureWrapMode.TWM_CLAMP
      })
    })
    texCount++
  }

  // -----------------------------------------------------------------------
  // GLTF: instantiate the heavy pre-generated models
  // -----------------------------------------------------------------------
  function spawnGltf(): void {
    const i = gltfCount
    const src = STRESS_GLBS[i % STRESS_GLBS.length]
    const col = i % GLTF_COLS
    const row = Math.floor(i / GLTF_COLS)

    const model = engine.addEntity()
    Transform.create(model, {
      position: Vector3.create(-24 + col * GLTF_SPACING, 1, 26 + row * GLTF_SPACING),
      scale: Vector3.create(GLTF_SCALE, GLTF_SCALE, GLTF_SCALE)
    })
    GltfContainer.create(model, { src })
    gltfCount++
  }

  // -----------------------------------------------------------------------
  // Control buttons
  // -----------------------------------------------------------------------
  type Button = { entity: Entity; onClick: () => void }
  const buttons: Button[] = []

  function createButton(
    x: number,
    z: number,
    label: string,
    color: Color4,
    hoverText: string,
    onClick: () => void
  ): Entity {
    const box = engine.addEntity()
    Transform.create(box, {
      position: Vector3.create(x, 1.4, z),
      scale: Vector3.create(3, 1.5, 0.3)
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
      fontSize: 0.9,
      textColor: Color4.White(),
      outlineWidth: 0.2,
      outlineColor: Color3.Black()
    })

    buttons.push({ entity: box, onClick })
    return box
  }

  // Bright when ON, dim when off.
  const HEAP_ON = Color4.create(0.7, 0.3, 0.9, 1)
  const HEAP_OFF = Color4.create(0.28, 0.14, 0.36, 1)
  const TEX_ON = Color4.create(0.25, 0.55, 0.95, 1)
  const TEX_OFF = Color4.create(0.12, 0.24, 0.4, 1)
  const GLTF_ON = Color4.create(0.95, 0.6, 0.2, 1)
  const GLTF_OFF = Color4.create(0.4, 0.26, 0.1, 1)

  // Toggle row (z = 0).
  const heapBtn = createButton(-6, 0, 'HEAP\ntoggle', HEAP_OFF, 'Toggle HEAP allocator', () => {
    heapOn = !heapOn
    Material.setPbrMaterial(heapBtn, { albedoColor: heapOn ? HEAP_ON : HEAP_OFF })
    refreshStatus()
  })
  const texBtn = createButton(-2, 0, 'TEX\ntoggle', TEX_OFF, 'Toggle texture loader', () => {
    texOn = !texOn
    Material.setPbrMaterial(texBtn, { albedoColor: texOn ? TEX_ON : TEX_OFF })
    refreshStatus()
  })
  const gltfBtn = createButton(2, 0, 'GLTF\ntoggle', GLTF_OFF, 'Toggle GLTF spawner', () => {
    gltfOn = !gltfOn
    Material.setPbrMaterial(gltfBtn, { albedoColor: gltfOn ? GLTF_ON : GLTF_OFF })
    refreshStatus()
  })
  createButton(6, 0, 'STOP\nALL', Color4.create(0.75, 0.2, 0.2, 1), 'Stop every stressor', () => {
    heapOn = texOn = gltfOn = false
    Material.setPbrMaterial(heapBtn, { albedoColor: HEAP_OFF })
    Material.setPbrMaterial(texBtn, { albedoColor: TEX_OFF })
    Material.setPbrMaterial(gltfBtn, { albedoColor: GLTF_OFF })
    refreshStatus()
  })

  // Burst row (z = -3, nearer the incoming player).
  createButton(-6, -3, `HEAP\n+${HEAP_BURST_MB}MB`, HEAP_ON, `Allocate ${HEAP_BURST_MB} MB now`, () => {
    allocHeap(HEAP_BURST_MB)
    refreshStatus()
  })
  createButton(-2, -3, `TEX\n+${TEX_BURST}`, TEX_ON, `Load ${TEX_BURST} textures now`, () => {
    for (let k = 0; k < TEX_BURST; k++) spawnTexture()
    refreshStatus()
  })
  createButton(2, -3, `GLTF\n+${GLTF_BURST}`, GLTF_ON, `Load all ${GLTF_BURST} heavy models now`, () => {
    for (let k = 0; k < GLTF_BURST; k++) spawnGltf()
    refreshStatus()
  })

  // -----------------------------------------------------------------------
  // System: handle clicks + drive whichever stressors are enabled
  // -----------------------------------------------------------------------
  engine.addSystem((dt: number) => {
    for (const b of buttons) {
      if (inputSystem.isTriggered(InputAction.IA_POINTER, PointerEventType.PET_DOWN, b.entity)) {
        b.onClick()
      }
    }

    let dirty = false

    if (heapOn && !heapFailed) {
      heapAccum += dt
      let budget = MAX_SPAWNS_PER_FRAME
      while (heapAccum >= HEAP_INTERVAL && budget-- > 0) {
        heapAccum -= HEAP_INTERVAL
        allocHeap(HEAP_CHUNK_MB)
        dirty = true
      }
      if (heapAccum >= HEAP_INTERVAL) heapAccum = 0
    }

    if (texOn) {
      texAccum += dt
      let budget = MAX_SPAWNS_PER_FRAME
      while (texAccum >= TEX_INTERVAL && budget-- > 0) {
        texAccum -= TEX_INTERVAL
        spawnTexture()
        dirty = true
      }
      if (texAccum >= TEX_INTERVAL) texAccum = 0
    }

    if (gltfOn) {
      gltfAccum += dt
      let budget = MAX_SPAWNS_PER_FRAME
      while (gltfAccum >= GLTF_INTERVAL && budget-- > 0) {
        gltfAccum -= GLTF_INTERVAL
        spawnGltf()
        dirty = true
      }
      if (gltfAccum >= GLTF_INTERVAL) gltfAccum = 0
    }

    if (dirty) refreshStatus()
  })

  refreshStatus()
  console.log('Test 24: Memory Stress Lab initialized (toggle HEAP for the reliable OOM path)')
}
