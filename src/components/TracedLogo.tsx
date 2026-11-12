import React from 'react';

interface TracedLogoProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  trace: { w: number; h: number; paths: string[] };
  className?: string;
  imgClassName?: string;
}

/**
 * A logo that writes itself on the first load: a gold pen traces its outlines,
 * the picture fills in behind the pen, and a glint runs across it. Outside the
 * intro (or with reduced motion) it is just the picture.
 */
export const TracedLogo: React.FC<TracedLogoProps> = ({ src, alt, width, height, trace, className = '', imgClassName = '' }) => (
  <span className={`tl ${className}`} style={{ '--tl-n': trace.paths.length } as React.CSSProperties}>
    <img className={`tl-fill ${imgClassName}`} src={src} alt={alt} width={width} height={height} />
    <span
      className="tl-glint"
      aria-hidden="true"
      style={{ WebkitMaskImage: `url(${src})`, maskImage: `url(${src})` }}
    />
    <svg className="tl-trace" viewBox={`0 0 ${trace.w} ${trace.h}`} aria-hidden="true" preserveAspectRatio="none">
      {trace.paths.map((d, i) => (
        <path key={i} d={d} pathLength={1} style={{ '--i': i } as React.CSSProperties} />
      ))}
    </svg>
  </span>
);
