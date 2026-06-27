import React from 'react';
import styles from '../streams.module.css';

export default function StreamNavbar({
    firebaseUser,
    streamHeader,
    streamHeaderCountry,
    multiMode,
    leftWidth,
    setLeftWidth,
}) {
    return (
        <nav className={styles.navbar}>
            <div className={styles.navLeft}>
                <button className={styles.menuBtn} aria-label="Menu">
                    <svg viewBox="0 0 24 24" className={styles.navIcon}><path d="M21,6H3V5h18V6z M21,11H3v1h18V11z M21,17H3v1h18V17z" fill="currentColor"></path></svg>
                </button>
                <a href={firebaseUser ? '/dashboard' : '/'} className={styles.logoContainer} style={{ textDecoration: 'none' }}>
                    <span className={styles.logoText}>{streamHeader}</span>
                    <span className={styles.logoCountry}>{streamHeaderCountry}</span>
                </a>
            </div>

            <div className={styles.navCenter}>
                {multiMode ? (
                    <div style={{ display: 'flex', gap: '8px', background: '#fff', padding: '4px 8px', borderRadius: '0', border: '4px solid #000', boxShadow: '4px 4px 0px #000' }}>
                        <button
                            onClick={() => setLeftWidth(75)}
                            style={{ background: leftWidth > 60 ? '#D9FF00' : '#F5F4F0', color: '#000', border: leftWidth > 60 ? '2px solid #000' : '2px solid transparent', borderRadius: '0', padding: '6px 16px', fontSize: '13px', fontWeight: '900', textTransform: 'uppercase', cursor: 'pointer', transition: '0.2s' }}
                        >Besar Kiri</button>
                        <button
                            onClick={() => setLeftWidth(50)}
                            style={{ background: leftWidth > 40 && leftWidth < 60 ? '#D9FF00' : '#F5F4F0', color: '#000', border: leftWidth > 40 && leftWidth < 60 ? '2px solid #000' : '2px solid transparent', borderRadius: '0', padding: '6px 16px', fontSize: '13px', fontWeight: '900', textTransform: 'uppercase', cursor: 'pointer', transition: '0.2s' }}
                        >50 : 50</button>
                        <button
                            onClick={() => setLeftWidth(25)}
                            style={{ background: leftWidth < 40 ? '#D9FF00' : '#F5F4F0', color: '#000', border: leftWidth < 40 ? '2px solid #000' : '2px solid transparent', borderRadius: '0', padding: '6px 16px', fontSize: '13px', fontWeight: '900', textTransform: 'uppercase', cursor: 'pointer', transition: '0.2s' }}
                        >Besar Kanan</button>
                    </div>
                ) : (
                    <div className={styles.searchContainer}>
                        <input type="text" placeholder="Telusuri" className={styles.searchBar} disabled />
                        <button className={styles.searchBtn} aria-label="Cari">
                            <svg viewBox="0 0 24 24" className={styles.searchIcon}><path d="M20.87,20.17l-5.59-5.59C16.35,13.35,17,11.75,17,10c0-3.87-3.13-7-7-7S3,6.13,3,10s3.13,7,7,7c1.75,0,3.35-0.65,4.58-1.71 l5.59,5.59L20.87,20.17z M10,16c-3.31,0-6-2.69-6-6s2.69-6,6-6s6,2.69,6,6S13.31,16,10,16z" fill="currentColor"></path></svg>
                        </button>
                    </div>
                )}
            </div>

            <div className={styles.navRight}>
                <button className={styles.navActionBtn}>
                    <svg viewBox="0 0 24 24" className={styles.navIcon}><path d="M14,13h-3v3H9v-3H6v-2h3V8h2v3h3V13z M17,6H3v12h14V6z M18,5v14H2V5H18z M22,8.5l-3,2.5v2l3,2.5V8.5z" fill="currentColor"></path></svg>
                </button>
                <button className={styles.navActionBtn}>
                    <svg viewBox="0 0 24 24" className={styles.navIcon}><path d="M10,20h4c0,1.1-0.9,2-2,2S10,21.1,10,20z M20,17.35V19H4v-1.65l2-1.88V10.2c0-2.92,1.56-5.36,4.28-6.01C10.45,4.07,10.5,3.92,10.5,3.7c0-0.94,0.67-1.7,1.5-1.7s1.5,0.76,1.5,1.7c0,0.22,0.05,0.37,0.22,0.49C16.44,4.84,18,7.28,18,10.2v5.27L20,17.35z M17,10.5c0-2.76-1.92-5-4.5-5S8,7.74,8,10.5v5.7h9V10.5z" fill="currentColor"></path></svg>
                </button>
                <div className={styles.userAvatar}>S</div>
            </div>
        </nav>
    );
}
