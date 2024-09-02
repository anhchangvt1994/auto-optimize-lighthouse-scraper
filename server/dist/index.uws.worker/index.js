'use strict'
function _interopRequireDefault(obj) {
	return obj && obj.__esModule ? obj : { default: obj }
}
var _path = require('path')
var _path2 = _interopRequireDefault(_path)
var _constants = require('../constants')

var _BrowserManager = require('../puppeteer-ssr/utils/BrowserManager')
var _BrowserManager2 = _interopRequireDefault(_BrowserManager)
var _WorkerManager = require('../utils/WorkerManager')
var _WorkerManager2 = _interopRequireDefault(_WorkerManager)

var _utils = require('./utils')

// const { Worker, isMainThread, threadId, parentPort } = require('worker_threads')

const workerManager = _WorkerManager2.default.init(
	_path2.default.resolve(__dirname, `./worker.${_constants.resourceExtension}`),
	{
		minWorkers: 1,
		maxWorkers: 5,
	}
)

const browserManager = _BrowserManager2.default.call(void 0)
const browserList = new Map()

const _startServerWorker = async (params) => {
	if (!browserManager) return

	const freePool = await workerManager.getFreePool()
	const pool = freePool.pool

	const acceptor = await pool.exec('startServerWorker', [params], {
		on: async (payload) => {
			if (!payload) return
			if (payload.name === 'getBrowser') {
				const browser = await browserManager.get()
				if (
					browser &&
					browser.connected &&
					!browserList.has(browser.wsEndpoint())
				) {
					browserList.set(browser.wsEndpoint(), browser)
				}
			} else if (payload.name === 'closePage') {
				if (payload.wsEndpoint) {
					const browser = browserList.get(payload.wsEndpoint)
					if (!browser || !browser.connected) return
					browser.emit('closePage', payload.url)
				}
			}
		},
	})

	return acceptor
} // _startServerWorker

_utils.startServer
	.call(void 0)
	.then(async (app) => {
		if (!browserManager) return

		const acceptorList = await Promise.all([
			_startServerWorker({
				threadOrder: 1,
			}),
			_startServerWorker({
				threadOrder: 2,
			}),
			_startServerWorker({
				threadOrder: 3,
			}),
			_startServerWorker({
				threadOrder: 4,
			}),
			_startServerWorker({
				threadOrder: 5,
			}),
		])

		for (const acceptor of acceptorList) {
			console.log(acceptor)
			app.addChildAppDescriptor(acceptor)
		}
	})
	.catch((err) => {
		console.error(err.message)
	})
