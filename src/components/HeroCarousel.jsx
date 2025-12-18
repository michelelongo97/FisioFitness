import { useEffect, useState } from "react";

const images = [
  "/images/hero/carousel/studio-1.jpeg",
  "/images/hero/carousel/studio-2.jpeg",
  "/images/hero/carousel/studio-3.jpeg",
  "/images/hero/carousel/studio-4.jpeg",
];

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

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
          className="btn"
          onClick={() => {
            document
              .querySelector(".chi-cta")
              ?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          Prenota una consulenza
        </button>
      </div>
    </section>
  );
}
