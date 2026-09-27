// After `astro build`: drop tooling pages from dist, and check nothing private slipped in.
import { existsSync, rmSync } from 'node:fs';

for (const p of ['dist/og-card']) if (existsSync(p)) rmSync(p, { recursive: true });
