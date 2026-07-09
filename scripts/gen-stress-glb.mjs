// Generates heavy, UNIQUE .glb files for the Memory Stress Lab (test 24).
//
// Each file is a self-contained glTF 2.0 binary with:
//   - a dense displaced grid mesh (lots of vertices / triangles)
//   - one large embedded PNG texture (baseColor + emissive)
//
// The texture is a smooth per-file gradient, so it compresses to a tiny PNG on
// disk but decodes to a full-size RGBA texture (+ mipmaps) in memory — a great
// memory-per-disk-byte ratio for stressing the client. Every file has unique
// bytes (per-file mesh displacement + gradient scaling) so the engine's asset
// cache can't dedupe them.
//
// Run:  node scripts/gen-stress-glb.mjs

import { writeFileSync, mkdirSync } from 'fs'
import { deflateSync } from 'zlib'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// ---- Config --------------------------------------------------------------
const FILES = 6 // number of distinct heavy GLBs
const GRID = 128 // mesh subdivisions -> (GRID+1)^2 verts, GRID^2*2 triangles
const TEX = 4096 // embedded texture resolution (RGBA). Decodes to ~64MB + mips.
const SIZE_UNITS = 8 // world extent of the mesh in X/Z before scaling
const AMP = 0.9 // displacement amplitude
const FREQ = 6 // displacement frequency

const scriptDir = dirname(fileURLToPath(import.meta.url))
const projectRoot = dirname(scriptDir)
const OUT_DIR = join(projectRoot, 'assets/models/stress')

// ---- PNG encoding (Node zlib) -------------------------------------------
const CRC_TABLE = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()

function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function pngChunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const typeBuf = Buffer.from(type, 'ascii')
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0)
  return Buffer.concat([len, typeBuf, data, crc])
}

function encodePng(width, height, fill) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // color type RGBA
  ihdr[10] = 0 // deflate
  ihdr[11] = 0 // filter method
  ihdr[12] = 0 // no interlace

  // Build each row unfiltered, then apply the PNG "Sub" filter (delta from the
  // pixel 4 bytes to the left). Smooth horizontal ramps become near-constant
  // deltas that deflate to almost nothing, keeping the file tiny on disk.
  const rowLen = 1 + width * 4
  const raw = Buffer.alloc(rowLen * height)
  const line = Buffer.alloc(width * 4)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) fill(x, y, line, x * 4)
    const off = y * rowLen
    raw[off] = 1 // filter: Sub
    for (let i = 0; i < line.length; i++) {
      const left = i >= 4 ? line[i - 4] : 0
      raw[off + 1 + i] = (line[i] - left) & 0xff
    }
  }
  const idat = deflateSync(raw, { level: 6 })
  return Buffer.concat([
    sig,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', idat),
    pngChunk('IEND', Buffer.alloc(0))
  ])
}

const fract = (n) => n - Math.floor(n)

function textureFill(seed) {
  // Smooth ramps scaled by per-file factors: stays highly compressible (tiny
  // PNG) while keeping every file's bytes unique.
  const fr = 0.5 + 0.5 * fract(seed * 0.37 + 0.11)
  const fg = 0.5 + 0.5 * fract(seed * 0.61 + 0.29)
  const fb = 0.5 + 0.5 * fract(seed * 0.89 + 0.53)
  const inv = 1 / (TEX - 1)
  return (x, y, buf, p) => {
    const u = x * inv
    const v = y * inv
    buf[p] = (u * 255 * fr) | 0
    buf[p + 1] = (v * 255 * fg) | 0
    buf[p + 2] = ((u + v) * 0.5 * 255 * fb) | 0
    buf[p + 3] = 255
  }
}

// ---- Geometry ------------------------------------------------------------
function buildGeometry(seed) {
  const n = GRID + 1
  const vertCount = n * n
  const positions = new Float32Array(vertCount * 3)
  const normals = new Float32Array(vertCount * 3)
  const uvs = new Float32Array(vertCount * 2)
  const min = [Infinity, Infinity, Infinity]
  const max = [-Infinity, -Infinity, -Infinity]

  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      const idx = j * n + i
      const u = i / GRID
      const v = j / GRID
      const x = (u - 0.5) * SIZE_UNITS
      const z = (v - 0.5) * SIZE_UNITS
      const y = AMP * Math.sin(u * FREQ + seed) * Math.cos(v * FREQ + seed)

      // Analytic normal of the displaced surface.
      const dydu = AMP * FREQ * Math.cos(u * FREQ + seed) * Math.cos(v * FREQ + seed)
      const dydv = -AMP * FREQ * Math.sin(u * FREQ + seed) * Math.sin(v * FREQ + seed)
      const dydx = dydu / SIZE_UNITS
      const dydz = dydv / SIZE_UNITS
      const nx = -dydx
      const ny = 1
      const nz = -dydz
      const len = Math.hypot(nx, ny, nz) || 1

      positions[idx * 3] = x
      positions[idx * 3 + 1] = y
      positions[idx * 3 + 2] = z
      normals[idx * 3] = nx / len
      normals[idx * 3 + 1] = ny / len
      normals[idx * 3 + 2] = nz / len
      uvs[idx * 2] = u
      uvs[idx * 2 + 1] = v

      const comps = [x, y, z]
      for (let c = 0; c < 3; c++) {
        if (comps[c] < min[c]) min[c] = comps[c]
        if (comps[c] > max[c]) max[c] = comps[c]
      }
    }
  }

  const idxCount = GRID * GRID * 6
  const indices = new Uint32Array(idxCount)
  let o = 0
  for (let j = 0; j < GRID; j++) {
    for (let i = 0; i < GRID; i++) {
      const a = j * n + i
      const b = j * n + i + 1
      const c = (j + 1) * n + i
      const d = (j + 1) * n + i + 1
      indices[o++] = a
      indices[o++] = c
      indices[o++] = b
      indices[o++] = b
      indices[o++] = c
      indices[o++] = d
    }
  }

  return { positions, normals, uvs, indices, min, max, vertCount, idxCount }
}

// ---- GLB assembly --------------------------------------------------------
const align4 = (n) => (n + 3) & ~3

function buildGlb(geo, png) {
  const parts = []
  let offset = 0
  const addBuffer = (buf) => {
    const byteOffset = offset
    parts.push(buf)
    offset += buf.length
    const pad = align4(offset) - offset
    if (pad) {
      parts.push(Buffer.alloc(pad))
      offset += pad
    }
    return { byteOffset, byteLength: buf.length }
  }
  const toBuf = (ta) => Buffer.from(ta.buffer, ta.byteOffset, ta.byteLength)

  const posV = addBuffer(toBuf(geo.positions))
  const nrmV = addBuffer(toBuf(geo.normals))
  const uvV = addBuffer(toBuf(geo.uvs))
  const idxV = addBuffer(toBuf(geo.indices))
  const imgV = addBuffer(png)
  const bin = Buffer.concat(parts)

  const gltf = {
    asset: { version: '2.0', generator: 'mem-stress-gen' },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0 }],
    meshes: [
      { primitives: [{ attributes: { POSITION: 0, NORMAL: 1, TEXCOORD_0: 2 }, indices: 3, material: 0 }] }
    ],
    materials: [
      {
        pbrMetallicRoughness: {
          baseColorTexture: { index: 0 },
          metallicFactor: 0.1,
          roughnessFactor: 0.8
        },
        emissiveTexture: { index: 0 },
        emissiveFactor: [0.5, 0.5, 0.5]
      }
    ],
    textures: [{ sampler: 0, source: 0 }],
    samplers: [{ magFilter: 9729, minFilter: 9987, wrapS: 10497, wrapT: 10497 }],
    images: [{ bufferView: 4, mimeType: 'image/png' }],
    accessors: [
      { bufferView: 0, componentType: 5126, count: geo.vertCount, type: 'VEC3', min: geo.min, max: geo.max },
      { bufferView: 1, componentType: 5126, count: geo.vertCount, type: 'VEC3' },
      { bufferView: 2, componentType: 5126, count: geo.vertCount, type: 'VEC2' },
      { bufferView: 3, componentType: 5125, count: geo.idxCount, type: 'SCALAR' }
    ],
    bufferViews: [
      { buffer: 0, byteOffset: posV.byteOffset, byteLength: posV.byteLength, target: 34962 },
      { buffer: 0, byteOffset: nrmV.byteOffset, byteLength: nrmV.byteLength, target: 34962 },
      { buffer: 0, byteOffset: uvV.byteOffset, byteLength: uvV.byteLength, target: 34962 },
      { buffer: 0, byteOffset: idxV.byteOffset, byteLength: idxV.byteLength, target: 34963 },
      { buffer: 0, byteOffset: imgV.byteOffset, byteLength: imgV.byteLength }
    ],
    buffers: [{ byteLength: bin.length }]
  }

  let jsonBuf = Buffer.from(JSON.stringify(gltf), 'utf8')
  const jsonPad = align4(jsonBuf.length) - jsonBuf.length
  if (jsonPad) jsonBuf = Buffer.concat([jsonBuf, Buffer.alloc(jsonPad, 0x20)])

  let binBuf = bin
  const binPad = align4(binBuf.length) - binBuf.length
  if (binPad) binBuf = Buffer.concat([binBuf, Buffer.alloc(binPad)])

  const jsonHeader = Buffer.alloc(8)
  jsonHeader.writeUInt32LE(jsonBuf.length, 0)
  jsonHeader.writeUInt32LE(0x4e4f534a, 4) // "JSON"
  const binHeader = Buffer.alloc(8)
  binHeader.writeUInt32LE(binBuf.length, 0)
  binHeader.writeUInt32LE(0x004e4942, 4) // "BIN\0"

  const total = 12 + jsonHeader.length + jsonBuf.length + binHeader.length + binBuf.length
  const header = Buffer.alloc(12)
  header.writeUInt32LE(0x46546c67, 0) // "glTF"
  header.writeUInt32LE(2, 4)
  header.writeUInt32LE(total, 8)

  return Buffer.concat([header, jsonHeader, jsonBuf, binHeader, binBuf])
}

// ---- Main ----------------------------------------------------------------
mkdirSync(OUT_DIR, { recursive: true })
const mb = (b) => (b / (1024 * 1024)).toFixed(2)

let totalDisk = 0
for (let f = 0; f < FILES; f++) {
  const seed = f * 1.618 + 0.5
  const geo = buildGeometry(seed)
  const png = encodePng(TEX, TEX, textureFill(seed))
  const glb = buildGlb(geo, png)

  const name = `heavy-${String(f + 1).padStart(2, '0')}.glb`
  writeFileSync(join(OUT_DIR, name), glb)
  totalDisk += glb.length

  const tris = geo.idxCount / 3
  const decodedTexMb = (TEX * TEX * 4 * 1.34) / (1024 * 1024)
  console.log(
    `${name}  disk=${mb(glb.length)}MB  verts=${geo.vertCount}  tris=${tris}  ` +
      `png=${mb(png.length)}MB  ~decodedTex=${decodedTexMb.toFixed(0)}MB`
  )
}
console.log(`\n${FILES} files, total disk ${mb(totalDisk)}MB -> ${OUT_DIR}`)
