'use client'

import { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import { onAuthStateChanged, signOut } from 'firebase/auth'

// MUI Imports
import InputAdornment from '@mui/material/InputAdornment'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Grid from '@mui/material/Grid'
import Alert from '@mui/material/Alert'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import IconButton from '@mui/material/IconButton'

import { ref, set, onValue } from 'firebase/database'

import { createUserWithRole, updateUserRole, deleteUserFromDb, syncUserToFirestore } from '@/lib/auth/service'
import { useAllUsers } from '@/features/iam/hooks/useAllUsers'
import { useUserRole } from '@/features/iam/hooks/useUserRole'
import { auth } from '@/lib/firebase/auth'
import { db } from '@/lib/firebase/db'

export default function AdminUserManagementPage({ activeTab = 'manage-users' }) {
  const router = useRouter()

  // Synchronously initialize state with active user session to bypass verification delay
  const [ready, setReady] = useState(!!auth.currentUser)
  const [currentUser, setCurrentUser] = useState(auth.currentUser || null)
  const [currentUserId, setCurrentUserId] = useState(auth.currentUser?.uid || null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { isSuperAdmin } = useUserRole(currentUser)

  // Form States for creating new accounts
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [createStatus, setCreateStatus] = useState({ type: '', message: '' })

  const { users, loading: loadingUsers } = useAllUsers()

  // State for active leagues visibility controlled by Superadmin
  const [leaguesSettings, setLeaguesSettings] = useState({
    premier_league: true,
    ucl: true,
    world_cup: true
  })

  useEffect(() => {
    const leaguesRef = ref(db, 'ucl_data/settings/leagues')

    const unsubscribe = onValue(leaguesRef, snapshot => {
      const val = snapshot.val()

      if (val) {
        setLeaguesSettings({
          premier_league: val.premier_league !== false,
          ucl: val.ucl !== false,
          world_cup: val.world_cup !== false
        })
      }
    })

    return () => unsubscribe()
  }, [])

  const handleToggleLeague = async (leagueKey, currentVal) => {
    try {
      await set(ref(db, `ucl_data/settings/leagues/${leagueKey}`), !currentVal)
    } catch (e) {
      console.error('Error setting league visibility:', e)
      alert('Failed to update visibility: ' + e.message)
    }
  }

  useEffect(() => {
    // Optimize: Proactively sync user to Firestore on mount if session is active
    if (auth.currentUser) {
      syncUserToFirestore(auth.currentUser).catch(console.error)
    }

    const unsub = onAuthStateChanged(auth, user => {
      if (!user) {
        router.replace('/login')

        return
      }

      setCurrentUser(user)
      setCurrentUserId(user.uid)
      setReady(true)
      syncUserToFirestore(user).catch(console.error)
    })

    return () => unsub()
  }, [router])

  const handleCreateUser = async event => {
    event.preventDefault()
    setCreateStatus({ type: '', message: '' })

    if (password !== confirmPassword) {
      setCreateStatus({
        type: 'error',
        message: 'Passwords do not match.'
      })

      return
    }

    setLoading(true)

    try {
      await createUserWithRole(email, password, 'user')
      setCreateStatus({
        type: 'success',
        message: 'User successfully created and synchronized to Firestore!'
      })
      setEmail('')
      setPassword('')
      setConfirmPassword('')
    } catch (error) {
      setCreateStatus({
        type: 'error',
        message: error?.message || 'Failed to create new user account.'
      })
    } finally {
      setLoading(false)
    }
  }

  if (!ready) {
    return <div className='p-6 text-slate-500 text-sm'>Verifying session...</div>
  }

  if (!isSuperAdmin) {
    return (
      <div className='p-6'>
        <Alert severity='error' className='mb-4'>
          Access Denied. This section is reserved for Superadmin only.
        </Alert>
        <Button variant='contained' onClick={() => router.push('/')}>
          Return to Dashboard
        </Button>
      </div>
    )
  }

  const titleMap = {
    'create-user': {
      title: 'Create Operator Account',
      subtitle: 'Add a new scoreboard operator account to the system'
    },
    'active-leagues': {
      title: 'Active Leagues Visibility Settings',
      subtitle: 'Toggle sidebar menu visibility of sports leagues for all operator profiles'
    },
    'manage-users': {
      title: 'Registered Operator Accounts',
      subtitle: 'Manage role privileges, view synchronizations, and delete operator accounts'
    }
  }

  const currentHeader = titleMap[activeTab] || titleMap['manage-users']

  return (
    <div className='p-4 space-y-6'>
      <div>
        <h1 className='text-2xl font-bold text-slate-800'>{currentHeader.title}</h1>
        <p className='text-slate-500 text-sm'>{currentHeader.subtitle}</p>
      </div>

      <Grid container spacing={6}>
        {/* Create User Form Card */}
        {activeTab === 'create-user' && (
          <Grid item xs={12}>
            <Card variant='outlined' sx={{ borderRadius: 3 }}>
              <CardHeader title='Create New Account' subheader='Add a new operator to the system' />
              <CardContent className='space-y-4'>
                {createStatus.message && (
                  <Alert severity={createStatus.type === 'error' ? 'error' : 'success'} className='text-xs'>
                    {createStatus.message}
                  </Alert>
                )}
                <form onSubmit={handleCreateUser} className='flex flex-col gap-4'>
                  <TextField
                    fullWidth
                    label='Email Address'
                    type='email'
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder='operator@example.com'
                    size='small'
                  />
                  <TextField
                    fullWidth
                    label='Password'
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder='Minimum 6 characters'
                    size='small'
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton onClick={() => setShowPassword(!showPassword)} edge='end'>
                            {showPassword ? <i className='ri-eye-off-line' /> : <i className='ri-eye-line' />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                  <TextField
                    fullWidth
                    label='Confirm Password'
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    placeholder='Confirm password'
                    size='small'
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge='end'>
                            {showConfirmPassword ? <i className='ri-eye-off-line' /> : <i className='ri-eye-line' />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                  <Button
                    fullWidth
                    variant='contained'
                    type='submit'
                    disabled={loading}
                    className='font-semibold text-sm normal-case mt-2'
                  >
                    {loading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Active Leagues Configuration */}
        {activeTab === 'active-leagues' && (
          <Grid item xs={12}>
            <Card variant='outlined' sx={{ borderRadius: 3 }}>
              <CardHeader title='Active Leagues Visibility' subheader='Toggle menu visibility for all accounts' />
              <CardContent className='space-y-4'>
                <div className='flex justify-between items-center py-2 border-b border-divider'>
                  <div>
                    <Typography variant='body2' sx={{ fontWeight: 600 }}>
                      Premier League
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      Show or hide PL menu
                    </Typography>
                  </div>
                  <Button
                    variant={leaguesSettings.premier_league ? 'contained' : 'outlined'}
                    color={leaguesSettings.premier_league ? 'success' : 'error'}
                    size='small'
                    className='normal-case font-semibold text-xs'
                    onClick={() => handleToggleLeague('premier_league', leaguesSettings.premier_league)}
                    sx={{ width: 130 }}
                  >
                    {leaguesSettings.premier_league ? 'Active / Shown' : 'Hidden'}
                  </Button>
                </div>

                <div className='flex justify-between items-center py-2 border-b border-divider'>
                  <div>
                    <Typography variant='body2' sx={{ fontWeight: 600 }}>
                      UEFA Champions League
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      Show or hide UCL menu
                    </Typography>
                  </div>
                  <Button
                    variant={leaguesSettings.ucl ? 'contained' : 'outlined'}
                    color={leaguesSettings.ucl ? 'success' : 'error'}
                    size='small'
                    className='normal-case font-semibold text-xs'
                    onClick={() => handleToggleLeague('ucl', leaguesSettings.ucl)}
                    sx={{ width: 130 }}
                  >
                    {leaguesSettings.ucl ? 'Active / Shown' : 'Hidden'}
                  </Button>
                </div>

                <div className='flex justify-between items-center py-2'>
                  <div>
                    <Typography variant='body2' sx={{ fontWeight: 600 }}>
                      FIFA World Cup 2026
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      Show or hide World Cup menu
                    </Typography>
                  </div>
                  <Button
                    variant={leaguesSettings.world_cup ? 'contained' : 'outlined'}
                    color={leaguesSettings.world_cup ? 'success' : 'error'}
                    size='small'
                    className='normal-case font-semibold text-xs'
                    onClick={() => handleToggleLeague('world_cup', leaguesSettings.world_cup)}
                    sx={{ width: 130 }}
                  >
                    {leaguesSettings.world_cup ? 'Active / Shown' : 'Hidden'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Users List Card */}
        {activeTab === 'manage-users' && (
          <Grid item xs={12}>
            <Card variant='outlined' sx={{ borderRadius: 3 }}>
              <CardHeader
                title={`Registered Accounts (${users.length})`}
                subheader='List of synchronized Firestore user profiles'
              />
              <CardContent>
                {loadingUsers ? (
                  <div className='text-center py-6 text-slate-400 text-sm'>Loading users list...</div>
                ) : users.length === 0 ? (
                  <div className='text-center py-6 text-slate-400 text-sm'>No users found.</div>
                ) : (
                  <TableContainer
                    component={Paper}
                    sx={{ boxShadow: 'none', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
                  >
                    <Table size='small'>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, fontSize: 11, py: 1.5, color: 'text.secondary' }}>
                            Email
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: 11, py: 1.5, color: 'text.secondary' }}>
                            Role
                          </TableCell>
                          <TableCell
                            sx={{ fontWeight: 600, fontSize: 11, py: 1.5, color: 'text.secondary', textAlign: 'right' }}
                          >
                            Actions
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {users.map(row => (
                          <UserRowItem key={row.uid} row={row} isMe={row.uid === currentUserId} />
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </div>
  )
}

function UserRowItem({ row, isMe }) {
  const [role, setRole] = useState(row.role || 'user')
  const [saving, setSaving] = useState(false)
  const [deleted, setDeleted] = useState(false)

  const handleRoleToggle = async newRole => {
    if (isMe) return
    setSaving(true)
    setRole(newRole)

    try {
      await updateUserRole(row.uid, newRole)
    } catch (err) {
      console.error('Error updating role:', err)
      alert('Failed to update user role: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteUser = async () => {
    if (isMe) return
    const confirm = window.confirm(`Are you sure you want to permanently delete user: ${row.email}?`)

    if (!confirm) return

    setSaving(true)

    try {
      await deleteUserFromDb(row.uid)
      setDeleted(true)
    } catch (err) {
      console.error('Error deleting user:', err)
      alert('Failed to delete user: ' + err.message)
      setSaving(false)
    }
  }

  if (deleted) return null

  return (
    <TableRow hover>
      <TableCell className='py-2.5'>
        <Typography variant='body2' sx={{ fontWeight: 500 }}>
          {row.email}
        </Typography>
        {isMe && (
          <span className='inline-block mt-0.5 text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-semibold'>
            You
          </span>
        )}
      </TableCell>
      <TableCell className='py-2.5'>
        {isMe ? (
          <span className='capitalize text-slate-400 italic text-xs'>{role}</span>
        ) : (
          <Select
            value={role}
            onChange={e => handleRoleToggle(e.target.value)}
            disabled={saving}
            size='small'
            sx={{ height: 30, fontSize: 12 }}
          >
            <MenuItem value='user'>User</MenuItem>
            <MenuItem value='admin'>Admin</MenuItem>
            <MenuItem value='superadmin'>Super Admin</MenuItem>
          </Select>
        )}
      </TableCell>
      <TableCell className='py-2.5 text-right'>
        {isMe ? (
          <span className='text-xs text-slate-400 italic'>Self</span>
        ) : (
          <Button
            variant='outlined'
            color='error'
            size='small'
            onClick={handleDeleteUser}
            disabled={saving}
            className='normal-case text-xs font-semibold px-2 py-0.5 min-w-0'
            sx={{ height: 26 }}
          >
            {saving ? '...' : 'Delete'}
          </Button>
        )}
      </TableCell>
    </TableRow>
  )
}
