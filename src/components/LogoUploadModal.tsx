import React, { useState, useRef } from 'react';
import { X, Upload, Image as ImageIcon, Trash2, Check, Sparkles } from 'lucide-react';

interface LogoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLogo: string | null;
  onSaveLogo: (logoDataUrl: string | null) => void;
}

export const LogoUploadModal: React.FC<LogoUploadModalProps> = ({
  isOpen,
  onClose,
  currentLogo,
  onSaveLogo,
}) => {
  const [preview, setPreview] = useState<string | null>(currentLogo);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido (PNG, JPG, SVG ou WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreview(result);
    };
    reader.readAsDataURL(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSave = () => {
    onSaveLogo(preview);
    onClose();
  };

  const handleRemove = () => {
    setPreview(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-xl border border-[#EFE5E0] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-[#FDF5F3] to-white border-b border-[#F4EBE6]">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#F5D8DB] text-[#9E4B52]">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#423533]">Logo da Lume</h3>
              <p className="text-xs text-[#8C7B76]">Personalize a marca da sua clínica facial</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Preview Box */}
          <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-[#FAF5F2] border border-[#EFE5E0] text-center">
            <div className="relative group mb-3">
              {preview ? (
                <div className="relative">
                  <img
                    src={preview}
                    alt="Logo Preview"
                    className="w-20 h-20 rounded-2xl object-cover shadow-sm border border-[#E4D7D2] bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleRemove}
                    title="Remover logo"
                    className="absolute -top-2 -right-2 p-1.5 rounded-full bg-white text-rose-600 hover:bg-rose-50 border border-rose-200 shadow-2xs transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#F5D8DB] to-[#E9BEBF] shadow-xs text-[#9E4B52]">
                  <Sparkles className="w-8 h-8" />
                </div>
              )}
            </div>

            <p className="text-xs font-semibold text-[#423533]">
              {preview ? 'Pré-visualização do seu logotipo' : 'Ícone Padrão da Lume'}
            </p>
            <p className="text-[11px] text-[#8C7B76] mt-0.5">
              {preview ? 'Ele será exibido na barra lateral e cabeçalho do app' : 'Nenhum arquivo enviado ainda'}
            </p>
          </div>

          {/* Upload Area */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed transition-all ${
              isDragging
                ? 'border-[#9E4B52] bg-[#FDF2F2]'
                : 'border-[#E4D7D2] hover:border-[#9E4B52] bg-white hover:bg-[#FAF6F4]'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileChange(e.target.files[0]);
                }
              }}
            />
            <div className="p-2.5 rounded-xl bg-[#FAF4F2] text-[#9E4B52] mb-2">
              <Upload className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-[#423533]">
              Clique para selecionar o logo no seu computador ou celular
            </p>
            <p className="text-[11px] text-[#A3928B] mt-1">
              Formatos aceitos: PNG (com fundo transparente), JPG, SVG ou WEBP
            </p>
          </div>

          {/* Tips */}
          <div className="p-3 rounded-xl bg-[#FBF8F6] border border-[#F4EBE6] text-[11px] text-[#7E6963] leading-relaxed">
            <span className="font-semibold text-[#544643]">Dica estética:</span> Logos em formato quadrado ou circular com fundo transparente (PNG) proporcionam o visual mais elegante e refinado na barra lateral.
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-[#F4EBE6]">
            {preview && (
              <button
                type="button"
                onClick={handleRemove}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 rounded-xl transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Usar Padrão</span>
              </button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-[#7E6963] hover:text-[#423533] hover:bg-stone-100 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#9E4B52] hover:bg-[#883B41] text-white text-xs font-semibold rounded-xl transition-all shadow-xs"
              >
                <Check className="w-4 h-4" />
                <span>Salvar Logo</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
