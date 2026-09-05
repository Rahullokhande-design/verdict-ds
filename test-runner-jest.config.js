const { getJestConfig } = require("@storybook/test-runner");

/**
 * The runner drives a real browser, so it needs one.
 *
 * CI installs Playwright's own Chromium and this file changes nothing there.
 * On a machine where Playwright ships no build for the OS, point it at an
 * installed Chrome instead:
 *
 *     TEST_BROWSER_CHANNEL=chrome npm run test:a11y
 *
 * Same engine, same axe results, one fewer reason to skip the check locally and
 * hear about it from CI.
 */
const channel = process.env.TEST_BROWSER_CHANNEL;
const base = getJestConfig();

module.exports = {
  ...base,
  testEnvironmentOptions: {
    ...base.testEnvironmentOptions,
    "jest-playwright": {
      ...base.testEnvironmentOptions?.["jest-playwright"],
      ...(channel ? { launchOptions: { channel } } : {}),
    },
  },
};
