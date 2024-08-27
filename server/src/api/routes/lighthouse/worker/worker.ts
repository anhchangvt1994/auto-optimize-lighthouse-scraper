// import lighthouse from 'lighthouse/core/index.cjs'
import { Browser, Page } from 'puppeteer-core'
import WorkerPool from 'workerpool'
import { puppeteer } from '../../../../puppeteer-ssr/constants'
import Console from '../../../../utils/ConsoleHandler'

const _getSafePage = (page: Page | undefined) => {
	const SafePage = page

	return () => {
		if (SafePage && SafePage.isClosed()) return
		return SafePage
	}
} // _getSafePage

let _browser: Browser

// const runLightHouse = async (url: string, wsEndpoint: string) => {
// 	if (!url || !wsEndpoint) return

// 	if (!_browser || !_browser.connected) {
// 		_browser = await puppeteer.connect({
// 			browserWSEndpoint: wsEndpoint,
// 		})
// 	}

// 	if (!_browser) return

// 	const page = await _browser.newPage()

// 	const safePage = _getSafePage(page)

// 	const lighthouseResult = await lighthouse(
// 		url,
// 		{
// 			output: 'html',
// 			emulatedUserAgent:
// 				'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Googlebot/2.1; +http://www.google.com/bot.html) Chrome/118.0.0.0 Safari/537.36',
// 		},
// 		undefined,
// 		safePage()
// 	)

// 	safePage()?.close()

// 	return lighthouseResult
// } // runLighthouse

const runPageSpeed = async (url: string, wsEndpoint: string) => {
	if (!url || !wsEndpoint) return

	if (!_browser || !_browser.connected) {
		_browser = await puppeteer.connect({
			browserWSEndpoint: wsEndpoint,
		})
	}

	if (!_browser) return

	const page = await _browser.newPage()

	const safePage = _getSafePage(page)

	await safePage()?.setDefaultTimeout(300000)
	safePage()?.goto(url)
	const pageSpeedResponse = await safePage()?.waitForResponse(
		(res) =>
			res.url().startsWith('https://www.googleapis.com/pagespeedonline') &&
			res.status() === 200
	)

	const lighthouseResult = await new Promise(async (res) => {
		const response = await pageSpeedResponse?.json()

		if (response) res(response.lighthouseResult)
		res(undefined)
	})

	safePage()?.close()

	return lighthouseResult
} // runPageSpeed

const getPageSpeedUrl = async (url: string, wsEndpoint: string) => {
	if (!url || !wsEndpoint) return

	if (!_browser || !_browser.connected) {
		_browser = await puppeteer.connect({
			browserWSEndpoint: wsEndpoint,
		})
	}

	if (!_browser) return

	try {
		const page = await _browser.newPage()

		const safePage = _getSafePage(page)

		await safePage()?.goto(`https://pagespeed.web.dev/analysis?url=${url}`, {
			waitUntil: 'load',
			timeout: 0,
		})

		await new Promise((res) => setTimeout(res, 5000))

		const pageSpeedUrl = await page.url()

		safePage()?.close()

		return { pageSpeedUrl }
	} catch (err) {
		Console.log(err.message)
		return { pageSpeedUrl: '' }
	}
} // getPageSpeedUrl

WorkerPool.worker({
	// runLightHouse,
	runPageSpeed,
	getPageSpeedUrl,
	finish: () => {
		return 'finish'
	},
})
