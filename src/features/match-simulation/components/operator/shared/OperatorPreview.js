'use client'

import LayoutA from '../LayoutA'
import LayoutB from '../LayoutB'
import LayoutC from '../LayoutC'
import LayoutD from '../LayoutD'
import LayoutE from '../LayoutE'
import LayoutPildun from '../LayoutPildun'
import LayoutPildun2 from '../LayoutPildun2'
import ThirdTitleOverlay from '@/app/(dashboard)/dashboard/operator/overlay/_components/ThirdTitleOverlay'
import PreviewWrapper from './PreviewWrapper'
import { Card } from '@/components/ui/card'

/**
 * Unified preview component used by ALL operator variants.
 * This renders the exact same Layout components that the overlay page uses,
 * ensuring preview and overlay always look identical.
 */
export default function OperatorPreview({ data, displayTime, formatTime }) {
  const previewData = { ...data, showOverlay: true, isPreview: true }
  const layout = data.layout || 'B'
  const isThirdTitleShowing = data?.thirdTitle?.isShowing === true

  const renderLayout = () => {
    switch (layout) {
      case 'A':
        return <LayoutA data={previewData} displayTime={displayTime} formatTime={formatTime} />
      case 'C':
        return <LayoutC data={previewData} displayTime={displayTime} formatTime={formatTime} />
      case 'D':
        return <LayoutD data={previewData} displayTime={displayTime} formatTime={formatTime} />
      case 'E':
        return <LayoutE data={previewData} displayTime={displayTime} formatTime={formatTime} />
      case 'Pildun':
        return <LayoutPildun data={previewData} displayTime={displayTime} formatTime={formatTime} />
      case 'Pildun2':
        return <LayoutPildun2 data={previewData} displayTime={displayTime} formatTime={formatTime} />
      default:
        return <LayoutB data={previewData} displayTime={displayTime} formatTime={formatTime} />
    }
  }

  return (
    <Card className='operator-b-preview-box'>
      <PreviewWrapper>
        <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
          <div
            style={{
              width: '100%',
              height: '100%',
              transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: isThirdTitleShowing ? 'translateY(-40px)' : 'translateY(0)'
            }}
          >
            {renderLayout()}
          </div>
          <ThirdTitleOverlay data={data} />
        </div>
      </PreviewWrapper>
    </Card>
  )
}
