'use client'

import { useMemo } from 'react'

import {
  Experimental_CssVarsProvider as CssVarsProvider,
  experimental_extendTheme as extendTheme,
  lighten,
  darken
} from '@mui/material/styles'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter'
import CssBaseline from '@mui/material/CssBaseline'

import { AuthProvider } from '@/shared/components/providers/AuthContext'
import primaryColorConfig from '@/shared/configs/primaryColorConfig'

const ThemeProvider = props => {
  const { children } = props

  const theme = useMemo(() => {
    return extendTheme({
      shape: {
        borderRadius: 6
      },
      typography: {
        fontFamily: 'var(--font-inter), sans-serif'
      },
      components: {
        MuiButtonBase: {
          defaultProps: {
            disableRipple: true
          }
        },
        MuiButton: {
          styleOverrides: {
            root: {
              textTransform: 'none',
              boxShadow: 'none',
              '&:hover': {
                boxShadow: 'none'
              }
            }
          }
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundImage: 'none'
            }
          }
        },
        MuiAppBar: {
          styleOverrides: {
            root: {
              boxShadow: 'none',
              backgroundImage: 'none'
            }
          }
        }
      },
      colorSchemes: {
        light: {
          palette: {
            primary: {
              main: primaryColorConfig[0].main,
              light: lighten(primaryColorConfig[0].main, 0.2),
              dark: darken(primaryColorConfig[0].main, 0.1)
            },
            background: {
              default: '#f4f4f5',
              paper: '#ffffff'
            }
          }
        },
        dark: {
          palette: {
            primary: {
              main: primaryColorConfig[0].main,
              light: lighten(primaryColorConfig[0].main, 0.2),
              dark: darken(primaryColorConfig[0].main, 0.1)
            },
            background: {
              default: '#000000',
              paper: '#09090b'
            }
          }
        }
      }
    })
  }, [])

  return (
    <AppRouterCacheProvider options={{ prepend: true }}>
      <CssVarsProvider theme={theme} defaultMode='dark'>
        <>
          <CssBaseline />
          <AuthProvider>{children}</AuthProvider>
        </>
      </CssVarsProvider>
    </AppRouterCacheProvider>
  )
}

export default ThemeProvider
