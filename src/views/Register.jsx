'use client'

import { useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'

import Illustrations from '@components/Illustrations'
import Logo from '@components/layout/Logo'

import { registerWithEmailPassword, loginWithGooglePopup } from '@/lib/auth/service'

const REGISTRATION_DISABLED = true

const Register = ({ mode }) => {
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState({ type: '', message: '' })

  const darkImg = '/images/pages/auth-v1-mask-dark.png'
  const lightImg = '/images/pages/auth-v1-mask-light.png'

  const router = useRouter()
  const authBackground = mode === 'light' ? lightImg : darkImg
  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  const handleSubmit = async e => {
    e.preventDefault()
    setStatus({ type: '', message: '' })

    if (REGISTRATION_DISABLED) {
      setStatus({
        type: 'error',
        message:
          'Registration is disabled. Please contact the administrator via Telegram (081331890624) for manual account activation after payment.'
      })

      return
    }

    if (password !== confirmPassword) {
      setStatus({
        type: 'error',
        message: 'Passwords do not match.'
      })

      return
    }

    setLoading(true)

    try {
      const user = await registerWithEmailPassword(email, password)

      router.push('/')
    } catch (err) {
      setStatus({
        type: 'error',
        message: err?.message || 'Failed to create account.'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex flex-col justify-center items-center min-bs-[100dvh] relative p-6 bg-slate-900/10'>
      <Card className='flex flex-col sm:is-[450px] z-10 shadow-lg border border-slate-700/10 rounded-2xl'>
        <CardContent className='p-6 sm:!p-12'>
          <Link href='/' className='flex justify-center items-start mbe-6'>
            <Logo />
          </Link>
          <div className='flex flex-col gap-4'>
            <div>
              <Typography variant='h4' className='font-bold text-slate-800'>
                Adventure starts here 🚀
              </Typography>
              <Typography className='mbs-1 text-slate-500 text-sm'>
                Create your operator account to customize overlays live!
              </Typography>
            </div>

            <Alert severity='warning' className='text-xs'>
              Registration can only be completed by the administrator. Contact Telegram: <strong>081331890624</strong>{' '}
              to activate your license.
            </Alert>

            {status.message && (
              <Alert severity={status.type === 'error' ? 'error' : 'success'} className='text-xs'>
                {status.message}
              </Alert>
            )}

            <form noValidate autoComplete='off' onSubmit={handleSubmit} className='flex flex-col gap-4'>
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
              <TextField
                fullWidth
                label='Confirm Password'
                type={isPasswordShown ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />

              <Button fullWidth variant='contained' type='submit' size='large' disabled={loading}>
                {loading ? 'Creating...' : 'Sign Up'}
              </Button>
              <div className='flex justify-center items-center flex-wrap gap-2 text-sm'>
                <Typography variant='body2'>Already have an account?</Typography>
                <Typography component={Link} href='/login' color='primary' className='font-semibold text-sm'>
                  Sign in instead
                </Typography>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>
      <Illustrations maskImg={{ src: authBackground }} />
    </div>
  )
}

export default Register
