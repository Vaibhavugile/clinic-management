
import React from "react";
import "./SocialSidebar.css";

const WHATSAPP_NUMBER = "919168933375";
const WHATSAPP_MESSAGE =
  "Hello, I would like to book an appointment.";

const INSTAGRAM_URL = "https://www.instagram.com/";

const MAP_URL =
  "https://www.google.com/maps/search/?api=1&query=Abhijeet+Park+Vandev+Nagar+Thergaon+Pimpri-Chinchwad+Pune+411033";

function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle
        cx="12"
        cy="12"
        r="4"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M20.2 11.8a8.2 8.2 0 0 1-12.1 7.1L3 20l1.2-4.8A8.2 8.2 0 1 1 20.2 11.8Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.5 7.8c.3-.6.6-.6 1-.6h.4c.2 0 .4.1.5.4l.8 1.8c.1.3.1.5-.1.7l-.7.8c-.2.2-.2.4 0 .7.5.9 1.3 1.7 2.2 2.2.3.2.5.2.7-.1l.9-1c.2-.2.4-.3.7-.2l1.8.9c.3.1.4.3.4.5 0 .5-.2 1.2-.7 1.6-.5.5-1.2.7-1.9.6-1.2-.2-2.7-.9-4.1-2.2-1.4-1.3-2.3-2.8-2.5-4-.1-.8.1-1.5.6-2.1Z"
        fill="currentColor"
      />
    </svg>
  );
}

function MapsIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 21s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle
        cx="12"
        cy="9"
        r="2.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

const links = [
  {
    key: "instagram",
    label: "Follow on Instagram",
    href: INSTAGRAM_URL,
    icon: <InstagramIcon />,
  },
  {
    key: "whatsapp",
    label: "Chat on WhatsApp",
    href: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      WHATSAPP_MESSAGE
    )}`,
    icon: <WhatsAppIcon />,
  },
  {
    key: "map",
    label: "Find our clinic",
    href: MAP_URL,
    icon: <MapsIcon />,
  },
];

function SocialSidebar() {
  return (
    <nav
      className="social-sidebar"
      aria-label="Social and clinic location links"
    >
      {links.map((item) => (
        <a
          key={item.key}
          className={`social-sidebar__link social-sidebar__link--${item.key}`}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={item.label}
          title={item.label}
        >
          <span className="social-sidebar__icon">
            {item.icon}
          </span>

          <span className="social-sidebar__label">
            {item.label}
          </span>
        </a>
      ))}
    </nav>
  );
}

export default SocialSidebar;
