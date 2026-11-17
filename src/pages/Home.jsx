import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  CalendarDays,
  Clock3,
  HeartHandshake,
  MapPin,
  Phone,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";

/* Home.css (global styles) sabse pehle import hoti hai, phir har component ki apni CSS */
import "./Home.css";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import Hero from "../components/Hero/Hero";
import Services from "../components/Services/Services";
import About from "../components/About/About";
import Doctors from "../components/Doctors/Doctors";
import Reviews from "../components/Reviews/Reviews";
import Appointment from "../components/Appointment/Appointment";
import FAQ from "../components/FAQ/FAQ";
import SectionHeading from "../components/SectionHeading";
import { CLINIC_NAME } from "../clinicInfo";
import SocialSidebar from "../components/SocialSidebar";
/* Brand band ke logo wala tooth */
function ToothMark({ size = 22 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 5.6c-1.2-1.1-2.9-1.5-4.3-1-2 .7-3.2 2.8-2.9 5.3.3 2.4 1.3 3.6 1.8 5.4.5 1.9.6 4.3 1.6 4.8 1.3.6 1.7-2.3 2.2-3.8.3-.9.7-1.4 1.6-1.4s1.3.5 1.6 1.4c.5 1.5.9 4.4 2.2 3.8 1-.5 1.1-2.9 1.6-4.8.5-1.8 1.5-3 1.8-5.4.3-2.5-.9-4.6-2.9-5.3-1.4-.5-3.1-.1-4.3 1z" />
    </svg>
  );
}

/* BRAND BAND (clinic ke naam ki scrolling patti) */
const BRAND_TREATMENTS = ["Smile Makeover", "Dental Implants", "Root Canal Care", "Teeth Whitening"];

function BrandGroup({ hidden = false }) {
  return (
    <div className="brand-group" aria-hidden={hidden || undefined}>
      {BRAND_TREATMENTS.map((treatment) => (
        <React.Fragment key={treatment}>
          <span className="brand-name">
            <ToothMark size={20} /> {CLINIC_NAME}
          </span>
          <span className="brand-sep" aria-hidden="true">✦</span>
          <span className="brand-treatment">{treatment}</span>
          <span className="brand-sep" aria-hidden="true">✦</span>
        </React.Fragment>
      ))}
    </div>
  );
}

// Seamless loop ke liye 4 same groups (CSS .brand-track -50% tak chalata hai)
function BrandBand() {
  return (
    <section className="brand-band" aria-label={CLINIC_NAME}>
      <div className="brand-track">
        <BrandGroup />
        <BrandGroup hidden />
        <BrandGroup hidden />
        <BrandGroup hidden />
      </div>
    </section>
  );
}

function TrustBar() {
  const items = [
    { icon: HeartHandshake, title: "Patient First", text: "Care tailored to you" },
    { icon: ShieldCheck, title: "Safety Focused", text: "Careful clinical practices" },
    { icon: Stethoscope, title: "Modern Dentistry", text: "Individual treatment plans" },
    { icon: CalendarDays, title: "Easy Booking", text: "Simple appointment requests" },
  ];

  return (
    <section className="trust-bar" data-reveal>
      <div className="container trust-grid">
        {items.map(({ icon: Icon, title, text }) => (
          <div className="trust-item" key={title}>
            <span className="trust-icon">
              <Icon size={23} />
            </span>
            <span>
              <strong>{title}</strong>
              <small>{text}</small>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function WhyChooseUs() {
  return (
    <section className="section why-section" data-reveal>
      <div className="container">
        <SectionHeading
          eyebrow="THE ANAND DIFFERENCE"
          title="Thoughtful care, at every step."
          description="From your first conversation to follow-up guidance, we focus on making your experience clear and comfortable."
          centered
        />

        <div className="why-grid">
          <article className="why-card">
            <span className="why-number">01</span>
            <ShieldCheck size={28} />
            <h3>Care You Can Understand</h3>
            <p>Clear explanations help you make informed decisions about your dental health.</p>
          </article>
          <article className="why-card">
            <span className="why-number">02</span>
            <HeartHandshake size={28} />
            <h3>A Personal Approach</h3>
            <p>Your concerns, comfort and treatment goals are part of the conversation.</p>
          </article>
          <article className="why-card">
            <span className="why-number">03</span>
            <Clock3 size={28} />
            <h3>Convenient Appointments</h3>
            <p>Send a booking request online and let the clinic help coordinate your visit.</p>
          </article>
        </div>
      </div>
    </section>
  );
}

function Gallery() {
  return (
    <section className="section gallery-section" data-reveal>
      <div className="container">
        <div className="gallery-heading-row">
          <SectionHeading
            eyebrow="SMILE STORIES"
            title="Every smile is personal."
            description="Explore our clinic environment and, with patient consent, examples of treatment journeys."
          />
          <Link to="/gallery" className="text-link gallery-view-link">
            View gallery <ArrowUpRight size={17} />
          </Link>
        </div>

        <div className="gallery-grid">
          <Link to="/gallery" className="gallery-card gallery-card-large">
            <img
              src="https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=1000&q=85"
              alt="Dental consultation in a modern clinic"
              loading="lazy"
            />
            <span className="gallery-overlay">
              <small>YOUR DENTAL JOURNEY</small>
              <strong>Personalized care</strong>
              <ArrowUpRight size={22} />
            </span>
          </Link>
          <Link to="/gallery" className="gallery-card">
            <img
              src="https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=800&q=85"
              alt="Dental professional working in a clinical setting"
              loading="lazy"
            />
            <span className="gallery-overlay">
              <small>OUR APPROACH</small>
              <strong>Modern dentistry</strong>
              <ArrowUpRight size={22} />
            </span>
          </Link>
          <Link to="/gallery" className="gallery-card">
            <img
              src="https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=800&q=85"
              alt="Welcoming dental care environment"
              loading="lazy"
            />
            <span className="gallery-overlay">
              <small>OUR CLINIC</small>
              <strong>A welcoming space</strong>
              <ArrowUpRight size={22} />
            </span>
          </Link>
        </div>
        <p className="gallery-disclaimer">
          Images are illustrative. Publish clinical before-and-after cases only with verified
          details and patient consent.
        </p>
      </div>
    </section>
  );
}

function Location() {
  return (
    <section className="location-section" data-reveal>
      <div className="container location-card">
        <div className="location-copy">
          <span className="eyebrow">WE'RE HERE TO HELP</span>
          <h2>Let's talk about your smile.</h2>
          <p>
            Reach out to our team for clinic directions, opening hours or appointment
            assistance.
          </p>
        </div>
        <div className="location-actions">
          <Link to="/contact" className="btn btn-primary">
            <MapPin size={17} /> Find Our Clinic
          </Link>
          <a className="btn btn-light" href="#appointment">
            <Phone size={17} /> Request a Visit
          </a>
        </div>
      </div>
    </section>
  );
}

function Home() {
  // Scroll reveal animation (saare [data-reveal] sections ke liye)
  useEffect(() => {
    const nodes = document.querySelectorAll("[data-reveal]");

    if (!("IntersectionObserver" in window)) {
      nodes.forEach((node) => node.classList.add("is-visible"));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    nodes.forEach((node) => observer.observe(node));

    return () => observer.disconnect();
  }, []);

  return (
    <main className="home-page">
      <Navbar/>
      <Hero />
      <TrustBar />
      <Services />
      <About />
      <WhyChooseUs />
      <BrandBand />
      <Doctors />
      <Gallery />
      <Appointment />
      <Reviews />
      <FAQ />
      <Location />
      <Footer/>
      <SocialSidebar/>
    </main>
    
  );
}

export default Home;