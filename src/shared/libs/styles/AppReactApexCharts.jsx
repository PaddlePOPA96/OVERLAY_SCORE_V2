'use client'

import ReactApexcharts from '@/shared/libs/ApexCharts'

const AppReactApexCharts = props => {
  const { boxProps, ...rest } = props

  return (
    <div className="apexchart-wrapper p-4 border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] bg-white" {...boxProps}>
      <style jsx global>{`
        .apexcharts-tooltip {
          box-shadow: 4px 4px 0 0 rgba(0,0,0,1) !important;
          border: 2px solid black !important;
          background: white !important;
          border-radius: 0 !important;
        }
        .apexcharts-tooltip-title {
          font-weight: 900 !important;
          text-transform: uppercase !important;
          border-bottom: 2px solid black !important;
          background: #ccff00 !important;
          color: black !important;
        }
        .apexcharts-text {
          fill: black !important;
          font-weight: bold !important;
        }
      `}</style>
      <ReactApexcharts {...rest} />
    </div>
  )
}

export default AppReactApexCharts
