'use client'

// Config Imports
import themeConfig from '@/shared/configs/themeConfig'

const Logo = ({ color }) => {
  return (
    <div className='flex items-center min-h-[24px]'>
      <img src="/icon-512x512.png" alt="Scorebos Logo" className="w-[32px] h-[32px] object-contain rounded-md border-2 border-black" />
      <span 
        className={`text-xl font-black uppercase tracking-wide ml-2 ${!color ? 'text-black' : ''}`}
        style={color ? { color } : undefined}
      >
        {themeConfig.templateName}
      </span>
    </div>
  )
}

export default Logo
