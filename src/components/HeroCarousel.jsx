import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

const images = [
  "/images/hero/carousel/studio-1.jpg",
  "/images/hero/carousel/studio-2.jpg",
  "/images/hero/carousel/studio-3.jpg",
  "/images/hero/carousel/studio-4.jpg",
];

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);

  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

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
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;

    if (distance > minSwipeDistance) nextSlide();
    if (distance < -minSwipeDistance) prevSlide();
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
          style={{ backgroundImage: `url(${img})` }}
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

        <button type="button" className="btn" onClick={scrollToCTA}>
          Prenota una consulenza
        </button>
      </div>
    </section>
  );
}
