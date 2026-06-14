'use client'

import React, { useEffect, useRef, useState } from 'react'

export default function PreviewWrapper({ children }) {
  const containerRef = useRef(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        // Calculate the scale needed to fit 1440px into the container width
        const width = containerRef.current.clientWidth
        setScale(width / 1440)
      }
    }

    // Initial scale
    updateScale()

    // Resize observer to update scale when container size changes
    const observer = new ResizeObserver(() => {
      updateScale()
    })
    
    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div 
      ref={containerRef} 
      style={{ 
        width: '100%', 
        aspectRatio: '16/9', 
        position: 'relative', 
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000'
      }}
    >
      <div 
        style={{
          width: '1440px',
          height: '810px',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: 'center center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {children}
      </div>
    </div>
  )
}
