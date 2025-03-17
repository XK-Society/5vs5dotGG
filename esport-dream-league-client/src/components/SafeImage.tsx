'use client';

import { useState } from 'react';
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
const DEFAULT_TEAM_LOGO = '/placeholder-team-logo.png';

export const SafeImage = ({ 
  src, 
  alt, 
  className = '', 
  fill = false,
  width,
  height 
}: SafeImageProps) => {
  const [imageSrc, setImageSrc] = useState<string>(
    src && src.startsWith('http') ? src : DEFAULT_TEAM_LOGO
  );

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