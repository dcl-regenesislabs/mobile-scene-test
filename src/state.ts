import { Entity, VideoPlayer } from '@dcl/sdk/ecs'

// Source types for the video player
export enum VideoSourceType {
  VIDEO_URL = 'video_url',
  LIVEKIT = 'livekit'
}

// LiveKit streaming source
export const LIVEKIT_SOURCE = 'livekit-video://current-stream'

// Default video URL (Big Buck Bunny - Blender Foundation)
export const DEFAULT_VIDEO_URL = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'

class VideoState {
  // Video entity reference
  private _videoEntity: Entity | null = null

  // Source state (starts on LiveKit stream)
  sourceType: VideoSourceType = VideoSourceType.LIVEKIT
  currentSource: string = LIVEKIT_SOURCE

  // Stream key info (from LiveKit API)
  streamingUrl: string = ''
  streamingKey: string = ''
  streamKeyExpiresAt: number = 0
  streamKeyLoading: boolean = false
  streamKeyError: string = ''

  setVideoEntity(entity: Entity) {
    this._videoEntity = entity
  }

  getVideoEntity(): Entity | null {
    return this._videoEntity
  }

  // Switch video source type and apply to VideoPlayer
  setSourceType(type: VideoSourceType) {
    this.sourceType = type
    switch (type) {
      case VideoSourceType.VIDEO_URL:
        this.currentSource = DEFAULT_VIDEO_URL
        break
      case VideoSourceType.LIVEKIT:
        this.currentSource = LIVEKIT_SOURCE
        break
    }
    this.applySource()
  }

  // Apply current source to the VideoPlayer component
  applySource() {
    if (!this._videoEntity) return
    const video = VideoPlayer.getMutable(this._videoEntity)
    video.src = this.currentSource
    video.playing = true
    console.log(`[STREAM] Source changed to: ${this.currentSource}`)
  }

  // Update stream key info from API
  setStreamKeyInfo(url: string, key: string, expiresAt: number) {
    this.streamingUrl = url
    this.streamingKey = key
    this.streamKeyExpiresAt = expiresAt
    this.streamKeyError = ''
    this.streamKeyLoading = false
    console.log(`[STREAM] Stream key updated, expires: ${new Date(expiresAt).toLocaleString()}`)
  }

  setStreamKeyError(error: string) {
    this.streamKeyError = error
    this.streamKeyLoading = false
  }
}

// Export singleton instance
export const videoState = new VideoState()
