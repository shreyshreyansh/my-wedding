import { expect, type APIRequestContext, type Page } from '@playwright/test';

export const LATE = 'http://127.0.0.1:8789';
export const SHEET = 'http://127.0.0.1:8799';
/** a fixed moment before replies close, for still frames */
export const TODAY = new Date('2026-10-27T10:00:00+05:30');

export async function openCover(page: Page) {
  await page.locator('#openBtn').click();
  await expect(page.locator('#cover')).toHaveCount(0);
}

export async function sheetRows(request: APIRequestContext, code: string) {
  const rows = (await (await request.get(SHEET + '/log')).json()) as { code: string }[];
  return rows.filter((r) => r.code === code);
}

export const noSideways = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
