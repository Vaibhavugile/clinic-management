import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronDown } from "lucide-react";
import "./FAQ.css";

const faqs = [
  {
    question: "How can I book a dental appointment?",
    answer:
      "Use the appointment form on this page or contact the clinic by phone or WhatsApp. The clinic will confirm your appointment.",
  },
  {
    question: "What should I bring to my first visit?",
    answer:
      "Bring any relevant dental records, a list of medicines you take and previous X-rays if available. The clinic can advise you about any additional requirements.",
  },
  {
    question: "Do you offer different dental treatments?",
    answer:
      "Treatment options depend on your individual dental needs. Explore our services and book an assessment to discuss suitable options with a dentist.",
  },
  {
    question: "Can I reschedule my appointment?",
    answer:
      "Contact the clinic directly to request a new date or time. Changes are subject to the clinic's availability and confirmation.",
  },
];

function FAQ() {
  const [activeFaq, setActiveFaq] = useState(0);

  return (
    <section className="section faq-section" data-reveal>
      <div className="container faq-grid">
        <div className="faq-intro">
          <span className="eyebrow">GOOD TO KNOW</span>
          <h2>Your questions, answered.</h2>
          <p>Find answers to common questions before planning your visit.</p>
          <Link to="/contact" className="text-link">
            Still have questions? Contact us <ArrowRight size={17} />
          </Link>
        </div>

        <div className="faq-list">
          {faqs.map((faq, index) => (
            <article
              className={`faq-item ${activeFaq === index ? "faq-item-open" : ""}`}
              key={faq.question}
            >
              <button
                type="button"
                className="faq-question"
                aria-expanded={activeFaq === index}
                onClick={() => setActiveFaq(activeFaq === index ? -1 : index)}
              >
                <span>{faq.question}</span>
                <ChevronDown size={19} />
              </button>
              {activeFaq === index && <p className="faq-answer">{faq.answer}</p>}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FAQ;
