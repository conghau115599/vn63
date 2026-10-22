import { test, expect } from "@playwright/test";
import { createLife } from "../../src/simulation/init";
import { advanceMonth } from "../../src/simulation/core/advanceMonth";
import { readFile } from "node:fs/promises";

test("weekly migration preserves an exportable original save and the exact fifth birthday unlocks habits", async ({
  page,
}) => {
  const fixture = createLife({ legacyDemo: true, seed: "recovery" });
  fixture.engineVersion = "1.3.0-alpha.2";
  await page.goto("/");
  await page.locator("input[type=file]").setInputFiles({
    name: "legacy.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(fixture)),
  });
  await expect(page.getByText("Đã lưu trên thiết bị")).toBeVisible();
  await page.getByRole("button", { name: /^Qua một tuần/ }).click();
  await expect(page.locator('time[aria-label="Ngày trong game"]')).toHaveText(
    "08/01/2024",
  );
  await expect(page.getByText("Đã lưu trên thiết bị")).toBeVisible();
  await page.getByText("Xem thêm", { exact: true }).click();
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Xuất bản lưu trước chuyển đổi", exact: true })
    .click();
  const file = await (await download).path();
  expect(JSON.parse(await readFile(file!, "utf8"))).toEqual(fixture);
  const child = createLife({ seed: "birthday-ui" });
  child.birthDate = "1975-05-10";
  child.currentMonth = "1980-05";
  child.currentDate = "1980-05-09";
  await page.locator("input[type=file]").setInputFiles({
    name: "birthday.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(child)),
  });
  await expect(page.locator('time[aria-label="Ngày trong game"]')).toHaveText(
    "09/05/1980",
  );
  await page.getByRole("button", { name: /^❧\s*Bản thân$/ }).click();
  await expect(
    page.getByRole("button", { name: "Đọc sách, truyện", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: /^Qua một tuần/ }).click();
  if (await page.getByRole("dialog").isVisible())
    await page
      .getByRole("region", { name: "Quyết định quan trọng" })
      .getByRole("button")
      .last()
      .click();
  await page
    .getByRole("button", { name: "Đọc sách, truyện", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Đọc sách, truyện", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText("Đã lưu trên thiết bị")).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: /^❧\s*Bản thân$/ }).click();
  await expect(
    page.getByRole("button", { name: "Đọc sách, truyện", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
});

test("weekly clock processes seven days, pauses, speeds up and stops at decisions", async ({
  page,
}) => {
  await page.clock.install();
  await page.clock.pauseAt(new Date(Date.now() + 60000));
  const fixture = createLife({ legacyDemo: true, seed: "clock-baby" });
  await page.goto("/");
  await page.locator("input[type=file]").setInputFiles({
    name: "clock.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(fixture)),
  });
  const date = page.locator('time[aria-label="Ngày trong game"]');
  await expect(date).toHaveText("01/01/2024");
  await page.getByRole("button", { name: "Tiếp tục", exact: true }).click();
  await page.clock.fastForward(999);
  await expect(date).toHaveText("01/01/2024");
  await page.clock.fastForward(1);
  await expect(date).toHaveText("08/01/2024");
  await page.getByRole("button", { name: "Tạm dừng", exact: true }).click();
  await page.clock.fastForward(10000);
  await expect(date).toHaveText("08/01/2024");
  await page.getByRole("button", { name: "16×", exact: true }).click();
  await page.getByRole("button", { name: "Tiếp tục", exact: true }).click();
  await page.clock.fastForward(63);
  await expect(date).toHaveText("15/01/2024");
  await page.getByRole("button", { name: "Tạm dừng", exact: true }).click();
  const senior = createLife({
    legacyDemo: true,
    seed: "clock-care",
    start: "SENIOR_CARE",
  });
  await page.locator("input[type=file]").setInputFiles({
    name: "care.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(senior)),
  });
  await expect(date).toHaveText("01/01/2099");
  await page.getByRole("button", { name: "Tiếp tục", exact: true }).click();
  await page.clock.fastForward(63);
  await expect(date).toHaveText("08/01/2099");
  await page.clock.fastForward(63);
  const popup = page.getByRole("dialog");
  await expect(popup.getByRole("heading")).toHaveText(
    "Người bạn đời cần chăm sóc",
  );
  await popup.press("Escape");
  await page.clock.fastForward(10000);
  await expect(
    page.getByRole("button", { name: "Tiếp tục", exact: true }),
  ).toBeDisabled();
  await expect(date).toHaveText("12/01/2099");
});

test("1975 birth is paused, has four management groups and no under-five actions", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Bắt đầu cuộc đời", exact: true })
    .click();
  await expect(page.locator('time[aria-label="Ngày trong game"]')).toHaveText(
    /\d{2}\/\d{2}\/1975/,
  );
  await expect(
    page.getByRole("button", { name: "Tiếp tục", exact: true }),
  ).toBeVisible();
  await expect(
    page
      .getByRole("navigation", { name: "Bốn nhóm quản lý" })
      .getByRole("button"),
  ).toHaveCount(4);
  await page.getByRole("button", { name: /^❧\s*Bản thân$/ }).click();
  await expect(
    page.getByRole("button", { name: "Đọc sách, truyện", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByText(/Gia đình quyết định việc chăm sóc/),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Qua một tuần", exact: false })
    .click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByText("Đã lưu trên thiết bị")).toBeVisible();
  const date = await page
    .locator('time[aria-label="Ngày trong game"]')
    .textContent();
  await page.reload();
  await expect(page.locator('time[aria-label="Ngày trong game"]')).toHaveText(
    date!,
  );
});

test("quiet months are grouped without losing the monthly archive", async ({
  page,
}) => {
  let fixture = createLife({ legacyDemo: true, seed: "quiet-year" });
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
    legacyDemo: true,
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
  await page.getByRole("button", { name: /^↗\s*Sự nghiệp$/ }).click();
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
  await page.getByRole("button", { name: /^↗\s*Sự nghiệp$/ }).click();
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
  await expect(
    page.getByRole("heading", { name: "Tháng 01/2052" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Qua một tuần", exact: false })
    .click();
  const decision = page.getByRole("region", { name: "Quyết định quan trọng" });
  if (await decision.isVisible())
    await decision.getByRole("button").last().click();
  await expect(
    page.getByRole("heading", { name: "Tháng 01/2052" }),
  ).toBeVisible();
  await expect(page.getByText("Đã lưu trên thiết bị")).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Tháng 01/2052" }),
  ).toBeVisible();
  await page.getByRole("button", { name: /^₫\s*Tài chính$/ }).click();
  await expect(
    page.getByRole("heading", { name: "Cam kết & hợp đồng" }),
  ).toBeVisible();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Xuất bản lưu" }).click();
  expect((await downloadPromise).suggestedFilename()).toContain("2052-01");
  await page.getByText("Xem thêm", { exact: true }).click();
  await page
    .getByRole("button", { name: "Nguồn & mô hình", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Thực tế và Khắc nghiệt" }),
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
    page.getByRole("button", { name: "Qua một tuần", exact: false }),
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
  await page.getByRole("button", { name: /^↗\s*Sự nghiệp$/ }).click();
  await page
    .getByRole("button", { name: "Quản lý kinh doanh", exact: true })
    .click();
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
  await page.getByRole("button", { name: /^↗\s*Sự nghiệp$/ }).click();
  await page
    .getByRole("button", { name: "Quản lý kinh doanh", exact: true })
    .click();
  await expect(page.getByText("Đang hoạt động", { exact: true })).toBeVisible();
  await page.getByText("Xem thêm", { exact: true }).click();
  await page
    .getByRole("button", { name: "Kiểm tra mô hình", exact: true })
    .click();
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
  await page
    .getByRole("button", { name: "Tới quyết định", exact: true })
    .click();
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
  await expect(page.locator('time[aria-label="Ngày trong game"]')).toHaveText(
    "15/01/2099",
  );
  await page.getByText("Xem thêm", { exact: true }).click();
  await page
    .getByRole("button", { name: "Kiểm tra mô hình", exact: true })
    .click();
  await expect(page.getByText(/care-self/)).toBeVisible();
});
