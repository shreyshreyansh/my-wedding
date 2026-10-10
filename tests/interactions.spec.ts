import { expect, test } from "@playwright/test";

test("RSVP and verified venue controls work without leaving the page", async ({ page }) => {
  await page.setViewportSize({ width: 393, height: 852 });
  await page.goto("/");

  const send = page.getByRole("link", { name: "Send via WhatsApp" });
  await expect(send).toHaveAttribute("aria-disabled", "true");

  await page.getByRole("textbox", { name: "Full Name" }).fill("Aarav");
  await page.getByRole("button", { name: "Select Event" }).click();
  await page.getByRole("option", { name: "Shaadi" }).click();
  await page.getByRole("combobox", { name: "No. of People" }).selectOption("3");

  await expect(send).toHaveAttribute("aria-disabled", "false");
  await expect(send).toHaveAttribute(
    "href",
    "https://wa.me/?text=Hi%2C%20I%20am%20Aarav.%20I%20would%20like%20to%20RSVP%20for%20Shaadi%20for%203%20people."
  );

  await page.getByRole("button", { name: "Sangeet" }).click();
  await expect(page.getByRole("region", { name: "Venue details for Sangeet" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Open in Google Maps/ })).toHaveAttribute(
    "href",
    "https://www.google.com/maps/search/?api=1&query=Haveli+Banquet+Ranchi"
  );
});

test("the verified names and parent lines fit at responsive boundaries", async ({ page }) => {
  for (const width of [599, 600, 767, 768]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const selectors = [
      ".hero__name--first .hero__title-reveal",
      ".hero__name--second .hero__title-reveal",
      ".invitation__copy > .invitation__parents:not(.invitation__parents--second)",
      ".invitation__names span:first-child",
      ".invitation__names span:last-child",
      ".invitation__parents--second"
    ];

    for (const selector of selectors) {
      const bounds = await page.locator(selector).evaluate((element) => {
        const range = document.createRange();
        range.selectNodeContents(element);
        const rect = range.getBoundingClientRect();
        return { left: rect.left, right: rect.right };
      });

      expect(bounds.left, `${selector} starts outside ${width}px`).toBeGreaterThanOrEqual(-1);
      expect(bounds.right, `${selector} ends outside ${width}px`).toBeLessThanOrEqual(width + 1);
    }

    const invitationFlow = await page.locator(".invitation__copy").evaluate((container) => {
      const bounds = (selector: string) => {
        const element = container.querySelector(selector)!;
        const range = document.createRange();
        range.selectNodeContents(element);
        const rect = range.getBoundingClientRect();
        return { top: rect.top, bottom: rect.bottom };
      };

      return {
        brideName: bounds(".invitation__names span:last-child"),
        relation: bounds(".invitation__relation"),
        brideParents: bounds(".invitation__parents--second")
      };
    });

    expect(invitationFlow.brideName.bottom, `bride name overlaps relation at ${width}px`).toBeLessThanOrEqual(invitationFlow.relation.top);
    expect(invitationFlow.relation.bottom, `relation overlaps bride parents at ${width}px`).toBeLessThanOrEqual(invitationFlow.brideParents.top);

    const card = await page.locator(".location-card").evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return { left: rect.left, right: rect.right };
    });
    expect(card.left, `venue card starts outside ${width}px`).toBeGreaterThanOrEqual(-1);
    expect(card.right, `venue card ends outside ${width}px`).toBeLessThanOrEqual(width + 1);
  }
});
