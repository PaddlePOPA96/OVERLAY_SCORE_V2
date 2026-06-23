'use client'

// Third-party Imports
import styled from '@emotion/styled'

// Component Imports
const MaterioLogo = (props) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2L2 22h20L12 2z"/>
  </svg>
)

// Config Imports
import themeConfig from '@/shared/configs/themeConfig'

const LogoText = styled.span`
  color: ${({ color }) => color ?? 'var(--mui-palette-text-primary)'};
  font-size: 1.25rem;
  line-height: 1.2;
  font-weight: 600;
  letter-spacing: 0.15px;
  text-transform: uppercase;
  margin-inline-start: 10px;
`

const Logo = ({ color }) => {
  return (
    <div className='flex items-center min-bs-[24px]'>
      <img src="/icon-512x512.png" alt="Scorebos Logo" className="w-[32px] h-[32px] object-contain rounded-md" />
      <LogoText color={color}>{themeConfig.templateName}</LogoText>
    </div>
  )
}

export default Logo
