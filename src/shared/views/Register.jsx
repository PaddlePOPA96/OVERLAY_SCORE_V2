'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import Illustrations from '@/shared/components/Illustrations'
import Logo from '@/shared/components/layout/Logo'
import { registerWithEmailPassword, loginWithGooglePopup } from '@/services/auth/service'

import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'

const REGISTRATION_DISABLED = true

const Register = ({ mode }) => {
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passcode, setPasscode] = useState('')
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
          'Registration is disabled. Please contact the administrator via discord (paddlepopa) for manual account activation after payment.'
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
      const user = await registerWithEmailPassword(email, password, passcode)

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
      <Card className='flex flex-col sm:is-[450px] z-10'>
        <CardContent className='p-6 sm:!p-12'>
          <Link href='/' className='flex justify-center items-start mbe-6'>
            <Logo />
          </Link>
          <div className='flex flex-col gap-4'>
            <div>
              <h1 className='text-3xl font-black uppercase tracking-wider text-black'>
                Adventure starts here 🚀
              </h1>
              <p className='mt-2 text-black font-semibold text-sm'>
                Create your operator account to customize overlays live!
              </p>
            </div>

            <div className='bg-[#ffcc00] border-4 border-black p-4 font-bold text-sm text-black'>
              Registration can only be completed by the administrator. Contact discord: <strong className="bg-white px-1 border-2 border-black">@paddlepopa</strong>{' '}
              to activate your license.
            </div>

            {status.message && (
              <div className={`p-4 border-4 border-black font-bold text-sm ${status.type === 'error' ? 'bg-[#ff3366] text-white' : 'bg-[#00ffff] text-black'}`}>
                {status.message}
              </div>
            )}

            <form noValidate autoComplete='off' onSubmit={handleSubmit} className='flex flex-col gap-4 mt-4'>
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
              <Input
                fullWidth
                label='Confirm Password'
                type={isPasswordShown ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
              <Input
                fullWidth
                label='Passcode (4 Angka)'
                type='number'
                value={passcode}
                onChange={e => {
                  const val = e.target.value
                  if (val.length <= 4) setPasscode(val)
                }}
                required
                placeholder='Contoh: 1234'
                maxLength={4}
                minLength={4}
              />

              <Button fullWidth variant='primary' type='submit' size='lg' disabled={loading} className="mt-4">
                {loading ? 'Creating...' : 'Sign Up'}
              </Button>
              <div className='flex justify-center items-center flex-wrap gap-2 text-sm mt-4'>
                <span className="font-bold">Already have an account?</span>
                <Link href='/login' className='font-black text-[#ff3366] hover:underline decoration-2 uppercase'>
                  Sign in instead
                </Link>
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
