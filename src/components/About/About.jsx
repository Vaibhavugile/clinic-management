import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, CheckCircle2, Smile } from "lucide-react";
import SectionHeading from "../SectionHeading";
import "./About.css";

/*
  ABOUT SECTION IMAGE ("A DIFFERENT KIND OF DENTAL EXPERIENCE")
  Photo public/assets/about.png me rakhein. Browser me path "/assets/about.png" rahega.
*/
const ABOUT_IMAGE = "/assets/about.png";

const aboutPoints = [
  {
    title: "Care built around you",
    text: "Understand your options before making treatment decisions.",
  },
  {
    title: "Clear communication",
    text: "Discuss your treatment plan, expected steps and aftercare.",
  },
  {
    title: "Comfortable environment",
    text: "A welcoming space for routine visits and dental consultations.",
  },
];

function About() {
  return (
    <section className="section about-section" data-reveal>
      <div className="container about-grid">
        <div className="about-visual">
          <img
            src={ABOUT_IMAGE}
            alt="Dentist providing care in a modern dental clinic"
            loading="lazy"
          />
          <div className="about-image-note">
            <span className="about-note-icon">
              <Smile size={23} />
            </span>
            <span>
              <strong>Care with a personal touch</strong>
              <small>Your comfort matters to us.</small>
            </span>
          </div>
          <span className="about-image-outline" aria-hidden="true" />
        </div>

        <div className="about-content">
          <SectionHeading
            eyebrow="A DIFFERENT KIND OF DENTAL EXPERIENCE"
            title="More than a dental visit."
            description="We believe a positive dental experience begins with listening, clear communication and care that respects every patient's individual needs."
          />

          <div className="about-points">
            {aboutPoints.map((point) => (
              <div className="about-point" key={point.title}>
                <span>
                  <CheckCircle2 size={19} />
                </span>
                <div>
                  <strong>{point.title}</strong>
                  <p>{point.text}</p>
                </div>
              </div>
            ))}
          </div>

          <Link to="/about" className="btn btn-primary about-button">
            Discover Our Clinic <ArrowUpRight size={17} />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default About;
