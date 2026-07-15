'use client'

import { useState, useEffect } from 'react'

import pildunData from '@/data/fix-playerpildun32.json'

export default function ThirdTitleControls({ data, actions, theme = 'dark' }) {
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const [eventType, setEventType] = useState('goal') // goal, yellow_card, red_card, mvp

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('club') // 'club' or 'global'

  // Club Mode State
  const [clubs, setClubs] = useState([])
  const [filteredClubs, setFilteredClubs] = useState([])
  const [clubSearch, setClubSearch] = useState('')
  const [selectedClub, setSelectedClub] = useState(null)
  const [players, setPlayers] = useState([])
  const [playerSearch, setPlayerSearch] = useState('')

  // Global Mode State
  const [globalSearchQuery, setGlobalSearchQuery] = useState('')
  const [globalResults, setGlobalResults] = useState([])

  const [isLoading, setIsLoading] = useState(false)

  // Sync local state with live data if it's currently showing
  useEffect(() => {
    if (data?.thirdTitle && data.thirdTitle.isShowing) {
      if (data.thirdTitle.eventType) {
        setEventType(data.thirdTitle.eventType)
      }
      if (data.thirdTitle.playerName) {
        setSelectedPlayer({
          name: data.thirdTitle.playerName,
          img_url: data.thirdTitle.playerImg,
          club: 'Live Data' // fallback since club isn't in thirdTitle
        })
      }
    }
  }, [data?.thirdTitle?.triggerId, data?.thirdTitle?.isShowing])

  // Map pildunData to clubs on load
  useEffect(() => {
    const mappedClubs = pildunData.map(d => ({ id: d.negara, name: d.negara }))

    setClubs(mappedClubs)
    setFilteredClubs(mappedClubs)

    // Load saved selection from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('selected_country_team')

      if (saved) {
        const countryObj = pildunData.find(d => d.negara === saved)

        if (countryObj) {
          setSelectedClub({ id: saved, name: saved })
          setPlayers(countryObj.pemain.map(p => ({
            name: p.nama_pemain,
            img_url: p.link_foto,
            club: saved
          })))
        }
      }
    }
  }, [])

  // Filter clubs locally
  useEffect(() => {
    if (!clubSearch) {
      setFilteredClubs(clubs)

      return
    }

    const lower = clubSearch.toLowerCase()

    setFilteredClubs(clubs.filter(c => c.name.toLowerCase().includes(lower)))
  }, [clubSearch, clubs])

  // Load players locally when a club/country is selected
  useEffect(() => {
    if (selectedClub) {
      const countryObj = pildunData.find(d => d.negara === selectedClub.name)

      if (countryObj) {
        setPlayers(countryObj.pemain.map(p => ({
          name: p.nama_pemain,
          img_url: p.link_foto,
          club: selectedClub.name
        })))


        // Save to local storage
        if (typeof window !== 'undefined') {
          localStorage.setItem('selected_country_team', selectedClub.name)
        }
      } else {
        setPlayers([])
      }
    }
  }, [selectedClub])

  // Global Search locally inside pildunData
  useEffect(() => {
    if (activeTab !== 'global') return

    if (globalSearchQuery.length < 3) {
      setGlobalResults([])

      return
    }

    const query = globalSearchQuery.toLowerCase()
    const results = []

    pildunData.forEach(d => {
      d.pemain.forEach(p => {
        if (p.nama_pemain.toLowerCase().includes(query)) {
          results.push({
            name: p.nama_pemain,
            img_url: p.link_foto,
            club: d.negara
          })
        }
      })
    })
    setGlobalResults(results)
  }, [globalSearchQuery, activeTab])

  // Reset search state when closed (keep selected country)
  useEffect(() => {
    if (!isModalOpen) {
      setActiveTab('club')
      setClubSearch('')
      setPlayerSearch('')
      setGlobalSearchQuery('')
      setGlobalResults([])
    }
  }, [isModalOpen])

  const handleShow = () => {
    if (!selectedPlayer) {
      alert('Pilih pemain terlebih dahulu!')

      return
    }

    actions.triggerThirdTitle(eventType, selectedPlayer.name, selectedPlayer.img_url)
  }

  const handleHide = () => {
    actions.hideThirdTitle()
  }

  const isShowing = data?.thirdTitle?.isShowing

  const getEventName = (type) => {
    switch (type) {
      case 'goal': return '⚽ GOAL'
      case 'yellow_card': return '🟨 YELLOW CARD'
      case 'red_card': return '🟥 RED CARD'
      case 'goat': return '🐐 GOAT'
      default: return type.toUpperCase()
    }
  }

  const displayedPlayers = playerSearch
    ? players.filter(p => p.name.toLowerCase().includes(playerSearch.toLowerCase()))
    : players

  const handleQuickMatch = (teamName) => {
    const lower = teamName.toLowerCase()
    const matched = pildunData.find(d => d.negara.toLowerCase().includes(lower) || lower.includes(d.negara.toLowerCase()))

    if (matched) {
      const clubObj = { id: matched.negara, name: matched.negara }

      setSelectedClub(clubObj)
    } else {
      setClubSearch(teamName)
    }
  }

  const homeTeam = data?.homeFullName || data?.homeName
  const awayTeam = data?.awayFullName || data?.awayName

  const isLight = true
  const modalBg = isLight ? '#ffffff' : '#020617'
  const modalText = isLight ? '#0f172a' : '#e5e7eb'
  const modalBorder = isLight ? '#cbd5e1' : '#1f2937'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

      {/* Event Type Grid Selector (Rendered directly in card) */}
      <div>
        <div style={{ fontSize: '10px', fontWeight: 'bold', color: isLight ? '#475569' : '#9ca3af', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.05em' }}>
          🏷️ Event Type
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
          {[
            { type: 'goal', label: '⚽ Goal' },
            { type: 'yellow_card', label: '🟨 Yellow' },
            { type: 'red_card', label: '🟥 Red' },
            { type: 'mvp', label: '🏆 MVP' }
          ].map(item => (
            <button
              key={item.type}
              type="button"
              className={`neo-btn-lg ${eventType === item.type ? 'neo-btn-primary' : 'neo-btn-outline'}`}
              onClick={() => setEventType(item.type)}
              style={{ fontSize: '11px', padding: '8px 2px' }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Player Selection & Search */}
      <div>
        <div style={{ fontSize: '10px', fontWeight: 'bold', color: isLight ? '#475569' : '#9ca3af', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.05em' }}>
          👤 Target Player
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div
            className="neo-btn-lg neo-btn-outline"
            style={{
              flex: 1,
              justifyContent: 'flex-start',
              background: isLight ? '#ffffff' : '#090d16',
              color: modalText,
              cursor: 'default',
              boxShadow: 'none',
              border: `3px solid ${isLight ? '#cbd5e1' : '#000000'}`,
              fontWeight: 900,
              fontSize: '12px'
            }}
          >
            👤 {selectedPlayer ? selectedPlayer.name : 'No Player Selected'}
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="neo-btn-lg neo-btn-primary"
            style={{ padding: '0 16px', fontSize: '12px' }}
          >
            🔍 Find Player
          </button>
        </div>
      </div>

      {/* Action Trigger Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', borderTop: `1px solid ${isLight ? '#e2e8f0' : '#1f2937'}`, paddingTop: '10px', marginTop: '4px' }}>
        <button
          onClick={handleShow}
          disabled={!selectedPlayer}
          className="neo-btn-lg neo-btn-primary"
          style={{ width: '100%', height: '42px', fontSize: '12px', background: '#00E676', color: '#000000' }}
        >
          {isShowing ? 'Update Live' : '▶ Show Overlay'}
        </button>

        <button
          onClick={handleHide}
          disabled={!isShowing}
          className="neo-btn-lg neo-btn-danger"
          style={{ width: '100%', height: '42px', fontSize: '12px' }}
        >
          ⏹ Hide Overlay
        </button>
      </div>

      {/* Grid Selection Modal */}
      {isModalOpen && (
        <div className="neo-modal-overlay" style={{ backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}>
          <div className="neo-modal-content" style={{ background: modalBg, color: modalText, border: `3px solid ${isLight ? '#cbd5e1' : '#000000'}`, boxShadow: isLight ? '5px 5px 0px 0px rgba(0,0,0,0.1)' : '5px 5px 0px 0px #000000' }}>
            <div className="neo-modal-header" style={{ borderBottom: `1px solid ${modalBorder}` }}>
              <span className="neo-modal-title" style={{ color: isLight ? '#2563eb' : '#FFE600' }}>Select Player</span>
              <button
                className="neo-btn-lg neo-btn-outline"
                style={{ padding: '6px 12px', fontSize: '12px', background: isLight ? '#f1f5f9' : '#1f2937', color: modalText }}
                onClick={() => setIsModalOpen(false)}
              >
                Close
              </button>
            </div>

            <div className="neo-modal-body">

              {/* Player Search Tab Menu */}
              <div>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                  <button
                    onClick={() => setActiveTab('club')}
                    className={`neo-btn-lg ${activeTab === 'club' ? 'neo-btn-primary' : 'neo-btn-outline'}`}
                    style={{ flex: 1, padding: '8px', fontSize: '12px' }}
                  >
                    Select From Club
                  </button>
                  <button
                    onClick={() => setActiveTab('global')}
                    className={`neo-btn-lg ${activeTab === 'global' ? 'neo-btn-primary' : 'neo-btn-outline'}`}
                    style={{ flex: 1, padding: '8px', fontSize: '12px' }}
                  >
                    Global Search
                  </button>
                </div>

                {activeTab === 'club' ? (

                  /* Club Mode Player Selection */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {selectedClub && (
                        <button
                          onClick={() => {
                            setSelectedClub(null)
                            setPlayerSearch('')
                          }}
                          className="neo-btn-lg neo-btn-outline"
                          style={{ padding: '6px 10px', fontSize: '11px' }}
                        >
                          ← Back
                        </button>
                      )}
                      <span style={{ fontWeight: '800', fontSize: '13px' }}>
                        {selectedClub ? `Club: ${selectedClub.name}` : 'Choose club/country:'}
                      </span>
                    </div>

                    {!selectedClub ? (

                      /* Club search view */
                      <>
                        <input
                          autoFocus
                          value={clubSearch}
                          onChange={e => setClubSearch(e.target.value)}
                          placeholder="Type club/country name..."
                          className="op-input"
                          style={{ width: '100%', padding: '8px 12px', fontSize: '13px', background: isLight ? '#ffffff' : '#090d16', color: modalText }}
                        />

                        {(homeTeam || awayTeam) && !clubSearch && (
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            {homeTeam && homeTeam !== 'HOME' && homeTeam !== 'NRG' && homeTeam !== 'XLG' && (
                              <button
                                onClick={() => handleQuickMatch(homeTeam)}
                                className="neo-btn-lg neo-btn-outline"
                                style={{ padding: '8px', fontSize: '11px', textAlign: 'left', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                              >
                                🏠 Home: {homeTeam}
                              </button>
                            )}
                            {awayTeam && awayTeam !== 'AWAY' && awayTeam !== 'NRG' && awayTeam !== 'XLG' && (
                              <button
                                onClick={() => handleQuickMatch(awayTeam)}
                                className="neo-btn-lg neo-btn-outline"
                                style={{ padding: '8px', fontSize: '11px', textAlign: 'left', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                              >
                                ✈️ Away: {awayTeam}
                              </button>
                            )}
                          </div>
                        )}

                        <div className="neo-grid-2" style={{ maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
                          {filteredClubs.map((club) => (
                            <div
                              key={club.id}
                              onClick={() => setSelectedClub(club)}
                              className="neo-grid-item-btn"
                              style={{ padding: '10px 6px', fontSize: '12px' }}
                            >
                              {club.name}
                            </div>
                          ))}
                          {filteredClubs.length === 0 && !isLoading && (
                            <span style={{ gridColumn: 'span 2', textAlign: 'center', fontSize: '12px', color: '#64748b', padding: '10px' }}>
                              Club not found.
                            </span>
                          )}
                        </div>
                      </>
                    ) : (

                      /* Club players view - No Images Rendered */
                      <>
                        <input
                          autoFocus
                          value={playerSearch}
                          onChange={e => setPlayerSearch(e.target.value)}
                          placeholder={`Search players in ${selectedClub.name}...`}
                          className="op-input"
                          style={{ width: '100%', padding: '8px 12px', fontSize: '13px', background: isLight ? '#ffffff' : '#090d16', color: modalText }}
                        />

                        <div className="neo-grid-2" style={{ maxHeight: '200px', overflowY: 'auto', paddingRight: '4px' }}>
                          {isLoading ? (
                            <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '10px', fontSize: '12px', color: '#64748b' }}>Loading...</div>
                          ) : (
                            <>
                              {displayedPlayers.map((p, i) => (
                                <div
                                  key={i}
                                  onClick={() => {
                                    setSelectedPlayer(p)
                                    setIsModalOpen(false)
                                  }}
                                  className={`neo-grid-item-card ${selectedPlayer?.name === p.name ? 'selected' : ''}`}
                                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', minHeight: '52px', padding: '8px 12px', background: isLight ? '#ffffff' : '#090d16', borderColor: isLight ? '#cbd5e1' : '#1f2937' }}
                                >
                                  <div style={{ fontSize: '12px', fontWeight: '900', color: modalText }}>{p.name}</div>
                                  <div style={{ fontSize: '9px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>{p.club}</div>
                                </div>
                              ))}
                              {displayedPlayers.length === 0 && (
                                <span style={{ gridColumn: 'span 2', textAlign: 'center', fontSize: '12px', color: '#64748b', padding: '10px' }}>
                                  Player not found.
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ) : (

                  /* Global Player Search - No Images Rendered */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <input
                      autoFocus
                      value={globalSearchQuery}
                      onChange={e => setGlobalSearchQuery(e.target.value)}
                      placeholder="Type player name (min 3 letters)..."
                      className="op-input"
                      style={{ width: '100%', padding: '8px 12px', fontSize: '13px', background: isLight ? '#ffffff' : '#090d16', color: modalText }}
                    />

                    <div className="neo-grid-2" style={{ maxHeight: '200px', overflowY: 'auto', paddingRight: '4px' }}>
                      {isLoading ? (
                        <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '10px', fontSize: '12px', color: '#64748b' }}>Searching...</div>
                      ) : (
                        <>
                          {globalResults.map((p, i) => (
                            <div
                              key={`global-${i}`}
                              onClick={() => {
                                setSelectedPlayer(p)
                                setIsModalOpen(false)
                              }}
                              className={`neo-grid-item-card ${selectedPlayer?.name === p.name ? 'selected' : ''}`}
                              style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', minHeight: '52px', padding: '8px 12px', background: isLight ? '#ffffff' : '#090d16', borderColor: isLight ? '#cbd5e1' : '#1f2937' }}
                            >
                              <div style={{ fontSize: '12px', fontWeight: '900', color: modalText }}>{p.name}</div>
                              <div style={{ fontSize: '9px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>{p.club}</div>
                            </div>
                          ))}

                          {globalResults.length === 0 && globalSearchQuery.length >= 3 && (
                            <span style={{ gridColumn: 'span 2', textAlign: 'center', fontSize: '12px', color: '#64748b', padding: '10px' }}>
                              No player found.
                            </span>
                          )}
                          {globalSearchQuery.length > 0 && globalSearchQuery.length < 3 && (
                            <span style={{ gridColumn: 'span 2', textAlign: 'center', fontSize: '12px', color: '#64748b', padding: '10px' }}>
                              Type more to search...
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  )
}

