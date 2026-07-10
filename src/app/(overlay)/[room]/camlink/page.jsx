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
  const [title, setTitle] = useState('NAMA TOURNAMENT')
  const [names, setNames] = useState({
    single: 'BUNG ALDO',
    dual1: 'BUNG ALDO',
    dual2: 'BUNG HUI',
    tripleMain: 'BUNG ALDO',
    triple1: 'BUNG HUI',
    triple2: 'BUNG ALDO',
    quad1: 'PLAYER 1',
    quad2: 'PLAYER 2',
    quad3: 'PLAYER 3',
    quad4: 'PLAYER 4'
  })

  useEffect(() => {
    // Override global body styles for this specific overlay page
    document.body.style.margin = '0'
    document.body.style.padding = '0'
    document.body.style.overflow = 'hidden'
    document.body.style.backgroundColor = '#000'

    return () => {
      // Revert styles when unmounting
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
        if (data.title) setTitle(data.title)
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
        <div key={title} className={styles.titleBox}>
          {title}
        </div>
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
          <div className={`${styles.layout} ${styles.layoutTripleWrap} ${layout === 'triple' ? styles.active : ''}`}>
            <div className={`${styles.camBox} ${styles.camTripleWrapItem}`}>
              {names.tripleMain && <div className={styles.namePlate}>{names.tripleMain}</div>}
            </div>
            <div className={`${styles.camBox} ${styles.camTripleWrapItem}`}>
              {names.triple1 && <div className={styles.namePlate}>{names.triple1}</div>}
            </div>
            <div className={`${styles.camBox} ${styles.camTripleWrapItem}`}>
              {names.triple2 && <div className={styles.namePlate}>{names.triple2}</div>}
            </div>
          </div>

          {/* Quad Cam Layout */}
          <div className={`${styles.layout} ${styles.layoutGrid} ${layout === 'quad' ? styles.active : ''}`}>
            <div className={`${styles.camBox} ${styles.camGridItem}`}>
              {names.quad1 && <div className={styles.namePlate}>{names.quad1}</div>}
            </div>
            <div className={`${styles.camBox} ${styles.camGridItem}`}>
              {names.quad2 && <div className={styles.namePlate}>{names.quad2}</div>}
            </div>
            <div className={`${styles.camBox} ${styles.camGridItem}`}>
              {names.quad3 && <div className={styles.namePlate}>{names.quad3}</div>}
            </div>
            <div className={`${styles.camBox} ${styles.camGridItem}`}>
              {names.quad4 && <div className={styles.namePlate}>{names.quad4}</div>}
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

      <div className={styles.titleContainer}>
        <div className={styles.titleBox}>
          {title}
        </div>
      </div>
    </div>
  )
}
