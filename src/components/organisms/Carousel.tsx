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

  const touchRef = useRef<{ startX: number; startY: number } | null>(null);

  useEffect(() => {
    if (!isAutoPlay || slides.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, autoSlideInterval);
    return () => clearInterval(interval);
  }, [isAutoPlay, slides.length, autoSlideInterval]);

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setIsAutoPlay(false);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setIsAutoPlay(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchRef.current = { startX: e.touches[0].clientX, startY: e.touches[0].clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchRef.current) return;
    const dx = e.changedTouches[0].clientX - touchRef.current.startX;
    const dy = Math.abs(e.changedTouches[0].clientY - touchRef.current.startY);
    if (Math.abs(dx) > 50 && dy < 80) {
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
      padding: '40px 0',
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

      {/* 슬라이드 이미지 */}
      <div
        style={{ width: '100%', borderRadius: '12px', overflow: 'hidden', background: '#0F1629' }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={slides[currentSlide].imagePath}
          alt={slides[currentSlide].title}
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
            background: '#0F1629',
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
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
            onClick={() => { setCurrentSlide(index); setIsAutoPlay(false); }}
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
