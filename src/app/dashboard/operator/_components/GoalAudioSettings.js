"use client";

export default function GoalAudioSettings({ data, updateMatch }) {
  const audioVolume = data.goalAudioVolume !== undefined ? data.goalAudioVolume : 1;
  const audioSource = data.goalAudioSource || "/sounds/goal.mp3";

  return (
    <div style={{ padding: "10px", background: "rgba(0,0,0,0.2)", border: "1px solid #444", borderRadius: "8px", marginTop: "10px", marginBottom: "10px" }}>
      <label className="op-label" style={{ marginBottom: "10px", display: "block", color: "#4ade80" }}>Goal Audio Settings</label>
      
      <div style={{ marginBottom: "10px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
          <span className="op-tiny">Volume:</span>
          <span className="op-tiny font-mono">{Math.round(audioVolume * 100)}%</span>
        </div>
        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.01" 
          value={audioVolume} 
          onChange={(e) => updateMatch({ goalAudioVolume: parseFloat(e.target.value) })} 
          className="w-full accent-green-500"
        />
      </div>

      <div>
        <span className="op-tiny" style={{ display: "block", marginBottom: "5px" }}>Sound:</span>
        <select
          value={audioSource}
          onChange={(e) => updateMatch({ goalAudioSource: e.target.value })}
          className="op-input"
          style={{ width: "100%", padding: "8px", background: "#111", color: "white" }}
        >
          <option value="/sounds/goal.mp3">Goal Horn</option>
          <option value="/sounds/brr-brr-patapim-alarm-clock.mp3">Brr Brr Patapim</option>
          <option value="/sounds/parado-no-bailao.mp3">Parado no Bailao</option>
          <option value="/sounds/lamine-yamal.mp3">Lamine Yamal</option>
        </select>
      </div>
    </div>
  );
}
