module.exports = {
  id: "joyus-storybook-regression",
  viewports: [
    { label: "desktop", width: 1440, height: 900 },
    { label: "mobile", width: 390, height: 844 }
  ],
  onBeforeScript: "puppet/onBefore.js",
  onReadyScript: "puppet/onReady.js",
  scenarios: [
    {
      label: "Hour By Hour Gross Profit",
      url: "http://127.0.0.1:6006/?path=/story/widgets-hour-by-hour-gross-profit--single-location",
      selectors: ["body"],
      delay: 300
    },
    {
      label: "Shift Planner Day Card",
      url: "http://127.0.0.1:6006/?path=/story/widgets-shift-planner-day-card--default-state",
      selectors: ["body"],
      delay: 300
    }
  ],
  paths: {
    bitmaps_reference: "backstop/bitmaps_reference",
    bitmaps_test: "backstop/bitmaps_test",
    engine_scripts: "backstop/engine_scripts",
    html_report: "backstop/html_report",
    ci_report: "backstop/ci_report"
  },
  report: ["browser", "CI"],
  engine: "playwright",
  engineOptions: {
    browser: "chromium"
  },
  asyncCaptureLimit: 5,
  asyncCompareLimit: 50,
  debug: false,
  debugWindow: false
};
