import LayoutPildun from './LayoutPildun'
import { Card } from '@/components/ui/card'
import UnifiedOperatorControls from './shared/UnifiedOperatorControls'
import PreviewWrapper from './shared/PreviewWrapper'

export default function OperatorPildun({ data, actions, displayTime, formatTime, roomId, theme }) {
  const isLight = theme === 'light'

  return (
    <div className={`operator-b-container ${isLight ? 'theme-light' : ''}`}>

      {/* ── Header Bar ── */}
      <div className='op-topbar'>
        <h2 className='op-topbar-title'>⚽ Layout Pildun – World Cup 2026</h2>
      </div>

      <Card className='operator-b-preview-box flex justify-center items-center overflow-hidden min-h-[300px] bg-black/20 relative'>
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
    </div>
  )
}
