import { useLayoutEffect, useRef, useState } from "react";
import { BirdFlock } from "./BirdFlock";
import { WavingFlag } from "./WavingFlag";
import { RotatingGallery } from "./RotatingGallery";
import { HangingBell } from "./HangingBell";
import { useCountdown } from "./countdown";
import { initMotion } from "./motion";
import { initSmoothScroll } from "./smoothScroll";

const image = (name: string) => `/assets/images/${name}`;

const events = Array.from({ length: 6 }, (_, index) => index + 1);
const people = Array.from({ length: 50 }, (_, index) => index + 1);
const eventOptions = ["Mehendi", "Sangeet", "Wedding Ceremony", "Reception"] as const;
const weddingDate = new Date("2026-08-29T18:00:00+05:30");

const locations = [
  { name: "Location 1", address: "M10 geomatrix silver crest kamote 9819200906 M10 geomatrix silver crest kamote 9819200906", wideAddress: "Full street address, city, state, ZIP", coordinates: "19.2183%2C%2072.9781" },
  { name: "Location 2", address: "Full street address, city, state, ZIP", coordinates: "19.0760%2C%2072.8777" },
  { name: "Location", address: "Full street address", coordinates: "19.2183%2C%2072.9781" },
  { name: "Location", address: "Full street address", coordinates: "19.0760%2C%2072.8777" }
] as const;

const mapTiles = [
  "426594370b7ea67a.png", "833f32b761f439cd.png", "73d9f0924b320557.png",
  "a2783fec7de810ea.png", "a6cd1f44096c8090.png", "d1bebc74671167c4.png",
  "c1c3cce0b6a83dce.png", "a597cc0f476083f1.png", "0b9fd2ccbf1cab52.png"
] as const;

const story =
  "Our hearts are full and our smiles wide, we can hardly believe our dreamy eyed teen selves made it here! We’re ready to make memories that last a lifetime, and they’ll be incomplete without you by our side. Come celebrate our love, share our joy, eat . till you can’t move and help us make this day a beautiful, laughter-filled blur we’ll never forget!";

const knowledge = [
  { icon: "2fe267c199f164f1.avif", title: "Hashtag", copy: "While posting photos on social media please use the hashtag - #abkan" },
  { icon: "37d2ce6c13c35461.avif", title: "Weather", copy: "It will be mostly sunny with temperature reaching up to 28 degrees at the venue" },
  { icon: "f4d45415c3a62726.avif", title: "Staff", copy: "We recommend the nearby hotel called Bhola Bhawan near the venue for the staff members" },
  { icon: "bdf80fd9d4b08bf2.webp", title: "Parking", copy: "Valet parking for all our guests will be available at the venue" }
] as const;

function DecorativeImage({ className, file, alt = "", invitationMotion }: { className: string; file: string; alt?: string; invitationMotion?: string }) {
  return <img className={className} src={image(file)} alt={alt} data-invitation-motion={invitationMotion} draggable={false} />;
}

function EventCard({ index }: { index: number }) {
  return (
    <article className={`event-card event-card--${index}`} data-testid="event-card">
      <DecorativeImage className="event-card__frame" file="75f08cc5ddae6040.avif" />
      <div className="event-card__copy">
        <h3>Shaadi</h3><p>Friday</p><p>29th Aug 2026</p><p>Pune, Maharashtra</p><p>6 Pm Onwards</p><small>More details below</small>
      </div>
    </article>
  );
}

const wideCardMedallions = Array.from({ length: 10 }, (_, index) => index + 1);

function LocationCard() {
  const [selectedLocation, setSelectedLocation] = useState(0);
  const [mapActive, setMapActive] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">("idle");
  const dragRef = useRef<{ pointerId: number; x: number; y: number }>();
  const location = locations[selectedLocation];

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(location.address);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("failed");
    }
  };

  const startMapDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!mapActive || (event.target instanceof Element && event.target.closest("button, a"))) return;
    dragRef.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const moveMap = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    drag.x = event.clientX;
    drag.y = event.clientY;
    setPan((value) => ({ x: value.x + dx, y: value.y + dy }));
  };

  const stopMapDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    dragRef.current = undefined;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  };

  return (
    <div className="location-card">
      <div className={`location-card__map${mapActive ? " is-active" : ""}`} role="region" aria-label={`Map showing ${location.name}`} onClick={() => setMapActive(true)} onPointerDown={startMapDrag} onPointerMove={moveMap} onPointerUp={stopMapDrag} onPointerCancel={stopMapDrag} onWheel={(event) => { if (!mapActive) return; event.preventDefault(); setZoom((value) => Math.max(.8, Math.min(1.6, value + (event.deltaY < 0 ? .2 : -.2)))); }}>
        <div className="location-card__tiles" style={{ transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px)) scale(${zoom})` }}>
          {mapTiles.map((file) => <DecorativeImage className="location-card__tile" file={file} key={file} />)}
        </div>
        <span className="location-card__pin" aria-hidden="true"><svg viewBox="0 0 30 40"><path d="M15 0C6.716 0 0 6.716 0 15c0 10.5 15 25 15 25s15-14.5 15-25C30 6.716 23.284 0 15 0z" fill="#ea4335" /><circle cx="15" cy="15" r="5.5" fill="#fff" /></svg></span>
        <div className="location-card__zoom" aria-label="Map zoom controls"><button type="button" aria-label="Zoom in" onClick={(event) => { event.stopPropagation(); setZoom((value) => Math.min(1.6, value + .2)); }}>+</button><button type="button" aria-label="Zoom out" onClick={(event) => { event.stopPropagation(); setZoom((value) => Math.max(.8, value - .2)); }}>−</button></div>
        {!mapActive && <span className="location-card__hint">Tap to interact with map</span>}
        <span className="location-card__nearby">Nearby Location</span>
        <a className="location-card__maps-link" href={`https://www.google.com/maps/search/?api=1&query=${location.coordinates}`} target="_blank" rel="noreferrer">Open in Google Maps <span aria-hidden="true">↗</span></a>
        <button className="location-card__recenter" type="button" aria-label="Recenter map on location" title="Recenter" onClick={(event) => { event.stopPropagation(); setZoom(1); setPan({ x: 0, y: 0 }); }}><span aria-hidden="true">⌾</span></button>
      </div>
      <div className="location-card__venue"><h3>Venue Name</h3><p>{"wideAddress" in location ? <><span className="narrow-only">{location.address}</span><span className="wide-only">{location.wideAddress}</span></> : location.address}</p><button type="button" aria-label="Copy address to clipboard" onClick={copyAddress}><span aria-hidden="true">▣</span></button>{copyStatus !== "idle" && <span className={`location-card__copy-status is-${copyStatus}`} role="status">{copyStatus === "copied" ? "Copied" : "Copy failed"}</span>}</div>
      <div className="location-card__switcher">{locations.map((item, index) => <button className={index === selectedLocation ? "is-active" : ""} key={`${item.name}-${index}`} type="button" onClick={() => { setSelectedLocation(index); setMapActive(false); setPan({ x: 0, y: 0 }); setZoom(1); setCopyStatus("idle"); }}>{item.name}</button>)}</div>
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
        <h1 className="hero__title" aria-label="Akash weds Drashti">
          <span className="hero__name hero__name--first"><span className="hero__title-reveal">Akash</span></span><span className="hero__and"><span className="hero__title-reveal">weds</span></span><span className="hero__name hero__name--second"><span className="hero__title-reveal">Drashti</span></span>
        </h1>
      </section>

      <section className="section-layer invitation" aria-label="Wedding invitation">
        <DecorativeImage className="wide-only wide-invitation__backdrop" file="wide-invitation-backdrop.webp" />
        <DecorativeImage className="wide-only wide-invitation__scroll" file="wide-scroll.webp" invitationMotion="ganpati-name" />
        <DecorativeImage className="wide-only wide-invitation__ganesh" file="wide-ganesh.webp" invitationMotion="ganpati-icon" />
        <DecorativeImage className="wide-only wide-invitation__flourish" file="wide-heading-flourish.webp" invitationMotion="shri-line" />
        <DecorativeImage className="invitation__garden" file="9833bdd6ffb94266.webp" />
        <div className="invitation__copy">
          <p className="invitation__parents" data-invitation-motion="groom-parents">Shri. Rajmani Pathak &amp; Smt. Ambika Pathak</p>
          <div className="mobile-invitation__line" data-invitation-motion="invitation-line"><p>Cordially request the honor of your</p><p>presence at the wedding celebration of</p><p>our beloved son</p></div>
          <div className="invitation__names"><span data-invitation-motion="groom-name">Akash</span><em data-invitation-motion="and">and</em><span data-invitation-motion="bride-name">Drashti</span></div>
          <p className="invitation__relation" data-invitation-motion="daughter-of">Daughter of</p>
          <p className="invitation__parents invitation__parents--second" data-invitation-motion="bride-parents">Shri. Rajmani Pathak &amp; Smt. Ambika Pathak</p>
          <p className="invitation__events" data-invitation-motion="events-intro"><span className="narrow-only">On The Following Events</span><span className="wide-only">On the following events</span></p>
        </div>
        <div className="wide-only wide-invitation__copy">
          <p className="wide-invitation__parents" data-invitation-motion="groom-parents">Shri. Rajmani Pathak &amp; Smt. Ambika Pathak</p>
          <div className="wide-invitation__line" data-invitation-motion="invitation-line"><p>Cordially request the honor of your presence at the wedding</p><p>celebration of our beloved son</p></div>
          <p className="wide-invitation__name wide-invitation__name--first" data-invitation-motion="groom-name">Akash</p>
          <p className="wide-invitation__and" data-invitation-motion="and">and</p>
          <p className="wide-invitation__name wide-invitation__name--second" data-invitation-motion="bride-name">Drashti</p>
          <p className="wide-invitation__relation" data-invitation-motion="daughter-of">Daughter of</p>
          <p className="wide-invitation__parents wide-invitation__parents--second" data-invitation-motion="bride-parents">Shri. Rajmani Pathak &amp; Smt. Ambika Pathak</p>
          <p className="wide-invitation__events" data-invitation-motion="events-intro">On the following events</p>
        </div>
        <DecorativeImage className="invitation__scroll" file="be15daddc4d3d265.webp" invitationMotion="ganpati-name" />
        <DecorativeImage className="invitation__ganesh" file="299c9e87d4b523dc.webp" invitationMotion="ganpati-icon" />
        <DecorativeImage className="invitation__birds" file="c32c73cb83ebac88.webp" invitationMotion="shri-line" />
      </section>

      <section className="section-layer timeline" aria-label="Wedding timeline">
        <DecorativeImage className="wide-only wide-timeline__backdrop" file="wide-timeline-backdrop.webp" />
        <DecorativeImage className="timeline__garden" file="acf828b9baf56ad9.webp" />
        <div className="timeline__heading"><h2><span className="narrow-only">Wedding Timeline</span><span className="wide-only">Wedding Celebration Timeline</span></h2><p>Mark Your Calendars, We Can’t Wait to Celebrate</p></div>
        {events.map((event) => <EventCard index={event} key={event} />)}
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
        <DecorativeImage className="couple__photo" file="61350ca076dd5ac0.webp" alt="Akash and Drashti celebrating together" />
        <DecorativeImage className="wide-only wide-couple__photo" file="wide-couple-photo.webp" alt="Akash and Drashti celebrating together" />
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
