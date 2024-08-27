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
var _path = require('path')
var _path2 = _interopRequireDefault(_path)
var _constants = require('../../../../constants')
var _ConsoleHandler = require('../../../../utils/ConsoleHandler')
var _ConsoleHandler2 = _interopRequireDefault(_ConsoleHandler)
var _WorkerManager = require('../../../../utils/WorkerManager')
var _WorkerManager2 = _interopRequireDefault(_WorkerManager)
var _store = require('../../../../store')

const workerManager = _WorkerManager2.default.init(
	_path2.default.resolve(__dirname, `./worker.${_constants.resourceExtension}`),
	{
		minWorkers: 1,
		maxWorkers: 5,
	},
	['runPageSpeed', 'getPageSpeedUrl']
)

const runPageSpeed = async (url) => {
	const freePool = await workerManager.getFreePool()
	const pool = freePool.pool
	let result

	try {
		const wsEndpoint = _optionalChain([
			_store.getStore.call(void 0, 'browser'),
			'optionalAccess',
			(_) => _.wsEndpoint,
		])
		result = await pool.exec('runPageSpeed', [url, wsEndpoint])
	} catch (err) {
		_ConsoleHandler2.default.error(err)
	}

	freePool.terminate()
	return result
}
exports.runPageSpeed = runPageSpeed // runPageSpeed

const getPageSpeedUrl = async (url) => {
	const freePool = await workerManager.getFreePool()
	const pool = freePool.pool
	let result

	try {
		const wsEndpoint = _optionalChain([
			_store.getStore.call(void 0, 'browser'),
			'optionalAccess',
			(_2) => _2.wsEndpoint,
		])
		result = await pool.exec('getPageSpeedUrl', [url, wsEndpoint])
	} catch (err) {
		_ConsoleHandler2.default.error(err)
	}

	freePool.terminate()
	return result
}
exports.getPageSpeedUrl = getPageSpeedUrl // getPageSpeedUrl
