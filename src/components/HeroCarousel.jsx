import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

const images = [
  { src: "/images/hero/carousel/studio-1.jpg", position: "center " },
  { src: "/images/hero/carousel/studio-2.jpg", position: "center" },
  { src: "/images/hero/carousel/studio-3.jpg", position: "center" },
  { src: "/images/hero/carousel/studio-4.jpg", position: "center 10%" },
];

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);

  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isSwiping, setIsSwiping] = useState(false);

  const minSwipeDistance = 50;

  const nextSlide = () => {
    setIndex((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  // autoplay
  useEffect(() => {
    const interval = setInterval(nextSlide, 4500);
    return () => clearInterval(interval);
  }, []);

  // swipe
  const onTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
    setTouchEnd(null);
    setIsSwiping(true);
  };

  const onTouchMove = (e) => {
    if (!isSwiping) return;
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      setIsSwiping(false);
      return;
    }

    const distance = touchStart - touchEnd;

    if (distance > minSwipeDistance) {
      nextSlide();
    } else if (distance < -minSwipeDistance) {
      prevSlide();
    }

    setIsSwiping(false);
  };
  const scrollToCTA = () => {
    document.querySelector(".chi-cta")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      className="hero-carousel"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* SLIDES */}
      {images.map((img, i) => (
        <div
          key={i}
          className={`hero-slide ${i === index ? "active" : ""}`}
          style={{
            backgroundImage: `url(${img.src})`,
            backgroundPosition: img.position,
          }}
        />
      ))}

      {/* FRECCE DESKTOP */}
      <button
        className="hero-arrow hero-arrow-left"
        onClick={prevSlide}
        aria-label="immagine precedente"
      >
        <FontAwesomeIcon icon={faChevronLeft} />
      </button>

      <button
        className="hero-arrow hero-arrow-right"
        onClick={nextSlide}
        aria-label="immagine successiva"
      >
        <FontAwesomeIcon icon={faChevronRight} />
      </button>

      {/* OVERLAY */}
      <div className="hero-overlay">
        <h1>FisioFitness</h1>
        <p>Fisioterapia & Allenamento Personalizzato</p>

        <button
          type="button"
          className="btn hero-book-btn"
          onClick={scrollToCTA}
        >
          <strong>Prenota consulenza</strong>
        </button>
      </div>
    </section>
  );
}
