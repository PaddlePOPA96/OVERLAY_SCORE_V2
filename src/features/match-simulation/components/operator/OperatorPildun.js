'use client'

import { useState } from 'react'
import LayoutPildun from './LayoutPildun'
import { Card } from '@/components/ui/card'
import PreviewWrapper from './shared/PreviewWrapper'
import UnifiedOperatorControls from './shared/UnifiedOperatorControls'
import MobileOperatorView from './MobileOperatorView'
import ThirdTitleOverlay from '@/app/(dashboard)/dashboard/operator/overlay/_components/ThirdTitleOverlay'

export default function OperatorPildun({ data, actions, displayTime, formatTime, roomId, theme }) {
  const isLight = theme === 'light'
  const [viewMode, setViewMode] = useState('desktop')

  return (
    <div className={`operator-b-container ${isLight ? 'theme-light' : ''}`}>

      {/* ── Header + Mode Toggle Bar ── */}
      <div className='op-topbar'>
        <h2 className='op-topbar-title'>⚽ Layout Pildun – World Cup 2026</h2>
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
            <LayoutPildun
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
