import { useState, useEffect } from 'react'

import { Button } from '@/components/ui/button'

export default function TimerControls({
  data,
  actions,
  displayTime,
  formatTime,
  btnMainClass = 'op-b-btn-main' // Default to B/C style, A uses op-a-btn-main
}) {
  const [manualM, setManualM] = useState(0)
  const [manualS, setManualS] = useState(0)

  // For syncing the local input with the display time when not running
  useEffect(() => {
    if (!data.timer.isRunning) {
      setManualM(Math.floor(displayTime / 60))
      setManualS(displayTime % 60)
    }
  }, [displayTime, data.timer.isRunning])

  const handleSetTime = () => {
    const total = (parseInt(manualM, 10) || 0) * 60 + (parseInt(manualS, 10) || 0)

    actions.updateMatch({
      'timer/baseTime': total,
      'timer/startTime': null,
      'timer/isRunning': false
    })
  }

  return (
    <>
      <div className='op-section'>
        <label className='op-label'>Set Time</label>
        <input
          className='op-input'
          type='number'
          style={{ width: '50px' }}
          value={manualM}
          onChange={e => setManualM(e.target.value)}
        />{' '}
        :{' '}
        <input
          className='op-input'
          type='number'
          style={{ width: '50px' }}
          value={manualS}
          onChange={e => setManualS(e.target.value)}
        />
        <Button className='op-btn' variant='outline' size='sm' onClick={handleSetTime}>
          Set
        </Button>
      </div>

      <div className='op-section'>
        <label className='op-label'>Timer</label>
        <Button className={`op-btn ${btnMainClass}`} onClick={actions.toggleTimer}>
          {data.timer.isRunning ? 'Pause' : 'Start'}
        </Button>
        <Button className='op-btn' variant='outline' onClick={actions.resetTimer}>
          Reset
        </Button>
        <span className='op-tiny font-mono text-lg ml-2'>{formatTime(displayTime)}</span>
      </div>
    </>
  )
}
