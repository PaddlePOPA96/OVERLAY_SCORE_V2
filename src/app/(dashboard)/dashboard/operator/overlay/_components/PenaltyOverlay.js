'use client'

import React from 'react'

export default function PenaltyOverlay({ data }) {
  const homeName = data.homeName || 'HOME'
  const awayName = data.awayName || 'AWAY'
  const homeLogo = data.homeLogo
  const awayLogo = data.awayLogo

  const homePenList = (data.homePenalties || '2,2,2,2,2').split(',')
  const awayPenList = (data.awayPenalties || '2,2,2,2,2').split(',')

  const homePenScore = homePenList.filter(x => x === '1').length
  const awayPenScore = awayPenList.filter(x => x === '1').length

  const getActiveIndex = (homeList, awayList) => {
    let homeLast = -1

    for (let i = homeList.length - 1; i >= 0; i--) {
      if (homeList[i] !== '2') {
        homeLast = i
        break
      }
    }

    let awayLast = -1

    for (let i = awayList.length - 1; i >= 0; i--) {
      if (awayList[i] !== '2') {
        awayLast = i
        break
      }
    }

    const maxLast = Math.max(homeLast, awayLast)


    return maxLast + 1
  }

  const activeIdx = getActiveIndex(homePenList, awayPenList)
  const startIndex = Math.floor(activeIdx / 5) * 5

  const getVisiblePenalties = (penList) => {
    const sliced = penList.slice(startIndex, startIndex + 5)

    while (sliced.length < 5) {
      sliced.push('2')
    }


    return sliced
  }

  const visibleHomePens = getVisiblePenalties(homePenList)
  const visibleAwayPens = getVisiblePenalties(awayPenList)

  const roundNumber = Math.floor(startIndex / 5) + 1

  const headerLabel = roundNumber > 1
    ? `🏆 SUDDEN DEATH (ROUND ${roundNumber})`
    : `🏆 PENALTY SHOOTOUT`

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '50px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '760px',
        background: '#1f0172ff',
        border: '5px solid #000000',
        borderRadius: '20px',
        boxShadow: '10px 10px 0px 0px #d4ff00ff',
        padding: '24px 20px',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        fontFamily: '"Inter", "Outfit", system-ui, sans-serif',
      }}
    >
      {/* Header Banner */}
      <div
        style={{
          background: '#000000',
          color: '#FFE600',
          textAlign: 'center',
          padding: '8px 18px',
          borderRadius: '8px',
          fontWeight: '900',
          fontSize: '16px',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          border: '2px solid #000000',
          marginTop: '-38px',
          width: 'fit-content',
          alignSelf: 'center',
          boxShadow: '4px 4px 0px #000'
        }}
      >
        {headerLabel}
      </div>

      {/* Rows Container */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '4px' }}>

        {/* HOME TEAM ROW */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', border: '4px solid #005', borderRadius: '14px', padding: '12px 24px' }}>
          {/* Logo & Name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '120px' }}>
            <div style={{ width: '50px', height: '50px', border: '2.5px solid #000', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: '8px' }}>
              {homeLogo ? (
                <img src={homeLogo} alt={homeName} style={{ maxWidth: '85%', maxHeight: '85%', objectFit: 'contain' }} />
              ) : (
                <span style={{ fontSize: '18px', fontWeight: '900', color: data.homeColor || '#3b82f6' }}>
                  {homeName.charAt(0)}
                </span>
              )}
            </div>
            <span style={{ fontWeight: '950', fontSize: '20px', color: '#000000' }}>{homeName}</span>
          </div>

          {/* Penalty shot circles */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {visibleHomePens.map((val, idx) => (
              <div
                key={`overlay-home-pen-${idx}`}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  border: '3px solid #000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '900',
                  fontSize: '16px',
                  background: val === '1' ? '#00E676' : val === '0' ? '#FF1744' : '#e2e8f0',
                  color: val === '0' ? '#ffffff' : '#000000',
                  boxShadow: '2px 2px 0px #000'
                }}
              >
                {val === '1' ? '✓' : val === '0' ? '✗' : ''}
              </div>
            ))}
          </div>

          {/* Goal Sum count */}
          <div style={{ display: 'flex', width: '56px', height: '46px', background: '#FFE600', border: '3.5px solid #000', borderRadius: '8px', alignItems: 'center', justifyContent: 'center', boxShadow: '3px 3px 0px #000' }}>
            <span style={{ fontSize: '24px', fontWeight: '950', color: '#000000', fontFamily: 'monospace' }}>{homePenScore}</span>
          </div>
        </div>

        {/* AWAY TEAM ROW */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', border: '4px solid #005', borderRadius: '14px', padding: '12px 24px' }}>
          {/* Logo & Name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '120px' }}>
            <div style={{ width: '50px', height: '50px', border: '2.5px solid #000', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: '8px' }}>
              {awayLogo ? (
                <img src={awayLogo} alt={awayName} style={{ maxWidth: '85%', maxHeight: '85%', objectFit: 'contain' }} />
              ) : (
                <span style={{ fontSize: '18px', fontWeight: '900', color: data.awayColor || '#ef4444' }}>
                  {awayName.charAt(0)}
                </span>
              )}
            </div>
            <span style={{ fontWeight: '950', fontSize: '20px', color: '#000000' }}>{awayName}</span>
          </div>

          {/* Penalty shot circles */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {visibleAwayPens.map((val, idx) => (
              <div
                key={`overlay-away-pen-${idx}`}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  border: '3px solid #000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '900',
                  fontSize: '16px',
                  background: val === '1' ? '#00E676' : val === '0' ? '#FF1744' : '#e2e8f0',
                  color: val === '0' ? '#ffffff' : '#000000',
                  boxShadow: '2px 2px 0px #000'
                }}
              >
                {val === '1' ? '✓' : val === '0' ? '✗' : ''}
              </div>
            ))}
          </div>

          {/* Goal Sum count */}
          <div style={{ display: 'flex', width: '56px', height: '46px', background: '#FFE600', border: '3.5px solid #000', borderRadius: '8px', alignItems: 'center', justifyContent: 'center', boxShadow: '3px 3px 0px #000' }}>
            <span style={{ fontSize: '24px', fontWeight: '950', color: '#000000', fontFamily: 'monospace' }}>{awayPenScore}</span>
          </div>
        </div>

      </div>

    </div>
  )
}
