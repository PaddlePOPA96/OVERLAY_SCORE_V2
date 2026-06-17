import OperatorPreview from './OperatorPreview'
import UnifiedOperatorControls from './UnifiedOperatorControls'

/**
 * Shared operator shell that renders the topbar,
 * preview (using the same layout source as overlay), and controls.
 * All operator variants (A-E, Pildun, Pildun2) now use this single component.
 */
export default function OperatorShell({ data, actions, displayTime, formatTime, roomId, theme, title = '⚽ Scoreboard' }) {
  const isLight = theme === 'light'

  return (
    <div className={`operator-b-container ${isLight ? 'theme-light' : ''}`}>

      {/* ── Header Bar ── */}
      <div className='op-topbar'>
        <h2 className='op-topbar-title'>{title}</h2>
      </div>

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
    </div>
  )
}
