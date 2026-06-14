'use client'

import { useState } from 'react'
import LayoutA from './LayoutA'
import { Card } from '@/components/ui/card'
import PreviewWrapper from './shared/PreviewWrapper'
import UnifiedOperatorControls from './shared/UnifiedOperatorControls'
import MobileOperatorView from './MobileOperatorView'
import ThirdTitleOverlay from '@/app/(dashboard)/dashboard/operator/overlay/_components/ThirdTitleOverlay'

export default function OperatorA({ data, actions, displayTime, formatTime, roomId, theme }) {
  const isLight = theme === 'light'
  const [viewMode, setViewMode] = useState('desktop')

  return (
    <div className={`operator-a-container ${isLight ? 'theme-light' : ''}`}>

      {/* ── Header + Mode Toggle Bar ── */}
      <div className='op-topbar'>
        <h2 className='op-topbar-title'>⚽ EPL Scoreboard</h2>
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
          <Card className='operator-a-preview-box'>
            <PreviewWrapper>
            <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
            <div style={{
              width: '100%', height: '100%',
              transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: data?.thirdTitle?.isShowing ? 'translateY(-40px)' : 'translateY(0)',
              
            }}>
              <LayoutA
              data={{ ...data, showOverlay: true, isPreview: true }}
              displayTime={displayTime}
              formatTime={formatTime}
            />
            </div>
            <ThirdTitleOverlay data={data} />
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
