import { Vector3 } from '@dcl/sdk/math'
import { TestSceneHandle } from './tracker'
import { setupStaircaseTest } from '../tests/test01-staircase'
import { setupJumpingTest } from '../tests/test02-jumping'
import { setupPlatformsTest } from '../tests/test03-platforms'
import { setupStepHeightTest } from '../tests/test04-stepheight'
import { setupRampsTest } from '../tests/test05-ramps'
import { setupCorridorsTest } from '../tests/test06-corridors'
import { setupControlsTest } from '../tests/test07-controls'
import { setupTriggersTest } from '../tests/test08-triggers'
import { setupTeleportTest } from '../tests/test09-teleport'
import { setupContinuousTweensTest } from '../tests/test10-continuous-tweens'
import { setupTextureTweensTest } from '../tests/test11-texture-tweens'
import { setupBoundaryTriggerTest } from '../tests/test13-boundary-trigger'
import { setupVideoStreamingTest } from '../tests/test14-video-streaming'
import { setupMiscTest } from '../tests/test15-misc'
import { setupMeshesTest } from '../tests/test16-meshes'
import { setupMaterialsTest } from '../tests/test17-materials'
import { setupGltfModelsTest } from '../tests/test18-gltf-models'
import { setupAnimationsTest } from '../tests/test19-animations'
import { setupMorphTargetsTest } from '../tests/test20-morph-targets'
import { setupAttachPointsTest } from '../tests/test21-anchor-points'
import { setupSkyboxTimeZones } from '../tests/test22-skybox-time'
import { setupPlayerPhysicsTest } from '../tests/test23-player-physics'

export type SceneId =
  | 'staircase'
  | 'jumping'
  | 'platforms'
  | 'stepheight'
  | 'ramps'
  | 'corridors'
  | 'controls'
  | 'triggers'
  | 'teleport'
  | 'continuousTweens'
  | 'textureTweens'
  | 'boundaryTrigger'
  | 'videoStreaming'
  | 'misc'
  | 'meshes'
  | 'materials'
  | 'gltfModels'
  | 'animations'
  | 'morphTargets'
  | 'attachPoints'
  | 'skyboxTime'
  | 'playerPhysics'

export type SceneEntry = {
  label: string
  loader: () => TestSceneHandle
  // The test's natural "entry" position in its hard-coded world coordinates.
  // The scene manager parents the test under a stage root whose position is
  // STAGE_POSITION - origin, so the test ends up rendering at STAGE_POSITION.
  // Tests that are player-attached (no world position) use Vector3.Zero().
  origin: Vector3
}

export const SCENE_REGISTRY: Record<SceneId, SceneEntry> = {
  staircase:        { label: '01 Staircase',         loader: setupStaircaseTest,         origin: Vector3.create(2, 0, 6) },
  jumping:          { label: '02 Jumping',           loader: setupJumpingTest,           origin: Vector3.create(2, 0, 10) },
  platforms:        { label: '03 Platforms',         loader: setupPlatformsTest,         origin: Vector3.create(12, 0, 4) },
  stepheight:       { label: '04 Step Height',       loader: setupStepHeightTest,        origin: Vector3.create(2, 0, 1) },
  ramps:            { label: '05 Ramps',             loader: setupRampsTest,             origin: Vector3.create(24, 0, 4) },
  corridors:        { label: '06 Corridors',         loader: setupCorridorsTest,         origin: Vector3.create(4, 0, 20) },
  controls:         { label: '07 Controls',          loader: setupControlsTest,          origin: Vector3.create(40, 0, 24) },
  triggers:         { label: '08 Triggers',          loader: setupTriggersTest,          origin: Vector3.create(-48, 0, 8) },
  teleport:         { label: '09 Teleport',          loader: setupTeleportTest,          origin: Vector3.create(8, 0, -40) },
  continuousTweens: { label: '10 Continuous Tweens', loader: setupContinuousTweensTest,  origin: Vector3.create(56, 0, 92) },
  textureTweens:    { label: '11 Texture Tweens',    loader: setupTextureTweensTest,     origin: Vector3.create(56, 0, 136) },
  boundaryTrigger:  { label: '13 Boundary Trigger',  loader: setupBoundaryTriggerTest,   origin: Vector3.create(-144, 0, -144) },
  videoStreaming:   { label: '14 Video',             loader: setupVideoStreamingTest,    origin: Vector3.create(120, 0, -104) },
  misc:             { label: '15 Misc',              loader: setupMiscTest,              origin: Vector3.create(56, 0, 40) },
  meshes:           { label: '16 Meshes',            loader: setupMeshesTest,            origin: Vector3.create(-90, 0, -35) },
  materials:        { label: '17 Materials',         loader: setupMaterialsTest,         origin: Vector3.create(-90, 0, -65) },
  gltfModels:       { label: '18 GLTF Models',       loader: setupGltfModelsTest,        origin: Vector3.create(-65, 0, -112) },
  animations:       { label: '19 Animations',        loader: setupAnimationsTest,        origin: Vector3.create(-40, 0, -75) },
  morphTargets:     { label: '20 Morph Targets',     loader: setupMorphTargetsTest,      origin: Vector3.create(-40, 0, -35) },
  attachPoints:     { label: '21 Attach Points',     loader: setupAttachPointsTest,      origin: Vector3.Zero() },
  skyboxTime:       { label: '22 Skybox/Time',       loader: setupSkyboxTimeZones,       origin: Vector3.create(-76, 0, 12) },
  playerPhysics:    { label: '23 Player Physics',    loader: setupPlayerPhysicsTest,     origin: Vector3.create(105, 0, -25) }
}

export const SCENE_IDS: SceneId[] = Object.keys(SCENE_REGISTRY) as SceneId[]

// Scenes for which the altitude/jump panel is contextually relevant.
export const PHYSICS_SCENES: ReadonlySet<SceneId> = new Set<SceneId>([
  'staircase', 'jumping', 'platforms', 'stepheight', 'ramps', 'corridors', 'playerPhysics'
])

// Where every test scene renders, in world coordinates. All scenes spawn at
// world origin; the lobby is placed at parcel (0,-4) = world (0, 0, -64) so
// the player walks north from the lobby to reach the stage.
export const STAGE_POSITION: Vector3 = Vector3.Zero()
