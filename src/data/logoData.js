// Data logo dan helper untuk path & singkatan tim

// Struktur ini dibuat berdasarkan folder di public/logo
export const LOGO_DATA = {
  'ASEAN Championship': [
    'Brunei',
    'Cambodia',
    'Indonesia',
    'Laos',
    'Malaysia',
    'Myanmar',
    'Philippines',
    'Singapore',
    'Thailand',
    'Timor-Leste',
    'Vietnam',
    'ASEAN Championship'
  ],
  'England - Premier League': [
    'AFC Bournemouth',
    'Arsenal FC',
    'Aston Villa',
    'Brentford FC',
    'Brighton & Hove Albion',
    'Burnley FC',
    'Chelsea FC',
    'Crystal Palace',
    'Everton FC',
    'Fulham FC',
    'Leeds United',
    'Liverpool FC',
    'Manchester City',
    'Manchester United',
    'Newcastle United',
    'Nottingham Forest',
    'Sunderland',
    'Tottenham Hotspur',
    'West Ham United',
    'Wolverhampton Wanderers'
  ],
  'Italy - Serie A': [
    'AC Milan',
    'ACF Fiorentina',
    'AS Roma',
    'Atalanta BC',
    'Bologna FC 1909',
    'Cagliari Calcio',
    'Como 1907',
    'Genoa CFC',
    'Hellas Verona',
    'Inter Milan',
    'Juventus FC',
    'Parma Calcio 1913',
    'Pisa Sporting Club',
    'SS Lazio',
    'SSC Napoli',
    'Torino FC',
    'Udinese Calcio',
    'US Cremonese',
    'US Lecce',
    'US Sassuolo'
  ],
  'FIFA World Cup': [
    'Argentina',
    'Australia',
    'Belgium',
    'Brazil',
    'Cameroon',
    'Canada',
    'Costa Rica',
    'Croatia',
    'Denmark',
    'Ecuador',
    'England',
    'France',
    'Germany',
    'Ghana',
    'Iran',
    'Italy',
    'Japan',
    'Mexico',
    'Morocco',
    'Netherlands',
    'Poland',
    'Portugal',
    'Qatar',
    'Saudi Arabia',
    'Senegal',
    'Serbia',
    'South Korea',
    'Spain',
    'Switzerland',
    'Tunisia',
    'Ukraine',
    'Uruguay',
    'USA',
    'Wales',
    'Sweden',
    'Algeria',
    'Colombia',
    'Egypt',
    'Nigeria',
    'Peru',
    'Turkey',
    'Chile'
  ]
}

export function buildLogoSrc(league, club) {
  if (!league || !club) return ''

  if (club.toLowerCase() === 'paper rex') {
    return 'https://images.seeklogo.com/logo-png/45/2/paper-rex-logo-png_seeklogo-455546.png'
  }

  if (league === 'FIFA World Cup') {
    const countryMap = {
      argentina: 'ar',
      australia: 'au',
      belgium: 'be',
      brazil: 'br',
      cameroon: 'cm',
      canada: 'ca',
      costarica: 'cr',
      croatia: 'hr',
      denmark: 'dk',
      ecuador: 'ec',
      england: 'gb-eng',
      france: 'fr',
      germany: 'de',
      ghana: 'gh',
      iran: 'ir',
      italy: 'it',
      japan: 'jp',
      mexico: 'mx',
      morocco: 'ma',
      netherlands: 'nl',
      poland: 'pl',
      portugal: 'pt',
      qatar: 'qa',
      saudiarabia: 'sa',
      senegal: 'sn',
      serbia: 'rs',
      southkorea: 'kr',
      spain: 'es',
      switzerland: 'ch',
      tunisia: 'tn',
      ukraine: 'ua',
      uruguay: 'uy',
      usa: 'us',
      wales: 'gb-wls',
      sweden: 'se',
      algeria: 'dz',
      colombia: 'co',
      egypt: 'eg',
      nigeria: 'ng',
      peru: 'pe',
      turkey: 'tr',
      chile: 'cl',
      austria: 'at',
      czechrepublic: 'cz',
      greece: 'gr',
      norway: 'no',
      romania: 'ro',
      russia: 'ru'
    }

    const key = String(club)
      .toLowerCase()
      .replace(/[^a-z]/g, '')

    const code = countryMap[key]

    if (code) {
      return `https://flagcdn.com/w160/${code}.png`
    }

    return 'https://flagcdn.com/w160/un.png'
  }

  if (league === 'ASEAN Championship') {
    const affMap = {
      brunei: 'https://upload.wikimedia.org/wikipedia/commons/9/9c/Flag_of_Brunei.svg',
      cambodia: 'https://upload.wikimedia.org/wikipedia/commons/8/83/Flag_of_Cambodia.svg',
      indonesia: 'https://upload.wikimedia.org/wikipedia/commons/9/9f/Flag_of_Indonesia.svg',
      laos: 'https://upload.wikimedia.org/wikipedia/commons/5/56/Flag_of_Laos.svg',
      malaysia: 'https://upload.wikimedia.org/wikipedia/commons/6/66/Flag_of_Malaysia.svg',
      myanmar: 'https://upload.wikimedia.org/wikipedia/commons/8/8c/Flag_of_Myanmar.svg',
      philippines: 'https://upload.wikimedia.org/wikipedia/commons/9/99/Flag_of_the_Philippines.svg',
      singapore: 'https://upload.wikimedia.org/wikipedia/commons/4/48/Flag_of_Singapore.svg',
      thailand: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Flag_of_Thailand.svg',
      'timor-leste': 'https://upload.wikimedia.org/wikipedia/commons/2/26/Flag_of_East_Timor.svg',
      vietnam: 'https://upload.wikimedia.org/wikipedia/commons/2/21/Flag_of_Vietnam.svg',
      'asean championship': 'https://upload.wikimedia.org/wikipedia/en/7/76/2026_ASEAN_Championship_Logo.svg'
    }
    const key = String(club).toLowerCase()
    if (affMap[key]) {
      return affMap[key]
    }
    return 'https://upload.wikimedia.org/wikipedia/en/7/76/2026_ASEAN_Championship_Logo.svg'
  }

  const leagueSegment = encodeURIComponent(league)
  const clubSegment = encodeURIComponent(club)

  return `/logo/${leagueSegment}/${clubSegment}.png`
}

// Alias khusus untuk logo yang disimpan di /logo/other
// Key: nama tim yang dinormalisasi (lowercase, tanpa simbol)
// Value: nama file (tanpa .png) di folder /logo/other
const OTHER_LOGO_ALIAS = {
  // Kairat
  'fk kairat': 'FC Kairat',
  'fc kairat': 'FC Kairat',
  kairat: 'FC Kairat',
  'fk kairat almaty': 'FC Kairat',
  'kairat almaty': 'FC Kairat',

  // Paphos / Pafos / Papos
  'paphos fc': 'Papos FC',
  'pafos fc': 'Papos FC',
  'papos fc': 'Papos FC',
  paphos: 'Papos FC',
  pafos: 'Papos FC',
  papos: 'Papos FC',

  // Qarabag / Qarabağ Ağdam FK (untuk jaga‑jaga)
  'qarabag fk': 'Qarabağ Ağdam FK',
  'qarabag agdam fk': 'Qarabağ Ağdam FK',
  'qarabag agdam': 'Qarabağ Ağdam FK',
  qarabag: 'Qarabağ Ağdam FK',
  'qarabag agdam futbol klubu': 'Qarabağ Ağdam FK'
}

function normalizeOtherKey(name) {
  return (
    String(name || '')
      .toLowerCase()

      // buang accent (ā, ğ, dll)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim()
  )
}

export function buildOtherLogoSrc(club) {
  if (!club) return ''

  if (club.toLowerCase() === 'paper rex') {
    return 'https://images.seeklogo.com/logo-png/45/2/paper-rex-logo-png_seeklogo-455546.png'
  }

  const key = normalizeOtherKey(club)
  const fileBase = OTHER_LOGO_ALIAS[key] || club
  const clubSegment = encodeURIComponent(fileBase)

  return `/logo/other/${clubSegment}.png`
}

export function makeTeamAbbr(club) {
  if (!club) return ''

  const cleaned = club
    .replace(/[()]/g, ' ')
    .replace(/[^A-Za-zÀ-ÿ\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (!cleaned) return ''

  const stopWords = new Set([
    'fc',
    'cf',
    'sc',
    'ac',
    'as',
    'bc',
    'ss',
    'afc',
    'nk',
    'fk',
    'sv',
    'if',
    'bk',
    'cd',
    'sd',
    'ud',
    'uc',
    'us'
  ])

  const words = cleaned.split(' ')

  const mainWords = words.filter(w => !stopWords.has(w.toLowerCase())) || words

  const target = mainWords.length > 0 ? mainWords : words

  let letters = ''

  if (target.length >= 3) {
    letters = (target[0][0] || '') + (target[1][0] || '') + (target[2][0] || '')
  } else if (target.length === 2) {
    letters = (target[0][0] || '') + (target[1][0] || '') + (target[1][1] || target[0][1] || '')
  } else {
    letters = (target[0] || '').slice(0, 3)
  }

  return letters.toUpperCase()
}

const CLUB_ALIAS = {
  'bayern m nchen': 'bayern munich',
  bayern: 'bayern munich',
  'fc kopenhavn': 'fc copenhagen',
  kobenhavn: 'fc copenhagen',
  'k benhavn': 'fc copenhagen',
  kbenhavn: 'fc copenhagen',
  'sport lisboa e benfica': 'sl benfica',
  'olympique de marseille': 'olympique marseille',
  'galatasaray sk': 'galatasaray',
  'pae olympiakos sfp': 'olympiacos piraeus',
  'sk slavia praha': 'sk slavia prague',
  'qaraba a dam': 'qarabagh',
  'sporting clube de portugal': 'sporting cp',
  'sporting lisbon': 'sporting cp',
  sporting: 'sporting cp',
  olympiakos: 'olympiacos piraeus',
  olympiacos: 'olympiacos piraeus',
  inter: 'inter milan',
  internazionale: 'inter milan',
  'internazionale milano': 'inter milan'
}

const TEAM_STOP_WORDS_SET = new Set(['fc', 'afc', 'cf', 'sc', 'club', 'football', 'the'])

function localNormalizeTeamName(name) {
  if (!name) return ''

  return name
    .replace(/[()]/g, ' ')
    .replace(/[^A-Za-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => !TEAM_STOP_WORDS_SET.has(w.toLowerCase()))
    .join(' ')
    .toLowerCase()
    .trim()
}

export function resolveAnyClubLogo(apiName) {
  if (!apiName) return ''

  if (apiName.toLowerCase() === 'paper rex') {
    return 'https://images.seeklogo.com/logo-png/45/2/paper-rex-logo-png_seeklogo-455546.png'
  }

  const rawTarget = localNormalizeTeamName(apiName)

  if (!rawTarget) return ''

  const target = CLUB_ALIAS[rawTarget] || rawTarget

  let bestLeague = null
  let bestClub = null

  for (const [league, clubs] of Object.entries(LOGO_DATA)) {
    if (!Array.isArray(clubs)) continue

    let match = clubs.find(club => localNormalizeTeamName(club) === target)

    if (match) {
      bestLeague = league
      bestClub = match
      break
    }

    match = clubs.find(club => localNormalizeTeamName(club).includes(target))

    if (match && !bestClub) {
      bestLeague = league
      bestClub = match
    }

    if (!bestClub) {
      match = clubs.find(club => target.includes(localNormalizeTeamName(club)))

      if (match) {
        bestLeague = league
        bestClub = match
      }
    }
  }

  if (bestLeague && bestClub) {
    if (bestLeague === 'Kazakhstan - Premier League') {
      return buildOtherLogoSrc(bestClub)
    }

    return buildLogoSrc(bestLeague, bestClub)
  }

  return buildOtherLogoSrc(apiName)
}

