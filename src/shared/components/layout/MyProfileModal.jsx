'use client'

import React, { useState } from 'react'
import { changeUserPasscode } from '@/services/firebase/auth-service/service'

const MyProfileModal = ({ open, onClose, user, userRole }) => {
  const [oldPin, setOldPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [showOldPin, setShowOldPin] = useState(false)
  const [showNewPin, setShowNewPin] = useState(false)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState({ type: '', message: '' })

  const handleReset = () => {
    setOldPin('')
    setNewPin('')
    setStatus({ type: '', message: '' })
    setShowOldPin(false)
    setShowNewPin(false)
  }

  const handleClose = () => {
    handleReset()
    if (onClose) onClose()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (newPin.length !== 4 || isNaN(newPin)) {
      setStatus({ type: 'error', message: 'PIN baru harus terdiri dari tepat 4 angka.' })
      return
    }

    if (oldPin === newPin) {
      setStatus({ type: 'error', message: 'PIN baru tidak boleh sama dengan PIN lama.' })
      return
    }

    setStatus({ type: '', message: '' })
    setLoading(true)

    try {
      await changeUserPasscode(user.uid, oldPin, newPin)
      setStatus({ type: 'success', message: 'PIN berhasil diubah!' })
      setOldPin('')
      setNewPin('')
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Gagal mengubah PIN.' })
    } finally {
      setLoading(false)
    }
  }

  if (!user || !open) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] flex flex-col">
        
        {/* Header */}
        <div className="bg-[#ccff00] border-b-4 border-black p-4 flex justify-between items-center">
          <h2 className="text-xl font-black uppercase tracking-wider text-black m-0">My Profile</h2>
          <button 
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center bg-white border-2 border-black font-bold shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
          >
            <i className="ri-close-line text-lg"></i>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-6 bg-slate-50">
          
          {/* User Info Block */}
          <div className="flex flex-col gap-3 p-4 bg-white border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Email</span>
              <span className="font-black text-black">{user.email}</span>
            </div>
            <div className="h-1 bg-black w-full my-1"></div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Role</span>
              <span className="font-black text-[#ff3366] uppercase bg-[#ff3366]/10 px-2 py-0.5 border-2 border-[#ff3366]">{userRole}</span>
            </div>
          </div>

          <h3 className="text-lg font-black uppercase tracking-wider border-b-4 border-black pb-2 text-black">
            Ganti PIN Keamanan
          </h3>

          {status.message && (
            <div className={`p-3 border-4 border-black font-bold uppercase text-sm flex items-center gap-2 ${status.type === 'success' ? 'bg-[#00ff99]' : 'bg-[#ff3366] text-white'}`}>
              <i className={status.type === 'success' ? 'ri-checkbox-circle-fill text-xl' : 'ri-error-warning-fill text-xl'}></i>
              {status.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Old PIN */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold uppercase tracking-wider text-black">PIN Lama</label>
              <div className="relative">
                <input
                  type={showOldPin ? 'text' : 'password'}
                  value={oldPin}
                  onChange={(e) => setOldPin(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
                  placeholder="Masukkan 4 angka"
                  required
                  className="w-full bg-white border-4 border-black p-3 font-bold text-lg tracking-[0.5em] focus:outline-none focus:shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-shadow"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPin(!showOldPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xl hover:text-[#ff3366] transition-colors"
                >
                  <i className={showOldPin ? 'ri-eye-off-fill' : 'ri-eye-fill'} />
                </button>
              </div>
            </div>

            {/* New PIN */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold uppercase tracking-wider text-black">PIN Baru</label>
              <div className="relative">
                <input
                  type={showNewPin ? 'text' : 'password'}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
                  placeholder="Masukkan 4 angka"
                  required
                  className="w-full bg-white border-4 border-black p-3 font-bold text-lg tracking-[0.5em] focus:outline-none focus:shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-shadow"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPin(!showNewPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xl hover:text-[#ff3366] transition-colors"
                >
                  <i className={showNewPin ? 'ri-eye-off-fill' : 'ri-eye-fill'} />
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading || oldPin.length !== 4 || newPin.length !== 4}
              className="mt-4 bg-[#7a00ff] text-white border-4 border-black p-4 font-black uppercase tracking-widest text-sm shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] disabled:opacity-50 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)] transition-all flex justify-center items-center gap-2"
            >
              {loading ? (
                <>
                  <i className="ri-loader-4-line animate-spin"></i> Menyimpan...
                </>
              ) : 'Simpan PIN Baru'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default MyProfileModal
