import React, { useState } from 'react';

/**
 * The skeleton, the fallback SVG and the error overlay all painted #17161A — the
 * previous dark system — on what is now a cloth ground. On the slow connections
 * PRODUCT.md names as a product constraint, that skeleton is what a visitor looks at
 * longest, so it was a near-black rectangle flashing on paper for exactly the audience
 * least able to skip it. All three are cloth tokens now.
 */

const ImageWithFallback = ({
  src,
  alt,
  width,
  height,
  fallbackSrc = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect width="400" height="300" fill="%23E9E3D6"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="16" fill="%235B5F67"%3EImage unavailable%3C/text%3E%3C/svg%3E',
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
        <div className="absolute inset-0 animate-pulse bg-cloth-200" />
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
        <div className="absolute inset-0 flex items-center justify-center bg-cloth-200">
          <div className="text-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="mx-auto mb-2 h-10 w-10 text-mark-500" 
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
            <p className="text-label uppercase text-mark-600">Image unavailable</p>
          </div>
        </div>
      ) : (
        // Fallback when no sources
        <div className="absolute inset-0 flex items-center justify-center bg-cloth-200">
          <span className="text-label uppercase text-mark-600">Image unavailable</span>
        </div>
      )}
    </div>
  );
};

export default ImageWithFallback;
