'use client'

import { useState } from 'react'
import UnifiedOperatorControls from './UnifiedOperatorControls'
import MobileOperatorView from '../MobileOperatorView'
import OperatorPreview from './OperatorPreview'

/**
 * Shared operator shell that renders the topbar, mode toggle, 
 * preview (using the same layout source as overlay), and controls.
 * All operator variants (A-E, Pildun, Pildun2) now use this single component.
 */
export default function OperatorShell({ data, actions, displayTime, formatTime, roomId, theme, title = '⚽ Scoreboard' }) {
  const isLight = theme === 'light'
  const [viewMode, setViewMode] = useState('desktop')

  return (
    <div className={`operator-b-container ${isLight ? 'theme-light' : ''}`}>

      {/* ── Header + Mode Toggle Bar ── */}
      <div className='op-topbar'>
        <h2 className='op-topbar-title'>{title}</h2>
        <div className='op-mode-toggle'>
          <button
            className={`op-mode-btn ${viewMode === 'desktop' ? 'active' : ''}`}
            onClick={() => setViewMode('desktop')}
          >
            <i className='ri-computer-line' />
            <span>Desktop</span>
          </button>
          <button
            className={`op-mode-btn ${viewMode === 'mobile' ? 'active' : ''}`}
            onClick={() => setViewMode('mobile')}
          >
            <i className='ri-smartphone-line' />
            <span>Mobile</span>
          </button>
        </div>
      </div>

      {viewMode === 'mobile' ? (
        <MobileOperatorView
          data={data}
          actions={actions}
          displayTime={displayTime}
          formatTime={formatTime}
          roomId={roomId}
          theme={theme}
        />
      ) : (
        <>
          <OperatorPreview
            data={data}
            displayTime={displayTime}
            formatTime={formatTime}
          />

          <UnifiedOperatorControls
            data={data}
            actions={actions}
            displayTime={displayTime}
            formatTime={formatTime}
            roomId={roomId}
            theme={theme}
          />
        </>
      )}
    </div>
  )
}
