'use client'

import React from 'react'

const Illustrations = props => {
  const { image1, image2, maskImg, mode } = props

  const darkImg = '/images/pages/misc-mask-dark.png'
  const lightImg = '/images/pages/misc-mask-light.png'

  const maskBackground = mode === 'light' ? lightImg : darkImg

  function isImageObj(obj) {
    return obj && typeof obj === 'object' && 'src' in obj
  }

  return (
    <div className="hidden md:block">
      {image1 && (isImageObj(image1) ? (
        <img
          alt={image1.alt || 'illustration-1'}
          src={image1.src}
          className={image1.className || 'absolute left-0 bottom-0'}
          width={image1.width}
          height={image1.height || 200}
        />
      ) : (
        image1
      ))}
      
      {typeof maskImg === 'undefined' || isImageObj(maskImg) ? (
        <img
          alt={maskImg?.alt || 'mask'}
          src={maskImg?.src || maskBackground}
          className={`absolute bottom-0 w-full z-[-1] ${maskImg?.className || ''}`}
          width={maskImg?.width}
          height={maskImg?.height}
        />
      ) : (
        maskImg
      )}

      {image2 && (isImageObj(image2) ? (
        <img
          alt={image2.alt || 'illustration-2'}
          src={image2.src}
          className={image2.className || 'absolute right-0 bottom-0'}
          width={image2.width}
          height={image2.height || 200}
        />
      ) : (
        image2
      ))}
    </div>
  )
}

export default Illustrations
