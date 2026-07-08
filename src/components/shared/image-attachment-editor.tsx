"use client";

import Image from "next/image";
import { ImagePlus, Trash2, UploadCloud } from "lucide-react";
import type { ClipboardEvent as ReactClipboardEvent, DragEvent, KeyboardEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatBytes, prepareImageForStorage } from "@/lib/client-image-compression";
import type { UploadedImage } from "@/lib/types";
import {
  ALLOWED_IMAGE_MIME_TYPES,
  estimateDataUrlBytes,
  MAX_IMAGES_PER_SECTION,
  MAX_SECTION_BYTES,
} from "@/lib/image-limits";
import { cn } from "@/lib/utils";

const acceptedImageTypes: readonly string[] = ALLOWED_IMAGE_MIME_TYPES;
let activePasteTarget: symbol | null = null;

export function ImageAttachmentEditor({
  images,
  onChange,
  label = "Upload image",
}: {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const targetIdRef = useRef(Symbol(label));
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Keep a ref to the latest handler so the document-level paste listener can be
  // registered exactly once (stable deps) without capturing a stale closure.
  const handleFilesRef = useRef<(files: FileList | File[] | null) => void>(() => {});
  useEffect(() => {
    handleFilesRef.current = handleFiles;
  });

  useEffect(() => {
    function handleDocumentPaste(event: ClipboardEvent) {
      const files = filesFromDataTransfer(event.clipboardData);
      if (!files.length) return;

      const activeElement = document.activeElement;
      const ownsFocus = activeElement ? rootRef.current?.contains(activeElement) : false;
      if (activePasteTarget !== targetIdRef.current && !ownsFocus) return;

      event.preventDefault();
      activePasteTarget = targetIdRef.current;
      void handleFilesRef.current(files);
    }

    document.addEventListener("paste", handleDocumentPaste);
    return () => document.removeEventListener("paste", handleDocumentPaste);
  }, []);

  function markActivePasteTarget() {
    activePasteTarget = targetIdRef.current;
  }

  async function handleFiles(files: FileList | File[] | null) {
    const imageFiles = Array.from(files ?? []).filter((file) => file.type.startsWith("image/"));
    if (!imageFiles.length) return;
    setError("");
    setNotice("");
    setIsProcessing(true);
    try {
      if (images.length + imageFiles.length > MAX_IMAGES_PER_SECTION) {
        throw new Error(`이미지는 한 섹션당 최대 ${MAX_IMAGES_PER_SECTION}장까지 첨부할 수 있습니다.`);
      }

      const nextImages = await Promise.all(imageFiles.map(fileToUploadedImage));
      const existingBytes = images.reduce((total, image) => total + storedImageBytes(image), 0);
      const nextImageBytes = nextImages.reduce((total, image) => total + storedImageBytes(image), 0);
      if (existingBytes + nextImageBytes > MAX_SECTION_BYTES) {
        throw new Error("이미지는 한 섹션당 총 10MB 이하로 첨부해주세요.");
      }
      onChange([...images, ...nextImages]);
      setNotice(compressionNotice(nextImages));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "이미지를 불러오지 못했습니다.");
    } finally {
      setIsProcessing(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function updateImage(index: number, patch: Partial<UploadedImage>) {
    onChange(images.map((image, imageIndex) => (imageIndex === index ? { ...image, ...patch } : image)));
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    const files = filesFromDataTransfer(event.dataTransfer);
    void handleFiles(files);
  }

  function handlePaste(event: ReactClipboardEvent<HTMLDivElement>) {
    const files = filesFromDataTransfer(event.clipboardData);
    if (!files.length) return;
    event.preventDefault();
    event.stopPropagation();
    markActivePasteTarget();
    void handleFiles(files);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    inputRef.current?.click();
  }

  return (
    <div
      ref={rootRef}
      className="space-y-3"
      onClick={markActivePasteTarget}
      onFocusCapture={markActivePasteTarget}
      onMouseEnter={markActivePasteTarget}
      onPaste={handlePaste}
    >
      <input
        ref={inputRef}
        type="file"
        accept={acceptedImageTypes.join(",")}
        multiple
        className="hidden"
        onChange={(event) => void handleFiles(event.target.files)}
      />
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={handleKeyDown}
        onDragEnter={(event) => {
          event.preventDefault();
          markActivePasteTarget();
          setIsDragging(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          markActivePasteTarget();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-app-border-strong bg-app-surface-muted px-4 py-5 text-center transition hover:border-app-primary hover:bg-app-primary-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-primary/25",
          isDragging && "border-app-primary bg-app-primary-muted",
        )}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-app-surface text-app-primary shadow-sm">
          {isDragging ? <UploadCloud className="h-5 w-5" /> : <ImagePlus className="h-5 w-5" />}
        </div>
        <div className="text-sm font-semibold text-app-text">{label}</div>
        <div className="text-xs leading-5 text-app-text-muted">
          파일 선택, 드래그앤드롭, 클릭 후 Ctrl/⌘+V 붙여넣기
        </div>
        <div className="text-xs leading-5 text-app-text-muted">
          큰 이미지는 저장 전 자동으로 축소/압축됩니다.
        </div>
        <div className="max-w-md text-xs leading-5 text-app-text-muted">
          이 영역을 한 번 선택하면 다른 입력칸에서 이미지를 붙여넣어도 이곳에 임베드됩니다.
        </div>
      </div>
      {isProcessing ? (
        <p className="rounded-md border border-app-primary-soft bg-app-primary-muted px-3 py-2 text-sm text-app-primary">
          이미지를 저장하기 좋은 크기로 줄이는 중입니다.
        </p>
      ) : null}
      {error ? (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {error}
        </p>
      ) : null}
      {notice && !error ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          {notice}
        </p>
      ) : null}
      {images.length ? (
        <div className="grid gap-3 md:grid-cols-2">
          {images.map((image, index) => (
            <div key={image.id} className="rounded-lg border border-slate-200 bg-white p-3">
              <div className="relative mb-3 aspect-[4/3] overflow-hidden rounded-md bg-slate-100">
                <Image
                  src={image.dataUrl}
                  alt={image.caption || image.fileName}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
              <div className="space-y-2">
                <Input
                  value={image.caption ?? ""}
                  placeholder="캡션"
                  onChange={(event) => updateImage(index, { caption: event.target.value })}
                />
                <Textarea
                  value={image.note ?? ""}
                  rows={2}
                  placeholder="메모"
                  onChange={(event) => updateImage(index, { note: event.target.value })}
                />
                <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                  <div className="min-w-0">
                    <div className="truncate">{image.fileName}</div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
                      <span>{formatBytes(storedImageBytes(image))}</span>
                      {image.compressed ? <span>자동 압축됨</span> : null}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="danger-ghost"
                    size="sm"
                    onClick={() => onChange(images.filter((_, imageIndex) => imageIndex !== index))}
                  >
                    <Trash2 className="h-4 w-4" />
                    삭제
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500">
          PNG, JPG, JPEG, WebP 이미지를 첨부할 수 있습니다. 클립보드에 이미지가 있을 때만 붙여넣기가 업로드로 처리됩니다.
        </p>
      )}
    </div>
  );
}

async function fileToUploadedImage(file: File): Promise<UploadedImage> {
  if (!acceptedImageTypes.includes(file.type)) {
    throw new Error("PNG, JPG, JPEG, WebP 파일만 첨부할 수 있습니다.");
  }

  const prepared = await prepareImageForStorage(file);
  return {
    id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    fileName: prepared.fileName || `captured-image-${new Date().toISOString().replace(/[:.]/g, "-")}.jpg`,
    mimeType: prepared.mimeType,
    dataUrl: prepared.dataUrl,
    caption: "",
    note: "",
    createdAt: new Date().toISOString(),
    originalBytes: prepared.originalBytes,
    storedBytes: prepared.storedBytes,
    width: prepared.width,
    height: prepared.height,
    compressed: prepared.compressed,
  };
}

function storedImageBytes(image: UploadedImage) {
  return image.storedBytes ?? estimateDataUrlBytes(image.dataUrl);
}

function compressionNotice(images: UploadedImage[]) {
  const compressedImages = images.filter((image) => image.compressed);
  if (!compressedImages.length) return "";

  const originalBytes = compressedImages.reduce(
    (total, image) => total + (image.originalBytes ?? storedImageBytes(image)),
    0,
  );
  const storedBytes = compressedImages.reduce((total, image) => total + storedImageBytes(image), 0);
  return `이미지 ${compressedImages.length}장을 자동 압축했습니다. ${formatBytes(originalBytes)} → ${formatBytes(storedBytes)}`;
}

function filesFromDataTransfer(dataTransfer: DataTransfer | null) {
  if (!dataTransfer) return [];
  const directFiles = Array.from(dataTransfer.files ?? []);
  if (directFiles.length) return directFiles;
  return Array.from(dataTransfer.items ?? [])
    .filter((item) => item.kind === "file")
    .map((item) => item.getAsFile())
    .filter((file): file is File => Boolean(file));
}
