'use client'

import Link from 'next/link'

import Form from '@/shared/components/Form'
import DirectionalIcon from '@/shared/components/DirectionalIcon'
import Illustrations from '@/shared/components/Illustrations'
import Logo from '@/shared/components/layout/Logo'

import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'

const ForgotPassword = ({ mode }) => {
  const darkImg = '/images/pages/auth-v1-mask-dark.png'
  const lightImg = '/images/pages/auth-v1-mask-light.png'
  const authBackground = mode === 'light' ? lightImg : darkImg

  return (
    <div className='flex flex-col justify-center items-center min-bs-[100dvh] relative p-6'>
      <Card className='flex flex-col sm:is-[450px] z-10'>
        <CardContent className='p-6 sm:!p-12'>
          <Link href='/' className='flex justify-center items-center mbe-6'>
            <Logo />
          </Link>
          <h1 className='text-3xl font-black uppercase tracking-wider text-black'>Forgot Password 🔒</h1>
          <div className='flex flex-col gap-6 mt-4'>
            <p className='text-black font-semibold text-sm'>
              Enter your email and we&#39;ll send you instructions to reset your password
            </p>
            <Form noValidate autoComplete='off' className='flex flex-col gap-6'>
              <Input autoFocus fullWidth label='Email' />
              <Button fullWidth variant='primary' size='lg' type='submit'>
                Send reset link
              </Button>
              <div className='flex justify-center items-center mt-2'>
                <Link href='/login' className='flex items-center font-black text-[#ff3366] hover:underline decoration-2 uppercase'>
                  <DirectionalIcon ltrIconClass='ri-arrow-left-s-line' rtlIconClass='ri-arrow-right-s-line' />
                  <span className="ml-1">Back to Login</span>
                </Link>
              </div>
            </Form>
          </div>
        </CardContent>
      </Card>
      <Illustrations maskImg={{ src: authBackground }} />
    </div>
  )
}

export default ForgotPassword
