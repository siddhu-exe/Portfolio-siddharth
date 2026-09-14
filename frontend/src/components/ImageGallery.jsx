/**
 * Data-driven image slot used by every Chapter-page gallery section.
 *  - 1 image  -> full-width single frame
 *  - 2 images -> side-by-side grid, generous gutter
 *  - 3+ images -> horizontal scroll-snap row, with a fade hint on the right
 *    edge so it reads as scrollable
 * All frames share the same soft, all-corners rounded treatment.
 */
export default function ImageGallery({ images = [], color, alt }) {
  if (images.length === 0) return null;

  const Frame = ({ src, label, placeholderAspect = 'aspect-[16/9]', className = '' }) => {
    if (!src) {
      return (
        <div
          className={`overflow-hidden rounded-2xl border border-ink/10 shadow-sm md:rounded-3xl ${placeholderAspect} ${className}`}
          style={{ backgroundColor: color }}
        >
          <div className="flex h-full w-full items-center justify-center px-6 py-16 text-center">
            <span className="text-sm font-semibold uppercase tracking-widest text-cream/90">{label}</span>
          </div>
        </div>
      );
    }

    return (
      <div
        className={`group relative flex items-center justify-center overflow-hidden rounded-2xl border border-ink/10 bg-[#f8fafc] p-3 shadow-sm transition-shadow duration-300 hover:shadow-md sm:p-5 md:rounded-3xl md:p-6 ${className}`}
      >
        <img
          src={src}
          alt={label}
          className="h-auto max-h-[85vh] w-full object-contain transition-transform duration-300 group-hover:scale-[1.008]"
          loading="lazy"
        />
      </div>
    );
  };

  if (images.length === 1) {
    return (
      <div className="w-full">
        <Frame src={images[0]} label={alt} placeholderAspect="aspect-[16/9]" className="w-full" />
      </div>
    );
  }

  if (images.length === 2) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {images.map((src, i) => (
          <div key={i} className="flex w-full">
            <Frame
              src={src}
              label={`${alt} ${i + 1}`}
              placeholderAspect="aspect-[4/3]"
              className="w-full"
            />
          </div>
        ))}
      </div>
    );
  }

  // 3+ images: horizontal scroll-snap gallery with a fade-edge scroll hint.
  return (
    <div className="relative">
      <div className="scrollbar-none flex gap-6 overflow-x-auto pb-4 [scroll-snap-type:x_mandatory]">
        {images.map((src, i) => (
          <div
            key={i}
            className="w-[88%] shrink-0 sm:w-[60%] lg:w-[48%]"
            style={{ scrollSnapAlign: 'start' }}
          >
            <Frame
              src={src}
              label={`${alt} ${i + 1}`}
              placeholderAspect="aspect-[4/3]"
              className="w-full"
            />
          </div>
        ))}
      </div>
      {/* fade hint signalling more content off the right edge */}
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-cream to-transparent" />
    </div>
  );
}
