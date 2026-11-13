import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  Copy,
  Check,
  MessageCircle,
  Phone,
  Sparkles,
  FileText,
  AlertCircle,
  Edit3,
  Image as ImageIcon,
  Download,
  Share2,
  UploadCloud,
  Trash2,
} from 'lucide-react';
import { Appointment, Client, ServiceItem } from '../types';
import {
  compressImageFile,
  convertImageToPngBlob,
  imageSrcToFile,
} from '../utils/imageHelper';

interface PostCareWhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  client?: Client;
  service?: ServiceItem;
  onUpdateClientPhone?: (clientId: string, phone: string) => void;
  onUpdateServicePostCare?: (serviceId: string, postCare: string, imageUrl?: string) => void;
}

export const PostCareWhatsAppModal: React.FC<PostCareWhatsAppModalProps> = ({
  isOpen,
  onClose,
  appointment,
  client,
  service,
  onUpdateClientPhone,
  onUpdateServicePostCare,
}) => {
  const [phone, setPhone] = useState('');
  const [postCareText, setPostCareText] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [savedAsDefault, setSavedAsDefault] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);
  const [canShareFiles, setCanShareFiles] = useState(false);
  const [cachedPngBlob, setCachedPngBlob] = useState<Blob | null>(null);

  useEffect(() => {
    // Check if device/browser supports sharing image files directly (Android/iOS/Edge/Safari)
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.share === 'function' && typeof navigator.canShare === 'function') {
        const testFile = new File([''], 'test.png', { type: 'image/png' });
        setCanShareFiles(navigator.canShare({ files: [testFile] }));
      } else {
        setCanShareFiles(false);
      }
    } catch {
      setCanShareFiles(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    if (!imageUrl) {
      setCachedPngBlob(null);
      return;
    }
    convertImageToPngBlob(imageUrl)
      .then((blob) => {
        if (active) setCachedPngBlob(blob);
      })
      .catch(() => {
        if (active) setCachedPngBlob(null);
      });
    return () => {
      active = false;
    };
  }, [imageUrl]);

  useEffect(() => {
    if (appointment) {
      const initialPhone = client?.phone || '';
      setPhone(initialPhone);

      const instructions = service?.postCareInstructions?.trim() || '';
      setPostCareText(instructions);

      setImageUrl(service?.postCareImageUrl || null);

      setSavedAsDefault(false);
      setCopiedText(false);
      setCopiedImage(false);
      setIsEditing(false);
      setFeedback(null);
    }
  }, [appointment, client, service]);

  // Keep early return after all hooks for React 19 safety
  if (!isOpen || !appointment) return null;

  const clientFirstName = appointment.clientName.trim().split(' ')[0] || 'Cliente';
  const serviceName = appointment.serviceName;

  // Optional custom note if the user explicitly wrote one for this service/message
  const optionalNoteBlock = postCareText.trim() ? `\n\n${postCareText.trim()}` : '';

  // Format the full message that will be sent via WhatsApp (without the long care list, sent via flyer)
  const fullMessage = `Olá, ${clientFirstName}! ✨
Aqui é da *Lume - Estética Facial*. Foi um prazer imenso cuidar de você hoje! 🌸

Para garantir a máxima eficácia e luminosidade do procedimento ${serviceName.trim()}, estou te enviando o panfleto com todas as orientações de cuidados pós-atendimento.${optionalNoteBlock}

✨ Lembre-se: o resultado perfeito depende 50% do procedimento feito aqui no estúdio e 50% dos seus cuidados em casa!

Qualquer dúvida ou necessidade, estou totalmente à disposição por aqui. Tenha um dia iluminado! 💖`;

  const getCleanPhone = (rawPhone: string) => {
    const digits = rawPhone.replace(/\D/g, '');
    if (!digits) return '';
    if (digits.length === 10 || digits.length === 11) {
      return `55${digits}`;
    }
    return digits;
  };

  const handleImageFileChange = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setFeedback({ type: 'error', text: 'Selecione uma imagem válida (PNG, JPG ou WEBP).' });
      return;
    }
    try {
      const compressed = await compressImageFile(file, 1080, 0.85);
      setImageUrl(compressed);
      setFeedback(null);
    } catch {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownloadImage = () => {
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `panfleto_pos_${serviceName.toLowerCase().replace(/\s+/g, '_')}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Convert any image (JPG/WEBP/PNG) to PNG Blob so ClipboardItem ALWAYS works!
  const copyPngImageToClipboard = async (): Promise<boolean> => {
    if (!imageUrl || typeof ClipboardItem === 'undefined' || !navigator.clipboard?.write) {
      return false;
    }
    try {
      const pngBlob = cachedPngBlob || (await convertImageToPngBlob(imageUrl));
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': pngBlob,
        }),
      ]);
      setCopiedImage(true);
      setTimeout(() => setCopiedImage(false), 3000);
      return true;
    } catch {
      return false;
    }
  };

  const handleCopyImageButton = async () => {
    const ok = await copyPngImageToClipboard();
    if (ok) {
      setFeedback({
        type: 'success',
        text: 'Imagem copiada! Agora abra a conversa no WhatsApp e aperte Ctrl+V (ou Colar) para enviar.',
      });
    } else {
      handleDownloadImage();
      setFeedback({
        type: 'info',
        text: 'Este navegador bloqueou a cópia direta; baixamos a imagem para você anexar pelo clipe (📎) no WhatsApp.',
      });
    }
  };

  // Native Share (Mobile WhatsApp App: sends BOTH image file + text together!)
  const handleShareNative = async () => {
    if (!imageUrl) return;
    try {
      const safeName = serviceName.toLowerCase().replace(/[^a-z0-9]+/g, '_');
      const file = cachedPngBlob
        ? new File([cachedPngBlob], `panfleto_${safeName}.png`, { type: 'image/png' })
        : await imageSrcToFile(imageUrl, `panfleto_${safeName}.png`);
      // Copy text too as backup in case WhatsApp ignores text on some devices when sharing a file
      try {
        await navigator.clipboard.writeText(fullMessage);
      } catch {
        // Ignore clipboard errors
      }
      await navigator.share({
        title: `Pós-Procedimento - ${serviceName}`,
        text: fullMessage,
        files: [file],
      });
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setFeedback({
        type: 'info',
        text: 'Use "Enviar no WhatsApp" + "Copiar Foto" ou "Baixar" para anexar a imagem.',
      });
    }
  };

  const handleSendWhatsApp = () => {
    const cleanPhone = getCleanPhone(phone);
    if (!cleanPhone) {
      setFeedback({
        type: 'error',
        text: 'Informe um número de WhatsApp com DDD antes de enviar.',
      });
      return;
    }

    // Save phone to client profile if changed
    if (client?.id && phone.trim() && phone.trim() !== client.phone && onUpdateClientPhone) {
      onUpdateClientPhone(client.id, phone.trim());
    }

    // Trigger clipboard copy synchronously while document still has focus
    if (imageUrl) {
      const blobToCopy = cachedPngBlob;
      if (blobToCopy && typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
        navigator.clipboard
          .write([new ClipboardItem({ 'image/png': blobToCopy })])
          .then(() => {
            setCopiedImage(true);
            setFeedback({
              type: 'success',
              text: 'WhatsApp aberto com o texto! A imagem também foi copiada: dentro da conversa, aperte Ctrl+V (ou Colar) para enviar a foto junto.',
            });
          })
          .catch(() => {
            handleDownloadImage();
            setFeedback({
              type: 'info',
              text: 'WhatsApp aberto com o texto! Como links do WhatsApp não enviam anexos direto, baixamos o panfleto para você anexar na conversa.',
            });
          });
      } else {
        handleDownloadImage();
        setFeedback({
          type: 'info',
          text: 'WhatsApp aberto com o texto! Baixamos o panfleto para você anexar pelo clipe (📎) na conversa.',
        });
      }
    }

    const encodedText = encodeURIComponent(fullMessage);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;

    const link = document.createElement('a');
    link.href = whatsappUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(fullMessage);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    } catch {
      setFeedback({ type: 'error', text: 'Não foi possível copiar o texto automaticamente.' });
    }
  };

  const handleSaveAsDefault = () => {
    if (service?.id && onUpdateServicePostCare) {
      onUpdateServicePostCare(service.id, postCareText.trim(), imageUrl || '');
      setSavedAsDefault(true);
      setTimeout(() => setSavedAsDefault(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-[#EFE5E0] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#FDF5F3] via-[#FAF2EE] to-white border-b border-[#F4EBE6] shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 shadow-xs">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#423533]">Enviar Pós-Procedimento</h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  WhatsApp
                </span>
              </div>
              <p className="text-xs text-[#8C7B76]">
                {appointment.clientName} · {appointment.serviceName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {/* Inline Feedback Alert */}
          {feedback && (
            <div
              className={`flex items-start gap-2.5 p-3 rounded-2xl border text-xs leading-relaxed ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : feedback.type === 'error'
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{feedback.text}</span>
            </div>
          )}

          {/* Client WhatsApp Phone input */}
          <div className="p-3.5 rounded-2xl bg-[#FAF5F2] border border-[#EFE5E0] space-y-2">
            <label className="block text-xs font-semibold text-[#544643] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#9E4B52]" />
                WhatsApp da Cliente
              </span>
              {client ? (
                <span className="text-[10px] text-emerald-700 font-medium">
                  {client.phone ? '✓ Telefone vinculado à ficha' : 'Telefone pendente na ficha'}
                </span>
              ) : (
                <span className="text-[10px] text-stone-500">Cliente avulsa</span>
              )}
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ex: (11) 98765-4321 ou 11987654321"
              className="w-full px-3 py-2 text-sm rounded-xl border border-[#E4D7D2] focus:border-[#9E4B52] focus:ring-1 focus:ring-[#9E4B52] outline-hidden text-[#423533] bg-white font-medium"
            />
          </div>

          {/* Procedure & Post-care Instructions info */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#423533]">
                <FileText className="w-4 h-4 text-[#9E4B52]" />
                <span>Panfleto Digital ({appointment.serviceName})</span>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="text-xs font-semibold text-[#9E4B52] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditing ? 'Visualizar Prévia' : 'Editar Conteúdo'}</span>
              </button>
            </div>

            {isEditing ? (
              <div className="space-y-3">
                <textarea
                  rows={4}
                  value={postCareText}
                  onChange={(e) => setPostCareText(e.target.value)}
                  placeholder="Mensagem adicional opcional (deixe vazio se os cuidados forem apenas no panfleto em imagem)..."
                  className="w-full p-3 text-xs rounded-2xl border border-[#E4D7D2] focus:border-[#9E4B52] outline-hidden text-[#423533] bg-white leading-relaxed font-sans"
                />

                {/* Edit image attached */}
                <div className="p-3 rounded-2xl bg-[#FAF5F2] border border-[#EFE5E0] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#544643] flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-[#9E4B52]" />
                      Imagem / Panfleto Anexado
                    </span>
                    {imageUrl && (
                      <button
                        type="button"
                        onClick={() => setImageUrl(null)}
                        className="text-[11px] text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        Remover imagem
                      </button>
                    )}
                  </div>

                  {imageUrl ? (
                    <div className="relative rounded-xl overflow-hidden border border-[#EFE5E0] bg-white max-h-44 flex items-center justify-center p-2 group">
                      <img
                        src={imageUrl}
                        alt="Panfleto Pós-Procedimento"
                        className="max-h-40 object-contain rounded-lg shadow-2xs"
                      />
                      <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                        <span className="px-3 py-1.5 bg-white text-[#423533] text-xs font-semibold rounded-xl shadow-xs">
                          Trocar Imagem
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={(e) => e.target.files?.[0] && handleImageFileChange(e.target.files[0])}
                        />
                      </label>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-[#E4D7D2] hover:border-[#9E4B52] bg-white hover:bg-stone-50 transition-colors cursor-pointer text-xs text-[#7E6963]">
                      <UploadCloud className="w-4 h-4 text-[#9E4B52]" />
                      <span>Clique para anexar panfleto ou imagem deste pós-atendimento</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(e) => e.target.files?.[0] && handleImageFileChange(e.target.files[0])}
                      />
                    </label>
                  )}
                </div>

                {service && (
                  <button
                    type="button"
                    onClick={handleSaveAsDefault}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 transition-colors cursor-pointer"
                  >
                    {savedAsDefault ? <Check className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                    <span>{savedAsDefault ? 'Salvo como padrão do procedimento!' : 'Salvar como padrão deste procedimento'}</span>
                  </button>
                )}
              </div>
            ) : (
              /* WhatsApp Preview Bubble */
              <div className="p-4 rounded-2xl bg-[#EFEAE2] border border-[#E0D8CE] shadow-inner space-y-2.5 text-xs text-[#111B21]">
                <div className="flex items-center justify-between text-[11px] text-[#54656F] border-b border-[#E0D8CE] pb-1.5">
                  <span className="font-semibold text-emerald-800 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    Prévia da Mensagem
                  </span>
                  <span>Lume · Estética Facial</span>
                </div>

                {/* WhatsApp Chat Card */}
                <div className="bg-white rounded-2xl rounded-tl-xs shadow-xs overflow-hidden border border-black/5">
                  {imageUrl && (
                    <div className="relative bg-[#FAF5F2] border-b border-[#F4EBE6] p-2 flex items-center justify-center">
                      <img
                        src={imageUrl}
                        alt="Panfleto Anexado"
                        className="max-h-52 w-auto object-contain rounded-xl shadow-2xs"
                      />
                      <div className="absolute top-3 right-3 flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={handleCopyImageButton}
                          title="Copiar imagem para colar no WhatsApp (Ctrl+V)"
                          className="flex items-center gap-1 px-2.5 py-1 bg-white/95 hover:bg-white text-[#423533] text-[10px] font-bold rounded-lg shadow-xs transition-colors cursor-pointer border border-[#EFE5E0]"
                        >
                          {copiedImage ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedImage ? 'Copiada!' : 'Copiar Foto'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleDownloadImage}
                          title="Baixar imagem"
                          className="p-1.5 bg-white/95 hover:bg-white text-[#423533] rounded-lg shadow-xs transition-colors cursor-pointer border border-[#EFE5E0]"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Text body */}
                  <div className="p-3.5 whitespace-pre-wrap leading-relaxed text-[#20272B] font-sans">
                    {fullMessage}
                  </div>
                </div>

                {imageUrl && (
                  <div className="p-2.5 rounded-xl bg-white/80 border border-[#E0D8CE] text-[11px] text-[#544643] leading-relaxed">
                    <strong>Como funciona o envio da foto:</strong> links do WhatsApp só enviam o texto automaticamente. Por isso, ao clicar em <strong>Enviar no WhatsApp</strong>, copiamos a foto para você — dentro da conversa, basta apertar <strong>Ctrl + V</strong> (ou tocar em <strong>Colar</strong>) para enviar a imagem junto!
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 p-4 bg-[#FCF9F7] border-t border-[#F4EBE6] shrink-0">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleCopyText}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#675753] hover:text-[#423533] bg-white hover:bg-stone-100 rounded-xl border border-[#EFE5E0] transition-colors cursor-pointer"
            >
              {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedText ? 'Texto Copiado!' : 'Copiar Texto'}</span>
            </button>

            {imageUrl && (
              <button
                type="button"
                onClick={handleCopyImageButton}
                title="Copiar imagem PNG para colar no WhatsApp"
                className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition-colors cursor-pointer"
              >
                {copiedImage ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <ImageIcon className="w-3.5 h-3.5" />}
                <span>{copiedImage ? 'Foto Copiada!' : 'Copiar Foto'}</span>
              </button>
            )}
          </div>

          <div className="w-full sm:w-auto flex items-center gap-2 justify-end">
            {imageUrl && canShareFiles && (
              <button
                type="button"
                onClick={handleShareNative}
                title="Compartilhar foto e texto direto no app do WhatsApp (celular)"
                className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Enviar Foto + Texto</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleSendWhatsApp}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 bg-[#25D366] hover:bg-[#20BD5A] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Enviar no WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
