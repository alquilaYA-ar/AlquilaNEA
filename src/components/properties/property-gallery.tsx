'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';
import { PropiedadFoto } from '@/types/database';

interface PropertyGalleryProps {
  fotos: PropiedadFoto[];
  titulo: string;
}

export function PropertyGallery({ fotos, titulo }: PropertyGalleryProps) {
  // Encontrar el índice de la foto de portada inicial
  const portadaIndex = fotos.findIndex((f) => f.es_portada);
  const initialIndex = portadaIndex >= 0 ? portadaIndex : 0;

  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const fallbackImage =
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80';

  const currentImage = fotos[activeIndex]?.storage_path || fallbackImage;

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev === 0 ? fotos.length - 1 : prev - 1));
  }, [fotos.length]);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev === fotos.length - 1 ? 0 : prev + 1));
  }, [fotos.length]);

  // Soporte para teclas de navegación en lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsLightboxOpen(false);
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, handlePrev, handleNext]);

  if (fotos.length === 0) {
    return (
      <div className="relative aspect-[16/9] md:aspect-[21/9] w-full rounded-3xl overflow-hidden shadow-md bg-slate-100">
        <Image
          src={fallbackImage}
          alt={titulo}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* IMAGEN PRINCIPAL (GRANDE) */}
      <div className="relative aspect-[16/9] md:aspect-[21/9] w-full rounded-3xl overflow-hidden shadow-md bg-slate-900 group">
        <img
          src={currentImage}
          alt={`${titulo} - Foto ${activeIndex + 1}`}
          className="w-full h-full object-cover transition-opacity duration-300"
        />

        {/* Badge contador de fotos */}
        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full shadow flex items-center gap-1.5">
          <span>{activeIndex + 1}</span>
          <span className="text-white/60">/</span>
          <span>{fotos.length}</span>
        </div>

        {/* Botón Ver en Pantalla Completa */}
        <button
          type="button"
          onClick={() => setIsLightboxOpen(true)}
          className="absolute bottom-4 right-4 bg-white/90 hover:bg-white text-slate-800 text-xs font-bold px-3.5 py-2 rounded-xl shadow-lg backdrop-blur-sm transition flex items-center gap-2 cursor-pointer group-hover:scale-105"
        >
          <Maximize2 className="w-3.5 h-3.5 text-slate-700" />
          <span>Pantalla Completa</span>
        </button>

        {/* Flechas de navegación sobre la imagen principal */}
        {fotos.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              title="Foto anterior"
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-slate-900 shadow-lg flex items-center justify-center transition-all opacity-80 sm:opacity-0 group-hover:opacity-100 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={handleNext}
              title="Foto siguiente"
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-slate-900 shadow-lg flex items-center justify-center transition-all opacity-80 sm:opacity-0 group-hover:opacity-100 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* MINIATURAS INTERACTIVAS */}
      {fotos.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200">
          {fotos.map((foto, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={foto.id || idx}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`relative aspect-[4/3] w-24 sm:w-28 shrink-0 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${
                  isActive
                    ? 'border-orange-500 ring-2 ring-orange-200 scale-105 shadow-md'
                    : 'border-slate-200 opacity-70 hover:opacity-100 hover:border-slate-300'
                }`}
              >
                <img
                  src={foto.storage_path}
                  alt={`Miniatura ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* MODAL LIGHTBOX / PANTALLA COMPLETA */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200">
          {/* Barra superior de Lightbox */}
          <div className="flex items-center justify-between text-white pb-3 border-b border-white/10">
            <div className="text-sm font-semibold text-white/90 max-w-xl truncate">
              {titulo} • <span className="text-white/60">Foto {activeIndex + 1} de {fotos.length}</span>
            </div>

            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              title="Cerrar (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Área de imagen en resolución completa */}
          <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden">
            <img
              src={currentImage}
              alt={`${titulo} - Vista completa`}
              className="max-h-[80vh] max-w-[95vw] object-contain rounded-lg shadow-2xl"
            />

            {fotos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition shadow-lg cursor-pointer"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition shadow-lg cursor-pointer"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Tira inferior de miniaturas en el modal */}
          {fotos.length > 1 && (
            <div className="flex justify-center gap-2 overflow-x-auto py-2">
              {fotos.map((foto, idx) => (
                <button
                  key={foto.id || idx}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  className={`relative aspect-[4/3] w-14 sm:w-16 rounded-xl overflow-hidden border-2 transition cursor-pointer shrink-0 ${
                    idx === activeIndex
                      ? 'border-orange-500 ring-2 ring-orange-300 scale-110'
                      : 'border-white/20 opacity-50 hover:opacity-100'
                  }`}
                >
                  <img
                    src={foto.storage_path}
                    alt={`Miniatura modal ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

