"use client";

import { useState } from "react";
import { LOGO_DATA, buildLogoSrc } from "@/lib/logoData";

export default function LogoPickerModal({ isOpen, onClose, onSelect }) {
  const [league, setLeague] = useState(Object.keys(LOGO_DATA)[0] || "");

  if (!isOpen) return null;

  const clubs = LOGO_DATA[league] || [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
    >
      <div
        style={{
          background: "#020617",
          color: "#e5e7eb",
          padding: "18px",
          borderRadius: "14px",
          width: "92%",
          maxWidth: "980px",
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          border: "1px solid #1f2937",
          boxShadow: "0 22px 55px rgba(0,0,0,0.7)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 4,
          }}
        >
          <span style={{ fontWeight: 600, fontSize: 14 }}>
            Pilih Logo Klub (Layout B)
          </span>
          <button className="op-btn" onClick={onClose}>
            Tutup
          </button>
        </div>

        <div style={{ display: "flex", gap: 10, fontSize: 12 }}>
          <div
            style={{
              width: "32%",
              borderRight: "1px solid #1f2937",
              paddingRight: 10,
              overflowY: "auto",
              maxHeight: "60vh",
            }}
          >
            {Object.keys(LOGO_DATA).map((lg) => (
              <div
                key={lg}
                onClick={() => setLeague(lg)}
                style={{
                  padding: "7px 10px",
                  borderRadius: 6,
                  cursor: "pointer",
                  marginBottom: 5,
                  background: lg === league ? "#1d4ed8" : "#020617",
                  border:
                    lg === league ? "1px solid #60a5fa" : "1px solid #1f2937",
                  color: lg === league ? "#f9fafb" : "#e5e7eb",
                }}
              >
                {lg}
              </div>
            ))}
          </div>

          <div
            style={{
              flex: 1,
              overflowY: "auto",
              maxHeight: "60vh",
              display: "grid",
              gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
              gap: 10,
              paddingLeft: 4,
            }}
          >
            {clubs.map((club) => {
              const src = buildLogoSrc(league, club);
              return (
                <button
                  key={club}
                  type="button"
                  onClick={() => onSelect({ src, club, league })}
                  style={{
                    background: "#020817",
                    borderRadius: 10,
                    border: "1px solid #1f2937",
                    padding: 10,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 6,
                    cursor: "pointer",
                    minHeight: 150,
                    transition:
                      "border-color 0.15s ease, background 0.15s ease",
                  }}
                >
                  <div
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 12,
                      background: "#020617",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                      border: "1px solid #1f2937",
                    }}
                  >
                    <img
                      src={src}
                      alt={club}
                      style={{
                        maxWidth: "90%",
                        maxHeight: "90%",
                        objectFit: "contain",
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      textAlign: "center",
                      lineHeight: 1.3,
                      color: "#f9fafb",
                      textShadow: "0 1px 2px rgba(0,0,0,0.9)",
                      marginTop: 4,
                    }}
                  >
                    {club}
                  </span>
                </button>
              );
            })}
            {clubs.length === 0 && (
              <span style={{ fontSize: 12, opacity: 0.7 }}>
                Belum ada klub untuk liga ini.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
