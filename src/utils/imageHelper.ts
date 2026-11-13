/**
 * Utilities for compressing post-care flyers for Firestore/localStorage safety,
 * converting images to PNG blobs for Clipboard API compatibility, and creating
 * File objects for native Web Share (mobile WhatsApp image + text sharing).
 */

/**
 * Compresses an image file to a max dimension (default 1080px) so it always fits
 * comfortably inside Firestore (1MB document limit) and localStorage while staying crisp.
 */
export function compressImageFile(file: File, maxDimension = 1080, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Falha ao ler arquivo de imagem.'));
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const img = new Image();
      img.onerror = () => resolve(dataUrl); // fallback to raw if decode fails
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }

        // Fill white background in case PNG has transparency
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Converts any image URL / Data URL into a genuine 'image/png' Blob using canvas.
 * Browsers (Chrome/Safari/Edge) ONLY allow 'image/png' in navigator.clipboard.write(ClipboardItem).
 */
export function convertImageToPngBlob(imageSrc: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onerror = () => reject(new Error('Não foi possível carregar a imagem.'));
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Contexto canvas indisponível.'));
        return;
      }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Falha ao converter imagem para PNG.'));
          }
        },
        'image/png',
        1.0
      );
    };
    img.src = imageSrc;
  });
}

/**
 * Converts an image URL / Data URL into a File object suitable for navigator.share({ files })
 */
export async function imageSrcToFile(imageSrc: string, filename = 'panfleto-pos-procedimento.png'): Promise<File> {
  const blob = await convertImageToPngBlob(imageSrc);
  return new File([blob], filename, { type: 'image/png' });
}
