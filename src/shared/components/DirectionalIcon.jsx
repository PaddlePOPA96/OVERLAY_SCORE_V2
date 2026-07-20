'use client'

import classnames from 'classnames'

const DirectionalIcon = props => {
  const { ltrIconClass, rtlIconClass, className } = props

  // Assuming LTR by default without MUI theme
  return (
    <i
      className={classnames(
        ltrIconClass,
        className
      )}
    />
  )
}

export default DirectionalIcon
