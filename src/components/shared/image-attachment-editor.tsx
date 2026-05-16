"use client";

import Image from "next/image";
import { ImagePlus, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { UploadedImage } from "@/lib/types";

const acceptedImageTypes = ["image/png", "image/jpeg", "image/webp"];
const maxImageSizeBytes = 5 * 1024 * 1024;
const maxTotalImageSizeBytes = 10 * 1024 * 1024;

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
  const [error, setError] = useState("");

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setError("");
    try {
      const existingBytes = images.reduce((total, image) => total + estimateDataUrlBytes(image.dataUrl), 0);
      const nextFileBytes = Array.from(files).reduce((total, file) => total + file.size, 0);
      if (existingBytes + nextFileBytes > maxTotalImageSizeBytes) {
        throw new Error("이미지는 한 섹션당 총 10MB 이하로 첨부해주세요.");
      }
      const nextImages = await Promise.all(Array.from(files).map(fileToUploadedImage));
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

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept={acceptedImageTypes.join(",")}
        multiple
        className="hidden"
        onChange={(event) => void handleFiles(event.target.files)}
      />
      <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
        <ImagePlus className="h-4 w-4" />
        {label}
      </Button>
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
          PNG, JPG, JPEG, WebP 이미지를 첨부할 수 있습니다.
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
        fileName: file.name,
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
