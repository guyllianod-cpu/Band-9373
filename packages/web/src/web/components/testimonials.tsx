import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Aminata D.",
    country: "Canada",
    flag: "🇨🇦",
    role: "Entrepreneure",
    image: "/images/testimonials/aminata.jpeg",
    text: "Je recherchais une solution adaptée à mes objectifs financiers. J’apprécie la clarté des informations et la qualité de l’accompagnement. Une bonne communication est essentielle pour avancer dans ses projets.",
  },
  {
    name: "Jean M.",
    country: "Belgique",
    flag: "🇧🇪",
    role: "Investisseur",
    image: "/images/testimonials/jean.jpeg",
    text: "Pour moi, la transparence et le suivi sont essentiels. Je souhaite disposer d’informations claires sur les frais, les risques et les conditions avant de prendre mes décisions financières.",
  },
  {
    name: "Thomas K.",
    country: "France",
    flag: "🇫🇷",
    role: "Investisseur particulier",
    image: "/images/testimonials/thomas.jpeg",
    text: "J’apprécie la qualité de l’accueil et la disponibilité de l’équipe de Band Finance Investment. Les explications fournies m’aident à mieux comprendre les conditions de mon investissement et à prendre mes décisions avec davantage de confiance.",
  },
];

export function Testimonials() {
  return (
    <section className="section testimonials" id="temoignages" aria-labelledby="testimonials-title">
      <div className="container">
        <div className="center-heading">
          <div className="eyebrow">TÉMOIGNAGES DE NOS INVESTISSEURS</div>
          <h2 id="testimonials-title">
            Leur confiance est
            <br />
            <em>notre plus grande réussite.</em>
          </h2>
        </div>
        <div className="testimonials-grid">
          {testimonials.map((testimonial) => (
            <figure className="testimonial" key={testimonial.name}>
              <figcaption className="testimonial-person">
                <img
                  src={testimonial.image}
                  alt={`Portrait associé au témoignage de ${testimonial.name}`}
                  loading="lazy"
                  width={68}
                  height={68}
                />
                <div>
                  <h3>{testimonial.name}</h3>
                  <div className="testimonial-country">
                    — {testimonial.country}{" "}
                    <span aria-hidden="true">
                      <svg
                        width="18"
                        height="12"
                        viewBox="0 0 30 20"
                        style={{ display: "inline-block", verticalAlign: "middle" }}
                      >
                        <path
                          fill={
                            testimonial.country === "Canada"
                              ? "#d52b1e"
                              : testimonial.country === "Belgique"
                                ? "#171717"
                                : "#002395"
                          }
                          d="M0 0h10v20H0z"
                        />
                        <path
                          fill={testimonial.country === "Belgique" ? "#fdda24" : "#fff"}
                          d="M10 0h10v20H10z"
                        />
                        <path
                          fill={testimonial.country === "Belgique" ? "#ef3340" : "#ed2939"}
                          d="M20 0h10v20H20z"
                        />
                        {testimonial.country === "Canada" && (
                          <path
                            fill="#d52b1e"
                            d="M15 3l2 4 2-1-1 4 2 1-4 4v3h-2v-3l-4-4 2-1-1-4 2 1z"
                          />
                        )}
                      </svg>
                    </span>
                  </div>
                  <span className="testimonial-role">{testimonial.role}</span>
                </div>
              </figcaption>
              <div className="testimonial-stars">
                <span className="sr-only">5 étoiles sur 5</span>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={18}
                    fill="currentColor"
                    strokeWidth={0}
                    aria-hidden="true"
                  />
                ))}
              </div>
              <blockquote>« {testimonial.text} »</blockquote>
              <Quote
                className="testimonial-quote-icon"
                size={29}
                strokeWidth={1}
                aria-hidden="true"
              />
            </figure>
          ))}
        </div>
        <p className="testimonials-note">
          Témoignages et portraits fournis par Band Finance Investment. Ces avis ne constituent pas
          une garantie de résultat ou de rendement.
        </p>
      </div>
    </section>
  );
}
