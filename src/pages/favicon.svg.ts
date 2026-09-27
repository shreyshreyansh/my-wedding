// The browser-tab icon: the medallion, drawn from the same art as the page.
import type { APIRoute } from 'astro';
import { medallion } from '../art/peacock';

export const GET: APIRoute = () => new Response(medallion('apart', 'none').replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" '), { headers: { 'Content-Type': 'image/svg+xml' } });
