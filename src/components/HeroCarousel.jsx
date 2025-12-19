import { useEffect, useState } from "react";

const images = [
  "/images/hero/carousel/studio-1.jpg",
  "/images/hero/carousel/studio-2.jpg",
  "/images/hero/carousel/studio-3.jpg",
  "/images/hero/carousel/studio-4.jpg",
];

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  const scrollToCTA = () => {
    const cta = document.querySelector(".chi-cta");
    cta?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="hero-carousel">
      {images.map((img, i) => (
        <div
          key={i}
          className={`hero-slide ${i === index ? "active" : ""}`}
          style={{ backgroundImage: `url(${img})` }}
        />
      ))}

      <div className="hero-overlay">
        <h1>FisioFitness</h1>
        <p>Fisioterapia & Allenamento Personalizzato</p>

        <button
          type="button"
          className="btn"
          aria-label="scorri alla sezione prenota una consulenza"
          onClick={scrollToCTA}
        >
          Prenota una consulenza
        </button>
      </div>
    </section>
  );
}
