export const audioOptions = [
  { label: 'upin ipin', value: '/sounds/tamatlah-sudah.mp3' },
  { label: 'IKEVE YAMAL', value: '/sounds/ikeve.mp3' },
  { label: 'Bahlil', value: '/sounds/bahlil-song.mp3' },
  { label: 'Goal Horn', value: '/sounds/goal.mp3' },
  { label: 'GGMU', value: '/sounds/ggmu.mp3' },
  { label: 'antek-antek', value: '/sounds/antek.mp3' },
  { label: 'jokowi', value: '/sounds/jokowi.mp3' },
  { label: 'dj-kicau-mania', value: '/sounds/dj-kicau-mania.mp3' },
  { label: 'kenapa nyak', value: '/sounds/kenapa-nya.mp3' },
  { label: 'shapeofmy', value: '/sounds/shapeofmy.mp3' },
  { label: 'whistellop', value: '/sounds/whistleloop.mp3' },
  { label: 'maripulang', value: '/sounds/mari_pulang.mp3' },
  { label: 'HAALAND', value: '/sounds/haalandhaaland.mp3' },






]

export const getAudioLabel = value => {
  const option = audioOptions.find(opt => opt.value === value)

  return option ? option.label : 'Unknown Sound'
}
