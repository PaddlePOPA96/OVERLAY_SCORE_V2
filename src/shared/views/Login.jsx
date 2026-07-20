'use client'

import { useState, useEffect } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { loginWithEmailPassword, loginWithGooglePopup, sendResetPassword } from '@/services/auth/service'
import Illustrations from '@/shared/components/Illustrations'
import Logo from '@/shared/components/layout/Logo'
import { useAuth } from '@/shared/components/providers/AuthContext'

import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
import { Dialog, DialogTitle, DialogContent, DialogFooter } from '@/components/ui/Dialog'

const GOOGLE_LOGIN_DISABLED = false

const Login = ({ mode }) => {
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleCooldown, setGoogleCooldown] = useState(false)
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

    if (googleCooldown) {
      setStatus({ type: 'error', message: 'Mohon tunggu beberapa saat sebelum mencoba login kembali.' })
      return
    }

    setStatus({ type: '', message: '' })
    setLoading(true)

    // Set 5 seconds cooldown to prevent spam
    setGoogleCooldown(true)
    setTimeout(() => {
      setGoogleCooldown(false)
    }, 3600000)

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
      <Card className='flex flex-col sm:is-[450px] z-10'>
        <CardContent className='p-6 sm:!p-12'>
          <Link href='/' className='flex justify-center items-center mbe-6'>
            <Logo />
          </Link>
          <div className='flex flex-col gap-5'>
            <div>
              <h1 className='text-3xl font-black uppercase tracking-wider text-black'>{`Scoreboard Panel 👋🏻`}</h1>
              <p className='mt-2 text-black font-semibold text-sm'>
                Please sign-in to your operator account to manage overlays.
              </p>
            </div>
            {status.message && (
              <div className={`p-4 border-4 border-black font-bold text-sm ${status.type === 'error' ? 'bg-[#ff3366] text-white' : 'bg-[#ccff00] text-black'}`}>
                {status.message}
              </div>
            )}
            <form noValidate autoComplete='off' onSubmit={handleSubmit} className='flex flex-col gap-5'>
              <Input
                autoFocus
                fullWidth
                label='Email'
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <Input
                fullWidth
                label='Password'
                id='outlined-adornment-password'
                type={isPasswordShown ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                endAdornment={
                  <button
                    type="button"
                    className="p-1 hover:bg-slate-200 transition-colors border-2 border-transparent hover:border-black"
                    onClick={handleClickShowPassword}
                    onMouseDown={e => e.preventDefault()}
                  >
                    <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                  </button>
                }
              />
              <div className='flex justify-between items-center gap-x-3 gap-y-1 flex-wrap mt-2'>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={remember} 
                    onChange={e => setRemember(e.target.checked)}
                    className="w-5 h-5 border-2 border-black appearance-none checked:bg-[#00ffff] relative before:content-[''] checked:before:absolute checked:before:left-1/2 checked:before:top-1/2 checked:before:-translate-x-1/2 checked:before:-translate-y-1/2 checked:before:w-2.5 checked:before:h-2.5 checked:before:bg-black group-hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-all"
                  />
                  <span className="font-bold text-sm select-none">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={handleResetPassword}
                  className='text-end text-sm font-bold text-[#ff3366] hover:underline decoration-2 cursor-pointer'
                >
                  Forgot password?
                </button>
              </div>
              <Button fullWidth variant='primary' type='submit' disabled={loading} size='lg' className="mt-4">
                {loading ? 'Signing in...' : 'Log In'}
              </Button>
              <div className='flex justify-center items-center flex-wrap gap-2 text-sm mt-2'>
                <span className="font-bold">New on our platform?</span>
                <Link href='/register' className='font-black text-[#00ffff] hover:underline decoration-2 uppercase'>
                  Create an account
                </Link>
              </div>
            </form>

            <div className="flex items-center my-2 gap-4">
              <div className="h-1 bg-black flex-1"></div>
              <span className="font-black uppercase tracking-wider text-sm">or</span>
              <div className="h-1 bg-black flex-1"></div>
            </div>

            <Button
              fullWidth
              variant='secondary'
              size='lg'
              onClick={handleGoogleLogin}
              disabled={loading || googleCooldown}
              startIcon={
                <img
                  src='https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg'
                  alt='Google Logo'
                  width={24}
                  height={24}
                  className="bg-white rounded-full"
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
        <div className="bg-[#ff3366] text-white p-6 border-b-4 border-black">
          <DialogTitle className="flex items-center gap-3 text-white">
            <i className="ri-error-warning-line text-3xl"></i>
            {errorPopup.title}
          </DialogTitle>
        </div>
        <DialogContent>
          <p className="text-black font-bold text-lg mt-4">
            {errorPopup.message}
          </p>
        </DialogContent>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setErrorPopup({ ...errorPopup, open: false })}>
            Mengerti
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}

export default Login
