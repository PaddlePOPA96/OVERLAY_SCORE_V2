'use client'

import { useState } from 'react'
import LayoutD from './LayoutD'
import { Card } from '@/components/ui/card'
import UnifiedOperatorControls from './shared/UnifiedOperatorControls'
import MobileOperatorView from './MobileOperatorView'
import PreviewWrapper from './shared/PreviewWrapper'

export default function OperatorD({ data, actions, displayTime, formatTime, roomId, theme }) {
  const isLight = theme === 'light'
  const [viewMode, setViewMode] = useState('desktop')

  return (
    <div className={`operator-b-container ${isLight ? 'theme-light' : ''}`}>

      {/* ── Header + Mode Toggle Bar ── */}
      <div className='op-topbar'>
        <h2 className='op-topbar-title'>⚽ Layout D – Valorant Esports</h2>
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
          <Card className='operator-b-preview-box'>
            <PreviewWrapper>
            <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
            <div style={{
              width: '100%', height: '100%',

            }}>
              <LayoutD
              data={{ ...data, showOverlay: true, isPreview: true }}
              displayTime={displayTime}
              formatTime={formatTime}
            />
            </div>
          </div>
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
