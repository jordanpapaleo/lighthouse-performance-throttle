const argv = require('yargs').argv
const chromeLauncher = require('chrome-launcher')
const fs = require('fs')
const get = require('lodash/get')
const lighthouse = require('lighthouse')

// https://github.com/GoogleChrome/lighthouse/blob/master/docs/throttling.md#how-do-i-get-high-quality-packet-level-throttling
// https://github.com/GoogleChrome/lighthouse/blob/v6.4.1/lighthouse-core/config/constants.js#L22-L29
const DEVTOOLS_RTT_ADJUSTMENT_FACTOR = 3.75
const DEVTOOLS_THROUGHPUT_ADJUSTMENT_FACTOR = 0.9

// https://github.com/WPO-Foundation/webpagetest/blob/master/www/settings/connectivity.ini.sample
const throttling = {
  mobile3G: {
    rttMs: 150,
    throughputKbps: 1.6 * 1024,
    requestLatencyMs: 150 * DEVTOOLS_RTT_ADJUSTMENT_FACTOR,
    downloadThroughputKbps: 1.6 * 1024 * DEVTOOLS_THROUGHPUT_ADJUSTMENT_FACTOR,
    uploadThroughputKbps: 750 * DEVTOOLS_THROUGHPUT_ADJUSTMENT_FACTOR,
    cpuSlowdownMultiplier: 4,
  },
  mobile4G: {
    rttMs: 170,
    throughputKbps: 9 * 1024,
    requestLatencyMs: 170 * DEVTOOLS_RTT_ADJUSTMENT_FACTOR,
    downloadThroughputKbps: 9 * 1024 * DEVTOOLS_THROUGHPUT_ADJUSTMENT_FACTOR,
    uploadThroughputKbps: 750 * DEVTOOLS_THROUGHPUT_ADJUSTMENT_FACTOR,
    cpuSlowdownMultiplier: 3,
  },
  mobileLTE: {
    rttMs: 70,
    throughputKbps: 12 * 1024,
    requestLatencyMs: 70 * DEVTOOLS_RTT_ADJUSTMENT_FACTOR,
    downloadThroughputKbps: 12 * 1024 * DEVTOOLS_THROUGHPUT_ADJUSTMENT_FACTOR,
    uploadThroughputKbps: 750 * DEVTOOLS_THROUGHPUT_ADJUSTMENT_FACTOR,
    cpuSlowdownMultiplier: 3,
  },
}

/**
 * @param {string} url
 * @param {string=} speed [n="3g"]
 * @return {Promise<{}>}
 */
const launchChromeAndRunLighthouse = (url, speed = '3g') => {
  let throttleSpeed

  switch (speed) {
    case '4g':
      throttleSpeed = throttling.mobile4G
      break
    case 'lte':
      throttleSpeed = throttling.mobileLTE
      break
    case '3g':
    default:
      throttleSpeed = throttling.mobile3G
      break
}

  return chromeLauncher.launch({ chromeFlags: ['--headless'] })
    .then((chrome) => lighthouse(url, {
        throttling: throttleSpeed,
        logLevel: 'info',
        output: 'json',
        onlyCategories: ['performance'],
        port: chrome.port,
        quiet: true,
      })
        .then((results) => chrome.kill()
          .then(() => results)
        )
    )
}

if (argv.url) {
  launchChromeAndRunLighthouse(argv.url, argv.speed)
    .then((results) => {
      console.log(`
      ${results.lhr.finalUrl}
      Connection speed: ${argv.speed || '3g'}
      Performance score: ${get(results, 'lhr.categories.performance.score', 0) * 100}
      `)

      fs.writeFileSync('results.json', results.report)
    })
    .catch((err) => { console.log(err) })
} else {
  throw '--url param is required'
}
