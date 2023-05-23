import { DataObjectType } from '@/api/queries/__generated__/baseTypes.generated'
import { BasicMembershipFieldsFragment } from '@/api/queries/__generated__/fragments.generated'
import { BUILD_ENV } from '@/config/env'
import { AssetLogger, ConsoleLogger, DataObjectResponseMetric, DistributorEventEntry } from '@/utils/logs'
import { wait } from '@/utils/misc'

const imageAssetTypes: DataObjectType['__typename'][] = [
  'DataObjectTypeChannelAvatar',
  'DataObjectTypeChannelCoverPhoto',
  'DataObjectTypeVideoThumbnail',
]
const videoAssetTypes: DataObjectType['__typename'][] = ['DataObjectTypeVideoMedia']
const subtitleAssetTypes: DataObjectType['__typename'][] = ['DataObjectTypeVideoSubtitle']

export const getMemberAvatar = (member?: BasicMembershipFieldsFragment | null) => {
  const avatar = member?.metadata?.avatar

  if (avatar?.__typename === 'AvatarUri') {
    return { url: avatar.avatarUri, isLoadingAsset: false }
  } else if (avatar?.__typename === 'AvatarObject') {
    return { url: avatar.avatarObject.resolvedUrl, isLoadingAsset: false }
  }
  // if avatar is `undefined` it means that avatar is not loaded yet, If it's `null` it means that it's not set
  return { url: null, isLoadingAsset: avatar === null ? false : true }
}

export const testAssetDownload = (url: string, type: DataObjectType): Promise<number> => {
  return new Promise((_resolve, _reject) => {
    let img: HTMLImageElement | null = null
    let video: HTMLVideoElement | null = null

    const cleanup = () => {
      if (img) {
        img.removeEventListener('error', reject)
        img.removeEventListener('load', resolve)
        img.remove()
        img = null
      }
      if (video) {
        video.removeEventListener('error', reject)
        video.removeEventListener('loadedmetadata', resolve)
        video.removeEventListener('loadeddata', resolve)
        video.removeEventListener('canplay', resolve)
        video.removeEventListener('progress', resolve)
        video.remove()
        video = null
      }
    }

    const resolve = () => {
      cleanup()

      const performanceEntries = performance.getEntriesByName(url)
      if (performanceEntries.length !== 1) {
        _resolve(0)
        return
      }
      _resolve(performanceEntries[0].duration)
    }

    const reject = (err?: unknown) => {
      cleanup()
      _reject(err)
    }

    if (imageAssetTypes.includes(type?.__typename)) {
      img = new Image()
      img.addEventListener('load', resolve)
      img.addEventListener('error', reject)
      img.src = url
    } else if (videoAssetTypes.includes(type?.__typename)) {
      video = document.createElement('video')
      video.addEventListener('loadedmetadata', resolve)
      video.addEventListener('loadeddata', resolve)
      video.addEventListener('canplay', resolve)
      video.addEventListener('progress', resolve)
      video.addEventListener('error', (err) => {
        if (err.target) {
          reject((err.target as HTMLVideoElement).error)
        } else {
          reject(err)
        }
      })
      video.src = url
    } else if (subtitleAssetTypes.includes(type?.__typename)) {
      fetch(url, { method: 'HEAD', cache: 'no-store' }).then(resolve).catch(reject)
    } else {
      ConsoleLogger.warn('Encountered unknown asset type', { ...type })
      reject()
    }
  })
}

export const logDistributorPerformance = async (assetUrl: string, eventEntry: DistributorEventEntry) => {
  if (!AssetLogger.isEnabled) return

  // delay execution for 1s to make sure performance entries get populated
  await wait(1000)

  const performanceEntries = window.performance.getEntriesByName(assetUrl)
  const performanceEntry = performanceEntries[0] as PerformanceResourceTiming

  if (!performanceEntry && BUILD_ENV === 'production') {
    ConsoleLogger.debug('Performance entry not found', { assetUrl })
    return
  }

  const { decodedBodySize, transferSize, fetchStart, responseStart, responseEnd } = performanceEntry

  if (decodedBodySize / transferSize > 5) {
    // if resource size is considerably larger than over-the-wire transfer size, we can assume we got the result from the cache
    return
  }

  const metric: DataObjectResponseMetric = {
    initialResponseTime: responseStart - fetchStart,
    fullResponseTime: responseEnd - fetchStart,
  }

  AssetLogger.logDistributorResponseTime(eventEntry, metric)
}
