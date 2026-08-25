import { useState } from 'react'
import { cn } from '@/lib/cn'

interface LazyImageProps {
  src: string
  alt: string
  ratio?: string
  priority?: boolean
  className?: string
  imgClassName?: string
}

export function LazyImage({
  src,
  alt,
  ratio,
  priority = false,
  className,
  imgClassName,
}: LazyImageProps) {
  const [loaded, setLoaded] = useState(priority)

  return (
    <figure
      className={cn('relative overflow-hidden bg-sand-200', className)}
      style={ratio ? { aspectRatio: ratio } : undefined}
    >
      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : 'auto'}
        onLoad={() => setLoaded(true)}
        className={cn(
          'h-full w-full object-cover transition-[opacity,filter,transform] duration-(--d-reveal) ease-expo',
          loaded ? 'opacity-100 blur-none' : 'opacity-0 blur-md',
          !loaded && 'scale-105',
          imgClassName,
        )}
      />
    </figure>
  )
}
