import React from "react";
import { ArrowRight, ArrowUpRight, CheckCircle2, Sparkles } from "lucide-react";
import "./Hero.css";

/*
  HERO BACKGROUND IMAGE
  Image public/assets/hero.png me rakhi hai. Browser me path "/assets/hero.png" hota hai.
*/
const HERO_IMAGE = "/assets/hero.png";

function Hero() {
  return (
    <section className="hero">
      <div
        className="hero-background"
        style={{ backgroundImage: `url("${HERO_IMAGE}")` }}
        aria-hidden="true"
      />
      <div className="hero-overlay" aria-hidden="true" />

      <div className="hero-content container">
        <div className="hero-copy">
          <span className="hero-eyebrow">
            <span className="eyebrow-line" />
            PERSONALIZED DENTAL CARE · THERGAON, PUNE
          </span>

          <h1>
            Your smile.
            <br />
            <span>Our passion.</span>
            <br />
            Your confidence.
          </h1>

          <p className="hero-description">
            Thoughtful dental care, modern treatment options and a welcoming
            experience designed around your smile.
          </p>

          <div className="hero-actions">
            <a href="#appointment" className="btn btn-primary">
              Book an Appointment <ArrowUpRight size={18} />
            </a>
            <a href="#services" className="btn btn-outline">
              Explore Treatments <ArrowRight size={17} />
            </a>
          </div>

          <div className="hero-trust">
            <span>
              <CheckCircle2 size={16} /> Personalized care
            </span>
            <span>
              <CheckCircle2 size={16} /> Modern facilities
            </span>
          </div>
        </div>

        <a href="#services" className="hero-scroll" aria-label="Scroll to treatments">
          <span>SCROLL TO DISCOVER</span>
          <span className="hero-scroll-line" />
        </a>

        <div className="hero-image-caption">
          <span className="caption-icon">
            <Sparkles size={17} />
          </span>
          <span>
            <strong>A reason to smile.</strong>
            <small>Care that starts with you.</small>
          </span>
        </div>
      </div>
    </section>
  );
}

export default Hero;
