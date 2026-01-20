import React, { useState } from 'react';

const ImageWithFallback = ({
  src,
  alt,
  width,
  height,
  fallbackSrc = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect width="400" height="300" fill="%230a1929"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="monospace" font-size="16" fill="%23666"%3E📷 Image unavailable%3C/text%3E%3C/svg%3E',
  className = '',
  loading = 'lazy',
  sizes = '100vw',
  priority = false,
  onLoad,
  onError,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = (e) => {
    setIsLoaded(true);
    setHasError(false);
    onLoad?.(e);
  };

  const handleError = (e) => {
    console.warn(`Failed to load image: ${src}`);
    setIsLoaded(false);
    setHasError(true);
    onError?.(e);
  };

  // Generate srcset for WebP/AVIF support (when available)
  const generateSources = () => {
    if (!src || hasError) return null;

    // Extract extension
    const extension = src.match(/\.(jpg|jpeg|png|webp|avif)$/i)?.[1];
    if (!extension) return null;

    const basePath = src.replace(/\.(jpg|jpeg|png|webp|avif)$/i, '');

    return {
      avif: `${basePath}.avif`,
      webp: `${basePath}.webp`,
      original: src,
    };
  };

  const sources = generateSources();

  // Calculate aspect ratio for CLS prevention
  const aspectRatio = width && height ? `${width} / ${height}` : undefined;

  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {/* Loading Skeleton */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-blue-800/20 animate-pulse" />
      )}

      {!hasError && sources ? (
        <picture>
          {/* AVIF - Best compression, newest format */}
          <source srcSet={sources.avif} type="image/avif" />
          
          {/* WebP - Good compression, wide support */}
          <source srcSet={sources.webp} type="image/webp" />
          
          {/* Fallback to original format */}
          <img
            src={sources.original}
            alt={alt}
            width={width}
            height={height}
            loading={priority ? 'eager' : loading}
            sizes={sizes}
            onLoad={handleLoad}
            onError={handleError}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            {...props}
          />
        </picture>
      ) : hasError ? (
        // Error Overlay
        <div className="absolute inset-0 flex items-center justify-center bg-[#061220]/80">
          <div className="text-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-12 w-12 text-gray-600 mx-auto mb-2" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
              />
            </svg>
            <p className="text-xs text-gray-500">Image unavailable</p>
          </div>
        </div>
      ) : (
        // Fallback when no sources
        <div className="absolute inset-0 flex items-center justify-center bg-blue-900/20">
          <span className="text-gray-400 text-sm">📷 Image unavailable</span>
        </div>
      )}
    </div>
  );
};

export default ImageWithFallback;
