"use client";

import { useState, useEffect } from "react";

import { LOGO_DATA, buildLogoSrc } from "@/lib/logoData";

export default function LogoPickerModal({ isOpen, onClose, defaultClubName, onSelect }) {
  const [activeTab, setActiveTab] = useState("database");
  const [league, setLeague] = useState(Object.keys(LOGO_DATA)[0] || "");
  
  // Custom logo states
  const [webUrl, setWebUrl] = useState("");
  const [customSrc, setCustomSrc] = useState("");
  const [customClubName, setCustomClubName] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  // Sync / Reset states when modal is opened or default name changes
  useEffect(() => {
    if (isOpen) {
      setCustomClubName(defaultClubName || "");
      setCustomSrc("");
      setWebUrl("");
      setUploadError("");
      setActiveTab("database");
    }
  }, [isOpen, defaultClubName]);

  if (!isOpen) return null;

  const clubs = LOGO_DATA[league] || [];

  // Canvas Image Compression Helper
  const processAndCompressFile = (file) => {
    if (!file) return;

    // Validate type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

    if (!validTypes.includes(file.type)) {
      setUploadError("Format file tidak didukung. Harap gunakan format JPG, PNG, atau WEBP.");
      
return;
    }

    setUploadError("");
    const reader = new FileReader();

    reader.onload = (e) => {
      const dataUrl = e.target.result;
      
      // Perform Canvas compression
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const max_size = 400; // Max width or height (increased from 160 for high quality on scaled overlays)
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > max_size) {
            height *= max_size / width;
            width = max_size;
          }
        } else {
          if (height > max_size) {
            width *= max_size / height;
            height = max_size;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        ctx.drawImage(img, 0, 0, width, height);

        // Compress to WebP or fall back to PNG
        let compressedBase64;

        try {
          compressedBase64 = canvas.toDataURL("image/webp", 0.85);
        } catch (err) {
          compressedBase64 = canvas.toDataURL("image/png");
        }

        setCustomSrc(compressedBase64);
      };
      
      img.onerror = () => {
        setUploadError("Gagal membaca gambar. File mungkin rusak.");
      };
      
      img.src = dataUrl;
    };

    reader.onerror = () => {
      setUploadError("Gagal membaca file dari disk.");
    };

    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    processAndCompressFile(file);
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];

    processAndCompressFile(file);
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;

    setWebUrl(url);
    setUploadError("");

    if (url.trim()) {
      setCustomSrc(url.trim());
    } else {
      setCustomSrc("");
    }
  };

  const handleApplyCustomLogo = () => {
    if (!customSrc || !customClubName.trim()) return;
    onSelect({
      src: customSrc,
      club: customClubName.trim(),
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
    >
      <div
        style={{
          background: "#020617",
          color: "#e5e7eb",
          padding: "20px",
          borderRadius: "16px",
          width: "94%",
          maxWidth: "980px",
          maxHeight: "88vh",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          border: "1px solid #1f2937",
          boxShadow: "0 25px 60px rgba(0,0,0,0.8)",
        }}
      >
        {/* Header Modal */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #1f2937",
            paddingBottom: "12px",
          }}
        >
          <span style={{ fontWeight: 700, fontSize: 16, color: "#60a5fa" }}>
            Pengaturan Logo Tim Scoreboard
          </span>
          <button
            className="op-btn"
            onClick={onClose}
            style={{
              padding: "5px 12px",
              background: "#1f2937",
              border: "1px solid #374151",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "12px",
              color: "#e5e7eb",
              transition: "all 0.15s ease",
            }}
          >
            Tutup
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            borderBottom: "1px solid #1f2937",
            paddingBottom: "8px",
            marginBottom: "4px",
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab("database")}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              background: activeTab === "database" ? "#1d4ed8" : "transparent",
              color: activeTab === "database" ? "#fff" : "#9ca3af",
              border: activeTab === "database" ? "1px solid #3b82f6" : "1px solid transparent",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "13px",
              transition: "all 0.2s ease",
            }}
          >
            🗄️ Database Logo Klub (Default)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("custom")}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              background: activeTab === "custom" ? "#1d4ed8" : "transparent",
              color: activeTab === "custom" ? "#fff" : "#9ca3af",
              border: activeTab === "custom" ? "1px solid #3b82f6" : "1px solid transparent",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "13px",
              transition: "all 0.2s ease",
            }}
          >
            🌐 Logo Kustom (Web / Upload File)
          </button>
        </div>

        {/* Tab Content */}
        <div style={{ flex: 1, overflowY: "auto", minHeight: "350px", display: "flex", flexDirection: "column" }}>
          
          {/* TAB 1: PREDEFINED DATABASE */}
          {activeTab === "database" && (
            <div style={{ display: "flex", gap: 10, fontSize: 12, height: "100%", minHeight: "350px" }}>
              {/* Sidebar League List */}
              <div
                style={{
                  width: "30%",
                  borderRight: "1px solid #1f2937",
                  paddingRight: 10,
                  overflowY: "auto",
                  maxHeight: "58vh",
                }}
              >
                {Object.keys(LOGO_DATA).map((lg) => (
                  <div
                    key={lg}
                    onClick={() => setLeague(lg)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 8,
                      cursor: "pointer",
                      marginBottom: 5,
                      background: lg === league ? "#1d4ed8" : "#0f172a",
                      border: lg === league ? "1px solid #60a5fa" : "1px solid #1f2937",
                      color: lg === league ? "#f9fafb" : "#9ca3af",
                      fontWeight: lg === league ? "bold" : "normal",
                      fontSize: "12px",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {lg}
                  </div>
                ))}
              </div>

              {/* Grid Club List */}
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  maxHeight: "58vh",
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
                  gap: 12,
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
                        background: "#090d16",
                        borderRadius: 12,
                        border: "1px solid #1f2937",
                        padding: 12,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 8,
                        cursor: "pointer",
                        minHeight: 140,
                        transition: "all 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#3b82f6";
                        e.currentTarget.style.background = "#0f172a";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#1f2937";
                        e.currentTarget.style.background = "#090d16";
                      }}
                    >
                      <div
                        style={{
                          width: 70,
                          height: 70,
                          borderRadius: 10,
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
                          fontSize: 12,
                          fontWeight: 600,
                          textAlign: "center",
                          lineHeight: 1.3,
                          color: "#f3f4f6",
                          marginTop: 2,
                        }}
                      >
                        {club}
                      </span>
                    </button>
                  );
                })}
                {clubs.length === 0 && (
                  <span style={{ fontSize: 12, opacity: 0.6, padding: "20px" }}>
                    Belum ada klub untuk liga ini.
                  </span>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: CUSTOM UPLOAD & WEB URL */}
          {activeTab === "custom" && (
            <div style={{ display: "flex", gap: "20px", flexDirection: "row", flexWrap: "wrap", padding: "10px 0" }}>
              {/* Left Column: Upload / Web Input */}
              <div style={{ flex: "1 1 450px", display: "flex", flexDirection: "column", gap: "16px" }}>
                
                {/* File Drop Zone */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <span style={{ fontSize: "11px", fontWeight: "700", color: "#60a5fa", letterSpacing: "0.05em" }}>
                    METODE A: UNGGAH GAMBAR TIM LOKAL (.JPG, .PNG, .WEBP)
                  </span>
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleFileDrop}
                    onClick={() => document.getElementById("logo-file-input-custom").click()}
                    style={{
                      border: isDragging ? "2px dashed #3b82f6" : "2px dashed #1e293b",
                      borderRadius: "12px",
                      background: isDragging ? "#0f172a" : "#090d16",
                      padding: "30px 20px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      gap: "8px",
                      transition: "all 0.2s ease",
                      boxShadow: isDragging ? "0 0 15px rgba(59, 130, 246, 0.15)" : "none",
                    }}
                  >
                    <input
                      id="logo-file-input-custom"
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp"
                      onChange={handleFileChange}
                      style={{ display: "none" }}
                    />
                    <span style={{ fontSize: "32px", marginBottom: "4px" }}>📁</span>
                    <span style={{ fontSize: "13px", fontWeight: "600", color: "#f3f4f6" }}>
                      Tarik & Lepas gambar di sini
                    </span>
                    <span style={{ fontSize: "11px", color: "#9ca3af", textAlign: "center" }}>
                      atau klik untuk menjelajah file dari komputer Anda (akan dikompresi otomatis)
                    </span>
                  </div>
                  {uploadError && (
                    <span style={{ fontSize: "11px", color: "#f87171", marginTop: "2px", fontWeight: "500" }}>
                      ⚠️ {uploadError}
                    </span>
                  )}
                </div>

                {/* Web URL Input */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <span style={{ fontSize: "11px", fontWeight: "700", color: "#60a5fa", letterSpacing: "0.05em" }}>
                    METODE B: TEMPELKAN URL LOGO WEB
                  </span>
                  <input
                    type="text"
                    placeholder="Contoh: https://example.com/logo.png"
                    value={webUrl}
                    onChange={handleUrlChange}
                    style={{
                      width: "100%",
                      padding: "11px 14px",
                      background: "#090d16",
                      border: "1px solid #1e293b",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "13px",
                      outline: "none",
                      transition: "border-color 0.2s",
                    }}
                    onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
                    onBlur={(e) => e.target.style.borderColor = "#1e293b"}
                  />
                  <span style={{ fontSize: "10px", color: "#9ca3af", lineHeight: "1.4" }}>
                    Mendukung format gambar .jpg, .png, .webp, dan .svg. Pastikan URL tersebut menggunakan protokol HTTPS dan dapat diakses publik.
                  </span>
                </div>

                {/* Club Name Input */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <span style={{ fontSize: "11px", fontWeight: "700", color: "#60a5fa", letterSpacing: "0.05em" }}>
                    NAMA LENGKAP TIM (CLUB FULL NAME)
                  </span>
                  <input
                    type="text"
                    placeholder="Masukkan nama lengkap tim/klub..."
                    value={customClubName}
                    onChange={(e) => setCustomClubName(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "11px 14px",
                      background: "#090d16",
                      border: "1px solid #1e293b",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "13px",
                      fontWeight: 600,
                      outline: "none",
                      transition: "border-color 0.2s",
                    }}
                    onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
                    onBlur={(e) => e.target.style.borderColor = "#1e293b"}
                  />
                  <span style={{ fontSize: "10px", color: "#9ca3af" }}>
                    Wajib diisi. Menentukan label teks lengkap klub pada layout scoreboard.
                  </span>
                </div>

              </div>

              {/* Right Column: Preview & Apply Button */}
              <div
                style={{
                  flex: "1 1 250px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderLeft: "1px solid #1f2937",
                  paddingLeft: "20px",
                  minHeight: "320px",
                }}
              >
                <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "12px", fontWeight: "600", color: "#9ca3af" }}>PREVIEW LOGO BARU</span>
                  
                  <div
                    style={{
                      width: "150px",
                      height: "150px",
                      borderRadius: "14px",
                      background: "#090d16",
                      border: "1px solid #1e293b",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                      boxShadow: "inset 0 4px 12px rgba(0,0,0,0.6)",
                      position: "relative",
                    }}
                  >
                    {customSrc ? (
                      <img
                        src={customSrc}
                        alt="Logo Custom Preview"
                        style={{ maxWidth: "85%", maxHeight: "85%", objectFit: "contain" }}
                        onError={() => {
                          setUploadError("Gambar gagal dimuat dari URL. Periksa kembali keaktifan tautan.");
                          setCustomSrc("");
                        }}
                      />
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", opacity: 0.35 }}>
                        <span style={{ fontSize: "30px" }}>🖼️</span>
                        <span style={{ fontSize: "10px", textAlign: "center", fontWeight: "500" }}>Belum Ada Logo</span>
                      </div>
                    )}
                  </div>

                  {customSrc && !uploadError && (
                    <span style={{ fontSize: "11px", color: "#10b981", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                      ✓ Logo Siap Diterapkan
                    </span>
                  )}
                </div>

                {/* Control Action Buttons */}
                <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "8px", marginTop: "24px" }}>
                  <button
                    type="button"
                    onClick={handleApplyCustomLogo}
                    disabled={!customSrc || !customClubName.trim()}
                    style={{
                      width: "100%",
                      padding: "11px 14px",
                      background: (!customSrc || !customClubName.trim()) ? "#1e293b" : "#10b981",
                      color: (!customSrc || !customClubName.trim()) ? "#9ca3af" : "#fff",
                      border: "none",
                      borderRadius: "8px",
                      fontWeight: "700",
                      fontSize: "13px",
                      cursor: (!customSrc || !customClubName.trim()) ? "not-allowed" : "pointer",
                      transition: "all 0.15s ease",
                      boxShadow: (!customSrc || !customClubName.trim()) ? "none" : "0 4px 12px rgba(16, 185, 129, 0.2)",
                    }}
                    onMouseEnter={(e) => {
                      if (customSrc && customClubName.trim()) {
                        e.currentTarget.style.background = "#059669";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (customSrc && customClubName.trim()) {
                        e.currentTarget.style.background = "#10b981";
                      }
                    }}
                  >
                    💾 Terapkan Logo Kustom
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomSrc("");
                      setWebUrl("");
                      setCustomClubName(defaultClubName || "");
                      setUploadError("");
                    }}
                    style={{
                      width: "100%",
                      padding: "9px 14px",
                      background: "transparent",
                      color: "#ef4444",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(239, 68, 68, 0.05)";
                      e.currentTarget.style.borderColor = "#ef4444";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.3)";
                    }}
                  >
                    Setel Ulang (Reset)
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
