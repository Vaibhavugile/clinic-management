import React, { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Award,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ShieldCheck,
  Stethoscope,
  Users,
} from "lucide-react";
import SectionHeading from "../SectionHeading";
import { CLINIC_SHORT } from "../../clinicInfo";
import "./Doctors.css";

const doctors = [
  {
    name: "Dr. Shrikant Mali",
    role: "Dentist · Dental Surgeon",
    qualification: "BDS",
    years: 17,
    experience: "17 years experience overall",
    verified: true,
    bio: "Experienced in providing good quality dental treatments, from root canal treatment and crowns to teeth alignment and aligners.",
    tags: [
      "Root Canal Treatment",
      "Crowns & Caps (PFM, Zirconia)",
      "Dental Bridges",
      "Esthetic Fillings",
      "Tooth Removal",
      "Scaling & Polishing",
      "Teeth Alignment",
      "Aligners",
    ],
    photo: "/assets/docto1.png",
  },
  {
    name: "Dr. Devyani Mali",
    role: "Dentist · Cosmetic / Aesthetic Dentist",
    qualification: "BDS",
    years: 8,
    experience: "8 years experience overall · 5 years as specialist",
    verified: true,
    bio: "Experienced in providing good quality dental treatments, from root canal treatment and crowns to teeth alignment, aligners and children's dentistry.",
    tags: [
      "Root Canal Treatment",
      "Crowns & Caps (PFM, Zirconia)",
      "Dental Bridges",
      "Esthetic Fillings",
      "Tooth Removal",
      "Scaling & Polishing",
      "Teeth Alignment",
      "Aligners",
      "Children's Dentistry",
    ],
    photo: "/assets/doctor4.png",
  },
];

function CountUp({ to, duration = 1600, instant = false }) {
  const ref = useRef(null);
  const [value, setValue] = useState(instant ? to : 0);

  useEffect(() => {
    if (instant) {
      setValue(to);
      return undefined;
    }

    const node = ref.current;
    if (!node) return undefined;

    const reduceMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      setValue(to);
      return undefined;
    }

    let frame = 0;
    let started = false;

    const run = () => {
      const startTime = performance.now();
      const tick = (now) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(Math.round(to * eased));
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !started) {
            started = true;
            observer.disconnect();
            run();
          }
        });
      },
      { threshold: 0.4 }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [to, duration, instant]);

  return <span ref={ref}>{value}</span>;
}

function DoctorPhoto({ src, name }) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="doctor-photo">
      {failed ? (
        <span className="doctor-photo-fallback" aria-hidden="true">
          <Stethoscope size={42} />
        </span>
      ) : (
        <img
          src={src}
          alt={`Portrait of ${name}`}
          loading="lazy"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}

function Doctors() {
  const [expandedDoctors, setExpandedDoctors] = useState({});

  const totalYears = doctors.reduce((sum, doctor) => sum + doctor.years, 0);
  const treatmentCount = new Set(doctors.flatMap((doctor) => doctor.tags)).size;

  const stats = [
    { icon: Award, value: totalYears, label: "Years of combined experience" },
    { icon: Users, value: doctors.length, label: "Dedicated dentists" },
    { icon: Stethoscope, value: treatmentCount, label: "Treatment areas covered" },
  ];

  const statGroups = [0, 1];

  const toggleDoctor = (name) => {
    setExpandedDoctors((current) => ({
      ...current,
      [name]: !current[name],
    }));
  };

  return (
    <section className="section doctors-section" id="doctors" data-reveal>
      <div className="container">
        <SectionHeading
          centered
          eyebrow="MEET OUR DENTISTS"
          title="The people behind your care."
          description={`Get to know the dentists at ${CLINIC_SHORT}, who will guide you from your first consultation to follow-up care.`}
        />

        <div className="doctors-stats" aria-label="Clinic experience statistics">
          <div className="doctors-stats-track">
            {statGroups.map((group) => (
              <div
                className="doctors-stats-group"
                key={group}
                aria-hidden={group > 0 || undefined}
              >
                {[0, 1].map((copy) =>
                  stats.map((stat) => {
                    const Icon = stat.icon;
                    const isCopy = group > 0 || copy > 0;

                    return (
                      <div className="doctors-stat" key={`${copy}-${stat.label}`}>
                        <span className="doctors-stat-icon">
                          <Icon size={19} />
                        </span>
                        <strong>
                          <CountUp to={stat.value} instant={isCopy} />
                        </strong>
                        <small>{stat.label}</small>
                      </div>
                    );
                  })
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="doctors-grid">
          {doctors.map((doctor, index) => {
            const expanded = Boolean(expandedDoctors[doctor.name]);

            return (
              <article className="doctor-card" key={doctor.name}>
                <div className="doctor-card-top">
                  <div className="doctor-photo-wrap">
                    <DoctorPhoto src={doctor.photo} name={doctor.name} />
                    <span className="doctor-photo-check" aria-label="Verified doctor">
                      <ShieldCheck size={17} />
                    </span>
                  </div>

                  <span className="doctor-role">{doctor.role}</span>
                  <h3>{doctor.name}</h3>
                  <p className="doctor-qualification">
                    <strong>{doctor.qualification}</strong>
                    <span className="doctor-dot" aria-hidden="true">•</span>
                    {doctor.years} years of experience
                  </p>

                  {doctor.verified && (
                    <span className="doctor-verified">
                      <ShieldCheck size={14} /> Medical registration verified
                    </span>
                  )}

                  <p className="doctor-bio">{doctor.bio}</p>
                </div>

                {expanded && (
                  <div className="doctor-extra" id={`doctor-details-${index}`}>
                    <p className="doctor-full-experience">{doctor.experience}</p>
                    <h4>Treatments &amp; expertise</h4>
                    <ul className="doctor-tags" aria-label={`Treatments by ${doctor.name}`}>
                      {doctor.tags.map((tag) => (
                        <li key={tag}>
                          <CheckCircle2 size={14} />
                          <span>{tag}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="doctor-card-actions">
                  <button
                    type="button"
                    className="doctor-read-more"
                    onClick={() => toggleDoctor(doctor.name)}
                    aria-expanded={expanded}
                    aria-controls={`doctor-details-${index}`}
                  >
                    {expanded ? "Read Less" : "Read More"}
                    <ChevronDown
                      size={17}
                      className={expanded ? "doctor-chevron is-open" : "doctor-chevron"}
                    />
                  </button>

                  <a className="doctor-book" href="#appointment">
                    <CalendarDays size={17} />
                    Book Appointment
                    <ArrowRight size={17} className="doctor-book-arrow" />
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Doctors;
