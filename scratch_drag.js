const fs = require('fs');

let file = 'src/app/streams/page.jsx';
let content = fs.readFileSync(file, 'utf-8');

// 1. Add state for dragging
content = content.replace(
    "const [highlightMode, setHighlightMode] = useState('none');",
    `const [highlightMode, setHighlightMode] = useState('none');
    const containerRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [leftWidth, setLeftWidth] = useState(50);

    useEffect(() => {
        const onMouseMove = (e) => {
            if (!isDragging || !containerRef.current) return;
            const containerRect = containerRef.current.getBoundingClientRect();
            // if stacked vertically (mobile), don't drag width
            if (window.innerWidth <= 1000) return;
            
            let newLeft = ((e.clientX - containerRect.left) / containerRect.width) * 100;
            if (newLeft < 15) newLeft = 15;
            if (newLeft > 85) newLeft = 85;
            setLeftWidth(newLeft);
        };
        const onTouchMove = (e) => {
            if (!isDragging || !containerRef.current) return;
            const containerRect = containerRef.current.getBoundingClientRect();
            if (window.innerWidth <= 1000) return;
            
            let newLeft = ((e.touches[0].clientX - containerRect.left) / containerRect.width) * 100;
            if (newLeft < 15) newLeft = 15;
            if (newLeft > 85) newLeft = 85;
            setLeftWidth(newLeft);
        };
        const onMouseUp = () => { setIsDragging(false); };
        
        if (isDragging) {
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
            document.addEventListener('touchmove', onTouchMove, { passive: false });
            document.addEventListener('touchend', onMouseUp);
            // Disable text selection while dragging
            document.body.style.userSelect = 'none';
        } else {
            document.body.style.userSelect = '';
        }
        
        return () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            document.removeEventListener('touchmove', onTouchMove);
            document.removeEventListener('touchend', onMouseUp);
            document.body.style.userSelect = '';
        };
    }, [isDragging]);`
);

// 2. Remove the Highlight buttons from navCenter, since we use dragging now
const navCenterOld = `                    {multiMode ? (
                        <div style={{ display: 'flex', gap: '8px', background: '#121212', padding: '4px 8px', borderRadius: '20px', border: '1px solid #303030' }}>
                            <button 
                                onClick={() => setHighlightMode('left')}
                                style={{ background: highlightMode === 'left' ? '#3ea6ff' : 'transparent', color: highlightMode === 'left' ? '#0f0f0f' : '#f1f1f1', border: 'none', borderRadius: '16px', padding: '6px 16px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}
                            >Besar Kiri</button>
                            <button 
                                onClick={() => setHighlightMode('none')}
                                style={{ background: highlightMode === 'none' ? '#3ea6ff' : 'transparent', color: highlightMode === 'none' ? '#0f0f0f' : '#f1f1f1', border: 'none', borderRadius: '16px', padding: '6px 16px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}
                            >50 : 50</button>
                            <button 
                                onClick={() => setHighlightMode('right')}
                                style={{ background: highlightMode === 'right' ? '#3ea6ff' : 'transparent', color: highlightMode === 'right' ? '#0f0f0f' : '#f1f1f1', border: 'none', borderRadius: '16px', padding: '6px 16px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}
                            >Besar Kanan</button>
                        </div>
                    ) : (
                        <div className={styles.searchContainer}>
                            <input type="text" placeholder="Telusuri" className={styles.searchBar} disabled />
                            <button className={styles.searchBtn} aria-label="Cari">
                                <svg viewBox="0 0 24 24" className={styles.searchIcon}><path d="M20.87,20.17l-5.59-5.59C16.35,13.35,17,11.75,17,10c0-3.87-3.13-7-7-7S3,6.13,3,10s3.13,7,7,7c1.75,0,3.35-0.65,4.58-1.71 l5.59,5.59L20.87,20.17z M10,16c-3.31,0-6-2.69-6-6s2.69-6,6-6s6,2.69,6,6S13.31,16,10,16z" fill="currentColor"></path></svg>
                            </button>
                        </div>
                    )}`;

const navCenterNew = `                    <div className={styles.searchContainer}>
                        <input type="text" placeholder="Telusuri" className={styles.searchBar} disabled />
                        <button className={styles.searchBtn} aria-label="Cari">
                            <svg viewBox="0 0 24 24" className={styles.searchIcon}><path d="M20.87,20.17l-5.59-5.59C16.35,13.35,17,11.75,17,10c0-3.87-3.13-7-7-7S3,6.13,3,10s3.13,7,7,7c1.75,0,3.35-0.65,4.58-1.71 l5.59,5.59L20.87,20.17z M10,16c-3.31,0-6-2.69-6-6s2.69-6,6-6s6,2.69,6,6S13.31,16,10,16z" fill="currentColor"></path></svg>
                        </button>
                    </div>
                    {multiMode && <div style={{ fontSize: '13px', color: '#aaa', marginLeft: '12px' }}>Mode Kanan-Kiri Aktif</div>}`;

content = content.replace(navCenterOld, navCenterNew);

// 3. Update the layout
const layoutOld = /<div className=\{\`\$\{styles\.layout\}.*?\`\}>/;
content = content.replace(layoutOld, "<div className={styles.layout} ref={containerRef} style={multiMode ? { gap: 0 } : {}}>");

// 4. Update the left video section
const videoSectionOld = "<div className={styles.videoSection}>";
const videoSectionNew = "<div className={`${styles.videoSection} ${multiMode ? styles.resizableLeft : ''}`} style={multiMode ? { flex: `0 0 ${leftWidth}%`, paddingRight: '12px' } : {}}>";
content = content.replace(videoSectionOld, videoSectionNew);

// 5. Update the right video section and add splitter
const rightVideoOld = `{multiMode && (
                <div className={styles.videoSection}>`;
const rightVideoNew = `{multiMode && (
                <div 
                    className={styles.splitter} 
                    onMouseDown={() => setIsDragging(true)}
                    onTouchStart={() => setIsDragging(true)}
                >
                    <div className={styles.splitterHandle}></div>
                </div>
                )}

                {multiMode && (
                <div className={`${styles.videoSection} ${styles.resizableRight}`} style={{ flex: '1', paddingLeft: '12px', minWidth: 0 }}>`;
content = content.replace(rightVideoOld, rightVideoNew);

fs.writeFileSync(file, content, 'utf-8');

// Update streams.module.css
let cssFile = 'src/app/streams/streams.module.css';
let cssContent = fs.readFileSync(cssFile, 'utf-8');

// remove old highlight styles
const highlightRegex = /\\/\\* MULTI STREAM HIGHLIGHT MODES \\*\\/[\\s\\S]*/;
cssContent = cssContent.replace(highlightRegex, '');

cssContent += `
/* DRAGGABLE SPLITTER */
.splitter {
    width: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: col-resize;
    user-select: none;
    transition: background-color 0.2s;
    border-radius: 4px;
    margin: 0 -4px;
    z-index: 10;
}
.splitter:hover, .splitter:active {
    background-color: rgba(255, 255, 255, 0.1);
}
.splitterHandle {
    width: 4px;
    height: 40px;
    background-color: #3f3f3f;
    border-radius: 2px;
    transition: background-color 0.2s;
}
.splitter:hover .splitterHandle, .splitter:active .splitterHandle {
    background-color: #3ea6ff;
}

/* On mobile, stack them and hide splitter */
@media (max-width: 1000px) {
    .splitter {
        display: none;
    }
    .resizableLeft, .resizableRight {
        flex: 1 !important;
        padding: 0 !important;
        width: 100% !important;
    }
}
`;

fs.writeFileSync(cssFile, cssContent, 'utf-8');

console.log("Drag logic applied successfully.");
