'use client'

import { useState } from 'react'
import LayoutPildun2 from './LayoutPildun2'
import { Card } from '@/components/ui/card'
import PreviewWrapper from './shared/PreviewWrapper'
import UnifiedOperatorControls from './shared/UnifiedOperatorControls'
import MobileOperatorView from './MobileOperatorView'

export default function OperatorPildun2({ data, actions, displayTime, formatTime, roomId, theme }) {
  const isLight = theme === 'light'
  const [viewMode, setViewMode] = useState('desktop')

  return (
    <div className={`operator-b-container ${isLight ? 'theme-light' : ''}`}>

      {/* ── Header + Mode Toggle Bar ── */}
      <div className='op-topbar'>
        <h2 className='op-topbar-title' style={{ color: isLight ? '#0f172a' : '#ffffff' }}>⚽ Layout Pildun 2</h2>
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
          <Card className='operator-b-preview-box flex justify-center items-center overflow-hidden min-h-[300px] bg-black/20'>
            <PreviewWrapper>
            <LayoutPildun2
              data={{ ...data, showOverlay: true, isPreview: true }}
              displayTime={displayTime}
              formatTime={formatTime}
            />
          </PreviewWrapper>
          </Card>

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
