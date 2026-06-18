// Komponen overlay yang dipakai di dalam iframe OBS overlay.
// Semua logika ada di shared component: @/components/ui/RunningTextOverlay
import RunningTextOverlay from '@/components/ui/RunningTextOverlay'

export default function RunningTextOverlayWidget() {
  return <RunningTextOverlay isPageMode={false} />
}
