'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function PasscodeModal({ isOpen, onSuccess, expectedPasscode }) {
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)

  useEffect(() => {
    if (input.length === 4) {
      import('@/shared/utils/hash').then(({ hashPasscode }) => {
        hashPasscode(input).then((hashedInput) => {
          if (hashedInput === expectedPasscode) {
            onSuccess()
          } else {
            setError(true)
            setTimeout(() => {
              setInput('')
              setError(false)
            }, 500)
          }
        })
      })
    }
  }, [input, expectedPasscode, onSuccess])

  const handleKeyPress = (key) => {
    if (input.length < 4) {
      setInput((prev) => prev + key)
    }
  }

  const handleDelete = () => {
    setInput((prev) => prev.slice(0, -1))
  }

  const handleClear = () => {
    setInput('')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-zinc-900 rounded-3xl p-8 shadow-2xl w-full max-w-sm border border-zinc-800"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Enter Passcode</h2>
              <p className="text-zinc-400 text-sm">Please enter your dashboard passcode</p>
            </div>

            <div className="flex justify-center gap-4 mb-8">
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  animate={error ? { x: [-5, 5, -5, 5, 0] } : {}}
                  transition={{ duration: 0.4 }}
                  className={`w-4 h-4 rounded-full transition-colors duration-200 ${
                    input.length > i ? 'bg-[#D9FF00]' : 'bg-zinc-700'
                  }`}
                />
              ))}
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  onClick={() => handleKeyPress(num.toString())}
                  className="h-16 rounded-2xl bg-zinc-800 text-white text-2xl font-semibold hover:bg-zinc-700 active:bg-zinc-600 transition-colors"
                >
                  {num}
                </button>
              ))}
              <button
                onClick={handleClear}
                className="h-16 rounded-2xl bg-zinc-800/50 text-red-400 text-xl font-medium hover:bg-zinc-700 active:bg-zinc-600 transition-colors"
              >
                C
              </button>
              <button
                onClick={() => handleKeyPress('0')}
                className="h-16 rounded-2xl bg-zinc-800 text-white text-2xl font-semibold hover:bg-zinc-700 active:bg-zinc-600 transition-colors"
              >
                0
              </button>
              <button
                onClick={handleDelete}
                className="h-16 rounded-2xl bg-zinc-800/50 text-zinc-300 text-xl flex items-center justify-center hover:bg-zinc-700 active:bg-zinc-600 transition-colors"
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path>
                  <line x1="18" y1="9" x2="12" y2="15"></line>
                  <line x1="12" y1="9" x2="18" y2="15"></line>
                </svg>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
