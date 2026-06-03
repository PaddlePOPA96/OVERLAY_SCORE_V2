import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { useAllUsers } from '@/features/iam/hooks/useAllUsers'
import { updateUserRole, syncUserToFirestore, deleteUserFromDb } from '@/lib/auth/service'
import { auth } from '@/lib/firebaseAuth'

export function UserManagementModal({ open, onClose, currentUserUid, isSuperAdmin }) {
  const { users, loading } = useAllUsers()

  // Coba sync user sendiri saat modal dibuka, in case belum masuk
  useEffect(() => {
    if (!open) return

    if (auth.currentUser) {
      syncUserToFirestore(auth.currentUser).catch(console.error)
    }
  }, [open])

  if (!open) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 overflow-y-auto py-10'>
      <div className='bg-slate-950 border border-slate-700 rounded-2xl p-6 w-full max-w-2xl shadow-2xl text-slate-100 mx-4 relative'>
        <div className='flex items-center justify-between mb-4'>
          <div>
            <h2 className='text-xl font-bold'>Manajemen User (Firestore)</h2>
            <p className='text-sm text-slate-400'>Total User: {users.length}</p>
          </div>
          <button
            onClick={onClose}
            className='w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center justify-center'
          >
            ×
          </button>
        </div>

        {loading ? (
          <div className='text-center py-10 text-slate-400'>Memuat data user...</div>
        ) : users.length === 0 ? (
          <div className='text-center py-10 text-slate-400 flex flex-col items-center gap-2'>
            <p>Belum ada data user di Firestore.</p>
            <p className='text-xs'>Pastikan Firestore sudah diaktifkan di Firebase Console.</p>
            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                if (auth.currentUser) syncUserToFirestore(auth.currentUser)
              }}
            >
              Sync Saya ke DB
            </Button>
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full text-left text-sm'>
              <thead className='border-b border-slate-800 text-slate-400 uppercase text-xs'>
                <tr>
                  <th className='py-3 px-2'>Email</th>
                  <th className='py-3 px-2'>Tanggal Join</th>
                  <th className='py-3 px-2'>Role Saat Ini</th>
                  <th className='py-3 px-2'>Aksi</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-900'>
                {users.map(user => (
                  <UserRow key={user.uid} user={user} isMe={user.uid === currentUserUid} isSuperAdmin={isSuperAdmin} />
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className='mt-6 flex justify-end'>
          <Button variant='ghost' onClick={onClose} className='mr-2 text-xs'>
            Tutup
          </Button>
        </div>
      </div>
    </div>
  )
}

function UserRow({ user, isMe, isSuperAdmin }) {
  const [status, setStatus] = useState('') // "saving" | "success" | "error"
  const [currentRole, setCurrentRole] = useState(user.role || 'user')

  const handleRoleChange = async newRole => {
    if (isMe) return // Guard
    setStatus('saving')
    setCurrentRole(newRole) // Optimistic update

    try {
      await updateUserRole(user.uid, newRole)
      setStatus('success')
      setTimeout(() => setStatus(''), 2000)
    } catch (err) {
      console.error(err)
      setStatus('error')

      // Revert? For now just show error.
    }
  }

  const handleDelete = async () => {
    if (isMe) return
    const confirmDelete = window.confirm(`Apakah Anda yakin ingin menghapus akun ${user.email}?`)

    if (!confirmDelete) return

    setStatus('deleting')

    try {
      await deleteUserFromDb(user.uid)
      setStatus('deleted')
    } catch (err) {
      console.error(err)
      setStatus('error')
      alert('Gagal menghapus user: ' + err.message)
    }
  }

  return (
    <tr className='hover:bg-slate-900/50 transition-colors'>
      <td className='py-3 px-2'>
        <div className='font-medium text-slate-200'>{user.email}</div>
        {isMe && <span className='text-[10px] bg-purple-900 text-purple-200 px-1.5 rounded'>You</span>}
      </td>
      <td className='py-3 px-2 text-slate-500 text-xs'>
        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
      </td>
      <td className='py-3 px-2'>
        {isMe || !isSuperAdmin ? (
          <span className='capitalize text-slate-400 italic px-2'>{currentRole}</span>
        ) : (
          <select
            className='bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none'
            value={currentRole}
            onChange={e => handleRoleChange(e.target.value)}
            disabled={status === 'saving'}
          >
            <option value='user'>User</option>
            <option value='admin'>Admin</option>
            <option value='superadmin'>Super Admin</option>
          </select>
        )}
      </td>
      <td className='py-3 px-2 flex items-center gap-3'>
        {status === 'saving' && <span className='text-yellow-500 text-xs'>Menyimpan...</span>}
        {status === 'success' && <span className='text-emerald-500 text-xs'>Tersimpan!</span>}
        {status === 'deleting' && <span className='text-red-500 text-xs'>Menghapus...</span>}
        {status === 'deleted' && <span className='text-slate-500 text-xs'>Terhapus</span>}
        {status === 'error' && <span className='text-red-500 text-xs'>Gagal</span>}

        {isSuperAdmin && !isMe && !status && (
          <button
            onClick={handleDelete}
            className='text-xs text-red-400 hover:text-red-300 bg-red-950/40 hover:bg-red-950/70 border border-red-800/60 px-2.5 py-1 rounded-md transition-colors cursor-pointer'
          >
            Hapus
          </button>
        )}
      </td>
    </tr>
  )
}
