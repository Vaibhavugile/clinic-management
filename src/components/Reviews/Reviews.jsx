import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, Star } from "lucide-react";
import SectionHeading from "../SectionHeading";
import { CLINIC_WHATSAPP } from "../../clinicInfo";
import "./Reviews.css";

/*
  GOOGLE REVIEWS
  GOOGLE_REVIEWS_URL: clinic ka Google Maps listing.
  GOOGLE_WRITE_REVIEW_URL: seedha "Write a review" link. Khali ho to listing page khulega.
*/
const GOOGLE_REVIEWS_URL =
  "https://www.google.com/maps/search/?api=1&query=Anand+Dental+Clinic+and+Implant+Center+Thergaon+Pune";
const GOOGLE_WRITE_REVIEW_URL = ""; // TODO: apna Google review link yahan paste karein

const initialReviewForm = {
  name: "",
  rating: 0,
  text: "",
  consent: false,
};

/*
  PATIENT REVIEWS (REAL - Google se)
  Naya review jodne ke liye ek aur object add karein:
  { name: "Rahul K.", rating: 5, text: "...", date: "Sep 2026", source: "Google review" }
  - date optional, source optional (default "Patient review").
*/
const patientReviews = [
  {
    name: "Swapnali Patil",
    rating: 5, // TODO: Google par jo star the wahi confirm karein
    text: "Amazing experience for my child! We visited the clinic for my son's dental treatment, and I was so worried about how he would handle it. Thankfully, the doctor has incredible patience and a very calming presence. They handled him so gently, keeping him engaged and comfortable throughout the entire procedure. He didn't even cry once! The entire staff is friendly, polite, and wonderful with kids. Highly recommend this clinic to all parents!",
    date: "", // TODO: Google par review ki date (jaise "Sep 2026")
    source: "Google review",
  },
  {
    name: "Sushma Baviskar",
    rating: 5, // TODO: Google par jo star the wahi confirm karein
    text: "We have been visiting this dental clinic for more than 10 years, and our experience has always been excellent. The doctor couple is extremely smart, confident, polite, and positive. They explain every dental issue very clearly and make sure patients fully understand the problem and the treatment plan. What we truly appreciate is the way they take care of the patient's comfort. They are especially wonderful with children. They have treated both my daughters with great care and patience, and always send them back home with happy faces. We are truly grateful for their dedication and highly recommend their clinic to anyone looking for trustworthy and compassionate dental care. 🦷😊",
    date: "",
    source: "Google review",
  },
  {
    name: "Bhavika Surana",
    rating: 5, // TODO: Google par jo star the wahi confirm karein
    text: "I had a really great experience with Anand Dental clinic. The entire process was smooth and handled with a lot of care and professionalism. The clinic is clean, well-maintained, and the staff is very supportive. I'm very happy with the overall experience and would highly recommend them to anyone looking for quality dental care.",
    date: "",
    source: "Google review",
  },
];

function StarRow({ rating, size = 18 }) {
  return (
    <span className="star-row" role="img" aria-label={`Rated ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          fill={star <= Math.round(rating) ? "currentColor" : "none"}
          className={star <= Math.round(rating) ? "" : "star-empty"}
        />
      ))}
    </span>
  );
}

function Reviews() {
  const reviews = patientReviews;
  const [reviewForm, setReviewForm] = useState(initialReviewForm);
  const [reviewMessage, setReviewMessage] = useState("");
  const [reviewError, setReviewError] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const reviewNameRef = useRef(null);
  const reviewTriggerRef = useRef(null);

  // Rating summary (average + count per star)
  const reviewCount = reviews.length;
  const averageRating = reviewCount
    ? reviews.reduce((sum, item) => sum + item.rating, 0) / reviewCount
    : 0;
  const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((item) => item.rating === star).length;
    return { star, count, percent: reviewCount ? (count / reviewCount) * 100 : 0 };
  });

  // Review popup: Esc se band, background scroll lock, focus wapas button par
  useEffect(() => {
    if (!reviewOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") setReviewOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusTimer = window.setTimeout(() => {
      if (reviewNameRef.current) reviewNameRef.current.focus();
    }, 60);

    const trigger = reviewTriggerRef.current;

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(focusTimer);
      if (trigger) trigger.focus();
    };
  }, [reviewOpen]);

  const updateReviewField = (event) => {
    const { name, value, type, checked } = event.target;
    setReviewForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  };

  const openReviewForm = () => {
    setReviewMessage("");
    setReviewError(false);
    setReviewOpen(true);
  };

  const showReviewMessage = (message, isError = false) => {
    setReviewError(isError);
    setReviewMessage(message);
  };

  // Review WhatsApp par clinic ko bhejo
  const sendReviewOnWhatsApp = (event) => {
    event.preventDefault();

    const name = reviewForm.name.trim();
    const text = reviewForm.text.trim();

    if (!name || reviewForm.rating < 1) {
      showReviewMessage("Please enter your name and choose a star rating.", true);
      return;
    }

    if (text.length < 10) {
      showReviewMessage("Please write a few words about your visit (at least 10 characters).", true);
      return;
    }

    if (!reviewForm.consent) {
      showReviewMessage("Please tick the box to allow the clinic to display your review.", true);
      return;
    }

    const message = [
      "New patient review for the website",
      `Rating: ${reviewForm.rating}/5`,
      `Name: ${name}`,
      `Review: ${text}`,
      "The patient agrees that the clinic may display this review on the website.",
    ].join("\n");

    window.open(
      `https://wa.me/${CLINIC_WHATSAPP}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer"
    );

    setReviewForm(initialReviewForm);
    showReviewMessage("WhatsApp has opened with your review. Press send to share it with the clinic.");
  };

  return (
    <>
      <section className="section testimonials-section" id="testimonials" data-reveal>
        <div className="container">
          <SectionHeading
            eyebrow="PATIENT EXPERIENCES"
            title="Hear it from our patients."
            description="Read what patients say about visiting the clinic, or share your own experience."
            centered
          />

          <div className="reviews-layout">
            {/* Rating summary */}
            <aside className="reviews-summary">
              <strong className="reviews-score">
                {reviewCount ? averageRating.toFixed(1) : "–"}
              </strong>
              <StarRow rating={averageRating} size={20} />
              <span className="reviews-count">
                {reviewCount
                  ? `Based on ${reviewCount} patient review${reviewCount > 1 ? "s" : ""}`
                  : "No reviews yet"}
              </span>

              <ul className="reviews-bars" aria-label="Rating breakdown">
                {ratingBreakdown.map((row) => (
                  <li key={row.star}>
                    <span className="reviews-bar-label">
                      {row.star} <Star size={12} fill="currentColor" />
                    </span>
                    <span className="reviews-bar-track">
                      <span className="reviews-bar-fill" style={{ width: `${row.percent}%` }} />
                    </span>
                    <span className="reviews-bar-count">{row.count}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                className="btn btn-primary reviews-write-btn"
                onClick={openReviewForm}
                ref={reviewTriggerRef}
              >
                Write a review <ArrowUpRight size={17} />
              </button>
            </aside>

            {/* Review cards */}
            <div className="reviews-list">
              {reviews.length ? (
                reviews.map((item, index) => (
                  <article className="review-card" key={`${item.name}-${index}`}>
                    <div className="review-card-top">
                      <StarRow rating={item.rating} size={16} />
                      {item.date && <small>{item.date}</small>}
                    </div>
                    <p className="review-card-text">“{item.text}”</p>
                    <div className="review-card-author">
                      <span className="review-avatar" aria-hidden="true">
                        {item.name.trim().charAt(0).toUpperCase()}
                      </span>
                      <span>
                        <strong>{item.name}</strong>
                        <small>{item.source || "Patient review"}</small>
                      </span>
                    </div>
                  </article>
                ))
              ) : (
                <div className="review-card review-card-empty">
                  <h3>Be the first to share your experience.</h3>
                  <p>Visited the clinic? Tell others how it went.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* WRITE A REVIEW POPUP */}
      {reviewOpen && (
        <div
          className="review-modal"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setReviewOpen(false);
          }}
        >
          <div
            className="review-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-dialog-title"
          >
            <button
              type="button"
              className="review-close"
              aria-label="Close"
              onClick={() => setReviewOpen(false)}
            >
              <span aria-hidden="true">&times;</span>
            </button>

            <form className="review-form" onSubmit={sendReviewOnWhatsApp} noValidate>
              <div className="form-heading">
                <span className="form-heading-icon">
                  <Star size={21} />
                </span>
                <div>
                  <h3 id="review-dialog-title">Write a review</h3>
                  <p>Share your experience with the clinic.</p>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-field form-field-full">
                  <span id="review-rating-label">Your rating *</span>
                  <div className="review-stars" role="radiogroup" aria-labelledby="review-rating-label">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        role="radio"
                        aria-checked={reviewForm.rating === star}
                        aria-label={`${star} star${star > 1 ? "s" : ""}`}
                        className={`review-star ${star <= reviewForm.rating ? "is-on" : ""}`}
                        onClick={() => setReviewForm((current) => ({ ...current, rating: star }))}
                      >
                        <Star size={30} fill={star <= reviewForm.rating ? "currentColor" : "none"} />
                      </button>
                    ))}
                  </div>
                </div>

                <label className="form-field form-field-full">
                  Your name *
                  <input
                    name="name"
                    ref={reviewNameRef}
                    value={reviewForm.name}
                    onChange={updateReviewField}
                    placeholder="e.g. Rahul K."
                    autoComplete="name"
                    maxLength={60}
                  />
                </label>

                <label className="form-field form-field-full">
                  Your experience *
                  <textarea
                    name="text"
                    value={reviewForm.text}
                    onChange={updateReviewField}
                    placeholder="How was your visit?"
                    rows={4}
                    maxLength={600}
                  />
                </label>
              </div>

              <label className="review-consent">
                <input
                  type="checkbox"
                  name="consent"
                  checked={reviewForm.consent}
                  onChange={updateReviewField}
                />
                <span>I agree that the clinic may display my name and review on this website.</span>
              </label>

              <button type="submit" className="btn btn-primary form-submit">
                Send review on WhatsApp <ArrowRight size={18} />
              </button>

              {reviewMessage && (
                <div
                  className={`booking-message ${
                    reviewError ? "booking-message-error" : "booking-message-success"
                  }`}
                  role="status"
                >
                  {reviewMessage}
                </div>
              )}

              <a
                className="review-google-link"
                href={GOOGLE_WRITE_REVIEW_URL || GOOGLE_REVIEWS_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                Or review us on Google <ArrowUpRight size={14} />
              </a>

              <p className="form-privacy">
                Please do not include phone numbers or sensitive medical details in your review.
              </p>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default Reviews;
