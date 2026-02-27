import { signedFetch } from '~system/SignedFetch'
import { getRealm } from '~system/Runtime'

// Result type for API operations
type Success<T> = [null, T]
type Failure<E> = [E, null]
type Result<T, E = Error> = Success<T> | Failure<E>

// Stream key response type
export type StreamKeyResponse = {
  streamingUrl: string
  streamingKey: string
  createdAt: number
  endsAt: number
}

// Cache realm info
let realmCache: { isPreview?: boolean; networkId?: number } | undefined

async function getRealmInfo() {
  if (realmCache) return realmCache
  try {
    const result = await getRealm({})
    realmCache = result.realmInfo
    return realmCache
  } catch (e) {
    return undefined
  }
}

function getDomain() {
  if (!realmCache || realmCache.networkId === 1) return 'org'
  return 'zone'
}

// Convert snake_case to camelCase
function toCamelCase<T>(obj: Record<string, unknown>): T {
  const result: Record<string, unknown> = {}
  for (const key in obj) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase())
    const value = obj[key]
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[camelKey] = toCamelCase(value as Record<string, unknown>)
    } else {
      result[camelKey] = value
    }
  }
  return result as T
}

// Wrapper for signed fetch
async function wrapSignedFetch<T>(
  url: string,
  method?: string
): Promise<Result<T, string>> {
  const realm = await getRealmInfo()

  if (realm?.isPreview) {
    return ['Stream key not available in preview mode', null]
  }

  try {
    const response = await signedFetch({
      url,
      init: { method: method || 'GET', headers: {} }
    })

    if (!response.ok) {
      console.log(`[STREAM API] Error: ${response.body || 'Unknown error'}`)
      return [response.body || 'Request failed', null]
    }

    const body = JSON.parse(response.body || '{}')
    return [null, toCamelCase<T>(body)]
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.log(`[STREAM API] Exception: ${message}`)
    return [message, null]
  }
}

// Get stream key URL
function getStreamKeyUrl() {
  return `https://comms-gatekeeper.decentraland.${getDomain()}/scene-stream-access`
}

// Get existing stream key
export async function getStreamKey(): Promise<Result<StreamKeyResponse, string>> {
  await getRealmInfo()
  return wrapSignedFetch<StreamKeyResponse>(getStreamKeyUrl())
}

// Generate new stream key
export async function generateStreamKey(): Promise<Result<StreamKeyResponse, string>> {
  await getRealmInfo()
  return wrapSignedFetch<StreamKeyResponse>(getStreamKeyUrl(), 'POST')
}

// Revoke stream key
export async function revokeStreamKey(): Promise<Result<StreamKeyResponse, string>> {
  await getRealmInfo()
  return wrapSignedFetch<StreamKeyResponse>(getStreamKeyUrl(), 'DELETE')
}

// Reset (regenerate) stream key
export async function resetStreamKey(): Promise<Result<StreamKeyResponse, string>> {
  await getRealmInfo()
  return wrapSignedFetch<StreamKeyResponse>(getStreamKeyUrl(), 'PUT')
}

// Fetch and auto-generate stream key info, updating videoState
export async function fetchStreamKeyInfo(): Promise<StreamKeyResponse | null> {
  const { videoState } = await import('./state')
  videoState.streamKeyLoading = true
  console.log('[STREAM API] Fetching stream key...')

  const [error, data] = await getStreamKey()

  if (error) {
    console.log('[STREAM API] No existing key, generating new one...')
    const [genError, genData] = await generateStreamKey()

    if (genError) {
      console.log(`[STREAM API] Failed to get stream key: ${genError}`)
      videoState.setStreamKeyError(genError)
      return null
    }

    if (genData) {
      console.log('[STREAM API] Stream key generated successfully')
      videoState.setStreamKeyInfo(genData.streamingUrl, genData.streamingKey, genData.endsAt)
      return genData
    }
    videoState.setStreamKeyError('No data returned')
    return null
  }

  if (data) {
    console.log('[STREAM API] Stream key loaded successfully')
    videoState.setStreamKeyInfo(data.streamingUrl, data.streamingKey, data.endsAt)
    return data
  }
  videoState.setStreamKeyError('No data returned')
  return null
}
