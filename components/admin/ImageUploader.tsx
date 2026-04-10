'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Spinner } from '../ui/Spinner';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string, public_id?: string) => void;
  folder?: string;
  label?: string;
}

export function ImageUploader({ value, onChange, folder = 'products', label }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        onChange(data.url, data.public_id);
      } else {
        alert(data.error || 'Error al subir imagen');
      }
    } catch (err) {
      console.error(err);
      alert('Error en la conexión');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium text-muted">{label}</label>}
      <div 
        className={`
          relative w-full h-40 border-2 border-dashed rounded-xl flex items-center justify-center transition-colors
          ${value ? 'border-border' : 'border-border hover:border-accent/20 hover:bg-surface-2'}
        `}
      >
        {isUploading ? (
          <Spinner />
        ) : value ? (
          <div className="relative w-full h-full p-2">
            <Image 
              src={value} 
              alt="Uploaded" 
              fill 
              className="object-contain rounded-lg"
            />
            <button
              onClick={() => onChange('')}
              className="absolute top-4 right-4 bg-surface/80 hover:bg-surface p-1.5 rounded-full shadow-sm text-red-500"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="text-center">
            <svg className="mx-auto h-10 w-10 text-muted-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="mt-2 text-xs text-muted-2">Click para subir imagen</p>
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          className="absolute inset-0 opacity-0 cursor-pointer"
          onChange={handleUpload}
          disabled={isUploading}
        />
      </div>
    </div>
  );
}
