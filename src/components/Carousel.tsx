import React, { useState, useEffect, useRef } from 'react';

interface CarouselSlide {
  title: string;
  description: string;
  imagePath: string;
}

interface CarouselProps {
  slides: CarouselSlide[];
  autoSlide?: boolean;
  autoSlideInterval?: number;
  title?: string;
}

export default function Carousel({ slides, autoSlide = true, autoSlideInterval = 5000, title = "Preview" }: CarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(autoSlide);
  const [imgScale, setImgScale] = useState(1);
  const [transformOrigin, setTransformOrigin] = useState('50% 50%');

  const containerRef = useRef<HTMLDivElement>(null);
  const touchRef = useRef<{
    startX: number;
    startY: number;
    startDist: number;
    startScale: number;
    isPinch: boolean;
  } | null>(null);
  const lastTapRef = useRef(0);

  useEffect(() => {
    if (!isAutoPlay || slides.length === 0 || imgScale > 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, autoSlideInterval);
    return () => clearInterval(interval);
  }, [isAutoPlay, slides.length, autoSlideInterval, imgScale]);

  const resetZoom = () => {
    setImgScale(1);
    setTransformOrigin('50% 50%');
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setIsAutoPlay(false);
    resetZoom();
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setIsAutoPlay(false);
    resetZoom();
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlay(false);
    resetZoom();
  };

  const getDist = (t1: Touch, t2: Touch) => {
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = getDist(e.touches[0], e.touches[1]);
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const cx = ((e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left) / rect.width * 100;
        const cy = ((e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top) / rect.height * 100;
        setTransformOrigin(`${cx}% ${cy}%`);
      }
      touchRef.current = { startX: 0, startY: 0, startDist: dist, startScale: imgScale, isPinch: true };
    } else if (e.touches.length === 1) {
      const now = Date.now();
      if (now - lastTapRef.current < 300) {
        resetZoom();
        lastTapRef.current = 0;
        touchRef.current = null;
        return;
      }
      lastTapRef.current = now;
      touchRef.current = {
        startX: e.touches[0].clientX,
        startY: e.touches[0].clientY,
        startDist: 0,
        startScale: imgScale,
        isPinch: false,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (!touchRef.current) return;
    if (e.touches.length === 2 && touchRef.current.isPinch) {
      const dist = getDist(e.touches[0], e.touches[1]);
      const newScale = Math.max(1, Math.min(4, touchRef.current.startScale * (dist / touchRef.current.startDist)));
      setImgScale(newScale);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchRef.current || touchRef.current.isPinch) {
      touchRef.current = null;
      return;
    }
    const endX = e.changedTouches[0]?.clientX ?? 0;
    const endY = e.changedTouches[0]?.clientY ?? 0;
    const dx = endX - touchRef.current.startX;
    const dy = Math.abs(endY - touchRef.current.startY);
    if (imgScale <= 1 && Math.abs(dx) > 50 && dy < 80) {
      if (dx < 0) goToNext();
      else goToPrevious();
    }
    touchRef.current = null;
  };

  if (slides.length === 0) return null;

  return (
    <div style={{
      width: '100%',
      background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(21, 30, 50, 0.8))',
      padding: '40px 20px',
      borderRadius: '16px',
      overflow: 'hidden'
    }}>
      <h2 style={{
        fontSize: '28px',
        fontWeight: 'bold',
        color: '#F9FAFB',
        marginBottom: '32px',
        textAlign: 'center'
      }}>{title}</h2>

      <div
        ref={containerRef}
        style={{
          position: 'relative',
          width: '100%',
          overflow: 'hidden',
          borderRadius: '12px',
          background: '#0F1629',
          touchAction: 'none',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16/9',
          background: '#0F1629'
        }}>
          {slides.map((slide, index) => (
            <div
              key={index}
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                opacity: index === currentSlide ? 1 : 0,
                transition: 'opacity 0.6s ease-in-out',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              <img
                src={slide.imagePath}
                alt={slide.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  background: '#0F1629',
                  transform: index === currentSlide ? `scale(${imgScale})` : 'scale(1)',
                  transformOrigin: transformOrigin,
                  transition: imgScale === 1 ? 'transform 0.3s' : 'none',
                  userSelect: 'none',
                  pointerEvents: 'none',
                  WebkitUserSelect: 'none',
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          ))}
        </div>

        {/* 핀치 힌트 / 줌 초기화 버튼 */}
        {imgScale === 1 ? (
          <div style={{
            position: 'absolute',
            bottom: '8px',
            right: '8px',
            background: 'rgba(0,0,0,0.45)',
            color: '#9CA3AF',
            fontSize: '11px',
            padding: '3px 8px',
            borderRadius: '4px',
            pointerEvents: 'none',
          }}>
            핀치로 확대 · 스와이프로 이동
          </div>
        ) : (
          <button
            onClick={resetZoom}
            style={{
              position: 'absolute',
              bottom: '8px',
              right: '8px',
              background: 'rgba(255,153,0,0.85)',
              color: '#0F1629',
              fontSize: '11px',
              fontWeight: '600',
              padding: '4px 10px',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            ✕ 초기화
          </button>
        )}
      </div>

      {/* 슬라이드 설명 */}
      <div style={{ marginTop: '24px', textAlign: 'center', padding: '20px' }}>
        <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#FF9900', marginBottom: '8px' }}>
          {slides[currentSlide].title}
        </h3>
        <p style={{ fontSize: '14px', color: '#D1D5DB', lineHeight: '1.6' }}>
          {slides[currentSlide].description}
        </p>
      </div>

      {/* 점 네비게이션 */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '24px' }}>
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            style={{
              width: index === currentSlide ? '32px' : '12px',
              height: '12px',
              borderRadius: '6px',
              background: index === currentSlide ? '#FF9900' : 'rgba(255, 153, 0, 0.4)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s',
              padding: '0'
            }}
          />
        ))}
      </div>
    </div>
  );
}
