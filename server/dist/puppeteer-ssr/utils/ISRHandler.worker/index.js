'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
function _interopRequireDefault(obj) {
	return obj && obj.__esModule ? obj : { default: obj }
}
var _path = require('path')
var _path2 = _interopRequireDefault(_path)
var _constants = require('../../../constants')
var _ConsoleHandler = require('../../../utils/ConsoleHandler')
var _ConsoleHandler2 = _interopRequireDefault(_ConsoleHandler)
var _WorkerManager = require('../../../utils/WorkerManager')
var _WorkerManager2 = _interopRequireDefault(_WorkerManager)
var _BrowserManager = require('../BrowserManager')
var _BrowserManager2 = _interopRequireDefault(_BrowserManager)
var _utils = require('../CacheManager.worker/utils')
var _utils2 = _interopRequireDefault(_utils)

const { parentPort, isMainThread } = require('worker_threads')

const workerManager = _WorkerManager2.default.init(
	_path2.default.resolve(__dirname, `./worker.${_constants.resourceExtension}`),
	{
		minWorkers: 1,
		maxWorkers: 5,
		enableGlobalCounter: !isMainThread,
	},
	['ISRHandler']
)

const browserManager = _BrowserManager2.default.call(void 0)

const ISRHandler = async (params) => {
	if (!browserManager || !params.url) return

	const freePool = await workerManager.getFreePool({
		delay: 250,
	})

	const browser = await browserManager.get()

	if (!browser || !browser.connected) {
		freePool.terminate({
			force: true,
		})
		return
	}

	const wsEndpoint = browser.wsEndpoint()

	if (!wsEndpoint) {
		freePool.terminate({
			force: true,
		})
		return
	}

	const pool = freePool.pool

	let result
	const cacheManager = _utils2.default.call(void 0, params.url)

	try {
		result = await new Promise(async (res, rej) => {
			let html
			const timeout = setTimeout(async () => {
				if (html) {
					const tmpResult = await cacheManager.set({
						html,
						url: params.url,
						isRaw: !params.hasCache,
					})

					res(tmpResult)
				} else {
					res(undefined)
				}
			}, 15000)
			try {
				const tmpResult = await pool.exec(
					'ISRHandler',
					[
						{
							...params,
							wsEndpoint,
						},
					],
					{
						on: (payload) => {
							if (!payload) return
							if (
								typeof payload === 'object' &&
								payload.name === 'html' &&
								payload.value
							) {
								html = payload.value
							}
						},
					}
				)

				clearTimeout(timeout)
				res(tmpResult)
			} catch (err) {
				rej(err)
			}
		})
	} catch (err) {
		// clearTimeout(timeoutToCloseBrowserPage)
		_ConsoleHandler2.default.error(err)
	}

	const url = params.url.split('?')[0]
	browser.emit('closePage', url)
	if (!isMainThread) {
		parentPort.postMessage({
			name: 'closePage',
			wsEndpoint,
			url,
		})
	}

	freePool.terminate({
		force: true,
		// delay: 30000,
	})

	if (!result || result.status !== 200) {
		cacheManager.remove(params.url)
	}

	return result
} // getData

exports.default = ISRHandler
