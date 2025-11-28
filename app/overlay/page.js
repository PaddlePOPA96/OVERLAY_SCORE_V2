// Halaman ini bisa dipakai sebagai helper untuk kasih info ke user
// bahwa URL overlay sekarang pakai roomId, contoh: /overlay/room123
export default function OverlayRootInfo() {
  return (
    <div style={{ padding: 32, fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>Overlay Multi Room</h1>
      <p>Gunakan URL seperti:</p>
      <pre
        style={{
          background: "#111",
          color: "#0f0",
          padding: 12,
          borderRadius: 8,
          marginTop: 8,
        }}
      >
        /overlay/&lt;roomId&gt;
      </pre>
      <p style={{ marginTop: 12 }}>
        Contoh: <code>/overlay/test-match</code> atau{" "}
        <code>/overlay/001</code>.
      </p>
    </div>
  );
}
