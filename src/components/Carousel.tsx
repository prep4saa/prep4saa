import React, { useState, useEffect } from 'react';

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

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlay(false);
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
      {/* 타이틀 */}
      <h2 style={{
        fontSize: '28px',
        fontWeight: 'bold',
        color: '#F9FAFB',
        marginBottom: '32px',
        textAlign: 'center'
      }}>{title}</h2>

      {/* 캐러셀 컨테이너 */}
      <div style={{
        position: 'relative',
        width: '100%',
        overflow: 'hidden',
        borderRadius: '12px',
        background: '#0F1629'
      }}>
        {/* 슬라이드 */}
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
                justifyContent: 'center'
              }}
            >
              <img
                src={slide.imagePath}
                alt={slide.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  background: '#0F1629'
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          ))}
        </div>

        {/* 좌측 버튼 */}
        <button
          onClick={goToPrevious}
          style={{
            position: 'absolute',
            left: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'rgba(255, 153, 0, 0.8)',
            border: 'none',
            color: '#0F1629',
            fontSize: '24px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            zIndex: 10,
            fontWeight: 'bold'
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.background = 'rgba(255, 153, 0, 1)';
            (e.target as HTMLButtonElement).style.transform = 'translateY(-50%) scale(1.1)';
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.background = 'rgba(255, 153, 0, 0.8)';
            (e.target as HTMLButtonElement).style.transform = 'translateY(-50%) scale(1)';
          }}
        >
          &#10094;
        </button>

        {/* 우측 버튼 */}
        <button
          onClick={goToNext}
          style={{
            position: 'absolute',
            right: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'rgba(255, 153, 0, 0.8)',
            border: 'none',
            color: '#0F1629',
            fontSize: '24px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            zIndex: 10,
            fontWeight: 'bold'
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.background = 'rgba(255, 153, 0, 1)';
            (e.target as HTMLButtonElement).style.transform = 'translateY(-50%) scale(1.1)';
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.background = 'rgba(255, 153, 0, 0.8)';
            (e.target as HTMLButtonElement).style.transform = 'translateY(-50%) scale(1)';
          }}
        >
          &#10095;
        </button>
      </div>

      {/* 슬라이드 설명 */}
      <div style={{
        marginTop: '24px',
        textAlign: 'center',
        padding: '20px'
      }}>
        <h3 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: '#FF9900',
          marginBottom: '8px'
        }}>
          {slides[currentSlide].title}
        </h3>
        <p style={{
          fontSize: '14px',
          color: '#D1D5DB',
          lineHeight: '1.6'
        }}>
          {slides[currentSlide].description}
        </p>
      </div>

      {/* 점 네비게이션 */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '12px',
        marginTop: '24px'
      }}>
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
            onMouseEnter={(e) => {
              if (index !== currentSlide) {
                (e.target as HTMLButtonElement).style.background = 'rgba(255, 153, 0, 0.6)';
              }
            }}
            onMouseLeave={(e) => {
              if (index !== currentSlide) {
                (e.target as HTMLButtonElement).style.background = 'rgba(255, 153, 0, 0.4)';
              }
            }}
          />
        ))}
      </div>
    </div>
  );
}
