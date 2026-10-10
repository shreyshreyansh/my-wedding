import { type KeyboardEvent, useLayoutEffect, useRef, useState } from "react";
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
  { title: "Shaadi", lines: ["Wednesday", "9th Dec 2026", "Haveli Banquet, Ranchi", "8 in the evening"], note: "Traditional finery · Jewel tones" }
] as const;

const venue = {
  address: "Haveli Banquet, Ranchi",
  mapEmbed: "https://www.google.com/maps?q=Haveli%20Banquet%20Ranchi&output=embed",
  mapLink: "https://www.google.com/maps/search/?api=1&query=Haveli+Banquet+Ranchi"
} as const;

const invitationCopy = {
  en: {
    tab: "English", lang: "en", kicker: "Together with our families",
    hostOne: "Mr Umesh Kumar Sinha & Mrs Rupa Sinha", connector: "and",
    hostTwo: "Mr Shriharsh Waghmare & Mrs Sumati Waghmare",
    request: "request the honour of your presence at the wedding of",
    names: "Shreyansh & Mrunalini", date: "Wednesday, 9 December 2026 · 8:00 PM",
    place: "Haveli Banquet, Ranchi", closing: "Please accept this invitation as our personal visit."
  },
  hi: {
    tab: "हिंदी", lang: "hi", kicker: "सपरिवार सादर आमंत्रण",
    hostOne: "श्री उमेश कुमार सिन्हा एवं श्रीमती रूपा सिन्हा", connector: "तथा",
    hostTwo: "श्री श्रीहर्ष वाघमारे एवं श्रीमती सुमति वाघमारे",
    request: "अपने प्रिय श्रेयांश एवं मृणालिनी के शुभ विवाह के अवसर पर आपकी स्नेहमयी उपस्थिति का अनुरोध करते हैं।",
    names: "श्रेयांश एवं मृणालिनी", date: "बुधवार, 9 दिसंबर 2026 · सायं 8 बजे",
    place: "हवेली बैंकेट, रांची", closing: "कृपया इस निमंत्रण को हमारा व्यक्तिगत आमंत्रण स्वीकार करें।"
  },
  mr: {
    tab: "मराठी", lang: "mr", kicker: "सस्नेह निमंत्रण",
    hostOne: "श्री. उमेश कुमार सिन्हा व सौ. रूपा सिन्हा", connector: "आणि",
    hostTwo: "श्री. श्रीहर्ष वाघमारे व सौ. सुमती वाघमारे",
    request: "यांच्या प्रिय श्रेयांश आणि मृणालिनी यांच्या शुभविवाह सोहळ्यास आपली स्नेहपूर्ण उपस्थिती प्रार्थनीय आहे.",
    names: "श्रेयांश आणि मृणालिनी", date: "बुधवार, ९ डिसेंबर २०२६ · सायंकाळी ८ वाजता",
    place: "हवेली बँक्वेट, रांची", closing: "कृपया हे निमंत्रण आमचे वैयक्तिक आमंत्रण समजावे."
  }
} as const;

type InvitationLanguage = keyof typeof invitationCopy;

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

function FormalInvitation({ language, onLanguageChange }: { language: InvitationLanguage; onLanguageChange: (language: InvitationLanguage) => void }) {
  const copy = invitationCopy[language];
  const languages = Object.keys(invitationCopy) as InvitationLanguage[];

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | undefined;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % languages.length;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + languages.length) % languages.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = languages.length - 1;
    if (nextIndex === undefined) return;

    event.preventDefault();
    const nextLanguage = languages[nextIndex];
    onLanguageChange(nextLanguage);
    event.currentTarget.parentElement
      ?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[nextIndex]
      ?.focus();
  };

  return (
    <div className="couple__story formal-invitation">
      <div className="formal-invitation__tabs" role="tablist" aria-label="Invitation language">
        {languages.map((key, index) => (
          <button
            aria-controls="formal-invitation-panel"
            aria-selected={language === key}
            className={language === key ? "is-active" : ""}
            id={`formal-invitation-tab-${key}`}
            key={key}
            lang={invitationCopy[key].lang}
            onClick={() => onLanguageChange(key)}
            onKeyDown={(event) => handleTabKeyDown(event, index)}
            role="tab"
            tabIndex={language === key ? 0 : -1}
            type="button"
          >
            {invitationCopy[key].tab}
          </button>
        ))}
      </div>
      <article
        aria-label={`${copy.tab} invitation`}
        className="formal-invitation__content"
        id="formal-invitation-panel"
        lang={copy.lang}
        role="tabpanel"
      >
        <p className="formal-invitation__kicker">{copy.kicker}</p>
        <p className="formal-invitation__hosts">{copy.hostOne}</p>
        <p className="formal-invitation__connector">{copy.connector}</p>
        <p className="formal-invitation__hosts">{copy.hostTwo}</p>
        <p className="formal-invitation__request">{copy.request}</p>
        <p className="formal-invitation__names">{copy.names}</p>
        <p className="formal-invitation__date">{copy.date}</p>
        <p className="formal-invitation__place">{copy.place}</p>
        <p className="formal-invitation__closing">{copy.closing}</p>
      </article>
    </div>
  );
}

function LocationCard() {
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">("idle");

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(venue.address);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("failed");
    }
  };

  return (
    <div className="location-card" role="region" aria-label="Wedding venue">
      <div className="location-card__map">
        <iframe
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src={venue.mapEmbed}
          title="Map showing Haveli Banquet, Ranchi"
        />
        <span className="location-card__nearby">Wedding venue</span>
        <a className="location-card__maps-link" href={venue.mapLink} target="_blank" rel="noreferrer">Open in Google Maps <span aria-hidden="true">↗</span></a>
      </div>
      <div className="location-card__venue">
        <p className="location-card__eyebrow">All three celebrations</p>
        <h3>Haveli Banquet</h3>
        <p>{venue.address}</p>
        <button type="button" aria-label="Copy address to clipboard" onClick={copyAddress}><span aria-hidden="true">▣</span></button>
        {copyStatus !== "idle" && <span className={`location-card__copy-status is-${copyStatus}`} role="status">{copyStatus === "copied" ? "Copied" : "Copy failed"}</span>}
      </div>
    </div>
  );
}

export function App() {
  const canvasRef = useRef<HTMLElement>(null);
  const [fullName, setFullName] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [partySize, setPartySize] = useState("");
  const [invitationLanguage, setInvitationLanguage] = useState<InvitationLanguage>("en");
  const countdown = useCountdown(weddingDate);
  const canSendRsvp = Boolean(fullName.trim() && selectedEvents.length && partySize);
  const eventSummary = selectedEvents.length > 1
    ? `${selectedEvents.slice(0, -1).join(", ")} and ${selectedEvents.at(-1)}`
    : selectedEvents[0] ?? "";
  const message = `Hi, I am ${fullName.trim()}. I would like to RSVP for ${eventSummary} for ${partySize} people.`;
  const whatsappHref = canSendRsvp ? `https://wa.me/?text=${encodeURIComponent(message)}` : "#whatsapp";
  const toggleEvent = (eventName: string) => {
    setSelectedEvents((current) => current.includes(eventName)
      ? current.filter((item) => item !== eventName)
      : eventOptions.filter((item) => [...current, eventName].includes(item)));
  };

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
          <span className="hero__name hero__name--first"><span className="hero__title-positioner"><span className="hero__title-reveal">Shreyansh</span></span></span><span className="hero__and"><span className="hero__title-positioner"><span className="hero__title-reveal">weds</span></span></span><span className="hero__name hero__name--second"><span className="hero__title-positioner"><span className="hero__title-reveal">Mrunalini</span></span></span>
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
        <FormalInvitation language={invitationLanguage} onLanguageChange={setInvitationLanguage} />
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
          <p className="rsvp-card__eyebrow">We would love to celebrate with you</p>
          <h2>Please confirm your presence</h2>
          <label className="rsvp-card__field rsvp-card__field--name" htmlFor="full-name"><span>Guest name</span><input id="full-name" name="fullName" placeholder="Your full name" value={fullName} onChange={(event) => setFullName(event.target.value)} /></label>
          <fieldset className="rsvp-card__events">
            <legend>Celebrations attending</legend>
            <div>{eventOptions.map((option) => (
              <label className={selectedEvents.includes(option) ? "is-selected" : ""} key={option}>
                <input checked={selectedEvents.includes(option)} onChange={() => toggleEvent(option)} type="checkbox" />
                <span>{option}</span>
              </label>
            ))}</div>
          </fieldset>
          <label className="rsvp-card__field rsvp-card__field--guests" htmlFor="people"><span>Number of guests</span><select id="people" value={partySize} onChange={(event) => setPartySize(event.target.value)} aria-label="No. of People"><option value="" disabled>Select guest count</option>{people.map((count) => <option value={count} key={count}>{count}</option>)}</select></label>
          <a className="rsvp-card__send" href={whatsappHref} target={canSendRsvp ? "_blank" : undefined} rel={canSendRsvp ? "noreferrer" : undefined} aria-label="Send via WhatsApp" aria-disabled={canSendRsvp ? "false" : "true"} onClick={(event) => { if (!canSendRsvp) event.preventDefault(); }}><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M17.6 6.32A7.85 7.85 0 0 0 12.05 4a7.94 7.94 0 0 0-6.9 11.9L4 20l4.2-1.1a7.9 7.9 0 0 0 3.85 1h.01A7.94 7.94 0 0 0 17.6 6.32ZM12.05 18.4a6.6 6.6 0 0 1-3.36-.92l-.24-.14-2.5.65.67-2.43-.16-.25a6.6 6.6 0 1 1 5.59 3.1Z" fill="currentColor" /></svg>Send via WhatsApp</a>
          <p className="rsvp-card__note">A prepared confirmation will open in WhatsApp.</p>
        </form>
        <DecorativeImage className="finale__divider finale__divider--bottom" file="92459d463a334df1.webp" />
        <div className="countdown"><h2>The countdown begins</h2><p><span className="narrow-only">Our families are excited that you are able to join<br />us in celebrating what we hope will be one<br />of the happiest days of our lives</span><span className="wide-only">Our families are excited that you are able to<br />join us in celebrating what we hope will be<br />one of the happiest days of our lives</span></p><div className="countdown__units">{(["days", "hours", "minutes", "seconds"] as const).map((unit) => { const value = String(countdown[unit]).padStart(2, "0"); return <div key={unit}><strong aria-label={value}>{value.split("").map((digit, index) => <span aria-hidden="true" key={`${unit}-${index}`}>{digit}</span>)}</strong><span>{unit.toUpperCase()}</span></div>; })}</div></div>
        <DecorativeImage className="finale__elephants" file="c22fb695b0b75f19.avif" />
      </section>
    </main>
  );
}
