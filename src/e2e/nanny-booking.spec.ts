import { test, expect } from "@playwright/test";

test.describe("Nanny Caregiver Booking UI Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a provider details page that has booking options.
    // Replace with a dynamic local route if needed.
    await page.goto("/provider/1");
  });

  test("should display only 4h and 8h duration choices for Nanny caregiver bookings", async ({ page }) => {
    // 1. Open the Booking Flow modal
    const bookNowButton = page.locator("button:has-text('Book Now')");
    await expect(bookNowButton).toBeVisible();
    await bookNowButton.click();

    // 2. Select Nanny Caregiver service type
    const nannyOption = page.locator("text=Nanny / Caregiver");
    await expect(nannyOption).toBeVisible();
    await nannyOption.click();

    // 3. Verify that the duration chips list contains EXACTLY 4h and 8h
    const durationChips = page.locator(".durationChips button, [class*='durationChip']");
    
    // We expect exactly 2 chips to be visible
    await expect(durationChips).toHaveCount(2);

    const chip4h = durationChips.filter({ hasText: "4h" });
    const chip8h = durationChips.filter({ hasText: "8h" });
    await expect(chip4h).toBeVisible();
    await expect(chip8h).toBeVisible();

    // Other standard maid/cook options should NOT be present
    const chip1h = durationChips.filter({ hasText: "1h" });
    const chip2h = durationChips.filter({ hasText: "2h" });
    await expect(chip1h).not.toBeVisible();
    await expect(chip2h).not.toBeVisible();
  });

  test("should default Nanny Caregiver service duration to 4h and update quote when toggling to 8h", async ({ page }) => {
    // 1. Open Booking modal and select Nanny
    await page.locator("button:has-text('Book Now')").click();
    await page.locator("text=Nanny / Caregiver").click();

    // 2. Verify 4h is selected by default
    const chip4h = page.locator("[class*='durationChip']").filter({ hasText: "4h" });
    await expect(chip4h).toHaveClass(/active|selected|durationChipActive/);

    // 3. Verify starting quote price (prorated for 4h) is displayed
    const initialPriceContainer = page.locator("[class*='PriceValue'], [class*='priceDisplay']");
    await expect(initialPriceContainer).toBeVisible();
    const initialPriceText = await initialPriceContainer.textContent();
    
    // 4. Click the 8h chip
    const chip8h = page.locator("[class*='durationChip']").filter({ hasText: "8h" });
    await chip8h.click();

    // 5. Verify 8h is now selected
    await expect(chip8h).toHaveClass(/active|selected|durationChipActive/);
    await expect(chip4h).not.toHaveClass(/active|selected|durationChipActive/);

    // 6. Verify that the quote price increases accordingly for 8h
    await expect(async () => {
      const updatedPriceText = await initialPriceContainer.textContent();
      expect(updatedPriceText).not.toBe(initialPriceText);
    }).toPass();
  });
});
