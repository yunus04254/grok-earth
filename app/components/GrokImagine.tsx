'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GECard } from '@/components/GECard';
import { GEButton } from '@/components/GEButton';
import { Download, RefreshCw, ImageIcon, Wand2, MapPin, Sparkles, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface GrokImagineProps {
  onClose: () => void;
  city: string;
}

interface MemeImage {
  url: string;
  revisedPrompt?: string;
  memeFormat?: string;
  humorStyle?: string;
}

export default function GrokImagine({ onClose, city }: GrokImagineProps) {
  const [images, setImages] = useState<MemeImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const hasGenerated = useRef(false);

  // Auto-generate memes when component mounts with a city
  useEffect(() => {
    if (city && !hasGenerated.current) {
      hasGenerated.current = true;
      generateMemes(city);
    }
  }, [city]);

  const generateMemes = async (cityName: string) => {
    if (!cityName.trim()) return;

    setIsGenerating(true);
    setError(null);
    setImages([]);
    setCurrentIndex(0);

    try {
      // Use the new meme generation API that searches for viral memes first
      const response = await fetch('/api/generate-memes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ city: cityName }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.message || 'Failed to generate memes');
      }

      if (!data.images || data.images.length === 0) {
        throw new Error('No memes were generated');
      }

      // Convert to MemeImage format
      const allImages: MemeImage[] = data.images.map((img: any) => ({
        url: img.url,
        revisedPrompt: img.revisedPrompt,
        memeFormat: img.memeFormat,
        humorStyle: img.humorStyle,
      }));

      setImages(allImages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = () => {
    hasGenerated.current = false;
    generateMemes(city);
  };

  const handleDownload = async (imageUrl: string, index: number) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `grok-meme-${city}-${index + 1}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      // Fallback: open in new tab
      window.open(imageUrl, '_blank');
    }
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleImageClick = (imageUrl: string) => {
    setExpandedImage(imageUrl);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="fixed right-6 top-[80px] z-40 w-[420px] max-h-[calc(100vh-260px)]"
      >
        <GECard
          icon={<Wand2 className="w-5 h-5" />}
          title="Grok Imagine"
          live={isGenerating}
          onClose={onClose}
          maxHeight={600}
        >
          <div className="space-y-4">
            {/* City Header */}
            <div className="flex items-center gap-3 p-3 bg-[#22d3ee]/10 border border-[#22d3ee]/20 rounded-lg">
              <div className="p-2 bg-[#22d3ee]/20 rounded-full">
                <MapPin className="w-5 h-5 text-[#22d3ee]" />
              </div>
              <div>
                <p className="text-xs text-[#9ca3af] uppercase tracking-wide">Viral Memes</p>
                <p className="text-lg font-semibold text-[#e5e7eb]">{city}</p>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg"
              >
                <p className="text-red-400 text-sm">
                  <strong>Error:</strong> {error}
                </p>
              </motion.div>
            )}

            {/* Loading Initial State */}
            {images.length === 0 && isGenerating && (
              <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
                <div className="relative">
                  <div className="w-16 h-16 border-2 border-[#22d3ee]/20 rounded-full" />
                  <div className="absolute inset-0 w-16 h-16 border-2 border-transparent border-t-[#22d3ee] rounded-full animate-spin" />
                  <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-[#22d3ee] animate-pulse" />
                </div>
                <p className="text-[#9ca3af] text-sm font-medium">
                  Generating meme...
                </p>
                <p className="text-xs text-[#6b7280]">
                  Creating a hilarious meme about {city}
                </p>
              </div>
            )}

            {/* Carousel Display */}
            {images.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-3"
              >
                {/* Carousel Container */}
                <div className="relative rounded-xl overflow-hidden border border-[#2a2f3a]/60 bg-[#0f1419]/40">
                  {/* Image Display */}
                  <div className="relative aspect-square bg-[#0f1419]">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={currentIndex}
                        src={images[currentIndex].url}
                        alt={`Meme ${currentIndex + 1} about ${city}`}
                        className="w-full h-full object-contain cursor-pointer"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        onClick={() => handleImageClick(images[currentIndex].url)}
                      />
                    </AnimatePresence>

                    {/* Navigation Arrows */}
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            prevImage();
                          }}
                          className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm transition-all duration-200 hover:scale-110"
                          aria-label="Previous meme"
                        >
                          <ChevronLeft className="w-5 h-5 text-white" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            nextImage();
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm transition-all duration-200 hover:scale-110"
                          aria-label="Next meme"
                        >
                          <ChevronRight className="w-5 h-5 text-white" />
                        </button>
                      </>
                    )}

                    {/* Image Counter and Meme Format */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
                      <div className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm">
                        <span className="text-xs text-white">
                          {currentIndex + 1} / {images.length}
                        </span>
                      </div>
                      {images[currentIndex]?.memeFormat && (
                        <div className="px-2 py-0.5 rounded bg-[#22d3ee]/20 backdrop-blur-sm border border-[#22d3ee]/30">
                          <span className="text-[10px] text-[#22d3ee] font-medium uppercase tracking-wide">
                            {images[currentIndex].memeFormat}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Download Button Overlay */}
                    <div className="absolute top-2 right-2 opacity-0 hover:opacity-100 transition-opacity duration-200">
                      <GEButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(images[currentIndex].url, currentIndex);
                        }}
                        variant="default"
                        size="sm"
                        className="backdrop-blur-sm"
                      >
                        <Download className="w-4 h-4" />
                      </GEButton>
                    </div>
                  </div>

                  {/* Dots Indicator */}
                  {images.length > 1 && (
                    <div className="flex justify-center gap-2 p-3 bg-[#0f1419]/40">
                      {images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentIndex(index)}
                          className={`w-2 h-2 rounded-full transition-all duration-200 ${
                            index === currentIndex
                              ? 'bg-[#22d3ee] w-6'
                              : 'bg-[#6b7280] hover:bg-[#9ca3af]'
                          }`}
                          aria-label={`Go to meme ${index + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Regenerate Button */}
                <GEButton
                  onClick={handleRegenerate}
                  variant="accent"
                  className="w-full"
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Regenerating...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Regenerate Memes
                    </>
                  )}
                </GEButton>
              </motion.div>
            )}

            {/* Empty State */}
            {images.length === 0 && !isGenerating && !error && (
              <div className="flex flex-col items-center justify-center py-8 text-[#6b7280]">
                <ImageIcon className="w-12 h-12 mb-3 opacity-40" />
                <p className="text-sm">Your memes will appear here</p>
              </div>
            )}

            {/* Footer Info */}
            {images.length > 0 && !isGenerating && (
              <div className="pt-3 border-t border-[#2a2f3a]/40">
                <p className="text-xs text-[#6b7280] text-center">
                  Powered by xAI Grok Imagine • Click to expand
                </p>
              </div>
            )}
          </div>
        </GECard>
      </motion.div>

      {/* Expanded Image Modal */}
      <AnimatePresence>
        {expandedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
            onClick={() => setExpandedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl max-h-[90vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setExpandedImage(null)}
                className="absolute -top-12 right-0 p-2 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm transition-all duration-200 hover:scale-110 z-10"
                aria-label="Close expanded view"
              >
                <X className="w-6 h-6 text-white" />
              </button>

              {/* Expanded Image */}
              <img
                src={expandedImage}
                alt="Expanded meme"
                className="w-full h-auto max-h-[90vh] object-contain rounded-xl"
              />

              {/* Download Button */}
              <div className="absolute bottom-4 right-4">
                <GEButton
                  onClick={() => {
                    const index = images.findIndex(img => img.url === expandedImage);
                    handleDownload(expandedImage, index >= 0 ? index : 0);
                  }}
                  variant="default"
                  className="backdrop-blur-sm"
                >
                  <Download className="w-4 h-4" />
                  Download
                </GEButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
