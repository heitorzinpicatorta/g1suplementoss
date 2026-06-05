import React, { useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { uploadProductImage } from "@/lib/supabase";

interface ImageUploaderProps {
  currentImage: string;
  onImageChange: (url: string) => void;
  isDark: boolean;
  border: string;
  textPrimary: string;
  textMuted: string;
}

export function ImageUploader({
  currentImage,
  onImageChange,
  isDark,
  border,
  textPrimary,
  textMuted,
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validação
    if (!file.type.startsWith("image/")) {
      setError("Selecione uma imagem válida");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Imagem muito grande (máx 5MB)");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const imageUrl = await uploadProductImage(file);
      onImageChange(imageUrl);
      setError(null);
    } catch (err) {
      setError(`Erro ao fazer upload: ${err instanceof Error ? err.message : "Desconhecido"}`);
      console.error(err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {/* Preview */}
      {currentImage && (
        <div style={{ position: "relative", overflow: "hidden", borderRadius: "4px" }}>
          <img
            src={currentImage}
            alt="Preview"
            style={{
              width: "100%",
              height: "200px",
              objectFit: "cover",
              background: isDark ? "#0d0d0d" : "#f5f5f5",
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://placehold.co/300x300/111/555?text=Erro";
            }}
          />
        </div>
      )}

      {/* Upload Area */}
      <div
        onClick={() => fileInputRef.current?.click()}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          padding: "20px",
          border: `2px dashed ${border}`,
          borderRadius: "4px",
          cursor: isUploading ? "not-allowed" : "pointer",
          background: isDark ? "#0d0d0d" : "#f8f8f8",
          transition: "all 0.2s",
          opacity: isUploading ? 0.5 : 1,
        }}
        onMouseEnter={(e) => {
          if (!isUploading) {
            (e.currentTarget as HTMLDivElement).style.borderColor = "#f97316";
            (e.currentTarget as HTMLDivElement).style.background = isDark ? "#161616" : "#fafafa";
          }
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = border;
          (e.currentTarget as HTMLDivElement).style.background = isDark ? "#0d0d0d" : "#f8f8f8";
        }}
      >
        <Upload size={20} color={isUploading ? "#888" : "#f97316"} />
        <div>
          <div style={{ fontSize: "0.7rem", color: textPrimary, fontWeight: 600 }}>
            {isUploading ? "Enviando..." : "Clique para fazer upload"}
          </div>
          <div style={{ fontSize: "0.6rem", color: textMuted }}>PNG, JPG, WebP (máx 5MB)</div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 12px",
            background: "#fee2e2",
            border: "1px solid #fecaca",
            borderRadius: "4px",
            fontSize: "0.65rem",
            color: "#dc2626",
          }}
        >
          <X size={12} />
          {error}
        </div>
      )}

      {/* URL Fallback */}
      <div style={{ fontSize: "0.58rem", color: textMuted, textAlign: "center", marginTop: "8px" }}>
        ou coloque a URL manualmente abaixo
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: "none" }}
        disabled={isUploading}
      />
    </div>
  );
}
