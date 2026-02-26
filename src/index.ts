import { engine, Transform, TextShape, AvatarAttach, MeshRenderer, MeshCollider, PBAvatarAttach, AvatarAnchorPointType, Material, VideoPlayer, GltfContainer, VisibilityComponent, NetworkEntity, SyncComponents, Name, Entity } from '@dcl/sdk/ecs'
import { Vector3, Color4, Color3, Quaternion } from '@dcl/sdk/math'
import { initAssetPacks } from '@dcl/asset-packs/dist/scene-entrypoint'
import { getComponents, AdminPermissions, MediaSource } from '@dcl/asset-packs'
import { setupUI } from './ui'
import { createPlatform, createLabel } from './utils/helpers'
import { SCENE_VERSION } from './version'

// Import all test setup functions
import { setupStaircaseTest } from './tests/test01-staircase'
import { setupJumpingTest } from './tests/test02-jumping'
import { setupPlatformsTest } from './tests/test03-platforms'
import { setupStepHeightTest } from './tests/test04-stepheight'
import { setupRampsTest } from './tests/test05-ramps'
import { setupCorridorsTest } from './tests/test06-corridors'
import { setupControlsTest } from './tests/test07-controls'
import { setupTriggersTest } from './tests/test08-triggers'
import { setupTeleportTest } from './tests/test09-teleport'
import { setupContinuousTweensTest } from './tests/test10-continuous-tweens'
import { setupTextureTweensTest } from './tests/test11-texture-tweens'
import { setupBoundaryTriggerTest } from './tests/test13-boundary-trigger'
import { setupVideoStreamingTest } from './tests/test14-video-streaming'
import { setupMiscTest } from './tests/test15-misc'
import { setupMeshesTest } from './tests/test16-meshes'
import { setupMaterialsTest } from './tests/test17-materials'
import { setupGltfModelsTest } from './tests/test18-gltf-models'
import { setupAnimationsTest } from './tests/test19-animations'
import { setupMorphTargetsTest } from './tests/test20-morph-targets'
import { getConnectedPlayers } from '~system/Players'
import { setupAttachPointsTest } from './tests/test21-anchor-points'
import { setupSkyboxTimeZones } from './tests/test22-skybox-time'

// ============================================================================
// MAIN SCENE
// ============================================================================

export function main() {
  // Initialize asset packs (enables Admin Tools and other smart items)
  initAssetPacks(engine)

  setupUI()

  // Version label on the floor at origin
  const versionLabel = engine.addEntity()
  Transform.create(versionLabel, {
    position: Vector3.create(-2, 0.1, 0),
    rotation: Quaternion.fromEulerDegrees(90, 0, 0)
  })
  TextShape.create(versionLabel, {
    text: `v${SCENE_VERSION}`,
    fontSize: 8,
    textColor: Color4.White(),
    outlineWidth: 0.3,
    outlineColor: Color3.Black()
  })

  console.log('Mobile Test Scene Initialized')
  console.log('VIDEO_DEBUG_ENABLED')

  // -------------------------------------------------------------------------
  // VIDEO SCREEN at scene center (0, 0, 0)
  // Default: plays a video URL. Admin Tools can switch to LiveKit streaming.
  // -------------------------------------------------------------------------
  const DEFAULT_VIDEO_URL = 'https://vz-7c61c1b5-d59.b-cdn.net/ccea595a-b910-4de6-b160-092819db021d/play_480p.mp4'

  const { AdminTools, VideoScreen } = getComponents(engine as any)

  const livekitScreen = engine.addEntity()
  console.log(`[VIDEO DEBUG] Video Screen entity ID: ${livekitScreen}`)
  Name.create(livekitScreen, { value: 'Video Screen' })
  Transform.create(livekitScreen, {
    position: Vector3.create(0, 3.5, 0),
    scale: Vector3.create(8, 4.5, 1)
  })
  MeshRenderer.setPlane(livekitScreen)
  MeshCollider.setPlane(livekitScreen)
  VideoPlayer.create(livekitScreen, {
    src: DEFAULT_VIDEO_URL,
    playing: true,
    volume: 1,
    loop: true
  })
  // Use unlit material (matching StreamerTeather composite setup)
  Material.create(livekitScreen, {
    material: {
      $case: 'unlit' as const,
      unlit: {
        texture: Material.Texture.Video({ videoPlayerEntity: livekitScreen }),
        diffuseColor: Color4.White(),
        alphaTest: 0.5,
        castShadows: true
      }
    }
  })
  VideoScreen.create(livekitScreen, {
    thumbnail: '',
    defaultMediaSource: MediaSource.VideoURL,
    defaultURL: DEFAULT_VIDEO_URL
  })
  SyncComponents.create(livekitScreen, { componentIds: [VideoPlayer.componentId, VideoScreen.componentId] })
  NetworkEntity.create(livekitScreen, { networkId: 0, entityId: 8004 as Entity })

  // -------------------------------------------------------------------------
  // DEBUG: Monitor VideoPlayer changes on the video screen
  // -------------------------------------------------------------------------
  let lastSrc = DEFAULT_VIDEO_URL
  let lastPlaying = true
  let debugFrameCount = 0
  engine.addSystem(() => {
    debugFrameCount++
    if (!VideoPlayer.has(livekitScreen)) {
      if (debugFrameCount % 300 === 0) {
        console.log(`[VIDEO DEBUG] WARNING: VideoPlayer component missing from entity ${livekitScreen}!`)
      }
      return
    }
    const vp = VideoPlayer.get(livekitScreen)
    if (vp.src !== lastSrc) {
      console.log(`[VIDEO DEBUG] VideoPlayer.src CHANGED: "${lastSrc}" -> "${vp.src}"`)
      lastSrc = vp.src
    }
    if (vp.playing !== lastPlaying) {
      console.log(`[VIDEO DEBUG] VideoPlayer.playing CHANGED: ${lastPlaying} -> ${vp.playing}`)
      lastPlaying = vp.playing ?? false
    }
    // Log full state every 10 seconds (at ~30fps = 300 frames)
    if (debugFrameCount % 300 === 0) {
      console.log(`[VIDEO DEBUG] Current state: src="${vp.src}", playing=${vp.playing}, volume=${vp.volume}, loop=${vp.loop}`)
    }
  })

  // -------------------------------------------------------------------------
  // ADMIN TOOLS smart item
  // Matches StreamerTeather's Admin Tools pattern
  // -------------------------------------------------------------------------
  const adminEntity = engine.addEntity()
  console.log(`[VIDEO DEBUG] Admin Tools entity ID: ${adminEntity}`)
  console.log(`[VIDEO DEBUG] VideoPlayer.componentId: ${VideoPlayer.componentId}`)
  console.log(`[VIDEO DEBUG] VideoScreen componentId: ${VideoScreen.componentId}`)
  console.log(`[VIDEO DEBUG] AdminTools componentId: ${AdminTools.componentId}`)
  console.log(`[VIDEO DEBUG] livekitScreen entity stored in videoPlayers: ${livekitScreen}`)
  Name.create(adminEntity, { value: 'Admin Tools' })
  Transform.create(adminEntity, {
    position: Vector3.create(0, 0, 0)
  })
  GltfContainer.create(adminEntity, {
    src: 'assets/asset-packs/admin_tools/admin_toolkit.glb',
    visibleMeshesCollisionMask: 1,
    invisibleMeshesCollisionMask: 0
  })
  VisibilityComponent.create(adminEntity, { visible: false })
  AdminTools.create(adminEntity, {
    adminPermissions: AdminPermissions.PUBLIC,
    authorizedAdminUsers: {
      me: true,
      sceneOwners: true,
      allowList: true,
      adminAllowList: []
    },
    moderationControl: {
      isEnabled: true,
      kickCoordinates: { x: 0, y: 0, z: 0 },
      allowNonOwnersManageAdminAllowList: false
    },
    textAnnouncementControl: {
      isEnabled: true,
      playSoundOnEachAnnouncement: true,
      showAuthorOnEachAnnouncement: true
    },
    videoControl: {
      isEnabled: true,
      disableVideoPlayersSound: false,
      showAuthorOnVideoPlayers: true,
      linkAllVideoPlayers: false,
      videoPlayers: [
        { entity: livekitScreen as unknown as number, customName: 'Screen' }
      ]
    },
    smartItemsControl: {
      isEnabled: true,
      linkAllSmartItems: false,
      smartItems: []
    },
    rewardsControl: {
      isEnabled: true,
      rewardItems: []
    }
  })
  SyncComponents.create(adminEntity, { componentIds: [99929642] })
  NetworkEntity.create(adminEntity, { networkId: 0, entityId: 8002 as Entity })

  // -------------------------------------------------------------------------
  // GROUND PLATFORM (Starting area)
  // -------------------------------------------------------------------------
  createPlatform(
    Vector3.create(8, 0.1, 2),
    Vector3.create(6, 0.2, 4),
    Color4.create(0.3, 0.3, 0.3, 1)
  )
  createLabel('START\nGround Level', Vector3.create(8, 1.5, 2), 1.5)

  // -------------------------------------------------------------------------
  // SETUP ALL TEST SECTORS
  // -------------------------------------------------------------------------

  // TEST 1: Fine Scale Staircase (2.0m - 2.5m heights)
  setupStaircaseTest()

  // TEST 2: Running Jump Distance
  setupJumpingTest()

  // TEST 3: Descending Platforms
  setupPlatformsTest()

  // TEST 4: Step Height Staircase (0.4m - 0.5m)
  setupStepHeightTest()

  // TEST 5: Inclined Ramps (45° - 70°)
  setupRampsTest()

  // TEST 6: Corridor Width Test
  setupCorridorsTest()

  // TEST 7: Control Mapping Test (input actions)
  setupControlsTest()

  // TEST 8: Trigger Areas (ADR-258)
  setupTriggersTest()

  // TEST 9: Wall Teleport Test
  setupTeleportTest()

  // TEST 10: Continuous Tweens (ADR-285)
  setupContinuousTweensTest()

  // TEST 11: Texture Tweens (ADR-255)
  setupTextureTweensTest()

  // TEST 13: Boundary Trigger Test
  setupBoundaryTriggerTest()

  // TEST 14: Video Streaming Test
  setupVideoStreamingTest()

  // TEST 15: MISC - VirtualCamera and InputModifier
  setupMiscTest()

  // -------------------------------------------------------------------------
  // VISUAL TEST PLATFORM
  // -------------------------------------------------------------------------

  // TEST 16: Primitive Meshes
  setupMeshesTest()

  // TEST 17: PBR Materials
  setupMaterialsTest()

  // TEST 18: GLTF/GLB Models (Static)
  setupGltfModelsTest()

  // TEST 19: GLTF Animations
  setupAnimationsTest()

  // TEST 20: Morph Targets
  setupMorphTargetsTest()

  // TEST 21: Attach Points
  setupAttachPointsTest()

  // TEST 22: SkyboxTime
  setupSkyboxTimeZones()

  console.log('All test platforms created')
  console.log('Tests: Staircase, Gap Jumps, Descend, Step Heights, Ramps, Corridor Width, Control Mapping, Trigger Areas, Wall Teleport, Continuous Tweens, Texture Tweens, Boundary Trigger, Video Streaming, MISC, Meshes, Materials, GLTF Models, Animations, Morph Targets')
}
