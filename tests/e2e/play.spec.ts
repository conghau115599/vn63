import { test, expect } from "@playwright/test";
import { createLife } from "../../src/simulation/init";
import { advanceMonth } from "../../src/simulation/core/advanceMonth";

test("continuous clock follows 72 seconds per year, pauses, speeds up and stops for a choice", async ({
  page,
}) => {
  await page.clock.install();
  await page.clock.pauseAt(new Date(Date.now() + 60000));
  const fixture = createLife({ seed: "clock-baby" });
  await page.goto("/");
  await page.locator("input[type=file]").setInputFiles({
    name: "clock.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(fixture)),
  });
  await page.getByRole("button", { name: "Tiếp tục", exact: true }).click();
  await page.clock.fastForward(5999);
  await expect(
    page.getByRole("heading", { name: /Tháng 01\/2024/ }),
  ).toBeVisible();
  await page.clock.fastForward(1);
  await expect(
    page.getByRole("heading", { name: /Tháng 02\/2024/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Tạm dừng", exact: true }).click();
  await page.clock.fastForward(72000);
  await expect(
    page.getByRole("heading", { name: /Tháng 02\/2024/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "16×", exact: true }).click();
  await page.getByRole("button", { name: "Tiếp tục", exact: true }).click();
  await page.clock.fastForward(375);
  await expect(
    page.getByRole("heading", { name: /Tháng 03\/2024/ }),
  ).toBeVisible();
  const senior = createLife({ seed: "clock-care", start: "SENIOR_CARE" });
  await page.locator("input[type=file]").setInputFiles({
    name: "care.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(senior)),
  });
  await expect(
    page.getByRole("heading", { name: /Tháng 01\/2099/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Tiếp tục", exact: true }).click();
  await page.clock.fastForward(375);
  const popup = page.getByRole("dialog");
  await expect(popup.getByRole("heading")).toHaveText(
    "Người bạn đời cần chăm sóc",
  );
  await popup.press("Escape");
  await page.clock.fastForward(72000);
  await expect(
    page.getByRole("button", { name: "Tiếp tục", exact: true }),
  ).toBeDisabled();
  await expect(
    page.getByRole("heading", { name: /Tháng 01\/2099/ }),
  ).toBeVisible();
});

test("quiet months are grouped without losing the monthly archive", async ({
  page,
}) => {
  let fixture = createLife({ seed: "quiet-year" });
  for (let i = 0; i < 12; i++) {
    let result = advanceMonth(fixture, { yearMonth: fixture.currentMonth });
    while (result.status === "PAUSED") {
      const state = result.nextState;
      result = advanceMonth(state, {
        yearMonth: state.currentMonth,
        choice: {
          eventId: state.pendingDecision!.id,
          optionId: state
            .pendingDecision!.options.filter((o) => !o.disabledReason)
            .at(-1)!.id,
        },
      });
    }
    fixture = result.nextState;
  }
  await page.goto("/");
  await page.locator("input[type=file]").setInputFiles({
    name: "year.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(fixture)),
  });
  await expect(page.getByText(/\d+ tháng bình yên trôi qua/)).toBeVisible();
  await page.getByRole("button", { name: "Xem sổ tháng & tổng kết →" }).click();
  await expect(
    page.getByText("12 tháng hoàn tất", { exact: true }),
  ).toBeVisible();
});
test("prepared musician can request a trial, review a persisted offer and accept a contract", async ({
  page,
}) => {
  const fixture = createLife({
    seed: "e2e-career",
    start: "ADULT",
    strength: "ARTIST",
  });
  fixture.careerDevelopment.goal = "ARTIST";
  fixture.careerDevelopment.skill.ARTIST = 70;
  fixture.careerDevelopment.minutes.ARTIST = 36000;
  fixture.careerDevelopment.portfolio = 40;
  await page.goto("/");
  await page.locator("input[type=file]").setInputFiles({
    name: "career.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(fixture)),
  });
  await page.getByRole("button", { name: /^♫\s*Nghề mơ ước$/ }).click();
  await page
    .getByRole("button", { name: "Đăng ký tuyển chọn & sang tháng" })
    .click();
  const decision = page.getByRole("region", { name: "Quyết định quan trọng" });
  await expect(decision.getByRole("heading")).toHaveText(
    "Hợp đồng nghệ sĩ biểu diễn",
  );
  await expect(page.getByText("Đã lưu trên thiết bị")).toBeVisible();
  await page.reload();
  await decision.getByRole("button", { name: /^Nhận hợp đồng/ }).click();
  await page.getByRole("button", { name: /^♫\s*Nghề mơ ước$/ }).click();
  await expect(page.getByText(/Hợp đồng: Nghệ sĩ biểu diễn/)).toBeVisible();
});
test("create, advance, reload, inspect finance, pause at decision and import/export", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Một đời,/ })).toBeVisible();
  await page.getByLabel("Seed cuộc đời").fill("decision-0");
  await page.getByLabel("Điểm bắt đầu").selectOption("ADULT");
  await page.getByRole("button", { name: "Bắt đầu cuộc đời" }).click();
  await page.getByRole("button", { name: "Tạm dừng", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Tháng 01/2052" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Sang tháng", exact: false }).click();
  const decision = page.getByRole("region", { name: "Quyết định quan trọng" });
  if (await decision.isVisible())
    await decision.getByRole("button").last().click();
  await expect(
    page.getByRole("heading", { name: "Tháng 02/2052" }),
  ).toBeVisible();
  await expect(page.getByText("Đã lưu trên thiết bị")).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Tháng 02/2052" }),
  ).toBeVisible();
  await page.getByRole("button", { name: /^↗\s*Tài chính$/ }).click();
  await expect(
    page.getByRole("heading", { name: "Cam kết & hợp đồng" }),
  ).toBeVisible();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Xuất save" }).click();
  expect((await downloadPromise).suggestedFilename()).toContain("2052-02");
  await page.getByRole("button", { name: /^ⓘ\s*Về mô hình$/ }).click();
  await expect(
    page.getByRole("heading", { name: "REALISM và HARDSHIP" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
test("critical decision persists and auto never chooses on behalf of the player", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByLabel("Điểm bắt đầu").selectOption("ADULT");
  await page.getByLabel("Seed cuộc đời").fill("decision-1");
  await page.getByRole("button", { name: "Bắt đầu cuộc đời" }).click();
  await page
    .getByRole("button", { name: "Tới quyết định", exact: true })
    .click();
  const region = page.getByRole("region", { name: "Quyết định quan trọng" });
  await expect(region).toBeVisible({ timeout: 30000 });
  const title = await region.getByRole("heading").textContent();
  const popup = page.getByRole("dialog");
  await expect(popup.getByRole("heading")).toBeFocused();
  await popup.press("Escape");
  await expect(popup).not.toBeVisible();
  await expect(
    page.getByRole("button", { name: "Mở lựa chọn →" }),
  ).toBeFocused();
  await expect(
    page.getByRole("button", { name: "Sang tháng", exact: false }),
  ).toBeDisabled();
  await expect(page.getByText("Đã lưu trên thiết bị")).toBeVisible();
  await page.reload();
  await expect(region.getByRole("heading")).toHaveText(title!);
  await page.getByRole("button", { name: "Xem nhật ký ↓" }).click();
  await expect(
    page.getByRole("heading", { name: "Nhật ký cuộc đời", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Mở lựa chọn →" }).click();
  const chosen = await region
    .getByRole("button")
    .last()
    .locator("b")
    .textContent();
  await region.getByRole("button").last().click();
  await expect(region).not.toBeVisible();
  await page.getByRole("button", { name: "Những lần tôi chọn" }).click();
  const journal = page.getByRole("region", {
    name: "Nhật ký cuộc đời",
    exact: true,
  });
  await expect(journal.getByText("✓ Bạn đã chọn").first()).toBeVisible();
  await expect(
    journal.getByText(`${title}: ${chosen}.`, { exact: true }),
  ).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Những lần tôi chọn" }).click();
  await expect(
    journal.getByText(`${title}: ${chosen}.`, { exact: true }),
  ).toBeVisible();
});

test("validate a venture, launch with delayed invoices, reload and inspect both books", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByLabel("Điểm bắt đầu").selectOption("ADULT");
  await page.getByLabel("Seed cuộc đời").fill("decision-1");
  await page.getByRole("button", { name: "Bắt đầu cuộc đời" }).click();
  await page.getByRole("button", { name: "Tạm dừng", exact: true }).click();
  await page.getByRole("button", { name: /^⌂\s*Kinh doanh$/ }).click();
  await page.getByRole("button", { name: /Nghiên cứu ý tưởng/ }).click();
  const decision = page.getByRole("region", { name: "Quyết định quan trọng" });
  if (await decision.isVisible())
    await decision.getByRole("button").last().click();
  await expect(
    page.getByText("Đang kiểm chứng", { exact: true }),
  ).toBeVisible();
  await page.getByLabel("Giá mỗi đơn (VND)", { exact: true }).fill("150000");
  await page.getByRole("combobox", { name: /Khách trả sau/ }).selectOption("1");
  await page.getByRole("button", { name: /^Khai trương.*sang tháng$/ }).click();
  if (await decision.isVisible())
    await decision.getByRole("button").last().click();
  await expect(page.getByText("Đang hoạt động", { exact: true })).toBeVisible();
  await expect(
    page.getByText(
      "Doanh thu có thể chưa thu tiền; phải thu không phải tiền mặt.",
    ),
  ).toBeVisible();
  await expect(page.getByText("Đã lưu trên thiết bị")).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: /^⌂\s*Kinh doanh$/ }).click();
  await expect(page.getByText("Đang hoạt động", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /^⚙\s*Kiểm tra mô hình$/ }).click();
  await expect(
    page.getByText("✓ Sổ doanh nghiệp cân", { exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
test("senior care decision references an actual living spouse and keeps pause after reload", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByLabel("Điểm bắt đầu").selectOption("SENIOR_CARE");
  await page.getByRole("button", { name: "Bắt đầu cuộc đời" }).click();
  await page.getByRole("button", { name: "Tạm dừng", exact: true }).click();
  await page.getByRole("button", { name: /^Sang tháng/ }).click();
  const decision = page.getByRole("region", { name: "Quyết định quan trọng" });
  await expect(decision.getByRole("heading")).toHaveText(
    "Người bạn đời cần chăm sóc",
  );
  await expect(page.getByText("Đã lưu trên thiết bị")).toBeVisible();
  await page.reload();
  await expect(decision.getByRole("heading")).toHaveText(
    "Người bạn đời cần chăm sóc",
  );
  await decision.getByRole("button", { name: /Tự chăm sóc/ }).click();
  await expect(
    page.getByRole("heading", { name: /Tháng 02\/2099/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: /^⚙\s*Kiểm tra mô hình$/ }).click();
  await expect(page.getByText(/care-self/)).toBeVisible();
});
