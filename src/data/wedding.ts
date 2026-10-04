// Everything the invitation says lives here. Edit this file, not the components.
// ⟦…⟧ marks content the family still has to supply: see todo() in ./schema.ts and docs/04-runbook.md.
import { todo, type Block, type Lang, type Tri, type WeddingEvent } from './schema';

/* ---------- the couple (groom first: his family hosts, in Ranchi) ---------- */
const parents = {
  groom: {
    father: { en: 'Umesh Kumar Sinha', mr: 'उमेश कुमार सिन्हा', hi: 'उमेश कुमार सिन्हा' } as Tri,
    mother: { en: 'Rupa Sinha', mr: 'रूपा सिन्हा', hi: 'रूपा सिन्हा' } as Tri
  },
  bride: {
    father: { en: 'Shriharsh Waghmare', mr: 'श्रीहर्ष वाघमारे', hi: 'श्रीहर्ष वाघमारे' } as Tri,
    mother: { en: 'Sumati Waghmare', mr: 'सुमती वाघमारे', hi: 'सुमती वाघमारे' } as Tri
  }
};

export const couple = {
  groom: { en: 'Shreyansh', dev: 'श्रेयांश', surname: 'Shrey', from: 'Bihar', art: 'Madhubani', artDev: 'मधुबनी' },
  bride: { en: 'Mrunalini', dev: 'मृणालिनी', surname: 'Waghmare', from: 'Pune', art: 'Paithani', artDev: 'पैठणी' },
  both: 'Shreyansh & Mrunalini',
  bothDev: 'श्रेयांश · मृणालिनी',
  parents
};

/* ---------- venue: the public banquet only, never a home address ---------- */
export const venue = {
  name: 'Haveli Banquet',
  city: 'Ranchi',
  full: 'Haveli Banquet, Ranchi',
  mr: 'हवेली बँक्वेट, रांची',
  hi: 'हवेली बैंक्वेट, रांची',
  /** replace with the exact Google Maps pin link when the family sends it */
  maps: 'https://www.google.com/maps/search/?api=1&query=Haveli+Banquet+Ranchi'
};

/* ---------- the three celebrations ---------- */
export const events: WeddingEvent[] = [
  {
    id: 'haldi',
    name: { en: 'Haldi', mr: 'हळद', hi: 'हल्दी' },
    dn: [{ lang: 'mr', text: 'हळद' }, { lang: 'hi', text: 'हल्दी' }],
    story: 'Turmeric in a brass bowl, mango leaves and marigolds.',
    start: '2026-12-08T12:00:00+05:30',
    end: '2026-12-08T15:00:00+05:30',
    when: 'Tuesday, 8 December 2026 · 12 noon',
    short: 'Tue 8 Dec · 12 noon',
    dress: 'Yellow, in turmeric shades',
    swatch: { bg: '#D99A1E', edge: '#E8C06A' }
  },
  {
    id: 'sangeet',
    name: { en: 'Sangeet', mr: 'संगीत', hi: 'संगीत संध्या' },
    dn: [{ lang: 'mr', text: 'संगीत' }, { lang: 'hi', text: 'संगीत संध्या' }],
    story: 'The dholak plays and the ghungroo answer.',
    start: '2026-12-08T20:00:00+05:30',
    end: '2026-12-08T23:30:00+05:30',
    when: 'Tuesday, 8 December 2026 · 8 in the evening',
    short: 'Tue 8 Dec · 8 pm',
    dress: 'Evening formals; Indo-western welcome',
    swatch: { bg: '#2F3E73', edge: '#C9A04A' }
  },
  {
    id: 'shaadi',
    name: { en: 'Shaadi', mr: 'लग्न', hi: 'शुभ विवाह' },
    dn: [{ lang: 'mr', text: 'लग्न' }, { lang: 'hi', text: 'शुभ विवाह' }],
    story: 'Seven steps around the fire; the knot is tied.',
    start: '2026-12-09T20:00:00+05:30',
    end: '2026-12-10T00:00:00+05:30',
    when: 'Wednesday, 9 December 2026 · 8 in the evening',
    short: 'Wed 9 Dec · 8 pm',
    dress: 'Traditional finery, in jewel tones',
    swatch: { bg: '#A3195B', edge: '#C9A04A' }
  }
];

const DAY = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', weekday: 'long', day: 'numeric' });
const dayOf = (iso: string) => iso.slice(0, 10);

/** "8 & 9 December 2026" and "Tuesday 8 & Wednesday 9 December 2026" for the events a guest is invited to. */
export function datesFor(ids: readonly string[]) {
  const days = [...new Set(events.filter((e) => ids.includes(e.id)).map((e) => dayOf(e.start)))].sort();
  const noon = (d: string) => new Date(d + 'T12:00:00+05:30');
  const short = days.map((d) => String(Number(d.slice(8, 10)))).join(' & ') + ' December 2026';
  const long = days.map((d) => DAY.format(noon(d)).replace(/^(\d+) (\w+)$/, '$2 $1')).join(' & ') + ' December 2026';
  return { short, long };
}

export const countWords = ['no celebrations', 'one celebration', 'two celebrations', 'three celebrations'];

export const dates = {
  ...datesFor(['haldi', 'sangeet', 'shaadi']),
  /** the muhurat the countdown runs to */
  countdown: '2026-12-09T20:00:00+05:30',
  countdownLabel: 'Wednesday, 9 December 2026 · 8 in the evening'
};

/* ---------- the invitation card, in the order elders expect (docs/01-research.md §10) ---------- */
const P = parents;
export const invitation: Record<Lang, { label: string; blocks: Block[] }> = {
  en: {
    label: 'English',
    blocks: [
      { k: 'invocation', t: '॥ Shri Ganeshaya Namah ॥ · ॥ Namo Buddhaya ॥' },
      { k: 'lead', t: 'With the blessings of our elders, we request the pleasure of your company at the wedding of' },
      { k: 'name', t: 'Shreyansh' },
      { k: 'parents', t: 'son of Mr ' + P.groom.father.en + ' & Mrs ' + P.groom.mother.en },
      { k: 'join', t: 'with' },
      { k: 'name', t: 'Mrunalini' },
      { k: 'parents', t: 'daughter of Mr ' + P.bride.father.en + ' & Mrs ' + P.bride.mother.en },
      { k: 'when', t: 'Wednesday, 9 December 2026' },
      { k: 'where', t: '8:00 in the evening · Haveli Banquet, Ranchi' },
      { k: 'note', t: 'Please accept this invitation as our personal visit.' },
      { k: 'sign', t: 'With love, Umesh Kumar & Rupa Sinha and Shriharsh & Sumati Waghmare' }
    ]
  },
  mr: {
    label: 'मराठी',
    blocks: [
      { k: 'invocation', t: '॥ श्री गणेशाय नमः ॥ · ॥ नमो बुद्धाय ॥' },
      { k: 'lead', t: 'सप्रेम नमस्कार वि. वि.' },
      { k: 'lead', t: 'वडीलधाऱ्यांच्या आशीर्वादाने' },
      { k: 'name', t: 'चि. श्रेयांश' },
      { k: 'parents', t: '(श्री. ' + P.groom.father.mr + ' व सौ. ' + P.groom.mother.mr + ' यांचा सुपुत्र)' },
      { k: 'join', t: 'आणि' },
      { k: 'name', t: 'चि. सौ. कां. मृणालिनी' },
      { k: 'parents', t: '(श्री. ' + P.bride.father.mr + ' व सौ. ' + P.bride.mother.mr + ' यांची सुकन्या)' },
      { k: 'shubh', t: '॥ यांचा शुभविवाह ॥' },
      { k: 'when', t: 'बुधवार, दि. ९ डिसेंबर २०२६ रोजी रात्री ८ वा. करण्याचे योजिले आहे.' },
      { k: 'request', t: 'तरी आपण या मंगलसमयी सहकुटुंब, सहपरिवार अगत्य उपस्थित राहून वधूवरांस शुभाशीर्वाद द्यावेत ही नम्र विनंती.' },
      { k: 'where', t: 'विवाह स्थळ: हवेली बँक्वेट, रांची' },
      { k: 'sign', t: 'आपले नम्र: श्री. उमेश कुमार व सौ. रूपा सिन्हा · श्री. श्रीहर्ष व सौ. सुमती वाघमारे' }
    ]
  },
  hi: {
    label: 'हिंदी',
    blocks: [
      { k: 'invocation', t: '॥ श्री गणेशाय नमः ॥ · ॥ नमो बुद्धाय ॥' },
      { k: 'shloka', t: 'वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ। निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥' },
      { k: 'lead', t: 'परमपिता परमेश्वर की असीम अनुकम्पा से' },
      { k: 'name', t: 'आयुष्मान् श्रेयांश' },
      { k: 'parents', t: 'सुपुत्र · श्री ' + P.groom.father.hi + ' एवं श्रीमती ' + P.groom.mother.hi },
      { k: 'join', t: 'संग' },
      { k: 'name', t: 'आयुष्मती मृणालिनी' },
      { k: 'parents', t: 'सुपुत्री · श्री ' + P.bride.father.hi + ' एवं श्रीमती ' + P.bride.mother.hi },
      { k: 'request', t: 'के शुभ विवाह के मांगलिक अवसर पर आप सपरिवार सादर आमंत्रित हैं।' },
      { k: 'when', t: 'बुधवार, ९ दिसम्बर २०२६' },
      { k: 'where', t: 'रात्रि ८ बजे · हवेली बैंक्वेट, रांची' },
      { k: 'sign', t: 'दर्शनाभिलाषी: श्री उमेश कुमार एवं श्रीमती रूपा सिन्हा · श्री श्रीहर्ष एवं श्रीमती सुमती वाघमारे' },
      { k: 'note', t: 'समयाभाव के कारण निमंत्रण पत्रिका को ही मनुहार की मान्यता प्रदान कर अनुगृहीत करें।' },
      { k: 'manuhar', t: '“मेले ' + todo('Bal manuhar: relation, e.g. चाचा') + ' की छादी में जलूल आना!”' },
      { k: 'manuhar-by', t: '— ' + todo('Bal manuhar: child’s name') }
    ]
  }
};

/* ---------- the blessing ---------- */
export const mangal = {
  verse: [
    'गङ्गा सिन्धु सरस्वती च यमुना गोदावरी नर्मदा',
    'कावेरी सरयू महेन्द्रतनया चर्मण्वती वेदिका।',
    'शिप्रा वेत्रवती महासुरनदी ख्याता च या गण्डकी',
    'पूर्णाः पुण्यजलैः समुद्रसहिताः कुर्वन्तु वो मङ्गलम्॥'
  ],
  rivers: ['गोदावरी', 'गण्डकी'],
  label: 'From the mangalashtak, the eight verses sung over a Marathi wedding',
  gloss: 'Ganga, Sindhu, Saraswati, Yamuna, Godavari, Narmada… and the famed Gandaki: may these holy rivers bring you auspiciousness. The Godavari flows through her Maharashtra; the Gandaki through his Bihar.',
  /* the first of the eight Pali victory verses chanted at Buddhist weddings (aimwell.org/jayamangala.html) */
  jaya: {
    verse: [
      'बाहुं सहस्समभिनिम्मित सायुधन्तं',
      'गिरिमेखलं उदित घोर ससेन मारं।',
      'दानादि धम्म विधिना जितवा मुनिन्दो',
      'तं तेजसा भवतु ते जयमङ्गलानि॥'
    ],
    marks: ['जयमङ्गलानि'],
    label: 'From the jayamangala gāthā, the eight Pali verses chanted at a Buddhist wedding',
    gloss: 'Mara came with a thousand armed hands and his army; the Lord of Sages won by giving and the other virtues. By that power, may victory and every blessing be yours. This first verse tells of the night under the Bodhi tree at Bodh Gaya, in his Bihar.'
  },
  savdhan: '॥ शुभमंगल सावधान ॥'
};

export const chaupai = ['मंगल भवन अमंगल हारी।', 'द्रवउ सो दसरथ अजिर बिहारी॥'];
/* her family's blessing beside his: "may all beings be happy" (Karaniya Metta Sutta, Sn 1.8) */
export const metta = { pi: 'सब्बे सत्ता भवन्तु सुखितत्ता॥', en: 'May all beings be happy.' };

/* ---------- RSVP ---------- */
export const rsvp = {
  /** replies close at the end of this day, IST; a quiet grace period follows for late taps */
  deadline: '2026-11-25T23:59:59+05:30',
  graceHours: 72,
  maxPerEvent: 20,
  /** how long the form must have been on screen before a send counts (bots fill forms instantly) */
  minMs: 2500
};

/* ---------- music: the couple's own recording, made with `npm run audio -- input.wav` ---------- */
export const music = {
  /** public/audio/invite.m4a, made by `npm run audio`; bump v when the file changes (MUSIC_SRC overrides it, for tests) */
  src: ((globalThis as { process?: { env: Record<string, string | undefined> } }).process?.env.MUSIC_SRC || '/audio/invite.m4a?v=1') as string | null,
  /** the background music plays round and round until the guest mutes it */
  loop: true,
  /** shown small in the footer when set, e.g. 'Mangalashtak' and 'sung by Aaji' */
  title: '',
  credit: ''
};

/* ---------- words used across the page ---------- */
export const copy = {
  cover: {
    eyebrow: 'with love, for',
    eyebrowDev: 'सस्नेह निमंत्रण',
    guestDefault: 'our family and friends',
    seal: 'शुभमंगल सावधान',
    tap: 'Open'
  },
  hero: { eyebrow: 'The wedding of' },
  /* his family's invocation and hers, side by side and equal, and one blessing both can say (docs/research/06-story-customs-bridges.md §c) */
  invocation: {
    his: '॥ श्री गणेशाय नमः ॥',
    hers: '॥ नमो बुद्धाय ॥',
    blessing: '॥ भवतु सब्ब मङ्गलं ॥',
    line: 'May every blessing be yours.'
  },
  homes: { eyebrowDev: 'दो घर · दोन घरं', eyebrow: 'two homes', title: 'Bihar and Buddhism,', titleEm: 'and the old threads between them' },
  invite: { eyebrowDev: 'निमंत्रण', eyebrow: 'the invitation', title: 'You are invited', titleFor: '{name}, you are invited', choose: 'Read the invitation in', manuhar: 'बाल मनुहार' },
  schedule: { eyebrowDev: 'कार्यक्रम', eyebrow: 'the celebrations', title: 'From Pune to Ranchi,', titleEm: 'three celebrations', when: 'When', where: 'Where', wear: 'Wear' },
  rites: {
    wayDev: 'रस्ता दाखवा', way: 'Find your way to us',
    knotDev: 'गाँठ बाँध लीजिए', knot: 'Save the date', knotBusy: 'Opening your calendar…'
  },
  mangal: { eyebrowDev: 'मंगलाष्टक', eyebrowPi: 'जयमङ्गल', eyebrow: 'Mangalashtak · Jayamangala', title: 'Eight verses each,', titleEm: 'one blessing' },
  count: { eyebrowDev: 'मुहूर्त', eyebrow: 'the muhurat is in', units: ['days', 'hours', 'minutes', 'seconds'] },
  rsvp: {
    eyebrowDev: 'उत्तराकांक्षी', eyebrow: 'awaiting your reply',
    title: 'Will you join us?',
    /* with ?name= in the link */
    titleFor: 'Will you join us, {name}?',
    ask: 'how many of you will come to each celebration?',
    name: 'Your name',
    note: 'A note for the couple (optional)',
    send: 'Send RSVP',
    sending: 'Sending…',
    thanksDev: 'धन्यवाद',
    /* the Mangala Sutta (Sn 2.4): for two families becoming one */
    pali: ['दानञ्च धम्मचरिया च, ञातकानञ्च सङ्गहो।', 'अनवज्जानि कम्मानि, एतं मङ्गलमुत्तमं॥'],
    paliEn: 'Giving, living rightly, kindness to one’s relatives, doing no harm: this is the highest blessing. From the Mangala Sutta.',
    thanks: 'Thank you!',
    thanksFor: 'Thank you, {name}!',
    seeYou: 'See you in Ranchi.',
    none: 'We’ll miss you. Thank you for letting us know.',
    change: 'Change my reply',
    failed: 'We couldn’t send your reply just now. Send it on WhatsApp instead; it’s already written for you.',
    whatsapp: 'Send on WhatsApp',
    retry: 'Try again',
    closed: 'Replies have closed. If your plans have changed, please message the family on WhatsApp.',
    noCode: 'To reply, answer the WhatsApp message that brought you here. We’ll count you in.',
    badCode: 'We couldn’t find your personal link, so here is the invitation for everyone.'
  },
  footer: {
    love: 'With love, the families of Shreyansh & Mrunalini',
    credits: 'The art on this page',
    creditsNote: 'Every picture here is shared openly: by the museums and libraries that keep it, or, for the photographs, by the people who took them.'
  },
  controls: {
    muteOn: 'Play the music', muteOff: 'Mute the music', hint: 'Tap the bell to mute'
  }
};

/* ---------- link preview, calendar ---------- */
export const site = {
  title: 'Shreyansh & Mrunalini · 8 & 9 December 2026',
  description: 'With love, you are invited to the wedding of Shreyansh and Mrunalini in Ranchi.',
  ogAlt: 'Shreyansh & Mrunalini, in large letters over a 17th-century painting of a peacock grove.',
  ogVersion: 3,
  /** bump when an event's time or place changes, so calendars update the saved event */
  calendarSequence: 0,
  themeColor: '#1A1220'
};
