"use client";

import Image from "next/image";
import { ImagePlus, Trash2, UploadCloud } from "lucide-react";
import type { ClipboardEvent as ReactClipboardEvent, DragEvent, KeyboardEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { UploadedImage } from "@/lib/types";
import { cn } from "@/lib/utils";

const acceptedImageTypes = ["image/png", "image/jpeg", "image/webp"];
const maxImageSizeBytes = 5 * 1024 * 1024;
const maxTotalImageSizeBytes = 10 * 1024 * 1024;
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
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    function handleDocumentPaste(event: ClipboardEvent) {
      const files = filesFromDataTransfer(event.clipboardData);
      if (!files.length) return;

      const activeElement = document.activeElement;
      const ownsFocus = activeElement ? rootRef.current?.contains(activeElement) : false;
      if (activePasteTarget !== targetIdRef.current && !ownsFocus) return;

      event.preventDefault();
      activePasteTarget = targetIdRef.current;
      void handleFiles(files);
    }

    document.addEventListener("paste", handleDocumentPaste);
    return () => document.removeEventListener("paste", handleDocumentPaste);
  });

  function markActivePasteTarget() {
    activePasteTarget = targetIdRef.current;
  }

  async function handleFiles(files: FileList | File[] | null) {
    const imageFiles = Array.from(files ?? []).filter((file) => file.type.startsWith("image/"));
    if (!imageFiles.length) return;
    setError("");
    try {
      const existingBytes = images.reduce((total, image) => total + estimateDataUrlBytes(image.dataUrl), 0);
      const nextFileBytes = imageFiles.reduce((total, file) => total + file.size, 0);
      if (existingBytes + nextFileBytes > maxTotalImageSizeBytes) {
        throw new Error("이미지는 한 섹션당 총 10MB 이하로 첨부해주세요.");
      }
      const nextImages = await Promise.all(imageFiles.map(fileToUploadedImage));
      onChange([...images, ...nextImages]);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "이미지를 불러오지 못했습니다.");
    } finally {
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
        <div className="max-w-md text-xs leading-5 text-app-text-muted">
          이 영역을 한 번 선택하면 다른 입력칸에서 이미지를 붙여넣어도 이곳에 임베드됩니다.
        </div>
      </div>
      {error ? (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {error}
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
                  <span className="truncate">{image.fileName}</span>
                  <Button
                    type="button"
                    variant="ghost"
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

function fileToUploadedImage(file: File): Promise<UploadedImage> {
  return new Promise((resolve, reject) => {
    if (!acceptedImageTypes.includes(file.type)) {
      reject(new Error("PNG, JPG, JPEG, WebP 파일만 첨부할 수 있습니다."));
      return;
    }
    if (file.size > maxImageSizeBytes) {
      reject(new Error("이미지는 파일당 5MB 이하로 첨부해주세요."));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        fileName: file.name || `captured-image-${new Date().toISOString().replace(/[:.]/g, "-")}.png`,
        mimeType: file.type,
        dataUrl: String(reader.result ?? ""),
        caption: "",
        note: "",
        createdAt: new Date().toISOString(),
      });
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function estimateDataUrlBytes(dataUrl: string) {
  const base64 = dataUrl.split(",")[1] ?? "";
  return Math.ceil((base64.length * 3) / 4);
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
