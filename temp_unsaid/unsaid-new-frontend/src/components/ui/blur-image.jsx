import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const BlurImage = ({ src, alt, className, containerClassName }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setIsLoaded(true);
    };
  }, [src]);

  return (
    <div className={cn("overflow-hidden relative", containerClassName)}>
      <img
        src={src}
        alt={alt}
        className={cn(
          "transition-all duration-500",
          isLoaded ? "blur-0 scale-100" : "blur-md scale-105",
          className
        )}
      />
    </div>
  );
};

export default BlurImage;