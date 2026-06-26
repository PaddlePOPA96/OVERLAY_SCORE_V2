// Overlay page untuk OBS Browser Source.
// Semua logika ada di shared component: @/components/ui/RunningTextOverlay
import RunningTextOverlay from '@/features/overlay/components/RunningTextOverlay'

export default function RunningTextOverlayPage() {
  return <RunningTextOverlay isPageMode={true} />
}
