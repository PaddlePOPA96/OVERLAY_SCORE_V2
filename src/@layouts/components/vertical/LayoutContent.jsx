'use client'

// Third-party Imports
import classnames from 'classnames'

// Util Imports
import { verticalLayoutClasses } from '@layouts/utils/layoutClasses'

// Styled Component Imports
import StyledMain from '@layouts/styles/shared/StyledMain'

const LayoutContent = ({ children }) => {
  return (
    <StyledMain
      isContentCompact={false}
      className={classnames(verticalLayoutClasses.content, 'flex-auto min-is-0 is-full bg-backgroundDefault')}
    >
      {children}
    </StyledMain>
  )
}

export default LayoutContent
