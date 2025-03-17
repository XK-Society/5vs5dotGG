'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface SafeImageProps {
  src?: string;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
}

// Use a local placeholder image in the public folder
const DEFAULT_TEAM_LOGO = '/images/placeholder-team-logo.png';

export const SafeImage = ({ 
  src, 
  alt, 
  className = '', 
  fill = false,
  width,
  height 
}: SafeImageProps) => {
  // Initialize with default local image
  const [imageSrc, setImageSrc] = useState<string>(DEFAULT_TEAM_LOGO);
  
  // Check if src is valid and update after mount
  useEffect(() => {
    // Only update if src is provided and looks valid
    if (src) {
      // For external URLs, ensure they are from allowed domains or use default
      if (src.startsWith('http')) {
        // You could check if domain is allowed, but safer to just use local default
        setImageSrc(DEFAULT_TEAM_LOGO);
      } else {
        // For local paths, use directly
        setImageSrc(src);
      }
    }
  }, [src]);

  const handleError = () => {
    setImageSrc(DEFAULT_TEAM_LOGO);
  };

  if (fill) {
    return (
      <div className="relative h-full w-full">
        <Image
          src={imageSrc}
          alt={alt}
          className={className}
          fill
          onError={handleError}
        />
      </div>
    );
  }

  return (
    <Image
      src={imageSrc}
      alt={alt}
      className={className}
      width={width || 100}
      height={height || 100}
      onError={handleError}
    />
  );
};

export default SafeImage;