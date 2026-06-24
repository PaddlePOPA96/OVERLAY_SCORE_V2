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
        borderRadius: 0
      },
      typography: {
        fontFamily: 'var(--font-inter), sans-serif',
        button: {
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }
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
              border: '3px solid #000',
              boxShadow: '4px 4px 0px 0px #000',
              transition: 'all 0.1s ease',
              '&:hover': {
                transform: 'translate(2px, 2px)',
                boxShadow: '2px 2px 0px 0px #000'
              },
              '&:active': {
                transform: 'translate(4px, 4px)',
                boxShadow: 'none'
              }
            },
            containedPrimary: {
              backgroundColor: primaryColorConfig[0].main,
              color: '#D9FF00', // Yellow text on blue button
              '&:hover': {
                backgroundColor: darken(primaryColorConfig[0].main, 0.1)
              }
            },
            containedSecondary: {
              backgroundColor: '#D9FF00',
              color: '#000',
              '&:hover': {
                backgroundColor: '#c4e600'
              }
            }
          }
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundImage: 'none',
              border: '3px solid #000',
              boxShadow: '6px 6px 0px 0px #000',
              borderRadius: 0
            }
          }
        },
        MuiCard: {
          styleOverrides: {
            root: {
              border: '3px solid #000',
              boxShadow: '6px 6px 0px 0px #000',
              borderRadius: 0
            }
          }
        },
        MuiAppBar: {
          styleOverrides: {
            root: {
              boxShadow: '0px 4px 0px 0px #000',
              borderBottom: '3px solid #000',
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
            secondary: {
              main: '#D9FF00',
              contrastText: '#000'
            },
            background: {
              default: '#F5F4F0',
              paper: '#ffffff'
            },
            text: {
              primary: '#000000',
              secondary: '#1f2937'
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
            secondary: {
              main: '#D9FF00',
              contrastText: '#000'
            },
            // Force Neo-brutalist bright colors even in dark mode
            background: {
              default: '#F5F4F0',
              paper: '#ffffff'
            },
            text: {
              primary: '#000000',
              secondary: '#1f2937'
            }
          }
        }
      }
    })
  }, [])

  return (
    <AppRouterCacheProvider options={{ prepend: true }}>
      <CssVarsProvider theme={theme} defaultMode='light'>
        <>
          <CssBaseline />
          <AuthProvider>{children}</AuthProvider>
        </>
      </CssVarsProvider>
    </AppRouterCacheProvider>
  )
}

export default ThemeProvider
