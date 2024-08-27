'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
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
}
var _chromiummin = require('@sparticuz/chromium-min')
var _chromiummin2 = _interopRequireDefault(_chromiummin)
var _path = require('path')
var _path2 = _interopRequireDefault(_path)

var _constants = require('../../constants')
var _serverconfig = require('../../server.config')
var _serverconfig2 = _interopRequireDefault(_serverconfig)
var _store = require('../../store')
var _ConsoleHandler = require('../../utils/ConsoleHandler')
var _ConsoleHandler2 = _interopRequireDefault(_ConsoleHandler)
var _WorkerManager = require('../../utils/WorkerManager')
var _WorkerManager2 = _interopRequireDefault(_WorkerManager)

var _constants3 = require('../constants')

const workerManager = _WorkerManager2.default.init(
	_path2.default.resolve(
		__dirname,
		`../../utils/FollowResource.worker/index.${_constants.resourceExtension}`
	),
	{
		minWorkers: 1,
		maxWorkers: 1,
	},
	['deleteResource']
)

const deleteUserDataDir = async (dir) => {
	if (dir) {
		const freePool = await workerManager.getFreePool()
		const pool = freePool.pool

		try {
			pool.exec('deleteResource', [dir])
		} catch (err) {
			_ConsoleHandler2.default.log('BrowserManager line 39:')
			_ConsoleHandler2.default.error(err)
		}

		freePool.terminate()
	}
}
exports.deleteUserDataDir = deleteUserDataDir // deleteUserDataDir

const _getSafePage = (page) => {
	let SafePage = page

	return () => {
		if (SafePage && SafePage.isClosed()) return
		return SafePage
	}
} // _getSafePage

const BrowserManager = (
	userDataDir = () => `${_constants.userDataPath}/user_data`
) => {
	if (process.env.PUPPETEER_SKIP_DOWNLOAD && !_constants3.canUseLinuxChromium)
		return

	const maxRequestPerBrowser = 20
	let totalRequests = 0
	let browserLaunch
	let reserveUserDataDirPath
	let executablePath

	const __launch = async () => {
		totalRequests = 0

		const selfUserDataDirPath =
			reserveUserDataDirPath ||
			`${userDataDir()}${
				_serverconfig2.default.isRemoteCrawler ? '_remote' : ''
			}`
		reserveUserDataDirPath = `${userDataDir()}_reserve${
			_serverconfig2.default.isRemoteCrawler ? '_remote' : ''
		}`

		const browserStore = (() => {
			const tmpBrowserStore = _store.getStore.call(void 0, 'browser')
			return tmpBrowserStore || {}
		})()
		const promiseStore = (() => {
			const tmpPromiseStore = _store.getStore.call(void 0, 'promise')
			return tmpPromiseStore || {}
		})()

		browserLaunch = new Promise(async (res, rej) => {
			let isError = false
			let promiseBrowser

			try {
				if (_constants3.canUseLinuxChromium && !promiseStore.executablePath) {
					_ConsoleHandler2.default.log('Create executablePath')
					promiseStore.executablePath = _chromiummin2.default.executablePath(
						_constants3.chromiumPath
					)
				}

				browserStore.userDataPath = selfUserDataDirPath
				browserStore.reserveUserDataPath = reserveUserDataDirPath

				_store.setStore.call(void 0, 'browser', browserStore)
				_store.setStore.call(void 0, 'promise', promiseStore)

				if (!executablePath && promiseStore.executablePath) {
					executablePath = await promiseStore.executablePath
				}

				if (promiseStore.executablePath) {
					_ConsoleHandler2.default.log('Start browser with executablePath')
					promiseBrowser = _constants3.puppeteer.launch({
						..._constants3.defaultBrowserOptions,
						userDataDir: selfUserDataDirPath,
						args: _chromiummin2.default.args,
						executablePath,
					})

					// NOTE - Create a preventive browser to replace when current browser expired
					new Promise(async (res) => {
						const reserveBrowser = await _constants3.puppeteer.launch({
							..._constants3.defaultBrowserOptions,
							userDataDir: reserveUserDataDirPath,
							args: _chromiummin2.default.args,
							executablePath,
						})
						try {
							await reserveBrowser.close()
						} catch (err) {
							_ConsoleHandler2.default.log('BrowserManager line 121')
							_ConsoleHandler2.default.error(err)
						}

						res(null)
					})
				} else {
					_ConsoleHandler2.default.log('Start browser without executablePath')
					promiseBrowser = _constants3.puppeteer.launch({
						..._constants3.defaultBrowserOptions,
						userDataDir: selfUserDataDirPath,
					})

					// NOTE - Create a preventive browser to replace when current browser expired
					new Promise(async (res) => {
						const reserveBrowser = await _constants3.puppeteer.launch({
							..._constants3.defaultBrowserOptions,
							userDataDir: reserveUserDataDirPath,
						})
						try {
							await reserveBrowser.close()
						} catch (err) {
							_ConsoleHandler2.default.log('BrowserManager line 143')
							_ConsoleHandler2.default.error(err)
						}
						res(null)
					})
				}
			} catch (err) {
				isError = true
				_ConsoleHandler2.default.error(err)
			} finally {
				if (isError) return rej(undefined)
				_ConsoleHandler2.default.log('Start browser success!')
				res(promiseBrowser)
			}
		})

		if (browserLaunch) {
			try {
				let tabsClosed = 0
				const browser = await browserLaunch

				browserStore.wsEndpoint = browser.wsEndpoint()
				_store.setStore.call(void 0, 'browser', browserStore)

				browser.on('createNewPage', async (page) => {
					if (page) {
						const safePage = _getSafePage(page)

						const timeoutToCloseBrowserPage = setTimeout(() => {
							browser.emit('closePage', true)
						}, 30000)

						_optionalChain([
							safePage,
							'call',
							(_) => _(),
							'optionalAccess',
							(_2) => _2.once,
							'call',
							(_3) =>
								_3('close', async () => {
									clearTimeout(timeoutToCloseBrowserPage)
								}),
						])
					}
				})

				browser.on('closePage', async (url) => {
					tabsClosed++

					if (!_constants.SERVER_LESS && tabsClosed === maxRequestPerBrowser) {
						if (browser.connected)
							try {
								await browser.close()
							} catch (err) {
								_ConsoleHandler2.default.log('BrowserManager line 193')
								_ConsoleHandler2.default.error(err)
							}
					}
					// else {
					// 	browser.pages().then(async (pages) => {
					// 		if (pages.length) {
					// 			for (const page of pages) {
					// 				if (page.url() === url && !page.isClosed()) {
					// 					await new Promise((res) => setTimeout(res, 20000))

					// 					if (!page.isClosed()) page.close()
					// 				}
					// 			}
					// 		}
					// 	})
					// }
				})

				browser.once('disconnected', () => {
					exports.deleteUserDataDir.call(void 0, selfUserDataDirPath)
				})
			} catch (err) {
				_ConsoleHandler2.default.log('Browser manager line 177:')
				_ConsoleHandler2.default.error(err)
			}
		}
	} // __launch()

	if (_constants.POWER_LEVEL === _constants.POWER_LEVEL_LIST.THREE) {
		__launch()
	}

	const _get = async () => {
		if (!browserLaunch || !_isReady()) {
			__launch()
		}

		totalRequests++
		const curBrowserLaunch = browserLaunch

		// const pages = (await (await curBrowserLaunch)?.pages())?.length ?? 0;
		// await new Promise((res) => setTimeout(res, pages * 10));

		return curBrowserLaunch
	} // _get

	const _newPage = async () => {
		try {
			const browser = await _get()

			if (!browser.connected) {
				browser.close()
				__launch()
				return _newPage()
			}

			const page = await _optionalChain([
				browser,
				'optionalAccess',
				(_4) => _4.newPage,
				'optionalCall',
				(_5) => _5(),
			])

			if (!page) {
				browser.close()
				__launch()
				return _newPage()
			}

			browser.emit('createNewPage', page)
			return page
		} catch (err) {
			__launch()
			return _newPage()
		}
	} // _newPage

	const _isReady = () => {
		return totalRequests < maxRequestPerBrowser
	} // _isReady

	return {
		get: _get,
		newPage: _newPage,
		isReady: _isReady,
	}
}

exports.default = BrowserManager
