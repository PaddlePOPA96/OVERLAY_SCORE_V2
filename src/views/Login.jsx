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
import Logo from '@components/layout/shared/Logo'
import Illustrations from '@components/Illustrations'
import themeConfig from '@configs/themeConfig'
import { useImageVariant } from '@core/hooks/useImageVariant'
import {
  loginWithEmailPassword,
  loginWithGooglePopup,
  sendResetPassword,
} from "@/lib/auth/service";

const GOOGLE_LOGIN_DISABLED = true;

const Login = ({ mode }) => {
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState({ type: "", message: "" })

  const darkImg = '/images/pages/auth-v1-mask-dark.png'
  const lightImg = '/images/pages/auth-v1-mask-light.png'

  const router = useRouter()
  const authBackground = useImageVariant(mode, lightImg, darkImg)
  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedRemember = window.localStorage.getItem("scoreboard-remember");
    const savedEmail = window.localStorage.getItem("scoreboard-email") || "";
    if (savedRemember === "1") {
      setRemember(true);
      if (savedEmail) {
        setEmail(savedEmail);
      }
    }
  }, []);

  const handleAuthSuccess = (user) => {
    if (!user) return;
    if (typeof window !== "undefined") {
      if (remember) {
        window.localStorage.setItem("scoreboard-remember", "1");
        window.localStorage.setItem("scoreboard-email", user.email || email || "");
      } else {
        window.localStorage.removeItem("scoreboard-remember");
        window.localStorage.removeItem("scoreboard-email");
      }
    }
    router.push("/");
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus({ type: "", message: "" })
    setLoading(true)
    try {
      const user = await loginWithEmailPassword(email, password);
      handleAuthSuccess(user);
    } catch (error) {
      setStatus({
        type: "error",
        message: error?.message || "Login failed. Please check your credentials.",
      });
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    if (GOOGLE_LOGIN_DISABLED) {
      setStatus({
        type: "error",
        message: "Google login is disabled. Please sign in using your admin-registered email & password.",
      });
      return;
    }
    setStatus({ type: "", message: "" })
    setLoading(true)
    try {
      const user = await loginWithGooglePopup();
      handleAuthSuccess(user);
    } catch (error) {
      setStatus({
        type: "error",
        message: error?.message || "Failed to login with Google.",
      });
    } finally {
      setLoading(false)
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setStatus({
        type: "error",
        message: "Please enter your email address to reset password.",
      });
      return;
    }
    setLoading(true);
    try {
      await sendResetPassword(email);
      setStatus({
        type: "success",
        message: "Password reset link sent successfully.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: error?.message || "Failed to send reset email.",
      });
    } finally {
      setLoading(false);
    }
  };

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
              <Typography className='mbs-1 text-slate-500 text-sm'>Please sign-in to your operator account to manage overlays.</Typography>
            </div>
            {status.message && (
              <Alert severity={status.type === "error" ? "error" : "success"} className="text-xs">
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
              <Button fullWidth variant='contained' type='submit' disabled={loading} size="large">
                {loading ? "Signing in..." : "Log In"}
              </Button>
              <div className='flex justify-center items-center flex-wrap gap-2 text-sm'>
                <Typography variant="body2">New on our platform?</Typography>
                <Typography component={Link} href='/register' color='primary' className="font-semibold text-sm">
                  Create an account
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

export default Login
