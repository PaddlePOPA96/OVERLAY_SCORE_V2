'use client'

import { useState, useEffect } from 'react'

import { auth } from '@/services/firebase/index'
import { useLayoutSettings } from '@/shared/hooks/useLayoutSettings'
import { useUserRole } from '@/features/iam/hooks/useUserRole'
import { usePremierLeagueMatches } from '@/features/premier-league/hooks/usePremierLeagueData'
import { useChampionsLeagueMatches } from '@/features/champions-league/hooks/useChampionsLeagueData'
import { useWorldCupMatches } from '@/features/world-cup/hooks/useWorldCupData'

export default function RunningTextSetupContent() {
  const [copied, setCopied] = useState(false)
  const [origin, setOrigin] = useState('')
  const { settings, loading: loadingSettings, updateSettings } = useLayoutSettings()

  // Resolve current user & role for superadmin gate
  const [currentUser, setCurrentUser] = useState(auth.currentUser || null)

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(u => setCurrentUser(u))

    return () => unsub()
  }, [])
  const { isSuperAdmin, loading: loadingRole } = useUserRole(currentUser)

  // Match hooks to trigger API reloads
  const { reloadMatches } = usePremierLeagueMatches()
  const { reloadUclMatches } = useChampionsLeagueMatches()
  const { reloadWcMatches } = useWorldCupMatches()

  const [refreshing, setRefreshing] = useState(false)
  const [refreshStatus, setRefreshStatus] = useState(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin)
    }
  }, [])

  const overlayUrl = `${origin}/dashboard/running-text`

  const handleCopy = () => {
    navigator.clipboard.writeText(overlayUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const activeSource = settings?.runningText?.source || 'premier-league'

  const handleSourceChange = event => {
    updateSettings('runningText', { source: event.target.value })
  }

  const customTexts = settings?.runningText?.customTexts || (settings?.runningText?.customText ? [settings?.runningText?.customText] : [''])

  const handleCustomTextChange = (index, value) => {
    const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0

    let finalValue = value
    if (wordCount > 25) {
      // Truncate to 25 words if pasted or typed over limit
      finalValue = value.trim().split(/\s+/).slice(0, 25).join(' ')
    }

    const newTexts = [...customTexts]
    newTexts[index] = finalValue
    updateSettings('runningText', { customTexts: newTexts })
  }

  const addCustomText = () => {
    if (customTexts.length < 5) {
      updateSettings('runningText', { customTexts: [...customTexts, ''] })
    }
  }

  const removeCustomText = index => {
    const newTexts = customTexts.filter((_, i) => i !== index)
    if (newTexts.length === 0) newTexts.push('')
    updateSettings('runningText', { customTexts: newTexts })
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    setRefreshStatus(null)

    try {
      if (activeSource === 'premier-league') {
        await reloadMatches()
        setRefreshStatus('Successfully refreshed Premier League matches data!')
      } else if (activeSource === 'champions-league') {
        await reloadUclMatches()
        setRefreshStatus('Successfully refreshed Champions League matches data!')
      } else if (activeSource === 'world-cup') {
        await reloadWcMatches()
        setRefreshStatus('Successfully refreshed World Cup matches data!')
      }
    } catch (error) {
      console.error('Error refreshing matches:', error)
      setRefreshStatus(`Error refreshing: ${error.message || 'Unknown error'}`)
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <div className='p-4 sm:p-8 w-full max-w-[1440px] mx-auto'>
      <div className='w-full border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 sm:p-8 space-y-10'>
        {/* Match Data Source Selector */}
        <div>
          <h2 className='text-xl uppercase text-black font-black mb-4 tracking-tight'>
            Match Data Source
          </h2>
          <div className='flex flex-col gap-4'>
            <div className='flex w-full border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'>
              {[
                { id: 'premier-league', label: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 EPL' },
                { id: 'champions-league', label: '🏆 UCL' },
                { id: 'world-cup', label: '🌎 World Cup' },
                { id: 'custom-text', label: '✍️ Custom Text' }
              ].map((src, i) => (
                <button
                  key={src.id}
                  onClick={() => handleSourceChange({ target: { value: src.id } })}
                  className={`flex-1 px-1 sm:px-2 py-3 sm:py-4 font-black text-[10px] sm:text-sm uppercase transition-colors ${i !== 3 ? 'border-r-4 border-black' : ''
                    } ${activeSource === src.id ? 'bg-[#bbf7d0] text-black' : 'bg-white text-black hover:bg-gray-100'
                    }`}
                >
                  {src.label}
                </button>
              ))}
            </div>
            {isSuperAdmin && (
              <button
                onClick={handleRefresh}
                disabled={refreshing || loadingSettings}
                className='self-start px-6 py-3 bg-[#fef08a] text-black font-black uppercase text-sm border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {refreshing ? 'Refreshing...' : '🔄 Refresh Source Data'}
              </button>
            )}
          </div>
          {refreshStatus && (
            <p
              className={`mt-3 font-bold ${refreshStatus.startsWith('Error') ? 'text-red-600' : 'text-emerald-700'}`}
            >
              {refreshStatus}
            </p>
          )}
          <p className='text-black font-medium mt-2 text-sm'>
            Select which competition matches to display and refresh the matches data directly from the API.
          </p>

          {activeSource === 'custom-text' && (
            <div className='mt-6 p-4 border-4 border-black bg-[#bfdbfe] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'>
              <h3 className='text-sm uppercase text-black font-black mb-3 flex items-center justify-between'>
                <span>Custom Text Content</span>
                <span className='text-xs bg-black text-white px-2 py-0.5 shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] border border-white'>
                  {customTexts.length} / 5
                </span>
              </h3>

              <div className='space-y-4'>
                {customTexts.map((text, idx) => {
                  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0
                  return (
                    <div key={idx} className='flex flex-col gap-1'>
                      <div className='flex gap-2'>
                        <input
                          type='text'
                          value={text}
                          onChange={e => handleCustomTextChange(idx, e.target.value)}
                          placeholder={`Text item ${idx + 1}...`}
                          className='w-full px-4 py-3 bg-white text-black font-bold text-sm border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all rounded-none'
                        />
                        {customTexts.length > 1 && (
                          <button
                            onClick={() => removeCustomText(idx)}
                            className='px-4 bg-[#f87171] text-black border-4 border-black font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all'
                          >
                            X
                          </button>
                        )}
                      </div>
                      <span className={`text-xs font-black text-right pr-1 ${wordCount >= 25 ? 'text-red-600' : 'text-slate-800'}`}>
                        {wordCount} / 25 words
                      </span>
                    </div>
                  )
                })}
              </div>

              {customTexts.length < 5 && (
                <button
                  onClick={addCustomText}
                  className='mt-4 w-full py-3 bg-[#fde047] text-black font-black uppercase text-sm border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all'
                >
                  + Add Text
                </button>
              )}
            </div>
          )}
        </div>

        <div>
          <h2 className='text-xl uppercase text-black font-black mb-4 tracking-tight'>
            OBS Overlay URL
          </h2>
          <div className='flex flex-col sm:flex-row gap-4 items-stretch sm:items-center'>
            <code className='flex-1 p-4 border-4 border-black bg-black text-[#4ade80] font-mono font-bold text-sm overflow-x-auto shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] select-all'>
              {overlayUrl}
            </code>
            <div className='flex gap-3'>
              <button
                onClick={handleCopy}
                className='px-6 py-3 bg-[#f87171] text-black font-black uppercase text-sm border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all'
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <a
                href={overlayUrl}
                target='_blank'
                rel='noreferrer'
                className='inline-flex items-center justify-center px-6 py-3 bg-[#c084fc] text-black font-black uppercase text-sm border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all'
              >
                Open Live
              </a>
            </div>
          </div>
        </div>

        <div className='p-6 border-4 border-black bg-[#fcd34d] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'>
          <h3 className='font-black uppercase text-black mb-3 text-lg'>
            How to Install in OBS:
          </h3>
          <ol className='list-decimal list-inside space-y-2 font-bold text-sm text-black'>
            <li>Open OBS and create a new source: <strong>Browser Source</strong></li>
            <li>Paste the URL copied above into the URL field.</li>
            <li>Set Width: <strong>1920</strong> (or same as your OBS canvas width).</li>
            <li>Set Height: <strong>80</strong> (adjust depending on ticker size).</li>
            <li>Check &quot;Refresh browser when scene becomes active&quot; if desired, and click OK.</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
