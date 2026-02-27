import ReactEcs, { ReactEcsRenderer, UiEntity, Label } from '@dcl/sdk/react-ecs'
import { Color4 } from '@dcl/sdk/math'
import { engine, Transform } from '@dcl/sdk/ecs'
import { videoState, VideoSourceType } from './state'
import { fetchStreamKeyInfo, resetStreamKey } from './api'

// ============================================================================
// TRACKING STATE
// ============================================================================

let currentAltitude = 0
let currentX = 0
let maxAltitude = 0

let isJumping = false
let jumpStartX = 0
let jumpStartY = 0
let jumpDeltaX = 0
let jumpDeltaY = 0
let maxJumpHeight = 0
let maxJumpDistance = 0
let lastY = 0

// ============================================================================
// COLORS
// ============================================================================

const C = {
  bg: Color4.create(0.08, 0.08, 0.12, 0.92),
  active: Color4.create(0.15, 0.45, 0.85, 1),
  inactive: Color4.create(0.22, 0.22, 0.28, 1),
  green: Color4.create(0.15, 0.55, 0.3, 1),
  orange: Color4.create(0.8, 0.55, 0.15, 1),
  red: Color4.create(0.7, 0.2, 0.2, 1),
  dark: Color4.create(0.06, 0.06, 0.09, 1),
  text: Color4.White(),
  muted: Color4.create(0.55, 0.55, 0.65, 1),
  yellow: Color4.Yellow()
}

// ============================================================================
// VIDEO SOURCE PANEL (top-left)
// ============================================================================

function VideoSourcePanel() {
  const isVideo = videoState.sourceType === VideoSourceType.VIDEO_URL
  const isStream = videoState.sourceType === VideoSourceType.LIVEKIT

  return (
    <UiEntity
      uiTransform={{
        width: 340,
        height: 'auto',
        positionType: 'absolute',
        position: { top: 16, left: 16 },
        padding: 12,
        flexDirection: 'column'
      }}
      uiBackground={{ color: C.bg }}
    >
      {/* Two big buttons: VIDEO PLAYER | STREAM */}
      <UiEntity uiTransform={{ width: '100%', flexDirection: 'row', margin: { bottom: 10 } }}>
        <UiEntity
          uiTransform={{
            width: '50%',
            height: 52,
            alignItems: 'center',
            justifyContent: 'center',
            margin: { right: 3 }
          }}
          uiBackground={{ color: isVideo ? C.active : C.inactive }}
          onMouseDown={() => videoState.setSourceType(VideoSourceType.VIDEO_URL)}
        >
          <Label value="VIDEO PLAYER" fontSize={16} color={C.text} />
        </UiEntity>
        <UiEntity
          uiTransform={{
            width: '50%',
            height: 52,
            alignItems: 'center',
            justifyContent: 'center',
            margin: { left: 3 }
          }}
          uiBackground={{ color: isStream ? C.active : C.inactive }}
          onMouseDown={() => videoState.setSourceType(VideoSourceType.LIVEKIT)}
        >
          <Label value="STREAM" fontSize={16} color={C.text} />
        </UiEntity>
      </UiEntity>

      {/* Active mode indicator */}
      <UiEntity
        uiTransform={{ width: '100%', padding: { top: 4, bottom: 4, left: 8, right: 8 }, margin: { bottom: 8 } }}
        uiBackground={{ color: C.dark }}
      >
        <Label
          value={isVideo ? 'Big Buck Bunny (Blender Foundation)' : 'livekit-video://current-stream'}
          fontSize={12}
          color={C.muted}
        />
      </UiEntity>

      {/* Stream section (only when STREAM is active) */}
      {isStream && (
        <UiEntity uiTransform={{ width: '100%', flexDirection: 'column' }}>
          {/* Refresh / Reset row */}
          <UiEntity uiTransform={{ width: '100%', flexDirection: 'row', margin: { bottom: 8 } }}>
            <UiEntity
              uiTransform={{ width: '50%', height: 40, alignItems: 'center', justifyContent: 'center', margin: { right: 3 } }}
              uiBackground={{ color: C.green }}
              onMouseDown={() => fetchStreamKeyInfo()}
            >
              <Label value={videoState.streamKeyLoading ? 'Loading...' : 'Get Key'} fontSize={14} color={C.text} />
            </UiEntity>
            <UiEntity
              uiTransform={{ width: '50%', height: 40, alignItems: 'center', justifyContent: 'center', margin: { left: 3 } }}
              uiBackground={{ color: C.orange }}
              onMouseDown={() => {
                resetStreamKey().then(([error, data]) => {
                  if (data) {
                    videoState.setStreamKeyInfo(data.streamingUrl, data.streamingKey, data.endsAt)
                  } else if (error) {
                    videoState.setStreamKeyError(error)
                  }
                })
              }}
            >
              <Label value="Reset Key" fontSize={14} color={C.text} />
            </UiEntity>
          </UiEntity>

          {/* Error */}
          {videoState.streamKeyError ? (
            <UiEntity
              uiTransform={{ width: '100%', padding: 8, margin: { bottom: 8 } }}
              uiBackground={{ color: C.red }}
            >
              <Label value={videoState.streamKeyError} fontSize={12} color={C.text} />
            </UiEntity>
          ) : null}

          {/* Stream key info */}
          {videoState.streamingKey ? (
            <UiEntity uiTransform={{ width: '100%', flexDirection: 'column' }}>
              <Label value="RTMP Server:" fontSize={12} color={C.muted} uiTransform={{ margin: { bottom: 2 } }} />
              <UiEntity
                uiTransform={{ width: '100%', padding: 8, margin: { bottom: 8 } }}
                uiBackground={{ color: C.dark }}
              >
                <Label value={videoState.streamingUrl || 'N/A'} fontSize={12} color={C.text} />
              </UiEntity>

              <Label value="Stream Key:" fontSize={12} color={C.muted} uiTransform={{ margin: { bottom: 2 } }} />
              <UiEntity
                uiTransform={{ width: '100%', padding: 8 }}
                uiBackground={{ color: C.dark }}
              >
                <Label value={videoState.streamingKey} fontSize={12} color={C.orange} />
              </UiEntity>
            </UiEntity>
          ) : null}
        </UiEntity>
      )}
    </UiEntity>
  )
}

// ============================================================================
// ALTITUDE PANEL (top-right)
// ============================================================================

function AltitudePanel() {
  const altColor = currentAltitude > 1.5
    ? Color4.create(0, 1, 0.5, 1)
    : currentAltitude > 0.5
      ? C.yellow
      : C.text

  return (
    <UiEntity
      uiTransform={{
        width: 200,
        height: 'auto',
        positionType: 'absolute',
        position: { top: 16, right: 16 },
        padding: 10,
        flexDirection: 'column'
      }}
      uiBackground={{ color: C.bg }}
    >
      <Label value="POSITION & JUMP" fontSize={14} color={C.yellow} uiTransform={{ margin: { bottom: 8 } }} />

      <UiEntity
        uiTransform={{ width: '100%', height: 36, margin: { bottom: 6 }, justifyContent: 'center', alignItems: 'center' }}
        uiBackground={{ color: C.dark }}
      >
        <Label value={`Y: ${currentAltitude.toFixed(2)}m`} fontSize={22} color={altColor} />
      </UiEntity>

      <UiEntity uiTransform={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', margin: { bottom: 8 }, padding: { left: 4, right: 4 } }}>
        <Label value="Max Y:" fontSize={10} color={C.muted} />
        <Label value={`${maxAltitude.toFixed(2)}m`} fontSize={11} color={Color4.create(0, 1, 0.5, 1)} />
      </UiEntity>

      <UiEntity
        uiTransform={{ width: '100%', height: 22, margin: { bottom: 6 }, justifyContent: 'center', alignItems: 'center' }}
        uiBackground={{ color: Color4.create(0.18, 0.18, 0.25, 0.9) }}
      >
        <Label
          value={isJumping ? "JUMPING!" : "ON GROUND"}
          fontSize={11}
          color={isJumping ? Color4.create(0, 1, 0.5, 1) : Color4.Gray()}
        />
      </UiEntity>

      <UiEntity uiTransform={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', padding: { left: 4, right: 4 }, margin: { bottom: 3 } }}>
        <Label value="Height:" fontSize={10} color={C.muted} />
        <Label value={`${jumpDeltaY.toFixed(2)}m`} fontSize={11} color={Color4.create(1, 0.8, 0, 1)} />
      </UiEntity>

      <UiEntity uiTransform={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', padding: { left: 4, right: 4 }, margin: { bottom: 6 } }}>
        <Label value="Distance:" fontSize={10} color={C.muted} />
        <Label value={`${jumpDeltaX.toFixed(2)}m`} fontSize={11} color={Color4.create(0, 0.8, 1, 1)} />
      </UiEntity>

      <UiEntity
        uiTransform={{ width: '100%', padding: 6, flexDirection: 'column' }}
        uiBackground={{ color: Color4.create(0.12, 0.12, 0.18, 0.9) }}
      >
        <Label value="Best Jump:" fontSize={9} color={C.muted} />
        <UiEntity uiTransform={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between' }}>
          <Label value={`H: ${maxJumpHeight.toFixed(2)}m`} fontSize={10} color={Color4.create(1, 0.8, 0, 1)} />
          <Label value={`D: ${maxJumpDistance.toFixed(2)}m`} fontSize={10} color={Color4.create(0, 0.8, 1, 1)} />
        </UiEntity>
      </UiEntity>
    </UiEntity>
  )
}

// ============================================================================
// COMBINED UI
// ============================================================================

function MainUI() {
  return (
    <UiEntity>
      <VideoSourcePanel />
      <AltitudePanel />
    </UiEntity>
  )
}

// ============================================================================
// SETUP
// ============================================================================

export function setupUI() {
  ReactEcsRenderer.setUiRenderer(MainUI)

  engine.addSystem(() => {
    if (!Transform.has(engine.PlayerEntity)) return

    const transform = Transform.get(engine.PlayerEntity)
    if (transform && transform.position) {
      const newY = transform.position.y
      const newX = transform.position.x

      currentAltitude = newY
      currentX = newX

      if (currentAltitude > maxAltitude) {
        maxAltitude = currentAltitude
      }

      const isRising = newY > lastY + 0.01
      const isFalling = newY < lastY - 0.01
      const onGround = newY < 1.8 && !isRising && !isFalling

      if (!isJumping && isRising && lastY < 1.8) {
        isJumping = true
        jumpStartX = newX
        jumpStartY = newY
        jumpDeltaX = 0
        jumpDeltaY = 0
      }

      if (isJumping) {
        jumpDeltaY = newY - jumpStartY
        jumpDeltaX = Math.abs(newX - jumpStartX)

        if (jumpDeltaY > maxJumpHeight) maxJumpHeight = jumpDeltaY
        if (jumpDeltaX > maxJumpDistance) maxJumpDistance = jumpDeltaX

        if (onGround || (isFalling && newY <= jumpStartY)) {
          isJumping = false
        }
      }

      lastY = newY
    }
  })
}
