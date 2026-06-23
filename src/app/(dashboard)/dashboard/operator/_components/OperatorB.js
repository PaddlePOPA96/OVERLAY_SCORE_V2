import LayoutB from './LayoutB'
import { Card } from '@/shared/components/ui/card'
import UnifiedOperatorControls from './shared/UnifiedOperatorControls'
import PreviewWrapper from './shared/PreviewWrapper'

export default function OperatorB({ data, actions, displayTime, formatTime, roomId, theme }) {
  const isLight = theme === 'light'

  return (
    <div className={`operator-b-container ${isLight ? 'theme-light' : ''}`}>

      {/* ── Header Bar ── */}
      <div className='op-topbar'>
        <h2 className='op-topbar-title'>⚽ EPL Scoreboard</h2>
      </div>

      <Card className='operator-b-preview-box'>
        <PreviewWrapper>
          <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
            <div style={{ width: '100%', height: '100%' }}>
              <LayoutB
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
