import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowUp,
  ArrowUpRight,
  MapPin,
  Phone,
  Mail,
  Clock3,
} from "lucide-react";
import "./Footer.css";

function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="site-footer">
      {/* CTA CARD */}
      <div className="container footer-cta">
        <div className="footer-cta-copy">
          <span className="footer-eyebrow">YOUR SMILE, OUR CARE</span>
          <h2>Ready for a healthier, more confident smile?</h2>
        </div>
        <Link to="/#appointment" className="btn btn-primary footer-cta-button">
          Book Appointment <ArrowUpRight size={17} />
        </Link>
      </div>

      {/* MAIN */}
      <div className="container footer-main">
        <div className="footer-brand-column">
          <Link
            to="/"
            className="brand footer-brand"
            aria-label="Anand Dental Clinic and Implant Center - Home"
          >
            <span className="brand-icon" aria-hidden="true">
              <svg
                className="brand-tooth"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 5.6c-1.2-1.1-2.9-1.5-4.3-1-2 .7-3.2 2.8-2.9 5.3.3 2.4 1.3 3.6 1.8 5.4.5 1.9.6 4.3 1.6 4.8 1.3.6 1.7-2.3 2.2-3.8.3-.9.7-1.4 1.6-1.4s1.3.5 1.6 1.4c.5 1.5.9 4.4 2.2 3.8 1-.5 1.1-2.9 1.6-4.8.5-1.8 1.5-3 1.8-5.4.3-2.5-.9-4.6-2.9-5.3-1.4-.5-3.1-.1-4.3 1z" />
              </svg>
            </span>
            <span className="brand-copy">
              <strong>Anand Dental Clinic</strong>
              <small>&amp; IMPLANT CENTER</small>
            </span>
          </Link>

          <p>
            Thoughtful dental care and personalized guidance for a healthier,
            more confident smile.
          </p>
        </div>

        <nav className="footer-column" aria-label="Explore">
          <h3>Explore</h3>
          <Link to="/">Home</Link>
          <Link to="/about">About Us</Link>
          <Link to="/treatments">Our Treatments</Link>
          <Link to="/gallery">Smile Gallery</Link>
          <Link to="/blog">Dental Tips</Link>
        </nav>

        <nav className="footer-column" aria-label="Patient care">
          <h3>Patient Care</h3>
          <Link to="/#appointment">Book Appointment</Link>
          <Link to="/contact">Contact Clinic</Link>
          <Link to="/#testimonials">Patient Feedback</Link>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Use</Link>
        </nav>

        <div className="footer-column footer-contact">
          <h3>Get in Touch</h3>
          <p>
            <span className="footer-contact-icon">
              <MapPin size={16} />
            </span>
            <a
              href="https://www.google.com/maps/search/?api=1&query=Abhijeet+Park+Vandev+Nagar+Thergaon+Pimpri-Chinchwad+Pune+411033"
              target="_blank"
              rel="noreferrer"
            >
              Shop no. 6, Abhijeet Park, Vandev Nagar, Thergaon,
              <br />
              Pimpri-Chinchwad, Pune, Maharashtra 411033
            </a>
          </p>
          <p>
            <span className="footer-contact-icon">
              <Phone size={16} />
            </span>
            <a href="tel:+919168933375">091689 33375</a>
          </p>
          <p>
            <span className="footer-contact-icon">
              <Mail size={16} />
            </span>
            <span>Add your clinic email</span>
          </p>
          <p>
            <span className="footer-contact-icon">
              <Clock3 size={16} />
            </span>
            <span>
              Mon–Sat: 9:30 am–1:30 pm, 5:30–9 pm
              <br />
              Sunday: Closed
            </span>
          </p>
        </div>
      </div>

      {/* BOTTOM */}
      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>
            © {new Date().getFullYear()} Anand Dental Clinic &amp; Implant
            Center. All rights reserved.
          </p>
          <button
            type="button"
            className="footer-top-button"
            onClick={scrollToTop}
            aria-label="Back to top"
          >
            Back to top <ArrowUp size={16} />
          </button>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
