'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { ref, onValue } from 'firebase/database'
import { db } from '@/services/firebase/index'
import styles from './page.module.css'

export default function CamlinkOverlayPage() {
  const params = useParams()
  const roomId = params.room || 'default'
  
  const [layout, setLayout] = useState('single')
  const [chatUrl, setChatUrl] = useState('')
  const [names, setNames] = useState({
    single: 'BUNG ALDO',
    dual1: 'BUNG ALDO',
    dual2: 'BUNG HUI',
    tripleMain: 'MAIN EVENT',
    triple1: 'BUNG ALDO',
    triple2: 'BUNG HUI'
  })

  useEffect(() => {
    // Override global body styles for this specific overlay page
    document.body.style.margin = '0'
    document.body.style.padding = '0'
    document.body.style.overflow = 'hidden'
    document.body.style.backgroundColor = '#000'

    return () => {
      // Revert styles when unmounting (though overlays usually don't unmount in OBS)
      document.body.style.margin = ''
      document.body.style.padding = ''
      document.body.style.overflow = ''
      document.body.style.backgroundColor = ''
    }
  }, [])

  useEffect(() => {
    const overlayPath = `match_live/${roomId}/camlink_overlay`
    const dbRef = ref(db, overlayPath)

    const unsubscribe = onValue(dbRef, snapshot => {
      const data = snapshot.val()
      if (data) {
        if (data.layout) setLayout(data.layout)
        if (data.chatUrl) setChatUrl(data.chatUrl)
        if (data.names) {
          setNames(prev => ({ ...prev, ...data.names }))
        }
      }
    })

    return () => unsubscribe()
  }, [roomId])

  return (
    <div className={styles.bodyWrapper}>
      <div className={styles.bgOuter}></div>

      <div className={styles.titleContainer}>
        <img src="/camlink/tittle.webp" alt="Title" className={styles.titleImg} />
      </div>

      <div className={styles.mainFrame}>
        <div className={styles.layoutsContainer}>
          
          {/* Single Cam Layout */}
          <div className={`${styles.layout} ${layout === 'single' ? styles.active : ''}`}>
            <div className={`${styles.camBox} ${styles.camLarge}`}>
              {names.single && <div className={styles.namePlate}>{names.single}</div>}
            </div>
          </div>

          {/* Dual Cam Layout */}
          <div className={`${styles.layout} ${layout === 'dual' ? styles.active : ''}`}>
            <div className={`${styles.camBox} ${styles.camMedium}`}>
              {names.dual1 && <div className={styles.namePlate}>{names.dual1}</div>}
            </div>
            <div className={`${styles.camBox} ${styles.camMedium}`}>
              {names.dual2 && <div className={styles.namePlate}>{names.dual2}</div>}
            </div>
          </div>

          {/* Triple Cam Layout */}
          <div className={`${styles.layout} ${layout === 'triple' ? styles.active : ''}`}>
            <div className={`${styles.camBox} ${styles.camMain}`}>
              {names.tripleMain && <div className={styles.namePlate}>{names.tripleMain}</div>}
            </div>
            <div className={styles.sideCams}>
              <div className={`${styles.camBox} ${styles.camSmall}`}>
                {names.triple1 && <div className={styles.namePlate}>{names.triple1}</div>}
              </div>
              <div className={`${styles.camBox} ${styles.camSmall}`}>
                {names.triple2 && <div className={styles.namePlate}>{names.triple2}</div>}
              </div>
            </div>
          </div>

          {/* 1 Cam + Chat Layout */}
          <div className={`${styles.layout} ${layout === 'chat' ? styles.active : ''}`}>
            <div className={`${styles.camBox} ${styles.camChatMode}`}>
              {names.single && <div className={styles.namePlate}>{names.single}</div>}
            </div>
            <div className={styles.chatFrame}>
              <div className={styles.chatHeader}>
                LIVE CHAT
              </div>
              <div className={styles.chatContent}>
                {chatUrl ? (
                  <iframe 
                    src={(function() {
                      try {
                        if (chatUrl.includes('youtube.com/live_chat')) {
                          const urlObj = new URL(chatUrl);
                          if (typeof window !== 'undefined') {
                            urlObj.searchParams.set('embed_domain', window.location.hostname);
                          }
                          return urlObj.toString();
                        }
                        return chatUrl;
                      } catch (e) {
                        return chatUrl;
                      }
                    })()} 
                    className={styles.chatIframe} 
                  />
                ) : (
                  <div style={{ color: '#000', fontSize: '32px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '40px', textAlign: 'center' }}>
                    YOUTUBE CHAT URL KOSONG
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
