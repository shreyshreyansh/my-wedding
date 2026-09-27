// /cal/haldi.ics, /cal/sangeet.ics, /cal/shaadi.ics — built once, served as text/calendar (public/_headers).
import type { APIRoute, GetStaticPaths } from 'astro';
import { buildIcs } from '../../lib/ics';
import { couple, events, site, venue } from '../../data/wedding';

export const getStaticPaths = (() => events.map((e) => ({ params: { file: e.id } }))) satisfies GetStaticPaths;

export const GET: APIRoute = ({ params }) => {
  const e = events.find((x) => x.id === params.file)!;
  const body = buildIcs({
    uid: e.id + '-2026@shreyansh-mrunalini',
    start: e.start, end: e.end,
    title: e.name.en + ' · ' + couple.both,
    where: venue.full,
    description: e.story + '\nWear: ' + e.dress + '.\nTimes are in IST (India, UTC+5:30).',
    sequence: site.calendarSequence,
    stamp: new Date()
  });
  return new Response(body, { headers: { 'Content-Type': 'text/calendar; charset=utf-8' } });
};
