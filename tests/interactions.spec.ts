import { expect, test } from "@playwright/test";

test("multi-event RSVP and live venue controls work without leaving the page", async ({ page }) => {
  await page.setViewportSize({ width: 393, height: 852 });
  await page.goto("/");

  const send = page.getByRole("link", { name: "Send via WhatsApp" });
  await expect(send).toHaveAttribute("aria-disabled", "true");

  await page.getByRole("textbox", { name: "Guest name" }).fill("Aarav");
  await page.getByRole("checkbox", { name: "Haldi" }).check();
  await page.getByRole("checkbox", { name: "Shaadi" }).check();
  await page.getByRole("combobox", { name: "No. of People" }).selectOption("3");

  await expect(send).toHaveAttribute("aria-disabled", "false");
  await expect(send).toHaveAttribute(
    "href",
    "https://wa.me/?text=Hi%2C%20I%20am%20Aarav.%20I%20would%20like%20to%20RSVP%20for%20Haldi%20and%20Shaadi%20for%203%20people."
  );

  await expect(page.getByRole("region", { name: "Wedding venue" })).toBeVisible();
  await expect(page.getByTitle("Map showing Haveli Banquet, Ranchi")).toHaveAttribute(
    "src",
    "https://www.google.com/maps?q=Haveli%20Banquet%20Ranchi&output=embed"
  );
  await expect(page.getByRole("link", { name: /Open in Google Maps/ })).toHaveAttribute(
    "href",
    "https://www.google.com/maps/search/?api=1&query=Haveli+Banquet+Ranchi"
  );
});

test("the formal invitation switches between all three languages", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const englishTab = page.getByRole("tab", { name: "English" });
  const hindiTab = page.getByRole("tab", { name: "हिंदी" });
  const marathiTab = page.getByRole("tab", { name: "मराठी" });

  await expect(page.getByRole("tabpanel", { name: "English invitation" })).toContainText("request the honour of your presence");
  await englishTab.focus();
  await englishTab.press("ArrowRight");
  await expect(hindiTab).toBeFocused();
  await expect(hindiTab).toHaveAttribute("lang", "hi");
  await expect(page.getByRole("tabpanel", { name: "हिंदी invitation" })).toContainText("श्रेयांश एवं मृणालिनी");
  await hindiTab.press("End");
  await expect(marathiTab).toBeFocused();
  await expect(marathiTab).toHaveAttribute("lang", "mr");
  await expect(page.getByRole("tabpanel", { name: "मराठी invitation" })).toContainText("श्रेयांश आणि मृणालिनी");
  await marathiTab.press("Home");
  await expect(englishTab).toBeFocused();
});

test("RSVP event choices show keyboard focus", async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 900 });
  await page.goto("/");

  const haldi = page.getByRole("checkbox", { name: "Haldi" });
  await haldi.focus();
  await expect(haldi).toBeFocused();
  await expect(haldi.locator("xpath=..")).toHaveCSS("outline-style", "solid");
  await haldi.press("Space");
  await expect(haldi).toBeChecked();
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

test("the hero names share the exact viewport center", async ({ page }) => {
  for (const width of [393, 600, 768, 1440, 1728, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");

    for (const selector of [".hero__name--first", ".hero__and", ".hero__name--second"]) {
      const center = await page.locator(selector).evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return rect.left + rect.width / 2;
      });
      expect(Math.abs(center - width / 2), `${selector} is not centered at ${width}px`).toBeLessThanOrEqual(1);
    }
  }
});
