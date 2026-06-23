// Overlay page untuk OBS Browser Source.
// Semua logika ada di shared component: @/components/ui/RunningTextOverlay
import RunningTextOverlay from '@/shared/components/ui/RunningTextOverlay'

export default function RunningTextOverlayPage() {
  return <RunningTextOverlay isPageMode={true} />
}
