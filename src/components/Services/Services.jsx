import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, ShieldCheck, Smile, Sparkles, Stethoscope } from "lucide-react";
import SectionHeading from "../SectionHeading";
import "./Services.css";

const services = [
  {
    number: "01",
    icon: Sparkles,
    title: "Smile Makeover",
    description: "Personalized cosmetic treatments designed around your smile and goals.",
    href: "/treatments/smile-makeover",
  },
  {
    number: "02",
    icon: ShieldCheck,
    title: "Dental Implants",
    description: "Explore tooth-replacement options with a personalized dental assessment.",
    href: "/treatments/dental-implants",
  },
  {
    number: "03",
    icon: Stethoscope,
    title: "Root Canal Care",
    description: "Assessment and treatment planning focused on preserving natural teeth.",
    href: "/treatments/root-canal",
  },
  {
    number: "04",
    icon: Smile,
    title: "Teeth Whitening",
    description: "Professional advice on options for a brighter, confident-looking smile.",
    href: "/treatments/teeth-whitening",
  },
];

function Services() {
  return (
    <section className="section services-section" id="services" data-reveal>
      <div className="container">
        <SectionHeading
          eyebrow="WHAT WE OFFER"
          title="Care for every kind of smile."
          description="Discover dental services designed around your needs, comfort and long-term oral health."
          centered
        />

        <div className="services-grid">
          {services.map((service) => {
            const Icon = service.icon;

            return (
              <article className="service-card" key={service.number}>
                <div className="service-card-top">
                  <span className="service-number">{service.number}</span>
                  <span className="service-icon">
                    <Icon size={25} />
                  </span>
                </div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <Link to={service.href} className="service-link">
                  Discover treatment <ArrowUpRight size={17} />
                </Link>
              </article>
            );
          })}
        </div>

        <div className="services-bottom">
          <Link to="/treatments" className="text-link">
            Explore all treatments <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Services;
