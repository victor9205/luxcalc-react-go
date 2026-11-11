import { test, expect } from "@playwright/test";

async function fillOperands(page, a, b) {
  await page.getByLabel("First operand", { exact: true }).fill(a);
  await page.getByLabel("Second operand", { exact: true }).fill(b);
}

test("desktop keyboard calculation uses the real Go API and clears stale results", async ({
  page,
}) => {
  const browserErrors = [];
  page.on("pageerror", (error) => browserErrors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Calculation result" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Calculate", exact: true }).click();
  await expect(
    page.getByLabel("First operand", { exact: true }),
  ).toHaveAttribute("aria-invalid", "true");
  await fillOperands(page, "120", "4");
  await page.getByRole("button", { name: "Divide", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Divide", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByLabel("Second operand", { exact: true }).focus();
  const responsePromise = page.waitForResponse((response) =>
    response.url().endsWith("/api/calculate"),
  );
  await page.keyboard.press("Enter");
  const response = await responsePromise;
  expect(response.status()).toBe(200);
  expect(await response.json()).toEqual({ result: 30 });
  await expect(
    page
      .getByRole("region", { name: "Calculation result" })
      .getByText("30", { exact: true }),
  ).toBeVisible();
  await page.screenshot({ path: ".artifacts/desktop.png", fullPage: true });
  await page.getByLabel("First operand", { exact: true }).fill("121");
  await expect(
    page
      .getByRole("region", { name: "Calculation result" })
      .getByText("30", { exact: true }),
  ).toHaveCount(0);
  expect(browserErrors).toEqual([]);
});

test("real backend division error is presented in React and the user can recover", async ({
  page,
}) => {
  await page.goto("/");
  await fillOperands(page, "12", "0");
  await page.getByRole("button", { name: "Divide", exact: true }).click();
  await page.getByRole("button", { name: "Calculate", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("Cannot divide by zero");
  await page.getByLabel("Second operand", { exact: true }).fill("3");
  await page.getByRole("button", { name: "Calculate", exact: true }).click();
  await expect(
    page
      .getByRole("region", { name: "Calculation result" })
      .getByText("4", { exact: true }),
  ).toBeVisible();
});

test("320px mobile preserves the full API precision and has no horizontal overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const transitionDuration = await page
    .getByRole("button", { name: "Add", exact: true })
    .evaluate((element) =>
      parseFloat(getComputedStyle(element).transitionDuration),
    );
  expect(transitionDuration).toBeLessThan(0.001);
  await fillOperands(page, "0.1", "0.2");
  await page.getByRole("button", { name: "Calculate", exact: true }).click();
  await expect(
    page
      .getByRole("region", { name: "Calculation result" })
      .getByText("0.30000000000000004", { exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({ path: ".artifacts/mobile.png", fullPage: true });
  await fillOperands(page, "1e200", "1e100");
  await page.getByRole("button", { name: "Multiply", exact: true }).click();
  await page.getByRole("button", { name: "Calculate", exact: true }).click();
  await expect(
    page
      .getByRole("region", { name: "Calculation result" })
      .getByText("1e+300", { exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test("connection failure is actionable and clears on editing", async ({
  page,
}) => {
  await page.goto("/");
  await page.route("**/api/calculate", (route) => route.abort("failed"));
  await fillOperands(page, "7", "3");
  await page.getByRole("button", { name: "Calculate", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText(
    /connect|network|reach|try again/i,
  );
  await page.getByLabel("First operand", { exact: true }).fill("8");
  await expect(page.getByRole("alert")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Calculate", exact: true }),
  ).toBeEnabled();
});

test("pending request blocks duplicate submit and edits invalidate it", async ({
  page,
}) => {
  await page.goto("/");
  let release;
  let calls = 0;
  const held = new Promise((resolve) => {
    release = resolve;
  });
  await page.route("**/api/calculate", async (route) => {
    calls += 1;
    await held;
    await route.fulfill({ json: { result: 999 } }).catch(() => {});
  });
  await fillOperands(page, "2", "3");
  await page.getByRole("button", { name: "Calculate", exact: true }).click();
  await expect(page.getByRole("button", { name: /calculat/i })).toBeDisabled();
  await page.getByLabel("Second operand", { exact: true }).press("Enter");
  await expect.poll(() => calls).toBe(1);
  await page.getByLabel("First operand", { exact: true }).fill("4");
  await expect(
    page.getByRole("button", { name: "Calculate", exact: true }),
  ).toBeEnabled();
  release();
  await expect(
    page
      .getByRole("region", { name: "Calculation result" })
      .getByText("999", { exact: true }),
  ).toHaveCount(0);
});

test("live transport returns strict JSON validation and method contracts", async ({
  request,
}) => {
  const invalid = await request.post("/api/calculate", {
    data: { operation: "add", a: 0 },
  });
  expect(invalid.status()).toBe(400);
  expect((await invalid.json()).error.code).toBe("INVALID_INPUT");
  const unsupported = await request.post("/api/calculate", {
    data: { operation: "power", a: 2, b: 3 },
  });
  expect(unsupported.status()).toBe(422);
  expect((await unsupported.json()).error.code).toBe("UNSUPPORTED_OPERATION");
  const method = await request.get("/api/calculate");
  expect(method.status()).toBe(405);
  expect(method.headers().allow).toBe("POST");
  const oversized = await request.post("/api/calculate", {
    headers: { "Content-Type": "application/json" },
    data: '{"operation":"add","a":1,"b":2}{}' + " ".repeat(9000),
  });
  expect(oversized.status()).toBe(413);
  expect((await oversized.json()).error.code).toBe("INVALID_INPUT");
  const encoded = await request.get("/api%2Fhealth");
  expect(encoded.status()).toBe(404);
  expect((await encoded.json()).error.code).toBe("NOT_FOUND");
});

test("Tab navigation exposes visible focus and keyboard operation selection", async ({
  page,
}) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "LuxCalc home" })).toBeFocused();
  await page.keyboard.press("Tab");
  const add = page.getByRole("button", { name: "Add", exact: true });
  await expect(add).toBeFocused();
  expect(
    await add.evaluate((element) => getComputedStyle(element).outlineStyle),
  ).toBe("solid");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Multiply", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("button", { name: "Multiply", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("First operand", { exact: true })).toBeFocused();
  await page.keyboard.type("2");
  await page.keyboard.press("Tab");
  await expect(
    page.getByLabel("Second operand", { exact: true }),
  ).toBeFocused();
  await page.keyboard.type("3");
  await page.keyboard.press("Enter");
  await expect(
    page
      .getByRole("region", { name: "Calculation result" })
      .getByText("6", { exact: true }),
  ).toBeVisible();
});
