export default function LayoutSelector({ data, updateMatch, description }) {
  return (
    <div
      className="op-section"
      style={{
        borderBottom: "1px solid #444",
        paddingBottom: "10px",
        marginBottom: "5px",
      }}
    >
      <label className="op-label" htmlFor="operator-layout">
        Layout
      </label>
      <select
        id="operator-layout"
        className="op-input"
        value={data.layout}
        onChange={(e) => updateMatch({ layout: e.target.value })}
      >
        <option value="A">Layout A</option>
        <option value="B">Layout B</option>
        <option value="C">Layout C</option>
      </select>
      {description && (
        <span className="op-tiny">{description}</span>
      )}
    </div>
  );
}
