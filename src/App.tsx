import { useLayoutEffect, useRef, useState } from "react";
import { BirdFlock } from "./BirdFlock";
import { WavingFlag } from "./WavingFlag";
import { RotatingGallery } from "./RotatingGallery";
import { HangingBell } from "./HangingBell";
import { useCountdown } from "./countdown";
import { initMotion } from "./motion";
import { initSmoothScroll } from "./smoothScroll";

const image = (name: string) => `/assets/images/${name}`;

const people = Array.from({ length: 50 }, (_, index) => index + 1);
const eventOptions = ["Haldi", "Sangeet", "Shaadi"] as const;
const weddingDate = new Date("2026-12-09T20:00:00+05:30");

const eventCards = [
  { title: "Haldi", lines: ["Tuesday", "8th Dec 2026", "Haveli Banquet, Ranchi", "12 Noon"], note: "Yellow · Turmeric shades" },
  { title: "Sangeet", lines: ["Tuesday", "8th Dec 2026", "Haveli Banquet, Ranchi", "8 in the evening"], note: "Evening formals · Indo-western welcome" },
  { title: "Shaadi", lines: ["Wednesday", "9th Dec 2026", "Haveli Banquet, Ranchi", "8 in the evening"], note: "Traditional finery · Jewel tones" },
  { title: "Haldi Attire", lines: ["Yellow", "Turmeric shades", "Tuesday · 8 Dec", "12 Noon"], note: "Haveli Banquet, Ranchi" },
  { title: "Sangeet Attire", lines: ["Evening formals", "Indo-western welcome", "Tuesday · 8 Dec", "8 in the evening"], note: "Haveli Banquet, Ranchi" },
  { title: "Shaadi Attire", lines: ["Traditional finery", "Jewel tones", "Wednesday · 9 Dec", "8 in the evening"], note: "Haveli Banquet, Ranchi" }
] as const;

const locations = [
  { name: "Venue", address: "Haveli Banquet, Ranchi", details: "Haveli Banquet, Ranchi", query: "Haveli+Banquet+Ranchi" },
  { name: "Haldi", address: "Haveli Banquet, Ranchi", details: "Tuesday, 8 December 2026 · 12 noon", query: "Haveli+Banquet+Ranchi" },
  { name: "Sangeet", address: "Haveli Banquet, Ranchi", details: "Tuesday, 8 December 2026 · 8 in the evening", query: "Haveli+Banquet+Ranchi" },
  { name: "Shaadi", address: "Haveli Banquet, Ranchi", details: "Wednesday, 9 December 2026 · 8 in the evening", query: "Haveli+Banquet+Ranchi" }
] as const;

const story =
  "With the blessings of our elders, we request the pleasure of your company at the wedding of Shreyansh with Mrunalini. Please accept this invitation as our personal visit. With love, Umesh Kumar & Rupa Sinha and Shriharsh & Sumati Waghmare.";

const knowledge = [
  { icon: "2fe267c199f164f1.avif", title: "Haldi", copy: "Tuesday, 8 December 2026 at 12 noon. Wear yellow, in turmeric shades." },
  { icon: "37d2ce6c13c35461.avif", title: "Sangeet", copy: "Tuesday, 8 December 2026 at 8 in the evening. Evening formals; Indo-western welcome." },
  { icon: "f4d45415c3a62726.avif", title: "Shaadi", copy: "Wednesday, 9 December 2026 at 8 in the evening. Traditional finery, in jewel tones." },
  { icon: "bdf80fd9d4b08bf2.webp", title: "Venue", copy: "All celebrations are at Haveli Banquet, Ranchi." }
] as const;

function DecorativeImage({ className, file, alt = "", invitationMotion }: { className: string; file: string; alt?: string; invitationMotion?: string }) {
  return <img className={className} src={image(file)} alt={alt} data-invitation-motion={invitationMotion} draggable={false} />;
}

function InvitationArrow() {
  return (
    <div className="invitation__arrow" data-invitation-motion="events-arrow" data-invitation-speed="120" aria-hidden="true">
      <div className="invitation__arrow-inner">
        <svg width="40" height="100%" viewBox="0 0 40 165" fill="none">
          <line x1="20" y1="155" x2="20" y2="30" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <path d="M 6.666666666666666 141.66666666666666 L 20 155 L 33.333333333333336 141.66666666666666" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}

function EventCard({ card, index }: { card: (typeof eventCards)[number]; index: number }) {
  return (
    <article className={`event-card event-card--${index}`} data-testid="event-card">
      <DecorativeImage className="event-card__frame" file="75f08cc5ddae6040.avif" />
      <div className="event-card__copy">
        <h3>{card.title}</h3>{card.lines.map((line) => <p key={line}>{line}</p>)}<small>{card.note}</small>
      </div>
    </article>
  );
}

const wideCardMedallions = Array.from({ length: 10 }, (_, index) => index + 1);

function LocationCard() {
  const [selectedLocation, setSelectedLocation] = useState(0);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">("idle");
  const location = locations[selectedLocation];

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(location.address);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("failed");
    }
  };

  return (
    <div className="location-card">
      <div className="location-card__map" role="region" aria-label={`Venue details for ${location.name}`}>
        <div className="location-card__venue-mark" aria-hidden="true">
          <svg viewBox="0 0 64 82"><path d="M32 2C15.4 2 2 15.4 2 32c0 22 30 48 30 48s30-26 30-48C62 15.4 48.6 2 32 2Z" /><circle cx="32" cy="32" r="11" /></svg>
        </div>
        <div className="location-card__map-copy"><strong>Haveli Banquet</strong><span>Ranchi</span></div>
        <span className="location-card__nearby">{location.name}</span>
        <a className="location-card__maps-link" href={`https://www.google.com/maps/search/?api=1&query=${location.query}`} target="_blank" rel="noreferrer">Open in Google Maps <span aria-hidden="true">↗</span></a>
      </div>
      <div className="location-card__venue"><h3>Haveli Banquet</h3><p>{location.details}</p><button type="button" aria-label="Copy address to clipboard" onClick={copyAddress}><span aria-hidden="true">▣</span></button>{copyStatus !== "idle" && <span className={`location-card__copy-status is-${copyStatus}`} role="status">{copyStatus === "copied" ? "Copied" : "Copy failed"}</span>}</div>
      <div className="location-card__switcher">{locations.map((item, index) => <button className={index === selectedLocation ? "is-active" : ""} key={`${item.name}-${index}`} type="button" onClick={() => { setSelectedLocation(index); setCopyStatus("idle"); }}>{item.name}</button>)}</div>
    </div>
  );
}

export function App() {
  const canvasRef = useRef<HTMLElement>(null);
  const [fullName, setFullName] = useState("");
  const [selectedEvent, setSelectedEvent] = useState("");
  const [partySize, setPartySize] = useState("");
  const [eventMenuOpen, setEventMenuOpen] = useState(false);
  const countdown = useCountdown(weddingDate);
  const canSendRsvp = Boolean(fullName.trim() && selectedEvent && partySize);
  const message = `Hi, I am ${fullName.trim()}. I would like to RSVP for ${selectedEvent} for ${partySize} people.`;
  const whatsappHref = canSendRsvp ? `https://wa.me/?text=${encodeURIComponent(message)}` : "#whatsapp";

  useLayoutEffect(() => {
    if (!canvasRef.current) return undefined;
    const root = canvasRef.current;
    const stopSmoothScroll = initSmoothScroll();
    let stopMotion = initMotion(root);
    const motionQueries = typeof window.matchMedia === "function" ? [
      window.matchMedia("(min-width: 1280px)"),
      window.matchMedia("(prefers-reduced-motion: reduce)")
    ] : [];
    const rebuildMotion = () => {
      stopMotion();
      stopMotion = initMotion(root);
    };
    motionQueries.forEach((query) => query.addEventListener("change", rebuildMotion));
    return () => {
      motionQueries.forEach((query) => query.removeEventListener("change", rebuildMotion));
      stopMotion();
      stopSmoothScroll();
    };
  }, []);

  return (
    <main className="site-canvas" data-layout="wide-desktop" ref={canvasRef}>
      <section className="section-layer hero" aria-label="Wedding invitation hero">
        <DecorativeImage className="wide-only wide-hero__sky" file="wide-hero-sky.webp" />
        <DecorativeImage className="wide-only wide-hero__clouds" file="wide-hero-clouds.webp" />
        <DecorativeImage className="wide-only wide-hero__atmosphere" file="wide-hero-atmosphere.webp" />
        <DecorativeImage className="wide-only wide-hero__temple" file="wide-hero-temple.webp" />
        <DecorativeImage className="wide-only wide-hero__foreground" file="wide-hero-foreground.webp" />
        <DecorativeImage className="wide-only wide-hero__flag" file="wide-flag.webp" />
        <WavingFlag className="hero__waving-flag" />
        <DecorativeImage className="wide-only wide-hero__journey" file="wide-hero-journey.webp" />
        {[1, 2, 3, 4, 5, 6].map((bell) => <HangingBell className={`wide-only hero__bell hero__bell--wide hero__bell--wide-${bell}`} file={bell <= 2 ? "wide-bell-outer.png" : "wide-bell-inner.png"} key={bell} />)}
        <DecorativeImage className="hero__sky" file="3a1202a6edfbd91f.webp" />
        <DecorativeImage className="hero__glow" file="bad6103adb6c57a4.avif" />
        <DecorativeImage className="hero__sun" file="81729a55f42074b9.avif" />
        <DecorativeImage className="hero__mountains" file="c245028d56191860.webp" />
        <DecorativeImage className="hero__walkway" file="f28f0c87faf11bce.webp" />
        <DecorativeImage className="hero__flowers" file="ed390e16966c8d20.webp" />
        <HangingBell className="hero__bell hero__bell--1" file="7e1a3a5150e03a86.avif" />
        <HangingBell className="hero__bell hero__bell--2" file="7e1a3a5150e03a86.avif" />
        <HangingBell className="hero__bell hero__bell--3" file="22081e683158c046.avif" />
        <HangingBell className="hero__bell hero__bell--4" file="22081e683158c046.avif" mass={2} volume={.75} />
        <DecorativeImage className="hero__flag" file="be9b608a683e28b1.webp" />
        <BirdFlock />
        <DecorativeImage className="hero__birds" file="c32c73cb83ebac88.webp" />
        <h1 className="hero__title" aria-label="Shreyansh weds Mrunalini">
          <span className="hero__name hero__name--first"><span className="hero__title-reveal">Shreyansh</span></span><span className="hero__and"><span className="hero__title-reveal">weds</span></span><span className="hero__name hero__name--second"><span className="hero__title-reveal">Mrunalini</span></span>
        </h1>
      </section>

      <section className="section-layer invitation" aria-label="Wedding invitation">
        <DecorativeImage className="wide-only wide-invitation__backdrop" file="wide-invitation-backdrop.webp" />
        <DecorativeImage className="wide-only wide-invitation__scroll" file="wide-scroll.webp" invitationMotion="ganpati-name" />
        <DecorativeImage className="wide-only wide-invitation__ganesh" file="wide-ganesh.webp" invitationMotion="ganpati-icon" />
        <DecorativeImage className="wide-only wide-invitation__flourish" file="wide-heading-flourish.webp" invitationMotion="shri-line" />
        <DecorativeImage className="invitation__garden" file="9833bdd6ffb94266.webp" />
        <div className="invitation__copy">
          <p className="invitation__parents" data-invitation-motion="groom-parents">Mr Umesh Kumar Sinha &amp; Mrs Rupa Sinha</p>
          <div className="mobile-invitation__line" data-invitation-motion="invitation-line"><p>With the blessings of our elders,</p><p>we request the pleasure of your company</p><p>at the wedding of our beloved son</p></div>
          <div className="invitation__names"><span data-invitation-motion="groom-name">Shreyansh</span><em data-invitation-motion="and">with</em><span data-invitation-motion="bride-name">Mrunalini</span></div>
          <p className="invitation__relation" data-invitation-motion="daughter-of">Daughter of</p>
          <p className="invitation__parents invitation__parents--second" data-invitation-motion="bride-parents">Mr Shriharsh Waghmare &amp; Mrs Sumati Waghmare</p>
          <p className="invitation__events" data-invitation-motion="events-intro"><span className="narrow-only">On The Following Events</span><span className="wide-only">On the following events</span></p>
        </div>
        <div className="wide-only wide-invitation__copy">
          <p className="wide-invitation__parents" data-invitation-motion="groom-parents">Mr Umesh Kumar Sinha &amp; Mrs Rupa Sinha</p>
          <div className="wide-invitation__line" data-invitation-motion="invitation-line"><p>With the blessings of our elders, we request the pleasure of your company</p><p>at the wedding of our beloved son</p></div>
          <p className="wide-invitation__name wide-invitation__name--first" data-invitation-motion="groom-name">Shreyansh</p>
          <p className="wide-invitation__and" data-invitation-motion="and">with</p>
          <p className="wide-invitation__name wide-invitation__name--second" data-invitation-motion="bride-name">Mrunalini</p>
          <p className="wide-invitation__relation" data-invitation-motion="daughter-of">Daughter of</p>
          <p className="wide-invitation__parents wide-invitation__parents--second" data-invitation-motion="bride-parents">Mr Shriharsh Waghmare &amp; Mrs Sumati Waghmare</p>
          <p className="wide-invitation__events" data-invitation-motion="events-intro">On the following events</p>
        </div>
        <InvitationArrow />
        <DecorativeImage className="invitation__scroll" file="be15daddc4d3d265.webp" invitationMotion="ganpati-name" />
        <DecorativeImage className="invitation__ganesh" file="299c9e87d4b523dc.webp" invitationMotion="ganpati-icon" />
        <DecorativeImage className="invitation__birds" file="c32c73cb83ebac88.webp" invitationMotion="shri-line" />
      </section>

      <section className="section-layer timeline" aria-label="Wedding timeline">
        <DecorativeImage className="wide-only wide-timeline__backdrop" file="wide-timeline-backdrop.webp" />
        <DecorativeImage className="timeline__garden" file="acf828b9baf56ad9.webp" />
        <div className="timeline__heading"><h2><span className="narrow-only">Wedding Timeline</span><span className="wide-only">Wedding Celebration Timeline</span></h2><p>Mark Your Calendars, We Can’t Wait to Celebrate</p></div>
        {eventCards.map((card, index) => <EventCard card={card} index={index + 1} key={`${card.title}-${index}`} />)}
        <div className="wide-only wide-timeline__medallions">{wideCardMedallions.map((item) => <DecorativeImage className={`wide-card-medallion wide-card-medallion--${item}`} file="wide-card-medallion.webp" key={item} />)}</div>
        <DecorativeImage className="timeline__medallion timeline__medallion--1" file="4ca8349ac539e315.webp" />
        <DecorativeImage className="timeline__medallion timeline__medallion--2" file="4ca8349ac539e315.webp" />
        <DecorativeImage className="timeline__divider" file="af880b786538e470.webp" />
        <DecorativeImage className="wide-only wide-timeline__divider" file="wide-timeline-divider.webp" />
      </section>

      <section className="section-layer couple" aria-label="Meet the bride and groom">
        <DecorativeImage className="wide-only wide-couple__backdrop" file="wide-couple-backdrop.webp" />
        <DecorativeImage className="wide-only wide-couple__medallion wide-couple__medallion--left" file="wide-medallion.webp" />
        <DecorativeImage className="wide-only wide-couple__medallion wide-couple__medallion--right" file="wide-medallion.webp" />
        <DecorativeImage className="wide-only wide-couple__portrait" file="wide-portrait.webp" />
        <DecorativeImage className="couple__backdrop" file="1c055f08ede33e3b.webp" />
        <h2 className="couple__heading"><span>Meet the</span><span>BRIDE &amp; GROOM</span></h2>
        <DecorativeImage className="couple__portrait" file="b2e7dc1c08c886c8.avif" />
        <p className="couple__story">{story.split(" ").map((word, index) => <span key={`${word}-${index}`}>{word} </span>)}</p>
        <RotatingGallery />
        <p className="couple__celebrate">Almost time<br />to celebrate</p>
        <DecorativeImage className="couple__photo" file="61350ca076dd5ac0.webp" />
        <DecorativeImage className="wide-only wide-couple__photo" file="wide-couple-photo.webp" />
      </section>

      <section className="section-layer guest" aria-label="Location and guest details">
        <DecorativeImage className="wide-only wide-guest__backdrop" file="wide-guest-backdrop.webp" />
        <DecorativeImage className="guest__backdrop" file="fcef956c50e247b8.avif" />
        <h2 className="guest__looking">Looking forward to see you</h2>
        <LocationCard />
        <div className="knowledge">
          <h2>Things to know</h2>
          <p className="knowledge__intro">To help you feel at ease and enjoy every moment of the celebrations,<br />we’ve gathered a few thoughtful details we’d love for you<br />to know before the big day</p>
          <div className="knowledge__grid">{knowledge.map((item) => <article key={item.title}><DecorativeImage className="knowledge__icon" file={item.icon} /><h3>{item.title}</h3><p>{item.copy}</p></article>)}</div>
        </div>
      </section>

      <section className="section-layer finale" aria-label="RSVP and countdown">
        <DecorativeImage className="wide-only wide-finale__backdrop" file="wide-finale-backdrop.webp" />
        <DecorativeImage className="wide-only wide-finale__flourish" file="wide-finale-flourish.webp" />
        <DecorativeImage className="wide-only wide-finale__divider wide-finale__divider--top" file="wide-divider.webp" />
        <DecorativeImage className="wide-only wide-finale__divider wide-finale__divider--bottom" file="wide-divider.webp" />
        <DecorativeImage className="finale__divider finale__divider--top" file="92459d463a334df1.webp" />
        <form className="rsvp-card">
          <h2><span className="narrow-only">RSVP via WhatsApp</span><span className="wide-only">Please confirm your presence</span></h2>
          <label className="sr-only" htmlFor="full-name">Full Name</label><input id="full-name" name="fullName" placeholder="Full Name" value={fullName} onChange={(event) => setFullName(event.target.value)} />
          <div className="rsvp-card__row">
            <div className="event-select"><button type="button" aria-haspopup="listbox" aria-expanded={eventMenuOpen} onClick={() => setEventMenuOpen((open) => !open)}>{selectedEvent || "Select Event"}</button>{eventMenuOpen && <div className="event-select__menu" role="listbox" aria-label="Wedding event">{eventOptions.map((option) => <button type="button" role="option" aria-selected={selectedEvent === option} key={option} onClick={() => { setSelectedEvent(option); setEventMenuOpen(false); }}>{option}</button>)}</div>}</div>
            <label className="sr-only" htmlFor="people">No. of People</label><select id="people" value={partySize} onChange={(event) => setPartySize(event.target.value)} aria-label="No. of People"><option value="" disabled>No. of People</option>{people.map((count) => <option value={count} key={count}>{count}</option>)}</select>
          </div>
          <a className="rsvp-card__send" href={whatsappHref} target={canSendRsvp ? "_blank" : undefined} rel={canSendRsvp ? "noreferrer" : undefined} aria-label="Send via WhatsApp" aria-disabled={canSendRsvp ? "false" : "true"} onClick={(event) => { if (!canSendRsvp) event.preventDefault(); }}><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M17.6 6.32A7.85 7.85 0 0 0 12.05 4a7.94 7.94 0 0 0-6.9 11.9L4 20l4.2-1.1a7.9 7.9 0 0 0 3.85 1h.01A7.94 7.94 0 0 0 17.6 6.32ZM12.05 18.4a6.6 6.6 0 0 1-3.36-.92l-.24-.14-2.5.65.67-2.43-.16-.25a6.6 6.6 0 1 1 5.59 3.1Z" fill="currentColor" /></svg>Send via WhatsApp</a>
        </form>
        <DecorativeImage className="finale__divider finale__divider--bottom" file="92459d463a334df1.webp" />
        <div className="countdown"><h2>The countdown begins</h2><p><span className="narrow-only">Our families are excited that you are able to join<br />us in celebrating what we hope will be one<br />of the happiest days of our lives</span><span className="wide-only">Our families are excited that you are able to<br />join us in celebrating what we hope will be<br />one of the happiest days of our lives</span></p><div className="countdown__units">{(["days", "hours", "minutes", "seconds"] as const).map((unit) => { const value = String(countdown[unit]).padStart(2, "0"); return <div key={unit}><strong aria-label={value}>{value.split("").map((digit, index) => <span aria-hidden="true" key={`${unit}-${index}`}>{digit}</span>)}</strong><span>{unit.toUpperCase()}</span></div>; })}</div></div>
        <DecorativeImage className="finale__elephants" file="c22fb695b0b75f19.avif" />
      </section>
    </main>
  );
}
