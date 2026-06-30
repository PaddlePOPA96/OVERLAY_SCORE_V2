import { execFile } from 'child_process'

export function resolveInstagram(url) {
  return new Promise((resolve, reject) => {
    // Jalankan yt-dlp dengan execFile yang lebih aman
    execFile('yt-dlp', ['-j', '-f', '1/best', url], (error, stdout, stderr) => {
      if (error) {
        console.error('yt-dlp exec error:', stderr)
        
return reject(new Error('Failed to resolve Instagram Reels URL'))
      }

      try {
        const data = JSON.parse(stdout)

        resolve({
          videoId: data.display_id || data.id || 'instagram_video',
          videoUrl: data.url || null,
          title: data.title || data.description || 'Instagram Reel',
          duration: Math.round(data.duration) || 25,
          cover: data.thumbnail || '',
          finalUrl: url
        })
      } catch (parseErr) {
        console.error('yt-dlp json parse error:', parseErr)
        reject(new Error('Failed to parse Instagram Reels metadata'))
      }
    })
  })
}

export async function resolveTiktok(targetUrl) {
    // Support short URLs like vt.tiktok.com, vm.tiktok.com, tiktok.com/t/, v.tiktok.com
    const isShortUrl =
      targetUrl.includes('vt.tiktok.com') ||
      targetUrl.includes('vm.tiktok.com') ||
      targetUrl.includes('tiktok.com/t/') ||
      targetUrl.includes('v.tiktok.com')

    if (isShortUrl) {
      try {
        const res = await fetch(targetUrl, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5'
          },
          redirect: 'follow'
        })

        if (res.ok) {
          targetUrl = res.url
        }
      } catch (err) {
        console.warn('Failed to resolve short URL redirect, using original URL:', err)
      }
    }

    let videoId = null
    let videoUrl = null
    let title = 'TikTok Video'
    let duration = 25
    let cover = ''

    // 1. Attempt to parse using TikWM API with www. (which has CORS headers and avoids Cloudflare block)
    try {
      const tikWmRes = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(targetUrl)}`, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
        }
      })

      if (tikWmRes.ok) {
        const result = await tikWmRes.json()

        if (result.code === 0 && result.data) {
          videoId = result.data.id
          videoUrl = result.data.play // Watermark-free direct MP4 URL
          title = result.data.title || 'TikTok Video'
          duration = result.data.duration || 25
          cover = result.data.cover || ''
        }
      }
    } catch (err) {
      console.warn('TikWM API request failed, trying backup API:', err)
    }

    // 2. Backup API: Tiklydown (highly reliable open API)
    if (!videoId) {
      try {
        const tiklyRes = await fetch(`https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(targetUrl)}`, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
          }
        })

        if (tiklyRes.ok) {
          const result = await tiklyRes.json()

          if (result.id && result.video) {
            videoId = result.id
            videoUrl = result.video.noWatermark || result.video.watermark || result.video.url || null
            title = result.title || 'TikTok Video'
            duration = result.duration || 25
            cover = result.video.cover || ''
          }
        }
      } catch (backupErr) {
        console.warn('Tiklydown API request failed:', backupErr)
      }
    }

    // 3. Graceful Fallback: If both APIs failed, extract videoId using regex for standard iframe embed
    if (!videoId) {
      const match = targetUrl.match(/\/video\/(\d+)/) || targetUrl.match(/\/v\/(\d+)/)

      if (match) {
        videoId = match[1]
      } else {
        throw new Error('Could not extract TikTok Video ID. Please check the URL format.')
      }
    }

    return {
      videoId,
      videoUrl,
      title,
      duration,
      cover,
      finalUrl: targetUrl
    }
}
