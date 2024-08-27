'use strict'
function _interopRequireDefault(obj) {
	return obj && obj.__esModule ? obj : { default: obj }
}
function _optionalChain(ops) {
	let lastAccessLHS = undefined
	let value = ops[0]
	let i = 1
	while (i < ops.length) {
		const op = ops[i]
		const fn = ops[i + 1]
		i += 2
		if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) {
			return undefined
		}
		if (op === 'access' || op === 'optionalAccess') {
			lastAccessLHS = value
			value = fn(value)
		} else if (op === 'call' || op === 'optionalCall') {
			value = fn((...args) => value.call(lastAccessLHS, ...args))
			lastAccessLHS = undefined
		}
	}
	return value
} // import lighthouse from 'lighthouse/core/index.cjs'

var _workerpool = require('workerpool')
var _workerpool2 = _interopRequireDefault(_workerpool)
var _constants = require('../../../../puppeteer-ssr/constants')
var _ConsoleHandler = require('../../../../utils/ConsoleHandler')
var _ConsoleHandler2 = _interopRequireDefault(_ConsoleHandler)

const _getSafePage = (page) => {
	const SafePage = page

	return () => {
		if (SafePage && SafePage.isClosed()) return
		return SafePage
	}
} // _getSafePage

let _browser

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

const runPageSpeed = async (url, wsEndpoint) => {
	if (!url || !wsEndpoint) return

	if (!_browser || !_browser.connected) {
		_browser = await _constants.puppeteer.connect({
			browserWSEndpoint: wsEndpoint,
		})
	}

	if (!_browser) return

	const page = await _browser.newPage()

	const safePage = _getSafePage(page)

	await _optionalChain([
		safePage,
		'call',
		(_) => _(),
		'optionalAccess',
		(_2) => _2.setDefaultTimeout,
		'call',
		(_3) => _3(300000),
	])
	_optionalChain([
		safePage,
		'call',
		(_4) => _4(),
		'optionalAccess',
		(_5) => _5.goto,
		'call',
		(_6) => _6(url),
	])
	const pageSpeedResponse = await _optionalChain([
		safePage,
		'call',
		(_7) => _7(),
		'optionalAccess',
		(_8) => _8.waitForResponse,
		'call',
		(_9) =>
			_9(
				(res) =>
					res.url().startsWith('https://www.googleapis.com/pagespeedonline') &&
					res.status() === 200
			),
	])

	const lighthouseResult = await new Promise(async (res) => {
		const response = await _optionalChain([
			pageSpeedResponse,
			'optionalAccess',
			(_10) => _10.json,
			'call',
			(_11) => _11(),
		])

		if (response) res(response.lighthouseResult)
		res(undefined)
	})

	_optionalChain([
		safePage,
		'call',
		(_12) => _12(),
		'optionalAccess',
		(_13) => _13.close,
		'call',
		(_14) => _14(),
	])

	return lighthouseResult
} // runPageSpeed

const getPageSpeedUrl = async (url, wsEndpoint) => {
	if (!url || !wsEndpoint) return

	if (!_browser || !_browser.connected) {
		_browser = await _constants.puppeteer.connect({
			browserWSEndpoint: wsEndpoint,
		})
	}

	if (!_browser) return

	try {
		const page = await _browser.newPage()

		const safePage = _getSafePage(page)

		await _optionalChain([
			safePage,
			'call',
			(_15) => _15(),
			'optionalAccess',
			(_16) => _16.goto,
			'call',
			(_17) =>
				_17(`https://pagespeed.web.dev/analysis?url=${url}`, {
					waitUntil: 'load',
					timeout: 0,
				}),
		])

		await new Promise((res) => setTimeout(res, 5000))

		const pageSpeedUrl = await page.url()

		_optionalChain([
			safePage,
			'call',
			(_18) => _18(),
			'optionalAccess',
			(_19) => _19.close,
			'call',
			(_20) => _20(),
		])

		return { pageSpeedUrl }
	} catch (err) {
		_ConsoleHandler2.default.log(err.message)
		return { pageSpeedUrl: '' }
	}
} // getPageSpeedUrl

_workerpool2.default.worker({
	// runLightHouse,
	runPageSpeed,
	getPageSpeedUrl,
	finish: () => {
		return 'finish'
	},
})
