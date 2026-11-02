import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, StarSolid } from "iconoir-react";

export interface CarouselSlide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  accent: string;
  imageUrl: string;
  fallbackImage?: string;
  imageAlt?: string;
  imageFit?: "cover" | "contain";
  href: string;
  meta: string;
  rating: number;
  reviews: number;
  badge?: string;
}

interface ElegantCarouselProps {
  slides: CarouselSlide[];
}

const SLIDE_DURATION = 6000;
const TRANSITION_DURATION = 800;

export default function ElegantCarousel({ slides }: ElegantCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const transitionRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const goToSlide = useCallback(
    (index: number) => {
      if (isTransitioning || index === currentIndex) return;
      setIsTransitioning(true);
      setProgress(0);

      if (transitionRef.current) clearTimeout(transitionRef.current);
      transitionRef.current = setTimeout(() => {
        setCurrentIndex(index);
        transitionRef.current = setTimeout(
          () => setIsTransitioning(false),
          50,
        );
      }, TRANSITION_DURATION / 2);
    },
    [isTransitioning, currentIndex],
  );

  const goNext = useCallback(() => {
    goToSlide((currentIndex + 1) % slides.length);
  }, [currentIndex, goToSlide, slides.length]);

  const goPrev = useCallback(() => {
    goToSlide((currentIndex - 1 + slides.length) % slides.length);
  }, [currentIndex, goToSlide, slides.length]);

  const isAutoPlaying = !isPaused && !isHovered && !isFocused;

  useEffect(() => {
    if (!isAutoPlaying) return;

    progressRef.current = setInterval(() => {
      setProgress((prev) => Math.min(prev + 100 / (SLIDE_DURATION / 50), 100));
    }, 50);

    intervalRef.current = setInterval(goNext, SLIDE_DURATION);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [currentIndex, isAutoPlaying, goNext]);

  useEffect(() => {
    slides.forEach((slide) => {
      const image = new Image();
      image.src = slide.imageUrl;
    });
  }, [slides]);

  useEffect(
    () => () => {
      if (transitionRef.current) clearTimeout(transitionRef.current);
    },
    [],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") goPrev();
      if (event.key === "ArrowRight") goNext();
    };
    const wrapper = wrapperRef.current;
    wrapper?.addEventListener("keydown", onKeyDown);
    return () => wrapper?.removeEventListener("keydown", onKeyDown);
  }, [goNext, goPrev]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 60) {
      if (diff > 0) goNext();
      else goPrev();
    }
  };

  const handleImageError = (
    event: React.SyntheticEvent<HTMLImageElement>,
    fallback?: string,
  ) => {
    if (!fallback) return;
    const img = event.currentTarget;
    if (img.src !== fallback) img.src = fallback;
  };

  const currentSlide = slides[currentIndex];

  return (
    <div
      ref={wrapperRef}
      className="carousel-wrapper"
      role="region"
      aria-label="Véhicules à la une"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocusCapture={() => setIsFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
          setIsFocused(false);
        }
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background accent wash */}
      <div
        className="carousel-bg-wash"
        style={{
          background: `radial-gradient(ellipse at 70% 50%, ${currentSlide.accent}18 0%, transparent 70%)`,
        }}
      />

      <div className="carousel-inner">
        {/* Left: Text Content */}
        <div className="carousel-content">
          <div className="carousel-content-inner">
            <div
              className={`carousel-collection-num ${isTransitioning ? "transitioning" : "visible"}`}
            >
              <span className="carousel-num-line" />
              <span className="carousel-num-text">
                {String(currentIndex + 1).padStart(2, "0")} /{" "}
                {String(slides.length).padStart(2, "0")}
              </span>
            </div>

            <h4
              className={`carousel-title ${isTransitioning ? "transitioning" : "visible"}`}
            >
              {currentSlide.title}
            </h4>

            <p
              className={`carousel-subtitle ${isTransitioning ? "transitioning" : "visible"}`}
              style={{ color: currentSlide.accent }}
            >
              {currentSlide.subtitle}
            </p>

            <p
              className={`carousel-description ${isTransitioning ? "transitioning" : "visible"}`}
            >
              {currentSlide.description}
            </p>

            <div
              className={`carousel-meta ${isTransitioning ? "transitioning" : "visible"}`}
            >
              <span className="carousel-rating">
                <StarSolid aria-hidden="true" />
                <span className="tabular-nums">
                  {currentSlide.rating.toFixed(1)}
                </span>
                <span className="sr-only">sur 5</span>
                <span aria-hidden="true">
                  ({currentSlide.reviews} avis)
                </span>
              </span>
              <span aria-hidden="true" className="carousel-meta-dot" />
              <span className="carousel-meta-text">{currentSlide.meta}</span>
            </div>

            <div
              className={`carousel-actions ${isTransitioning ? "transitioning" : "visible"}`}
            >
              <Link className="carousel-cta" to={currentSlide.href}>
                Découvrir
                <ArrowRight aria-hidden="true" />
              </Link>

              <div className="carousel-nav-arrows">
                <button
                  onClick={goPrev}
                  className="carousel-arrow-btn"
                  aria-label="Véhicule précédent"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    aria-hidden="true"
                  >
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={goNext}
                  className="carousel-arrow-btn"
                  aria-label="Véhicule suivant"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    aria-hidden="true"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Image */}
        <div className="carousel-image-container">
          <div
            className={`carousel-image-frame ${isTransitioning ? "transitioning" : "visible"}`}
          >
            <img
              src={currentSlide.imageUrl}
              onError={(event) =>
                handleImageError(event, currentSlide.fallbackImage)
              }
              alt={currentSlide.imageAlt ?? currentSlide.title}
              className={`carousel-image ${currentSlide.imageFit === "contain" ? "carousel-image--contain" : ""}`}
              style={{
                objectFit: currentSlide.imageFit ?? "cover",
              }}
              loading="eager"
              decoding="async"
              width={960}
              height={720}
            />
            <div
              className="carousel-image-overlay"
              style={{
                background: `linear-gradient(135deg, ${currentSlide.accent}22 0%, transparent 50%)`,
              }}
            />
            {currentSlide.badge && (
              <span className="carousel-badge">{currentSlide.badge}</span>
            )}
          </div>

          <div
            className="carousel-frame-corner carousel-frame-corner--tl"
            style={{ borderColor: currentSlide.accent }}
            aria-hidden="true"
          />
          <div
            className="carousel-frame-corner carousel-frame-corner--br"
            style={{ borderColor: currentSlide.accent }}
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Progress Indicators */}
      <div className="carousel-progress-bar">
        <div className="carousel-progress-items">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              onClick={() => goToSlide(index)}
              className={`carousel-progress-item ${index === currentIndex ? "active" : ""}`}
              aria-label={`Aller à ${slide.title}`}
              aria-current={index === currentIndex ? "true" : undefined}
            >
              <div className="carousel-progress-track">
                <div
                  className="carousel-progress-fill"
                  style={{
                    transform: `scaleX(${
                      index === currentIndex
                        ? progress / 100
                        : index < currentIndex
                          ? 1
                          : 0
                    })`,
                    backgroundColor:
                      index === currentIndex
                        ? currentSlide.accent
                        : undefined,
                  }}
                />
              </div>
              <span className="carousel-progress-label">{slide.title}</span>
            </button>
          ))}
        </div>

        <button
          type="button"
          className="carousel-pause-btn"
          onClick={() => setIsPaused((paused) => !paused)}
          aria-pressed={isPaused}
          aria-label={
            isPaused ? "Reprendre le défilement" : "Mettre en pause le défilement"
          }
        >
          {isPaused ? (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          ) : (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          )}
        </button>
      </div>

      <span className="sr-only" aria-live="polite">
        {currentSlide.title}
      </span>
    </div>
  );
}
