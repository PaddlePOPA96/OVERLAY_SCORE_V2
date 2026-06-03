'use client'

import { useState, useEffect } from 'react'

import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'

import { auth } from '@/lib/firebase'
import { useLayoutSettings } from '@/hooks/useLayoutSettings'
import { useUserRole } from '@/features/iam/hooks/useUserRole'
import { usePremierLeagueMatches } from '@/features/premier-league/hooks/usePremierLeagueData'
import { useChampionsLeagueMatches } from '@/features/champions-league/hooks/useChampionsLeagueData'
import { useWorldCupMatches } from '@/features/world-cup/hooks/useWorldCupData'

export function RunningTextSetupContent() {
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
    <div className='p-4'>
      <Card className='w-full border border-slate-700/20 bg-slate-50 shadow-sm rounded-xl'>
        <CardContent className='p-6 space-y-6'>
          {/* Match Data Source Selector */}
          <div>
            <Typography variant='subtitle2' className='text-xs uppercase text-slate-500 font-bold mb-2'>
              Match Data Source
            </Typography>
            <div className='flex flex-col sm:flex-row gap-3 items-stretch sm:items-center'>
              <div className='max-w-xs flex-1'>
                <FormControl fullWidth size='small' className='bg-white rounded border border-slate-300'>
                  <Select
                    value={activeSource}
                    onChange={handleSourceChange}
                    displayEmpty
                    className='text-slate-800 text-sm'
                  >
                    <MenuItem value='premier-league'>🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League</MenuItem>
                    <MenuItem value='champions-league'>🏆 UEFA Champions League</MenuItem>
                    <MenuItem value='world-cup'>🌎 FIFA World Cup</MenuItem>
                  </Select>
                </FormControl>
              </div>
              {isSuperAdmin && (
                <Button
                  variant='outlined'
                  color='secondary'
                  onClick={handleRefresh}
                  disabled={refreshing || loadingSettings}
                  className='normal-case font-semibold text-sm h-10 px-4'
                >
                  {refreshing ? 'Refreshing...' : '🔄 Refresh Source Data'}
                </Button>
              )}
            </div>
            {refreshStatus && (
              <Typography
                variant='caption'
                className={`mt-1.5 block ${refreshStatus.startsWith('Error') ? 'text-red-500' : 'text-emerald-600 font-medium'}`}
              >
                {refreshStatus}
              </Typography>
            )}
            <Typography variant='caption' className='text-slate-400 mt-1 block'>
              Select which competition matches to display and refresh the matches data directly from the API.
            </Typography>
          </div>

          <div>
            <Typography variant='subtitle2' className='text-xs uppercase text-slate-500 font-bold mb-2'>
              OBS Overlay URL
            </Typography>
            <div className='flex flex-col sm:flex-row gap-2 items-stretch sm:items-center'>
              <code className='flex-1 p-3 rounded text-sm font-mono bg-slate-900 text-green-400 overflow-x-auto select-all'>
                {overlayUrl}
              </code>
              <div className='flex gap-2'>
                <Button
                  variant='contained'
                  color='primary'
                  onClick={handleCopy}
                  className='px-4 font-semibold text-sm normal-case'
                >
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
                <Button
                  variant='outlined'
                  href={overlayUrl}
                  target='_blank'
                  className='px-4 font-semibold text-sm normal-case'
                >
                  Open Live
                </Button>
              </div>
            </div>
          </div>

          <div className='p-4 rounded-lg text-sm bg-blue-50 text-blue-800 border border-blue-100'>
            <Typography variant='body2' className='font-semibold mb-2 text-blue-900'>
              How to Install in OBS:
            </Typography>
            <ol className='list-decimal list-inside space-y-1.5 opacity-90 text-xs'>
              <li>
                Open OBS and create a new source: <strong>Browser Source</strong>
              </li>
              <li>Paste the URL copied above into the URL field.</li>
              <li>
                Set Width: <strong>1920</strong> (or same as your OBS canvas width).
              </li>
              <li>
                Set Height: <strong>80</strong> (adjust depending on ticker size).
              </li>
              <li>Check &quot;Refresh browser when scene becomes active&quot; if desired, and click OK.</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Default export for the /running-text-setup route
export default RunningTextSetupContent

