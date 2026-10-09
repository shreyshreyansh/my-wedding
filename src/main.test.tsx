import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("application entry point", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="root"></div>';
    vi.resetModules();
  });

  it("mounts the invitation into the root element", async () => {
    await import("./main");

    expect(await screen.findByRole("heading", { name: "Akash weds Drashti" })).toBeVisible();
  });
});
