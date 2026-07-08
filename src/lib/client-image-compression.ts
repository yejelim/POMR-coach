import {
  COMPRESSED_IMAGE_MIME_TYPE,
  estimateDataUrlBytes,
  IMAGE_COMPRESSION_QUALITY,
  IMAGE_COMPRESSION_TRIGGER_BYTES,
  MAX_IMAGE_BYTES,
  MAX_IMAGE_EDGE_PX,
} from "@/lib/image-limits";

export type PreparedImageFile = {
  dataUrl: string;
  fileName: string;
  mimeType: string;
  originalBytes: number;
  storedBytes: number;
  width?: number;
  height?: number;
  compressed: boolean;
};

export async function prepareImageForStorage(file: File): Promise<PreparedImageFile> {
  const source = await loadImageElement(file);
  const sourceWidth = source.naturalWidth;
  const sourceHeight = source.naturalHeight;
  if (!sourceWidth || !sourceHeight) throw new Error("이미지 크기를 읽지 못했습니다.");

  const scale = Math.min(1, MAX_IMAGE_EDGE_PX / Math.max(sourceWidth, sourceHeight));
  const targetWidth = Math.max(1, Math.round(sourceWidth * scale));
  const targetHeight = Math.max(1, Math.round(sourceHeight * scale));
  const needsResize = scale < 1;
  const shouldCompress = needsResize || file.size > IMAGE_COMPRESSION_TRIGGER_BYTES;

  if (!shouldCompress) {
    const dataUrl = await fileToDataUrl(file);
    const storedBytes = estimateDataUrlBytes(dataUrl);
    ensureStoredImageSize(storedBytes);
    return {
      dataUrl,
      fileName: file.name,
      mimeType: file.type,
      originalBytes: file.size,
      storedBytes,
      width: sourceWidth,
      height: sourceHeight,
      compressed: false,
    };
  }

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("이미지를 처리할 수 없습니다.");

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, targetWidth, targetHeight);
  context.drawImage(source, 0, 0, targetWidth, targetHeight);

  const compressedBlob = await canvasToBlob(
    canvas,
    COMPRESSED_IMAGE_MIME_TYPE,
    IMAGE_COMPRESSION_QUALITY,
  );

  if (!needsResize && compressedBlob.size >= file.size) {
    const dataUrl = await fileToDataUrl(file);
    const storedBytes = estimateDataUrlBytes(dataUrl);
    ensureStoredImageSize(storedBytes);
    return {
      dataUrl,
      fileName: file.name,
      mimeType: file.type,
      originalBytes: file.size,
      storedBytes,
      width: sourceWidth,
      height: sourceHeight,
      compressed: false,
    };
  }

  const dataUrl = await fileToDataUrl(compressedBlob);
  const storedBytes = estimateDataUrlBytes(dataUrl);
  ensureStoredImageSize(storedBytes);
  return {
    dataUrl,
    fileName: compressedFileName(file.name),
    mimeType: COMPRESSED_IMAGE_MIME_TYPE,
    originalBytes: file.size,
    storedBytes,
    width: targetWidth,
    height: targetHeight,
    compressed: true,
  };
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(kb < 100 ? 1 : 0)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

function ensureStoredImageSize(bytes: number) {
  if (bytes > MAX_IMAGE_BYTES) {
    throw new Error("이미지를 자동 압축했지만 여전히 5MB를 초과합니다. 더 작은 영역으로 캡처해주세요.");
  }
}

function loadImageElement(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("이미지를 불러오지 못했습니다."));
    };
    image.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, mimeType: string, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("이미지를 압축하지 못했습니다."));
      },
      mimeType,
      quality,
    );
  });
}

function fileToDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function compressedFileName(fileName: string) {
  const fallback = `captured-image-${new Date().toISOString().replace(/[:.]/g, "-")}`;
  const name = fileName.trim() || fallback;
  const withoutExtension = name.replace(/\.[^.]*$/, "") || fallback;
  return `${withoutExtension}.jpg`;
}
