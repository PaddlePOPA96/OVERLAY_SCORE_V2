import LayoutAFF2 from './LayoutAFF2'
import { Card } from '@/shared/components/ui/card'
import UnifiedOperatorControls from './shared/UnifiedOperatorControls'
import PreviewWrapper from './shared/PreviewWrapper'

export default function OperatorAFF2({ data, actions, displayTime, formatTime, roomId, theme }) {
  const isLight = true

  return (
    <div className={`operator-b-container ${isLight ? 'theme-light' : ''}`}>

      {/* ── Header Bar ── */}
      <div className='op-topbar'>
        <h2 className='op-topbar-title'>⚽ Layout AFF 2</h2>
      </div>

      <Card className='operator-b-preview-box flex justify-center items-center overflow-hidden min-h-[300px] bg-black/20 relative'>
        <PreviewWrapper>
          <LayoutAFF2
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
        isAFF={true}
      />
    </div>
  )
}
