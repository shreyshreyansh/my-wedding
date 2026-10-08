// Every word the page shows, for each way it can be read:
//   mixed  the page as it has always been (no ?lang=): English, with Devanagari accents beside it
//   en     English only;   mr  Marathi only;   hi  Hindi only
// The holy lines stay as they are written in every view (the invocations, the verses, the chaupai, the Pali);
// only what explains them is translated. The names, the art credits and the invitation card's own text stay too.
// ⚑ The Marathi and Hindi here want an elder's read before the invitations go out.
import { copy, countWords, dates, datesFor, events, mangal, metta, venue } from './wedding';
import { summaryLine, type Words } from '../lib/wa';

export type View = 'mixed' | 'en' | 'mr' | 'hi';
export type Lang1 = 'en' | 'mr' | 'hi';
/** a piece of text and the language it is in, when that differs from the page's */
export type Part = { t: string; lang?: string };

export const LANGS: readonly Lang1[] = ['en', 'mr', 'hi'];
export const isLang = (s: string | null | undefined): s is Lang1 => !!s && (LANGS as readonly string[]).includes(s);
/** which page this is, from its path: /mr/ is Marathi, / is the mixed page */
export const viewOf = (url: URL): View => { const s = url.pathname.split('/')[1]; return isLang(s) ? s : 'mixed'; };

const DEVA = '०१२३४५६७८९';
/** numbers in Devanagari digits on the Marathi and Hindi pages */
export const num = (v: View, n: number | string) => (v === 'mr' || v === 'hi' ? String(n).replace(/\d/g, (d) => DEVA[+d]) : String(n));

type EvText = { name: string; dn: Part[]; story: string; when: string; short: string; dress: string };

export interface Text {
  view: View;
  html: Lang1;
  cover: { eyebrow: Part[]; guestDefault: string; tap: string; city: string };
  hero: { eyebrow: Part[]; aria: string };
  invocation: { line: string };
  homes: { eyebrow: Part[]; title: string; titleEm: string; marks: [string, string]; lines: string[] };
  note: { eyebrow: Part[]; title: string; body: string; sign: string };
  place: { eyebrow: Part[]; title: string; map: string; open: string; copy: string; copied: string };
  know: { eyebrow: Part[]; title: string; intro: string; weather: [string, string]; wear: string; way: [string, string]; reply: [string, string] };
  photos: { eyebrow: Part[]; title: string; soon: string };
  invite: { eyebrow: Part[]; title: string; titleFor: string; choose: string; card: Lang1 };
  schedule: { eyebrow: Part[]; title: string; countWords: string[]; when: string; where: string; wear: string };
  ev: Record<string, EvText>;
  venue: string;
  dates: (ids: readonly string[]) => { short: string; long: string };
  rites: { way: Part[]; knot: Part[]; busy: string; wayAria: string; knotAria: (ev: string) => string };
  mangal: { eyebrow: Part[]; title: string; titleEm: string; label: string; gloss: string; jayaLabel: string; jayaGloss: string };
  count: { eyebrow: Part[]; units: string[]; when: string };
  rsvp: {
    eyebrow: Part[]; title: string; titleFor: string; ask: string; name: string; note: string; send: string; sending: string;
    thanksPre: Part | null; thanks: string; thanksFor: string; seeYou: string; paliGloss: string; none: string; change: string;
    failed: string; whatsapp: string; retry: string; closed: string; noCode: string; badCode: string;
    fewer: (ev: string) => string; more: (ev: string) => string; guestsFor: (ev: string) => string;
    /** "Haldi · 2 guests": the words around the number, for the page and for the edge */
    line: Words;
  };
  footer: { love: string; credits: string; creditsNote: string; metta: string };
  controls: { muteOn: string; muteOff: string; hint: string };
}

/* ---------- the page as it is today (no ?lang=) ---------- */
const evMixed = Object.fromEntries(events.map((e) => [e.id, { name: e.name.en, dn: e.dn.map((d) => ({ t: d.text, lang: d.lang })), story: e.story, when: e.when, short: e.short, dress: e.dress }]));
const mixed: Text = {
  view: 'mixed', html: 'en',
  cover: { eyebrow: [{ t: copy.cover.eyebrowDev, lang: 'hi' }, { t: copy.cover.eyebrow }], guestDefault: copy.cover.guestDefault, tap: copy.cover.tap, city: venue.city },
  hero: { eyebrow: [{ t: '॥ शुभ विवाह ॥', lang: 'hi' }, { t: copy.hero.eyebrow }], aria: 'Shreyansh and Mrunalini' },
  invocation: { line: copy.invocation.line },
  homes: { eyebrow: [{ t: copy.homes.eyebrowDev, lang: 'hi' }, { t: copy.homes.eyebrow }], title: copy.homes.title, titleEm: copy.homes.titleEm, marks: copy.homes.marks, lines: copy.homes.lines },
  note: { eyebrow: [{ t: copy.note.eyebrowDev, lang: 'hi' }, { t: copy.note.eyebrow }], title: copy.note.title, body: copy.note.body, sign: copy.note.sign },
  place: { eyebrow: [{ t: copy.place.eyebrowDev, lang: 'mr' }, { t: copy.place.eyebrow }], title: copy.place.title, map: copy.place.map, open: copy.place.open, copy: copy.place.copy, copied: copy.place.copied },
  know: { eyebrow: [{ t: copy.know.eyebrowDev, lang: 'hi' }, { t: copy.know.eyebrow }], title: copy.know.title, intro: copy.know.intro, weather: copy.know.weather, wear: copy.know.wear, way: copy.know.way, reply: copy.know.reply },
  photos: { eyebrow: [{ t: copy.photos.eyebrowDev, lang: 'mr' }, { t: copy.photos.eyebrow }], title: copy.photos.title, soon: copy.photos.soon },
  invite: { eyebrow: [{ t: copy.invite.eyebrowDev, lang: 'mr' }, { t: copy.invite.eyebrow }], title: copy.invite.title, titleFor: copy.invite.titleFor, choose: copy.invite.choose, card: 'en' },
  schedule: { eyebrow: [{ t: copy.schedule.eyebrowDev, lang: 'mr' }, { t: copy.schedule.eyebrow }], title: copy.schedule.title, countWords, when: copy.schedule.when, where: copy.schedule.where, wear: copy.schedule.wear },
  ev: evMixed,
  venue: venue.full,
  dates: datesFor,
  rites: {
    way: [{ t: copy.rites.wayDev, lang: 'mr' }, { t: copy.rites.way }], knot: [{ t: copy.rites.knotDev, lang: 'hi' }, { t: copy.rites.knot }], busy: copy.rites.knotBusy,
    wayAria: 'Find your way to ' + venue.full + ' (opens Google Maps)', knotAria: (ev) => 'Save the ' + ev + ' date to your calendar'
  },
  mangal: { eyebrow: [{ t: copy.mangal.eyebrowDev, lang: 'mr' }, { t: copy.mangal.eyebrowPi, lang: 'pi' }, { t: copy.mangal.eyebrow }], title: copy.mangal.title, titleEm: copy.mangal.titleEm, label: mangal.label, gloss: mangal.gloss, jayaLabel: mangal.jaya.label, jayaGloss: mangal.jaya.gloss },
  count: { eyebrow: [{ t: copy.count.eyebrowDev, lang: 'mr' }, { t: copy.count.eyebrow }], units: copy.count.units, when: dates.countdownLabel },
  rsvp: {
    eyebrow: [{ t: copy.rsvp.eyebrowDev, lang: 'hi' }, { t: copy.rsvp.eyebrow }], title: copy.rsvp.title, titleFor: copy.rsvp.titleFor, ask: copy.rsvp.ask,
    name: copy.rsvp.name, note: copy.rsvp.note, send: copy.rsvp.send, sending: copy.rsvp.sending, thanksPre: { t: copy.rsvp.thanksDev, lang: 'hi' },
    thanks: copy.rsvp.thanks, thanksFor: copy.rsvp.thanksFor, seeYou: copy.rsvp.seeYou, paliGloss: copy.rsvp.paliEn, none: copy.rsvp.none, change: copy.rsvp.change,
    failed: copy.rsvp.failed, whatsapp: copy.rsvp.whatsapp, retry: copy.rsvp.retry, closed: copy.rsvp.closed, noCode: copy.rsvp.noCode, badCode: copy.rsvp.badCode,
    fewer: (ev) => 'One fewer guest for ' + ev, more: (ev) => 'One more guest for ' + ev, guestsFor: (ev) => 'Guests for ' + ev,
    line: { one: 'guest', many: 'guests', no: 'not coming' }
  },
  footer: { love: copy.footer.love, credits: copy.footer.credits, creditsNote: copy.footer.creditsNote, metta: metta.en },
  controls: { muteOn: copy.controls.muteOn, muteOff: copy.controls.muteOff, hint: copy.controls.hint }
};

/* ---------- English only: the same words, without the Devanagari beside them ---------- */
const en: Text = {
  ...mixed, view: 'en',
  cover: { ...mixed.cover, eyebrow: [{ t: copy.cover.eyebrow }] },
  hero: { ...mixed.hero, eyebrow: [{ t: copy.hero.eyebrow }] },
  homes: { ...mixed.homes, eyebrow: [{ t: copy.homes.eyebrow }] },
  note: { ...mixed.note, eyebrow: [{ t: copy.note.eyebrow }] },
  place: { ...mixed.place, eyebrow: [{ t: copy.place.eyebrow }] },
  know: { ...mixed.know, eyebrow: [{ t: copy.know.eyebrow }] },
  photos: { ...mixed.photos, eyebrow: [{ t: copy.photos.eyebrow }] },
  invite: { ...mixed.invite, eyebrow: [{ t: copy.invite.eyebrow }] },
  schedule: { ...mixed.schedule, eyebrow: [{ t: copy.schedule.eyebrow }] },
  ev: Object.fromEntries(Object.entries(evMixed).map(([id, e]) => [id, { ...e, dn: [] }])),
  rites: { ...mixed.rites, way: [{ t: copy.rites.way }], knot: [{ t: copy.rites.knot }] },
  mangal: { ...mixed.mangal, eyebrow: [{ t: copy.mangal.eyebrow }] },
  count: { ...mixed.count, eyebrow: [{ t: copy.count.eyebrow }] },
  rsvp: { ...mixed.rsvp, eyebrow: [{ t: copy.rsvp.eyebrow }], thanksPre: null }
};

/* dates in Marathi and Hindi: "८ व ९ डिसेंबर २०२६", "मंगळवार ८ व बुधवार ९ डिसेंबर २०२६" */
const WEEK = {
  mr: ['रविवार', 'सोमवार', 'मंगळवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'],
  hi: ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार']
};
function datesIn(v: 'mr' | 'hi') {
  const and = v === 'mr' ? ' व ' : ' और ', month = v === 'mr' ? ' डिसेंबर ' : ' दिसंबर ';
  return (ids: readonly string[]) => {
    const days = [...new Set(events.filter((e) => ids.includes(e.id)).map((e) => e.start.slice(0, 10)))].sort();
    const wd = (d: string) => WEEK[v][new Date(d + 'T12:00:00+05:30').getUTCDay()];
    const day = (d: string) => num(v, Number(d.slice(8, 10)));
    return { short: days.map(day).join(and) + month + num(v, 2026), long: days.map((d) => wd(d) + ' ' + day(d)).join(and) + month + num(v, 2026) };
  };
}

/* ---------- मराठी ---------- */
const mr: Text = {
  view: 'mr', html: 'mr',
  cover: { eyebrow: [{ t: 'सस्नेह निमंत्रण' }], guestDefault: 'आमचे सर्व आप्तेष्ट आणि मित्रपरिवार', tap: 'उघडा', city: 'रांची' },
  hero: { eyebrow: [{ t: '॥ शुभविवाह ॥' }], aria: 'श्रेयांश आणि मृणालिनी' },
  invocation: { line: 'तुम्हाला सर्व मंगल लाभो.' },
  homes: {
    eyebrow: [{ t: 'दोन घरं' }], title: 'बिहार आणि बौद्ध धम्म,', titleEm: 'आणि त्यांना जोडणारे जुने धागे', marks: ['छठ', 'बोधगया'],
    lines: [
      'श्रेयांशचा बिहार: छठ पूजेला स्त्रिया नदीत उभ्या राहून फळांच्या टोपल्या सूर्याला अर्पण करतात.',
      'मृणालिनीच्या धम्माचा उगम श्रेयांशच्या बिहारमध्ये: बोधगयेत, बोधिवृक्षाखाली बुद्धांना ज्ञानप्राप्ती झाली.',
      'जुने धागे त्यांना आधीच जोडतात: ‘बिहार’ हे नावच ‘विहार’, म्हणजे बौद्ध मठ, या शब्दावरून आले आहे.'
    ]
  },
  note: {
    eyebrow: [{ t: 'दोन शब्द' }], title: 'या, आनंदात सहभागी व्हा',
    body: 'रांची आणि पुणे, ही दोन घरं आता एक कुटुंब होणार आहेत. हळद असेल, संगीत असेल, अग्नीभोवतीची सप्तपदी असेल आणि भरपूर मेजवानीही. पण तुम्ही नसाल तर यातलं काहीच पूर्ण वाटणार नाही.',
    sign: '— श्रेयांश आणि मृणालिनी'
  },
  place: { eyebrow: [{ t: 'विवाहस्थळ' }], title: 'आम्ही इथे असू', map: 'नकाशा दाखवा', open: 'Google Maps मध्ये उघडा', copy: 'पत्ता कॉपी करा', copied: 'पत्ता कॉपी झाला' },
  know: {
    eyebrow: [{ t: 'उपयुक्त माहिती' }], title: 'हे लक्षात असू द्या', intro: 'दिवस सोपा आणि आनंदी जावा म्हणून काही गोष्टी.',
    weather: ['हवामान', 'डिसेंबरमध्ये रांचीत थंड आणि कोरडं हवामान असतं: दिवसा सुमारे २३°, रात्री सुमारे १०° सेल्सियस. संध्याकाळसाठी शाल सोबत ठेवा.'],
    wear: 'पोशाख',
    way: ['कसे पोहोचाल', 'हवेली बँक्वेट, रांची. नकाशा आणि रस्ता वरच आहे.'],
    reply: ['उत्तर कळवा', 'बुधवार, २५ नोव्हेंबरपर्यंत. खाली उत्तर द्या, म्हणजे आम्हाला आपली तयारी करता येईल.']
  },
  photos: { eyebrow: [{ t: 'आठवणी' }], title: 'आमचे काही आवडते क्षण', soon: 'फोटो लवकरच' },
  invite: { eyebrow: [{ t: 'निमंत्रण' }], title: 'आपणास सस्नेह निमंत्रण', titleFor: '{name}, आपणास सस्नेह निमंत्रण', choose: 'निमंत्रण या भाषेत वाचा', card: 'mr' },
  schedule: { eyebrow: [{ t: 'कार्यक्रम' }], title: 'पुण्याहून रांचीपर्यंत,', countWords: ['एकही सोहळा नाही', 'एक सोहळा', 'दोन सोहळे', 'तीन सोहळे'], when: 'केव्हा', where: 'कुठे', wear: 'पोशाख' },
  ev: {
    haldi: { name: 'हळद', dn: [], story: 'पितळेच्या वाटीत हळद, आंब्याची पाने आणि झेंडूची फुले.', when: 'मंगळवार, ८ डिसेंबर २०२६ · दुपारी १२ वाजता', short: 'मंगळ, ८ डिसें. · दुपारी १२', dress: 'पिवळा, हळदीच्या छटांमध्ये' },
    sangeet: { name: 'संगीत', dn: [], story: 'ढोलकी वाजते आणि घुंगरू साथ देतात.', when: 'मंगळवार, ८ डिसेंबर २०२६ · रात्री ८ वाजता', short: 'मंगळ, ८ डिसें. · रात्री ८', dress: 'संध्याकाळचा औपचारिक पोशाख; इंडो-वेस्टर्नही चालेल' },
    shaadi: { name: 'लग्न', dn: [], story: 'अग्नीभोवती सात पावले; गाठ बांधली जाते.', when: 'बुधवार, ९ डिसेंबर २०२६ · रात्री ८ वाजता', short: 'बुध, ९ डिसें. · रात्री ८', dress: 'पारंपरिक पोशाख, गडद रत्नरंगांत' }
  },
  venue: venue.mr,
  dates: datesIn('mr'),
  rites: { way: [{ t: 'रस्ता दाखवा' }], knot: [{ t: 'गाठ बांधून ठेवा' }], busy: 'कॅलेंडर उघडत आहोत…', wayAria: venue.mr + ' कडे जाण्याचा रस्ता (Google Maps उघडेल)', knotAria: (ev) => ev + ' आपल्या कॅलेंडरमध्ये जोडा' },
  mangal: {
    eyebrow: [{ t: 'मंगलाष्टक · जयमंगल' }], title: 'दोन्हीकडे आठ श्लोक,', titleEm: 'एकच आशीर्वाद',
    label: 'मंगलाष्टकातून: मराठी लग्नात म्हटले जाणारे आठ श्लोक',
    gloss: 'गंगा, सिंधू, सरस्वती, यमुना, गोदावरी, नर्मदा… आणि प्रसिद्ध गंडकी: या पवित्र नद्या आपले मंगल करोत. गोदावरी मृणालिनीच्या महाराष्ट्रातून वाहते; गंडकी श्रेयांशच्या बिहारमधून.',
    jayaLabel: 'जयमंगल गाथेतून: बौद्ध विवाहात म्हटल्या जाणाऱ्या आठ पाली गाथा',
    jayaGloss: 'हजार सशस्त्र हातांनी, आपल्या सैन्यासह मार चालून आला; मुनींद्रांनी दान आदी पारमितांनी त्याला जिंकले. त्या तेजाने तुम्हाला जय आणि सर्व मंगल लाभो. ही पहिली गाथा श्रेयांशच्या बिहारमधील बोधगयेच्या बोधिवृक्षाखालच्या रात्रीची आहे.'
  },
  count: { eyebrow: [{ t: 'मुहूर्ताला' }], units: ['दिवस', 'तास', 'मिनिटे', 'सेकंद'], when: 'बुधवार, ९ डिसेंबर २०२६ · रात्री ८ वाजता' },
  rsvp: {
    eyebrow: [{ t: 'उत्तराच्या प्रतीक्षेत' }], title: 'आपण याल ना?', titleFor: '{name}, आपण याल ना?', ask: 'प्रत्येक सोहळ्याला आपण किती जण याल?',
    name: 'आपले नाव', note: 'वधू-वरांसाठी संदेश (ऐच्छिक)', send: 'उत्तर पाठवा', sending: 'पाठवत आहोत…', thanksPre: null,
    thanks: 'मनःपूर्वक आभार!', thanksFor: '{name}, मनःपूर्वक आभार!', seeYou: 'रांचीत भेटूया.',
    paliGloss: 'दान, धर्माचरण, नातेवाइकांचा सांभाळ, निर्दोष कर्मे: हेच उत्तम मंगल. मंगल सुत्तातून.',
    none: 'आपली उणीव भासेल. कळवल्याबद्दल आभार.', change: 'माझे उत्तर बदला',
    failed: 'आपले उत्तर आत्ता पाठवता आले नाही. ते व्हॉट्सॲपवर पाठवा; ते आधीच लिहून ठेवले आहे.', whatsapp: 'व्हॉट्सॲपवर पाठवा', retry: 'पुन्हा प्रयत्न करा',
    closed: 'उत्तर देण्याची मुदत संपली आहे. आपल्या योजनेत बदल झाला असल्यास कृपया कुटुंबीयांना व्हॉट्सॲपवर कळवा.',
    noCode: 'उत्तर देण्यासाठी, ज्या व्हॉट्सॲप संदेशातून आपण इथे आलात त्यालाच उत्तर द्या. आम्ही आपली नोंद करू.',
    badCode: 'आपली वैयक्तिक लिंक सापडली नाही, म्हणून हे सर्वांसाठीचे निमंत्रण आहे.',
    fewer: (ev) => ev + ': एक पाहुणा कमी', more: (ev) => ev + ': एक पाहुणा जास्त', guestsFor: (ev) => ev + ': पाहुण्यांची संख्या',
    line: { one: 'पाहुणा', many: 'पाहुणे', no: 'येणार नाही', deva: true }
  },
  footer: {
    love: 'सस्नेह, श्रेयांश आणि मृणालिनी यांचे कुटुंबीय', credits: 'या पानावरील चित्रे',
    creditsNote: 'येथील प्रत्येक चित्र खुलेपणाने उपलब्ध आहे: ते जपणाऱ्या संग्रहालयांनी आणि ग्रंथालयांनी, किंवा छायाचित्रांच्या बाबतीत ती काढणाऱ्यांनी दिलेले.',
    metta: 'सर्व प्राणी सुखी होवोत.'
  },
  controls: { muteOn: 'संगीत सुरू करा', muteOff: 'संगीत बंद करा', hint: 'संगीत बंद करण्यासाठी घंटेवर टॅप करा' }
};

/* ---------- हिंदी ---------- */
const hi: Text = {
  view: 'hi', html: 'hi',
  cover: { eyebrow: [{ t: 'सस्नेह निमंत्रण' }], guestDefault: 'हमारे सभी परिजन और मित्र', tap: 'खोलें', city: 'रांची' },
  hero: { eyebrow: [{ t: '॥ शुभ विवाह ॥' }], aria: 'श्रेयांश और मृणालिनी' },
  invocation: { line: 'आपको हर मंगल प्राप्त हो।' },
  homes: {
    eyebrow: [{ t: 'दो घर' }], title: 'बिहार और बौद्ध धर्म,', titleEm: 'और उन्हें जोड़ते पुराने धागे', marks: ['छठ', 'बोधगया'],
    lines: [
      'श्रेयांश का बिहार: छठ पर महिलाएँ नदी में खड़ी होकर फलों से भरे सूप सूर्य को अर्पित करती हैं।',
      'मृणालिनी के धर्म का उद्गम श्रेयांश के बिहार में है: बोधगया में, बोधिवृक्ष के नीचे, बुद्ध को ज्ञान मिला।',
      'पुराने धागे उन्हें पहले से जोड़ते हैं: ‘बिहार’ नाम ही ‘विहार’, यानी बौद्ध मठ, से आया है।'
    ]
  },
  note: {
    eyebrow: [{ t: 'दो शब्द' }], title: 'आइए, हमारे साथ उत्सव मनाइए',
    body: 'रांची और पुणे, ये दो घर अब एक परिवार बनने जा रहे हैं। हल्दी होगी, संगीत होगा, अग्नि के चारों ओर सात फेरे होंगे, और ढेर सारा खाना भी। पर आपके बिना इनमें से कुछ भी पूरा नहीं लगेगा।',
    sign: '— श्रेयांश और मृणालिनी'
  },
  place: { eyebrow: [{ t: 'विवाह स्थल' }], title: 'हम यहाँ होंगे', map: 'नक्शा दिखाएँ', open: 'Google Maps में खोलें', copy: 'पता कॉपी करें', copied: 'पता कॉपी हो गया' },
  know: {
    eyebrow: [{ t: 'ज़रूरी जानकारी' }], title: 'कुछ बातें ध्यान रखें', intro: 'दिन आसान और आनंद भरा रहे, इसलिए कुछ बातें।',
    weather: ['मौसम', 'दिसंबर में रांची का मौसम ठंडा और सूखा रहता है: दिन में लगभग २३° और रात में लगभग १०° सेल्सियस। शाम के लिए शॉल साथ रखें।'],
    wear: 'पहनावा',
    way: ['कैसे पहुँचें', 'हवेली बैंक्वेट, रांची। नक्शा और रास्ता ऊपर ही है।'],
    reply: ['उत्तर दें', 'बुधवार, २५ नवंबर तक। कृपया नीचे उत्तर दें, ताकि हम आपके लिए तैयारी कर सकें।']
  },
  photos: { eyebrow: [{ t: 'यादें' }], title: 'हमारे कुछ पसंदीदा पल', soon: 'तस्वीरें जल्द ही' },
  invite: { eyebrow: [{ t: 'निमंत्रण' }], title: 'आप सादर आमंत्रित हैं', titleFor: '{name}, आप सादर आमंत्रित हैं', choose: 'निमंत्रण इस भाषा में पढ़ें', card: 'hi' },
  schedule: { eyebrow: [{ t: 'कार्यक्रम' }], title: 'पुणे से रांची तक,', countWords: ['कोई समारोह नहीं', 'एक समारोह', 'दो समारोह', 'तीन समारोह'], when: 'कब', where: 'कहाँ', wear: 'पहनावा' },
  ev: {
    haldi: { name: 'हल्दी', dn: [], story: 'पीतल की कटोरी में हल्दी, आम के पत्ते और गेंदे के फूल।', when: 'मंगलवार, ८ दिसंबर २०२६ · दोपहर १२ बजे', short: 'मंगल, ८ दिसं. · दोपहर १२', dress: 'पीला, हल्दी के रंगों में' },
    sangeet: { name: 'संगीत संध्या', dn: [], story: 'ढोलक बजती है और घुँघरू जवाब देते हैं।', when: 'मंगलवार, ८ दिसंबर २०२६ · रात ८ बजे', short: 'मंगल, ८ दिसं. · रात ८', dress: 'शाम का औपचारिक पहनावा; इंडो-वेस्टर्न भी चलेगा' },
    shaadi: { name: 'शुभ विवाह', dn: [], story: 'अग्नि के सात फेरे; गाँठ बँध जाती है।', when: 'बुधवार, ९ दिसंबर २०२६ · रात ८ बजे', short: 'बुध, ९ दिसं. · रात ८', dress: 'पारंपरिक परिधान, रत्नों जैसे गहरे रंगों में' }
  },
  venue: venue.hi,
  dates: datesIn('hi'),
  rites: { way: [{ t: 'रास्ता देखें' }], knot: [{ t: 'गाँठ बाँध लीजिए' }], busy: 'कैलेंडर खुल रहा है…', wayAria: venue.hi + ' तक का रास्ता (Google Maps खुलेगा)', knotAria: (ev) => ev + ' अपने कैलेंडर में जोड़ें' },
  mangal: {
    eyebrow: [{ t: 'मंगलाष्टक · जयमंगल' }], title: 'दोनों ओर आठ श्लोक,', titleEm: 'एक ही आशीर्वाद',
    label: 'मंगलाष्टक से: मराठी विवाह में गाए जाने वाले आठ श्लोक',
    gloss: 'गंगा, सिंधु, सरस्वती, यमुना, गोदावरी, नर्मदा… और प्रसिद्ध गंडकी: ये पवित्र नदियाँ आपका मंगल करें। गोदावरी मृणालिनी के महाराष्ट्र से बहती है; गंडकी श्रेयांश के बिहार से।',
    jayaLabel: 'जयमंगल गाथा से: बौद्ध विवाह में पढ़ी जाने वाली आठ पाली गाथाएँ',
    jayaGloss: 'हज़ार शस्त्रधारी भुजाओं और अपनी सेना के साथ मार चढ़ आया; मुनींद्र ने दान आदि पारमिताओं से उसे जीत लिया। उस तेज से आपको जय और हर मंगल मिले। यह पहली गाथा श्रेयांश के बिहार में, बोधगया के बोधिवृक्ष के नीचे की उस रात की है।'
  },
  count: { eyebrow: [{ t: 'मुहूर्त में' }], units: ['दिन', 'घंटे', 'मिनट', 'सेकंड'], when: 'बुधवार, ९ दिसंबर २०२६ · रात ८ बजे' },
  rsvp: {
    eyebrow: [{ t: 'उत्तराकांक्षी' }], title: 'क्या आप पधारेंगे?', titleFor: '{name}, क्या आप पधारेंगे?', ask: 'हर समारोह में आप कितने लोग आएँगे?',
    name: 'आपका नाम', note: 'वर-वधू के लिए संदेश (वैकल्पिक)', send: 'उत्तर भेजें', sending: 'भेज रहे हैं…', thanksPre: null,
    thanks: 'हार्दिक धन्यवाद!', thanksFor: '{name}, हार्दिक धन्यवाद!', seeYou: 'रांची में मिलते हैं।',
    paliGloss: 'दान, धर्म का आचरण, संबंधियों का साथ, निर्दोष कर्म: यही उत्तम मंगल है। मंगल सुत्त से।',
    none: 'आपकी कमी खलेगी। बताने के लिए धन्यवाद।', change: 'मेरा उत्तर बदलें',
    failed: 'आपका उत्तर अभी नहीं भेजा जा सका। इसे व्हाट्सऐप पर भेज दीजिए; यह पहले से लिखा हुआ है।', whatsapp: 'व्हाट्सऐप पर भेजें', retry: 'फिर से कोशिश करें',
    closed: 'उत्तर देने की समय-सीमा समाप्त हो गई है। यदि आपकी योजना बदली है, तो कृपया परिवार को व्हाट्सऐप पर संदेश भेजें।',
    noCode: 'उत्तर देने के लिए, जिस व्हाट्सऐप संदेश से आप यहाँ आए हैं, उसी का जवाब दें। हम आपको गिन लेंगे।',
    badCode: 'आपका निजी लिंक नहीं मिला, इसलिए यह सबके लिए निमंत्रण है।',
    fewer: (ev) => ev + ': एक अतिथि कम', more: (ev) => ev + ': एक अतिथि और', guestsFor: (ev) => ev + ': अतिथियों की संख्या',
    line: { one: 'अतिथि', many: 'अतिथि', no: 'नहीं आएँगे', deva: true }
  },
  footer: {
    love: 'सस्नेह, श्रेयांश और मृणालिनी के परिवारजन', credits: 'इस पृष्ठ के चित्र',
    creditsNote: 'यहाँ का हर चित्र खुले रूप से साझा है: उन्हें सहेजने वाले संग्रहालयों और पुस्तकालयों द्वारा, या तस्वीरों के मामले में उन्हें खींचने वालों द्वारा।',
    metta: 'सभी प्राणी सुखी हों।'
  },
  controls: { muteOn: 'संगीत चलाएँ', muteOff: 'संगीत बंद करें', hint: 'संगीत बंद करने के लिए घंटी पर टैप करें' }
};

const ALL: Record<View, Text> = { mixed, en, mr, hi };
export const T = (v: View): Text => ALL[v];

/** "Haldi · 2 guests", in the page's language (the mixed and English pages say exactly what they always have) */
export const line = (v: View, name: string, n: number) => summaryLine({ name, n }, ALL[v].rsvp.line);
