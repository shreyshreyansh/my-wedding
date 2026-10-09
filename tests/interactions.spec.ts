import { expect, test } from "@playwright/test";

test("RSVP, venue switching, and map controls work without leaving the page", async ({ page }) => {
  await page.setViewportSize({ width: 393, height: 852 });
  await page.goto("/");

  const send = page.getByRole("link", { name: "Send via WhatsApp" });
  await expect(send).toHaveAttribute("aria-disabled", "true");

  await page.getByRole("textbox", { name: "Full Name" }).fill("Aarav");
  await page.getByRole("button", { name: "Select Event" }).click();
  await page.getByRole("option", { name: "Wedding Ceremony" }).click();
  await page.getByRole("combobox", { name: "No. of People" }).selectOption("3");

  await expect(send).toHaveAttribute("aria-disabled", "false");
  await expect(send).toHaveAttribute(
    "href",
    "https://wa.me/?text=Hi%2C%20I%20am%20Aarav.%20I%20would%20like%20to%20RSVP%20for%20Wedding%20Ceremony%20for%203%20people."
  );

  await page.getByRole("button", { name: "Location 2" }).click();
  const map = page.getByRole("region", { name: "Map showing Location 2" });
  await expect(map).toBeVisible();
  await map.click({ position: { x: 100, y: 100 } });
  await expect(page.getByText("Tap to interact with map")).toHaveCount(0);

  const tiles = map.locator(".location-card__tiles");
  await expect(tiles).toHaveAttribute("style", /scale\(1\)/);
  await page.getByRole("button", { name: "Zoom in" }).click();
  await expect(tiles).toHaveAttribute("style", /scale\(1\.2\)/);

  const mapBox = await map.boundingBox();
  expect(mapBox).not.toBeNull();
  const transformBeforeDrag = await tiles.getAttribute("style");
  await page.mouse.move(mapBox!.x + 100, mapBox!.y + 100);
  await page.mouse.down();
  await page.mouse.move(mapBox!.x + 132, mapBox!.y + 118);
  await page.mouse.up();
  expect(await tiles.getAttribute("style")).not.toBe(transformBeforeDrag);

  await page.getByRole("button", { name: "Recenter map on location" }).click();
  await expect(tiles).toHaveAttribute("style", /0px.*0px.*scale\(1\)/);
});
