'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { ref, set, onValue } from 'firebase/database'

import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'

import { createUserWithRole, updateUserRole, deleteUserFromDb, syncUserToFirestore, updateRolePermissions, validatePasswordStrength } from '@/services/auth/service'
import { useAllUsers } from '@/features/iam/hooks/useAllUsers'
import { useUserRole } from '@/features/iam/hooks/useUserRole'
import { auth } from '@/services/firebase/auth'
import { db } from '@/services/firebase/db'

export default function AdminUserManagementPage({ activeTab = 'manage-users' }) {
  const router = useRouter()
  const [ready, setReady] = useState(!!auth.currentUser)
  const [currentUser, setCurrentUser] = useState(auth.currentUser || null)
  const [currentUserId, setCurrentUserId] = useState(auth.currentUser?.uid || null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { isSuperAdmin } = useUserRole(currentUser)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passcode, setPasscode] = useState('')
  const [loading, setLoading] = useState(false)
  const [createStatus, setCreateStatus] = useState({ type: '', message: '' })

  const { users, loading: loadingUsers } = useAllUsers()

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
      setCreateStatus({ type: 'error', message: 'Passwords do not match.' })
      return
    }

    const passwordError = validatePasswordStrength(password)
    if (passwordError) {
      setCreateStatus({ type: 'error', message: passwordError })
      return
    }

    setLoading(true)
    try {
      await createUserWithRole(email, password, 'user', passcode)
      setCreateStatus({ type: 'success', message: 'User successfully created and synchronized to Firestore!' })
      setEmail('')
      setPassword('')
      setConfirmPassword('')
      setPasscode('')
    } catch (error) {
      setCreateStatus({ type: 'error', message: error?.message || 'Failed to create new user account.' })
    } finally {
      setLoading(false)
    }
  }

  if (!ready) {
    return <div className='p-6 text-slate-500 font-bold text-sm'>Verifying session...</div>
  }

  if (!isSuperAdmin) {
    return (
      <div className='p-6'>
        <div className='p-4 bg-[#ff3366] text-white font-black border-4 border-black mb-4 uppercase tracking-wider text-sm'>
          Access Denied. This section is reserved for Superadmin only.
        </div>
        <Button variant='primary' onClick={() => router.push('/')}>
          Return to Dashboard
        </Button>
      </div>
    )
  }

  const titleMap = {
    'create-user': { title: 'Create Operator Account', subtitle: 'Add a new scoreboard operator account to the system' },
    'active-leagues': { title: 'Active Leagues Visibility Settings', subtitle: 'Toggle sidebar menu visibility of sports leagues for all operator profiles' },
    'manage-users': { title: 'Registered Operator Accounts', subtitle: 'Manage role privileges, view synchronizations, and delete operator accounts' },
    'role-permissions': { title: 'Role Permissions Settings', subtitle: 'Configure feature permissions for Operator (User) and Admin roles' }
  }

  const currentHeader = titleMap[activeTab] || titleMap['manage-users']

  return (
    <div className='p-4 space-y-6 w-full'>
      <div className='border-b-4 border-black pb-4'>
        <h1 className='text-3xl font-black uppercase tracking-wider text-black'>{currentHeader.title}</h1>
        <p className='text-slate-700 font-bold mt-2'>{currentHeader.subtitle}</p>
      </div>

      {activeTab === 'create-user' && (
        <div className='bg-white border-4 border-black p-6 shadow-[8px_8px_0_0_rgba(0,0,0,1)]'>
          <h2 className='text-xl font-black uppercase text-black mb-4 pb-2 border-b-4 border-black'>Create New Account</h2>
          {createStatus.message && (
            <div className={`p-3 mb-4 font-black text-sm uppercase border-2 border-black ${createStatus.type === 'error' ? 'bg-[#ff3366] text-white' : 'bg-[#ccff00] text-black'}`}>
              {createStatus.message}
            </div>
          )}
          <form onSubmit={handleCreateUser} className='flex flex-col gap-4 max-w-md'>
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-black mb-1">Email Address</label>
              <Input
                type='email'
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder='operator@example.com'
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-black mb-1">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder='Minimum 6 characters'
                  className="w-full pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 font-black text-xl hover:text-[#00ffff] transition-colors"
                >
                  {showPassword ? <i className='ri-eye-off-line' /> : <i className='ri-eye-line' />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-black mb-1">Confirm Password</label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  placeholder='Confirm password'
                  className="w-full pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 font-black text-xl hover:text-[#00ffff] transition-colors"
                >
                  {showConfirmPassword ? <i className='ri-eye-off-line' /> : <i className='ri-eye-line' />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-black mb-1">Passcode (4 Angka)</label>
              <Input
                type='number'
                value={passcode}
                onChange={e => {
                  const val = e.target.value
                  if (val.length <= 4) setPasscode(val)
                }}
                required
                placeholder='Contoh: 1234'
                className="w-full"
                maxLength={4}
                minLength={4}
              />
            </div>
            <Button type='submit' variant='primary' disabled={loading} className="mt-4">
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>
        </div>
      )}

      {activeTab === 'active-leagues' && (
        <div className='bg-white border-4 border-black p-6 shadow-[8px_8px_0_0_rgba(0,0,0,1)]'>
          <h2 className='text-xl font-black uppercase text-black mb-4 pb-2 border-b-4 border-black'>Active Leagues Visibility</h2>
          <div className='flex flex-col gap-4'>
            {['premier_league', 'ucl', 'world_cup'].map((league) => {
              const labelMap = {
                premier_league: 'Premier League',
                ucl: 'UEFA Champions League',
                world_cup: 'FIFA World Cup 2026'
              };
              const descMap = {
                premier_league: 'Show or hide PL menu',
                ucl: 'Show or hide UCL menu',
                world_cup: 'Show or hide World Cup menu'
              };
              const isActive = leaguesSettings[league];
              return (
                <div key={league} className='flex justify-between items-center py-4 border-b-2 border-black last:border-b-0'>
                  <div>
                    <h3 className='font-black uppercase tracking-wider text-sm'>{labelMap[league]}</h3>
                    <p className='text-xs font-bold text-slate-500 mt-1'>{descMap[league]}</p>
                  </div>
                  <Button
                    variant='outline'
                    className={isActive ? 'bg-[#ccff00] min-w-[140px]' : 'bg-slate-200 text-slate-500 min-w-[140px]'}
                    onClick={() => handleToggleLeague(league, isActive)}
                  >
                    {isActive ? 'Active / Shown' : 'Hidden'}
                  </Button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {activeTab === 'manage-users' && (
        <div className='bg-white border-4 border-black p-6 shadow-[8px_8px_0_0_rgba(0,0,0,1)]'>
          <h2 className='text-xl font-black uppercase text-black mb-4 pb-2 border-b-4 border-black'>Registered Accounts ({users.length})</h2>
          {loadingUsers ? (
            <p className='text-center py-6 font-bold text-slate-500 text-sm'>Loading users list...</p>
          ) : users.length === 0 ? (
            <p className='text-center py-6 font-bold text-slate-500 text-sm'>No users found.</p>
          ) : (
            <div className='overflow-x-auto border-2 border-black'>
              <table className='w-full text-left border-collapse'>
                <thead className='bg-black text-white'>
                  <tr>
                    <th className='p-3 text-xs font-black uppercase tracking-wider border-r border-slate-700'>Email</th>
                    <th className='p-3 text-xs font-black uppercase tracking-wider border-r border-slate-700'>Role</th>
                    <th className='p-3 text-xs font-black uppercase tracking-wider text-right'>Actions</th>
                  </tr>
                </thead>
                <tbody className='divide-y-2 divide-black bg-white'>
                  {users.map(row => (
                    <UserRowItem key={row.uid} row={row} isMe={row.uid === currentUserId} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'role-permissions' && (
        <RolePermissionsConfig />
      )}
    </div>
  )
}

const DEFAULT_PERMISSIONS = {
  operator: true, countdown_timer: true, running_text: true, tiktok_overlay: true,
  premier_league: true, ucl: true, world_cup: true, streams_operator: true,
  streams: true, change_tournament_logo: true
}

const PERMISSION_ITEMS = [
  { key: 'operator', label: 'Scoreboard Operator', desc: 'Real-time control interface' },
  { key: 'countdown_timer', label: 'Countdown Timer', desc: 'Countdown overlay controls' },
  { key: 'running_text', label: 'Running Text (OBS)', desc: 'Configure broadcast ticker' },
  { key: 'tiktok_overlay', label: 'Tiktok & IG Overlay', desc: 'Social media overlay controls' },
  { key: 'premier_league', label: 'Premier League', desc: 'Schedules, standings, news' },
  { key: 'ucl', label: 'UCL Standings', desc: 'UEFA Champions League standings' },
  { key: 'world_cup', label: 'World Cup 2026', desc: 'FIFA World Cup 2026 matches' },
  { key: 'streams_operator', label: 'Live Streams Config', desc: 'Manage streaming URLs' },
  { key: 'streams', label: 'Live Streams Preview', desc: 'View current active live streams' },
  { key: 'change_tournament_logo', label: 'Ubah Logo Turnamen', desc: 'Izinkan ganti logo B2F/FIFA' }
]

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
    <tr className='hover:bg-slate-50 transition-colors'>
      <td className='p-3 border-r-2 border-black'>
        <span className='font-bold text-sm block'>{row.email}</span>
        {isMe && (
          <span className='inline-block mt-1 text-[9px] bg-[#00ffff] text-black border border-black px-1.5 py-0.5 font-black uppercase tracking-wider'>
            You
          </span>
        )}
      </td>
      <td className='p-3 border-r-2 border-black'>
        {isMe ? (
          <span className='capitalize text-slate-500 font-bold text-sm'>{role}</span>
        ) : (
          <Select
            value={role}
            onChange={e => handleRoleToggle(e.target.value)}
            disabled={saving}
            options={[
              { value: 'user', label: 'User' },
              { value: 'admin', label: 'Admin' },
              { value: 'superadmin', label: 'Super Admin' }
            ]}
          />
        )}
      </td>
      <td className='p-3 text-right'>
        {isMe ? (
          <span className='text-xs font-bold text-slate-400'>Self</span>
        ) : (
          <Button
            variant='outline'
            className='bg-[#ff3366] text-white py-1 px-3 text-xs'
            onClick={handleDeleteUser}
            disabled={saving}
          >
            {saving ? '...' : 'Delete'}
          </Button>
        )}
      </td>
    </tr>
  )
}

function RolePermissionsConfig() {
  const [selectedRole, setSelectedRole] = useState('user')
  const [permissions, setPermissions] = useState({
    user: { ...DEFAULT_PERMISSIONS },
    admin: { ...DEFAULT_PERMISSIONS }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const permsRef = ref(db, 'ucl_data/settings/roles_permissions')
    const unsubscribe = onValue(permsRef, snapshot => {
      const val = snapshot.val()
      if (val) {
        setPermissions({
          user: { ...DEFAULT_PERMISSIONS, ...(val.user || {}) },
          admin: { ...DEFAULT_PERMISSIONS, ...(val.admin || {}) }
        })
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const handleToggle = async (key) => {
    const currentRolePerms = permissions[selectedRole]
    const updatedRolePerms = { ...currentRolePerms, [key]: !currentRolePerms[key] }
    
    setPermissions(prev => ({ ...prev, [selectedRole]: updatedRolePerms }))
    try {
      await updateRolePermissions(selectedRole, updatedRolePerms)
    } catch (err) {
      console.error('Failed to update role permissions:', err)
      alert('Error: ' + err.message)
    }
  }

  if (loading) {
    return <div className='text-center py-6 font-bold text-slate-500 text-sm'>Loading role configurations...</div>
  }

  return (
    <div className='border-4 border-black shadow-[8px_8px_0px_#000] p-6 bg-white w-full'>
      <div className='mb-6 border-b-4 border-black pb-4'>
        <h2 className='text-2xl font-black uppercase tracking-tight text-black'>
          Configure Permissions by Role
        </h2>
        <p className='text-xs font-black uppercase tracking-wider text-slate-500 mt-2'>
          Changes apply immediately to all users assigned to the selected role
        </p>
      </div>

      <div className='flex flex-wrap gap-4 mb-8'>
        <button 
          onClick={() => setSelectedRole('user')}
          className={`px-5 py-3 border-4 border-black text-sm font-black uppercase tracking-wider transition-transform duration-100 ${
            selectedRole === 'user'
              ? 'bg-[#ccff00] text-black shadow-[4px_4px_0px_#000] translate-y-0'
              : 'bg-white text-black hover:bg-slate-100 shadow-[6px_6px_0px_#000] -translate-y-1'
          }`}
        >
          User (Operator) Role
        </button>
        <button 
          onClick={() => setSelectedRole('admin')}
          className={`px-5 py-3 border-4 border-black text-sm font-black uppercase tracking-wider transition-transform duration-100 ${
            selectedRole === 'admin'
              ? 'bg-[#ccff00] text-black shadow-[4px_4px_0px_#000] translate-y-0'
              : 'bg-white text-black hover:bg-slate-100 shadow-[6px_6px_0px_#000] -translate-y-1'
          }`}
        >
          Admin Role
        </button>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {PERMISSION_ITEMS.map(item => (
          <div 
            key={item.key} 
            className='flex items-center justify-between p-4 border-4 border-black bg-white shadow-[4px_4px_0px_#000] hover:-translate-y-1 hover:shadow-[6px_6px_0px_#000] transition-all'
          >
            <div className='flex flex-col pr-4'>
              <span className='text-xs font-black uppercase tracking-tight text-black'>{item.label}</span>
              <span className='text-[10px] font-bold text-slate-500 mt-1 leading-tight'>{item.desc}</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={!!permissions[selectedRole]?.[item.key]} 
                onChange={() => handleToggle(item.key)} 
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none border-2 border-black rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-black after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-2 after:border-black after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00ffff]"></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  )
}
