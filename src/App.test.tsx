import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "./App";

vi.mock("./motion", () => ({ initMotion: () => () => undefined }));

describe("Ram Mandir wedding page", () => {
  const writeText = vi.fn<(_: string) => Promise<void>>();

  beforeEach(() => {
    writeText.mockReset();
    writeText.mockResolvedValue();
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText }
    });
  });

  it("renders the complete six-part invitation story", () => {
    render(<App />);

    expect(document.querySelector('[data-animation="flocking-birds"]')).toBeInTheDocument();
    expect(document.querySelector('[data-animation="waving-flag"]')).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Shreyansh weds Mrunalini" })).toBeVisible();
    expect(screen.getByRole("region", { name: "Wedding invitation" })).toBeVisible();
    expect(screen.getByRole("region", { name: "Wedding timeline" })).toBeVisible();
    expect(screen.getByRole("region", { name: "Meet the bride and groom" })).toBeVisible();
    expect(screen.getByRole("region", { name: "Location and guest details" })).toBeVisible();
    expect(screen.getByRole("region", { name: "RSVP and countdown" })).toBeVisible();
  });

  it("keeps the reference invitation copy and all six timeline cards", () => {
    render(<App />);

    expect(screen.getByText("With the blessings of our elders,")).toBeVisible();
    expect(screen.getByText("On The Following Events")).toBeVisible();
    expect(screen.getByText("Wedding Timeline")).toBeVisible();
    expect(screen.getAllByTestId("event-card")).toHaveLength(6);
    expect(screen.getAllByText("8th Dec 2026")).toHaveLength(2);
    expect(screen.getAllByText("9th Dec 2026")).toHaveLength(1);
    expect(screen.getAllByText("Yellow · Turmeric shades")).toHaveLength(1);
    expect(screen.getAllByText("Evening formals · Indo-western welcome")).toHaveLength(1);
    expect(screen.getAllByText("Traditional finery · Jewel tones")).toHaveLength(1);
  });

  it("includes the reference large-desktop artwork and copy variant", () => {
    render(<App />);

    expect(document.querySelector('[data-layout="wide-desktop"]')).toBeInTheDocument();
    expect(screen.getByText("Wedding Celebration Timeline")).toBeInTheDocument();
    expect(screen.getByText("Please confirm your presence")).toBeInTheDocument();
    expect(document.querySelectorAll(".hero__bell--wide")).toHaveLength(6);
  });

  it("renders the reference guest details and RSVP controls", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "Things to know" })).toBeVisible();
    expect(screen.getByRole("textbox", { name: "Full Name" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Select Event" })).toBeVisible();
    expect(screen.getByRole("combobox", { name: "No. of People" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Send via WhatsApp" })).toBeVisible();
    expect(screen.getByText("The countdown begins")).toBeVisible();
  });

  it("builds a WhatsApp RSVP only after the three required values are selected", () => {
    render(<App />);

    const send = screen.getByRole("link", { name: "Send via WhatsApp" });
    expect(send).toHaveAttribute("aria-disabled", "true");

    fireEvent.change(screen.getByRole("textbox", { name: "Full Name" }), { target: { value: "Aarav" } });
    fireEvent.click(screen.getByRole("button", { name: "Select Event" }));

    expect(screen.getByRole("listbox", { name: "Wedding event" })).toBeVisible();
    expect(screen.getAllByRole("option")).toHaveLength(54);
    fireEvent.click(screen.getByRole("option", { name: "Shaadi" }));
    fireEvent.change(screen.getByRole("combobox", { name: "No. of People" }), { target: { value: "3" } });

    expect(send).toHaveAttribute("aria-disabled", "false");
    expect(send.getAttribute("href")).toMatch(/^https:\/\/wa\.me\/\?text=/);
    expect(decodeURIComponent(send.getAttribute("href") ?? "")).toContain("Aarav");
    expect(decodeURIComponent(send.getAttribute("href") ?? "")).toContain("Shaadi");
  });

  it("switches venue details and copies the selected address", async () => {
    render(<App />);

    expect(screen.getByRole("region", { name: "Venue details for Venue" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Sangeet" }));

    expect(screen.getByRole("region", { name: "Venue details for Sangeet" })).toBeVisible();
    expect(screen.getByText("Tuesday, 8 December 2026 · 8 in the evening")).toBeVisible();
    expect(screen.getByRole("link", { name: /Open in Google Maps/ })).toHaveAttribute("href", "https://www.google.com/maps/search/?api=1&query=Haveli+Banquet+Ranchi");
    fireEvent.click(screen.getByRole("button", { name: "Copy address to clipboard" }));

    expect(writeText).toHaveBeenCalledWith("Haveli Banquet, Ranchi");
    expect(await screen.findByText("Copied")).toBeVisible();
  });

  it("uses the verified couple, family, venue, and event details", () => {
    render(<App />);

    expect(screen.getAllByText("Mr Umesh Kumar Sinha & Mrs Rupa Sinha").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Mr Shriharsh Waghmare & Mrs Sumati Waghmare").length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { name: "Haveli Banquet" })).toBeVisible();
    expect(screen.getAllByText("Haveli Banquet, Ranchi").length).toBeGreaterThan(0);
    expect(document.querySelector(".couple__story")).toHaveTextContent("Please accept this invitation as our personal visit.");
    expect(document.querySelector(".couple__story")).toHaveTextContent("With love, Umesh Kumar & Rupa Sinha and Shriharsh & Sumati Waghmare.");
  });
});
