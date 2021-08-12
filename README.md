# Lighthouse Performance Throttle

The purpose of this project is to allow Google Lighthouse performance to be run with throttling other than 3g.  It will output the performance score after each execution and write the complete report content to `results.json`.

## Setup

This project requires NodeJS. It was built using NodeJS v14.15.3

1. Clone the repository
2. From the root of the project run `npm install` in your terminal

## Use

This tool is execuded via the command line.

Cli flags:
- `--url`: required | the url to test
- `--speed`: optional | 3g 4g lte | defaults to 3g like the lighthouse service

Run the following command from the root of your project in your terminal.

```bash
node index.js --url https://theorem.co --speed lte
```

## Links

- https://www.speedtest.net/global-index
- https://github.com/GoogleChrome/lighthouse/blob/HEAD/docs/readme.md#using-programmatically
- https://github.com/GoogleChrome/lighthouse/blob/master/lighthouse-core/config/constants.js
- https://github.com/WPO-Foundation/webpagetest/blob/master/www/settings/connectivity.ini.sample

