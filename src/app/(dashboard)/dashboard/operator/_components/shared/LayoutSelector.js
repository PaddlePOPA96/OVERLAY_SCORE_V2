import Select from '@/components/ui/Select';

export default function LayoutSelector({ data, updateMatch, description }) {
  const options = [
    { value: 'A', label: 'Layout A' },
    { value: 'B', label: 'Layout B' },
    { value: 'C', label: 'Layout C' },
    { value: 'D', label: 'Layout D (Valorant Esports)' },
    { value: 'E', label: 'Layout E (Valorant Overlay HUD)' },
    { value: 'Pildun', label: 'Layout Pildun (World Cup 2026)' },
    { value: 'Pildun2', label: 'Layout Pildun 2 (World Cup New)' },
    { value: 'AFF', label: 'Layout AFF (ASEAN Championship)' },
  ];

  return (
    <div className='p-4 bg-slate-100 border-4 border-black mb-4'>
      <Select
        id='operator-layout'
        label='Layout'
        value={data.layout}
        onChange={e => updateMatch({ layout: e.target.value })}
        options={options}
        helperText={description}
        fullWidth
      />
    </div>
  )
}
