import { setupUI } from './ui'
import { setupLobby } from './lobby'

export function main() {
  setupUI()
  setupLobby()
  console.log('Mobile Test Scene Initialized (lobby-only; click a sign to load a scene)')
}
