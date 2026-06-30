import LayoutC from './LayoutC'
import { Card } from '@/shared/components/ui/card'
import UnifiedOperatorControls from './shared/UnifiedOperatorControls'
import PreviewWrapper from './shared/PreviewWrapper'

export default function OperatorC({ data, actions, displayTime, formatTime, roomId, theme }) {
  const isLight = true

  return (
    <div className={`operator-c-container ${isLight ? 'theme-light' : ''}`}>

      {/* ── Header Bar ── */}
      <div className='op-topbar'>
        <h2 className='op-topbar-title'>⚽ EPL Scoreboard</h2>
      </div>

      <Card className='operator-c-preview-box'>
        <PreviewWrapper>
          <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
            <div style={{ width: '100%', height: '100%' }}>
              <LayoutC
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
    </div>
  )
}
