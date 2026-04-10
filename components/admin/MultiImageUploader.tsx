'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Spinner } from '../ui/Spinner';

interface ImageItem {
  url: string;
  public_id: string;
}

interface MultiImageUploaderProps {
  images: ImageItem[];
  onChange: (images: ImageItem[]) => void;
  folder?: string;
  label?: string;
}

export function MultiImageUploader({ images, onChange, folder = 'products', label }: MultiImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    
    try {
      const newImages: ImageItem[] = [];
      
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (res.ok) {
          newImages.push({ url: data.url, public_id: data.public_id });
        }
      }

      onChange([...images, ...newImages]);
    } catch (err) {
      console.error(err);
      alert('Error al subir imágenes');
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    onChange(newImages);
  };

  return (
    <div className="space-y-3">
      {label && <label className="block text-sm font-medium text-muted">{label}</label>}
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {images.map((img, idx) => (
          <div key={idx} className="relative aspect-square bg-surface-2 rounded-xl overflow-hidden border border-border">
            <Image src={img.url} alt={`Product ${idx}`} fill className="object-cover" />
            <button
              type="button"
              onClick={() => removeImage(idx)}
              className="absolute top-2 right-2 bg-black/50 hover:bg-black p-1 rounded-full text-white transition-colors"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            {idx === 0 && (
              <span className="absolute bottom-2 left-2 bg-black text-[10px] text-white px-2 py-0.5 rounded-md font-bold uppercase">Portada</span>
            )}
          </div>
        ))}
        
        <label className={`
          relative aspect-square border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center transition-colors cursor-pointer hover:border-accent/20 hover:bg-surface-2
          ${isUploading ? 'pointer-events-none' : ''}
        `}>
          {isUploading ? (
            <Spinner />
          ) : (
            <>
              <svg className="w-8 h-8 text-muted-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-[10px] text-muted-2 mt-2 font-medium">Subir Imagen</span>
            </>
          )}
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
            disabled={isUploading}
          />
        </label>
      </div>
    </div>
  );
}
