'use client'

import { useState, useEffect } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'
import Alert from '@mui/material/Alert'


import Divider from '@mui/material/Divider'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'

import { loginWithEmailPassword, loginWithGooglePopup, sendResetPassword } from '@/services/auth/service'
import themeConfig from '@/shared/configs/themeConfig'
import Illustrations from '@/shared/components/Illustrations'
import Logo from '@/shared/components/layout/Logo'
import { useAuth } from '@/shared/components/providers/AuthContext'

const GOOGLE_LOGIN_DISABLED = false

const Login = ({ mode }) => {
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState({ type: '', message: '' })
  const [errorPopup, setErrorPopup] = useState({ open: false, title: '', message: '' })

  const { user, loading: authLoading } = useAuth()

  const darkImg = '/images/pages/auth-v1-mask-dark.png'
  const lightImg = '/images/pages/auth-v1-mask-light.png'

  const router = useRouter()
  const authBackground = mode === 'light' ? lightImg : darkImg
  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const savedRemember = window.localStorage.getItem('scoreboard-remember')
    const savedEmail = window.localStorage.getItem('scoreboard-email') || ''

    if (savedRemember === '1') {
      setRemember(true)

      if (savedEmail) {
        setEmail(savedEmail)
      }
    }
  }, [])

  useEffect(() => {
    // If the user is already authenticated, redirect them to the dashboard
    if (!authLoading && user) {
      router.replace('/dashboard')
    }
  }, [user, authLoading, router])

  const handleAuthSuccess = user => {
    if (!user) return

    if (typeof window !== 'undefined') {
      localStorage.removeItem('dashboardPasscodeVerified')

      if (remember) {
        window.localStorage.setItem('scoreboard-remember', '1')
        window.localStorage.setItem('scoreboard-email', user.email || email || '')
      } else {
        window.localStorage.removeItem('scoreboard-remember')
        window.localStorage.removeItem('scoreboard-email')
      }
    }

    router.push('/dashboard')
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setStatus({ type: '', message: '' })
    setLoading(true)

    try {
      const user = await loginWithEmailPassword(email, password)

      handleAuthSuccess(user)
    } catch (error) {
      setStatus({
        type: 'error',
        message: error?.message || 'Login failed. Please check your credentials.'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    if (GOOGLE_LOGIN_DISABLED) {
      setStatus({
        type: 'error',
        message: 'Google login is disabled. Please sign in using your admin-registered email & password.'
      })

      return
    }

    setStatus({ type: '', message: '' })
    setLoading(true)

    try {
      const { user, isNewUser } = await loginWithGooglePopup()

      if (isNewUser) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('showNewUserGuide', 'true')
        }
        handleAuthSuccess(user)
      } else {
        handleAuthSuccess(user)
      }
    } catch (error) {
      if (error?.message?.includes('Akses ditolak')) {
        setErrorPopup({
          open: true,
          title: 'Google Account Not Registered',
          message: error.message
        })
      } else {
        setStatus({
          type: 'error',
          message: error?.message || 'Failed to login with Google.'
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!email) {
      setStatus({
        type: 'error',
        message: 'Please enter your email address to reset password.'
      })

      return
    }

    setLoading(true)

    try {
      await sendResetPassword(email)
      setStatus({
        type: 'success',
        message: 'Password reset link sent successfully.'
      })
    } catch (error) {
      setStatus({
        type: 'error',
        message: error?.message || 'Failed to send reset email.'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex flex-col justify-center items-center min-bs-[100dvh] relative p-6 bg-slate-900/10'>
      <Card className='flex flex-col sm:is-[450px] z-10 shadow-lg border border-slate-700/10 rounded-2xl'>
        <CardContent className='p-6 sm:!p-12'>
          <Link href='/' className='flex justify-center items-center mbe-6'>
            <Logo />
          </Link>
          <div className='flex flex-col gap-5'>
            <div>
              <Typography variant='h4' className='font-bold text-slate-800'>{`Scoreboard Panel 👋🏻`}</Typography>
              <Typography className='mbs-1 text-slate-500 text-sm'>
                Please sign-in to your operator account to manage overlays.
              </Typography>
            </div>
            {status.message && (
              <Alert severity={status.type === 'error' ? 'error' : 'success'} className='text-xs'>
                {status.message}
              </Alert>
            )}
            <form noValidate autoComplete='off' onSubmit={handleSubmit} className='flex flex-col gap-5'>
              <TextField
                autoFocus
                fullWidth
                label='Email'
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <TextField
                fullWidth
                label='Password'
                id='outlined-adornment-password'
                type={isPasswordShown ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton
                        size='small'
                        edge='end'
                        onClick={handleClickShowPassword}
                        onMouseDown={e => e.preventDefault()}
                      >
                        <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              <div className='flex justify-between items-center gap-x-3 gap-y-1 flex-wrap'>
                <FormControlLabel
                  control={<Checkbox checked={remember} onChange={e => setRemember(e.target.checked)} />}
                  label='Remember me'
                />
                <Typography
                  onClick={handleResetPassword}
                  className='text-end text-xs font-semibold cursor-pointer'
                  color='primary'
                >
                  Forgot password?
                </Typography>
              </div>
              <Button fullWidth variant='contained' type='submit' disabled={loading} size='large'>
                {loading ? 'Signing in...' : 'Log In'}
              </Button>
              <div className='flex justify-center items-center flex-wrap gap-2 text-sm'>
                <Typography variant='body2'>New on our platform?</Typography>
                <Typography component={Link} href='/register' color='primary' className='font-semibold text-sm'>
                  Create an account
                </Typography>
              </div>
            </form>
            
            <Divider className='text-sm text-slate-400'>or</Divider>
            
            <Button
              fullWidth
              variant='outlined'
              size='large'
              onClick={handleGoogleLogin}
              disabled={loading}
              className='text-slate-700 bg-white border-slate-300 hover:bg-slate-50'
              startIcon={
                <img
                  src='https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg'
                  alt='Google Logo'
                  width={20}
                  height={20}
                />
              }
            >
              Sign in with Google
            </Button>
          </div>
        </CardContent>
      </Card>
      <Illustrations maskImg={{ src: authBackground }} />

      <Dialog open={errorPopup.open} onClose={() => setErrorPopup({ ...errorPopup, open: false })}>
        <DialogTitle sx={{ fontWeight: 'bold', color: 'error.main' }}>
          <i className="ri-error-warning-line mr-2 align-middle"></i>
          {errorPopup.title}
        </DialogTitle>
        <DialogContent>
          <DialogContentText className="text-slate-700">
            {errorPopup.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button variant="contained" onClick={() => setErrorPopup({ ...errorPopup, open: false })} autoFocus>
            Mengerti
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default Login
