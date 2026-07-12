# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: nanny-booking.spec.ts >> Nanny Caregiver Booking UI Flow >> should display only 4h and 8h duration choices and support quote updates
- Location: src/e2e/nanny-booking.spec.ts:9:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'Select Booking Option' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('heading', { name: 'Select Booking Option' })

```

```yaml
- dialog:
  - button "Close"
  - heading "Select your Booking Option" [level=2]
  - group "Book by":
    - text: Book by
    - radiogroup:
      - radio "Date"
      - text: Date
      - radio "Short Term"
      - text: Short Term
      - radio "Monthly"
      - text: Monthly
  - button "Cancel"
  - button "Confirm" [disabled]
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | test.describe("Nanny Caregiver Booking UI Flow", () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     // 1. Navigate to the root homepage
  6  |     await page.goto("/");
  7  |   });
  8  | 
  9  |   test("should display only 4h and 8h duration choices and support quote updates", async ({ page }) => {
  10 |     // 2. Click the Caregiver card on the homepage
  11 |     const caregiverCard = page.locator("button:has-text('Caregiver')");
  12 |     await expect(caregiverCard).toBeVisible();
  13 |     await caregiverCard.click();
  14 | 
  15 |     // 3. Verify that the general BookingDialog opens
> 16 |     await expect(page.getByRole("heading", { name: "Select Booking Option" })).toBeVisible();
     |                                                                                ^ Error: expect(locator).toBeVisible() failed
  17 | 
  18 |     // 4. Select the "On-demand" option (value "Date" radio)
  19 |     const onDemandRadio = page.locator("input[value='Date']");
  20 |     await onDemandRadio.click();
  21 | 
  22 |     // 5. Select the first available day from the datepicker grid
  23 |     const firstActiveDay = page.locator(".dtp-grid .dtp-day:not(.disabled):not(.empty)").first();
  24 |     await expect(firstActiveDay).toBeVisible();
  25 |     await firstActiveDay.click();
  26 | 
  27 |     // 6. Select the first available time slot button
  28 |     const firstActiveTime = page.locator(".dtp-time-grid .dtp-time:not(.disabled)").first();
  29 |     await expect(firstActiveTime).toBeVisible();
  30 |     await firstActiveTime.click();
  31 | 
  32 |     // 7. Click the Confirm button to save search criteria and load the provider list
  33 |     const confirmBtn = page.locator("button:has-text('Confirm')");
  34 |     await expect(confirmBtn).toBeVisible();
  35 |     await confirmBtn.click();
  36 | 
  37 |     // 8. Verify the UI transitioned to DetailsView (loading providers list)
  38 |     // We expect "Book Now" buttons on provider cards to become visible
  39 |     const bookNowButton = page.locator("button:has-text('Book Now'), button:has-text('Book')").first();
  40 |     await expect(bookNowButton).toBeVisible({ timeout: 10000 });
  41 |     await bookNowButton.click();
  42 | 
  43 |     // 9. Now inside NannyServicesDialog, verify caregiver duration choices are strictly 4h and 8h
  44 |     // We expect exactly two chips inside the duration chips container
  45 |     const durationChips = page.locator("[class*='durationChips'] button, [class*='durationChip']");
  46 |     await expect(durationChips).toHaveCount(2);
  47 | 
  48 |     const chip4h = durationChips.filter({ hasText: "4h" });
  49 |     const chip8h = durationChips.filter({ hasText: "8h" });
  50 |     await expect(chip4h).toBeVisible();
  51 |     await expect(chip8h).toBeVisible();
  52 | 
  53 |     // Verify other standard hours chips are NOT visible
  54 |     const chip1h = durationChips.filter({ hasText: "1h" });
  55 |     const chip2h = durationChips.filter({ hasText: "2h" });
  56 |     await expect(chip1h).not.toBeVisible();
  57 |     await expect(chip2h).not.toBeVisible();
  58 | 
  59 |     // 10. Verify 4h is selected by default (nanny caregiver default choice)
  60 |     await expect(chip4h).toHaveClass(/active|selected|durationChipActive/);
  61 | 
  62 |     // 11. Read initial price quote for 4h
  63 |     const priceTextContainer = page.locator("[class*='summaryValue'], [class*='priceDisplay'], [class*='PriceValue']").last();
  64 |     await expect(priceTextContainer).toBeVisible();
  65 |     const initialPriceText = await priceTextContainer.textContent();
  66 | 
  67 |     // 12. Toggle to 8h chip
  68 |     await chip8h.click();
  69 | 
  70 |     // 13. Verify selection updates to 8h
  71 |     await expect(chip8h).toHaveClass(/active|selected|durationChipActive/);
  72 |     await expect(chip4h).not.toHaveClass(/active|selected|durationChipActive/);
  73 | 
  74 |     // 14. Verify that the price quote updates (increases) accordingly
  75 |     await expect(async () => {
  76 |       const updatedPriceText = await priceTextContainer.textContent();
  77 |       expect(updatedPriceText).not.toBe(initialPriceText);
  78 |     }).toPass();
  79 |   });
  80 | });
  81 | 
```