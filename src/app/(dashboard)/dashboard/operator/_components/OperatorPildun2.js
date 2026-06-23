import LayoutPildun2 from './LayoutPildun2'
import { Card } from '@/shared/components/ui/card'
import PreviewWrapper from './shared/PreviewWrapper'
import UnifiedOperatorControls from './shared/UnifiedOperatorControls'

export default function OperatorPildun2({ data, actions, displayTime, formatTime, roomId, theme }) {
  const isLight = theme === 'light'

  return (
    <div className={`operator-b-container ${isLight ? 'theme-light' : ''}`}>

      {/* ── Header Bar ── */}
      <div className='op-topbar'>
        <h2 className='op-topbar-title' style={{ color: isLight ? '#0f172a' : '#ffffff' }}>⚽ Layout Pildun 2</h2>
      </div>

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
    </div>
  )
}
