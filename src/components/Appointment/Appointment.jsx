import React, { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ArrowRight, CalendarDays, HeartHandshake, LoaderCircle } from "lucide-react";
import { db } from "../../firebase";
import "./Appointment.css";

const initialForm = {
  name: "",
  phone: "",
  email: "",
  treatment: "",
  date: "",
  message: "",
};

// Firestore offline hone par forever wait karta hai, isliye 15 second baad give up.
const withTimeout = (promise, ms = 15000) =>
  Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), ms)),
  ]);

function Appointment() {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [bookingMessage, setBookingMessage] = useState("");
  const [bookingError, setBookingError] = useState(false);

  const updateForm = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleBooking = async (event) => {
    event.preventDefault();
    if (submitting) return;

    setBookingMessage("");
    setBookingError(false);

    if (!form.name.trim() || !form.phone.trim() || !form.date || !form.treatment) {
      setBookingError(true);
      setBookingMessage("Please complete all required fields.");
      return;
    }

    const selectedDate = new Date(`${form.date}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (Number.isNaN(selectedDate.getTime()) || selectedDate < today) {
      setBookingError(true);
      setBookingMessage("Please select today or a future date.");
      return;
    }

    setSubmitting(true);

    try {
      // Saves to Firestore -> collection "appointments"
      const docRef = await withTimeout(
        addDoc(collection(db, "appointments"), {
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          treatment: form.treatment,
          date: form.date,
          message: form.message.trim(),
          status: "new",
          createdAt: serverTimestamp(),
        })
      );

      const reference = `APT-${docRef.id.slice(0, 6).toUpperCase()}`;

      setForm(initialForm);
      setBookingMessage(
        `Your request has been submitted. Reference: ${reference}. The clinic will contact you to confirm your appointment.`
      );
    } catch (error) {
      console.error("Appointment submission failed:", error);
      setBookingError(true);
      setBookingMessage(
        "We couldn't submit your request. Please try again or call the clinic directly on 091689 33375."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="section appointment-section" id="appointment" data-reveal>
      <div className="container appointment-grid">
        <div className="appointment-copy">
          <span className="eyebrow eyebrow-light">LET'S START WITH A CONVERSATION</span>
          <h2>A healthier smile starts here.</h2>
          <p>
            Tell us what you need. Our clinic team will contact you to discuss
            availability and confirm your appointment.
          </p>

          <div className="appointment-contact">
            <span className="appointment-contact-icon">
              <CalendarDays size={22} />
            </span>
            <span>
              <strong>Request your appointment</strong>
              <small>Choose your preferred date and treatment.</small>
            </span>
          </div>
          <div className="appointment-contact">
            <span className="appointment-contact-icon">
              <HeartHandshake size={22} />
            </span>
            <span>
              <strong>Get personal assistance</strong>
              <small>We'll help you with the next steps.</small>
            </span>
          </div>
        </div>

        <form className="appointment-form" onSubmit={handleBooking}>
          <div className="form-heading">
            <span className="form-heading-icon">
              <CalendarDays size={21} />
            </span>
            <div>
              <h3>Book an Appointment</h3>
              <p>Fields marked * are required.</p>
            </div>
          </div>

          <div className="form-grid">
            <label className="form-field">
              Full name *
              <input
                name="name"
                value={form.name}
                onChange={updateForm}
                placeholder="Enter your full name"
                autoComplete="name"
                maxLength={100}
                required
              />
            </label>

            <label className="form-field">
              Phone number *
              <input
                name="phone"
                type="tel"
                value={form.phone}
                onChange={updateForm}
                placeholder="Your contact number"
                autoComplete="tel"
                inputMode="tel"
                maxLength={20}
                required
              />
            </label>

            <label className="form-field form-field-full">
              Email address
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={updateForm}
                placeholder="you@example.com"
                autoComplete="email"
                maxLength={150}
              />
            </label>

            <label className="form-field">
              Preferred treatment *
              <select name="treatment" value={form.treatment} onChange={updateForm} required>
                <option value="">Select treatment</option>
                <option value="General Consultation">General Consultation</option>
                <option value="Dental Implants">Dental Implants</option>
                <option value="Root Canal">Root Canal</option>
                <option value="Teeth Whitening">Teeth Whitening</option>
                <option value="Braces and Aligners">Braces &amp; Aligners</option>
                <option value="Smile Makeover">Smile Makeover</option>
                <option value="Other">Other</option>
              </select>
            </label>

            <label className="form-field">
              Preferred date *
              <input
                name="date"
                type="date"
                value={form.date}
                onChange={updateForm}
                min={new Date().toLocaleDateString("en-CA")}
                required
              />
            </label>

            <label className="form-field form-field-full">
              Message (optional)
              <textarea
                name="message"
                value={form.message}
                onChange={updateForm}
                placeholder="Anything you'd like us to know?"
                rows={3}
                maxLength={500}
              />
            </label>
          </div>

          <button className="btn btn-primary form-submit" type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <LoaderCircle size={18} className="spin-icon" /> Submitting...
              </>
            ) : (
              <>
                Request Appointment <ArrowRight size={18} />
              </>
            )}
          </button>

          {bookingMessage && (
            <div
              className={`booking-message ${
                bookingError ? "booking-message-error" : "booking-message-success"
              }`}
              role="status"
            >
              {bookingMessage}
            </div>
          )}

          <p className="form-privacy">
            Your request is subject to clinic confirmation. Please do not include sensitive
            medical information in this form.
          </p>
        </form>
      </div>
    </section>
  );
}

export default Appointment;
