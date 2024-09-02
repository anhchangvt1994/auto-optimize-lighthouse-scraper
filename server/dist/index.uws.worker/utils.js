'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
function _interopRequireWildcard(obj) {
	if (obj && obj.__esModule) {
		return obj
	} else {
		var newObj = {}
		if (obj != null) {
			for (var key in obj) {
				if (Object.prototype.hasOwnProperty.call(obj, key)) {
					newObj[key] = obj[key]
				}
			}
		}
		newObj.default = obj
		return newObj
	}
}
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
var _fs = require('fs')
var _fs2 = _interopRequireDefault(_fs)
var _path = require('path')
var _path2 = _interopRequireDefault(_path)

var _PortHandler = require('../../../config/utils/PortHandler')
var _serverconfig = require('../server.config')
var _serverconfig2 = _interopRequireDefault(_serverconfig)
var _store = require('../store')
var _ConsoleHandler = require('../utils/ConsoleHandler')
var _ConsoleHandler2 = _interopRequireDefault(_ConsoleHandler)
var _InitEnv = require('../utils/InitEnv')

require('events').EventEmitter.setMaxListeners(200)

const setupCors = (res) => {
	res
		.writeHeader('Access-Control-Allow-Origin', '*')
		.writeHeader('Access-Control-Allow-Credentials', 'true')
		.writeHeader(
			'Access-Control-Allow-Methods',
			'GET, POST, PUT, DELETE, OPTIONS'
		)
		.writeHeader(
			'Access-Control-Allow-Headers',
			'origin, content-type, accept,' +
				' x-requested-with, authorization, lang, domain-key, Access-Control-Allow-Origin'
		)
		.writeHeader('Access-Control-Max-Age', '2592000')
		.writeHeader('Vary', 'Origin')
}

/**
 * Start the server.
 *
 * @return {Promise<Object>} A promise that resolves to the uWebSockets.js app instance.
 * @throws {Error} If the server fails to listen on the specified port.
 */
const startServer = async () => {
	let port =
		_InitEnv.PROCESS_ENV.PORT || _InitEnv.ENV_MODE === 'production'
			? 8080
			: _PortHandler.getPort.call(void 0, 'PUPPETEER_SSR_PORT')

	if (!port) {
		port = await _PortHandler.findFreePort.call(
			void 0,
			port || _InitEnv.PROCESS_ENV.PUPPETEER_SSR_PORT || 8080
		)
		_PortHandler.setPort.call(void 0, port, 'PUPPETEER_SSR_PORT')
	}

	_InitEnv.PROCESS_ENV.PORT = port

	const app = require('uWebSockets.js')./*SSL*/ App({
		key_file_name: 'misc/key.pem',
		cert_file_name: 'misc/cert.pem',
	})

	app.listen(Number(port), (token) => {
		if (token) {
			console.log(`Server started port ${port}. Press Ctrl+C to quit`)
			_optionalChain([
				process,
				'access',
				(_) => _.send,
				'optionalCall',
				(_2) => _2('ready'),
			])
			process.title = 'web-scraping'
		} else {
			console.log(`Failed to listen to port ${port}`)
		}
	})

	Promise.resolve()
		.then(() => _interopRequireWildcard(require('../utils/CleanerService')))
		.then((CleanerService) => {
			CleanerService.default()
		})
		.catch((err) => {
			_ConsoleHandler2.default.error(err.message)
		})

	process.on('SIGINT', async function () {
		await app.close()
		process.exit(0)
	})

	return app
}
exports.startServer = startServer // startServer

/**
 * Start a server worker.
 *
 * The server worker is created on an arbitrary port (4040) and is designed to
 * handle requests from an upstream load balancer. The server worker handles
 * all requests incoming to the load balancer, and it is the responsibility of
 * the load balancer to distribute the requests to the server worker.
 *
 * The server worker supports all the same features as the main server, with the
 * exception of the upstream proxy.
 *
 * @return {Promise<uWS.us_listen_socket>} A promise that resolves to the descriptor
 * for the server worker.
 */
const startServerWorker = async (params) => {
	params = {
		threadOrder: 0,
		...params,
	}

	_store.setStore.call(void 0, 'threadAdvanceInfo', {
		order: params.threadOrder,
	})

	const port = await _PortHandler.findFreePort.call(void 0, 4040)

	_InitEnv.PROCESS_ENV.PORT = port

	const app = require('uWebSockets.js')./*SSL*/ App({
		key_file_name: 'misc/key.pem',
		cert_file_name: 'misc/cert.pem',
	})

	app.any('/*', (res, req) => {
		if (!_InitEnv.PROCESS_ENV.BASE_URL)
			_InitEnv.PROCESS_ENV.BASE_URL = `${
				req.getHeader('x-forwarded-proto')
					? req.getHeader('x-forwarded-proto')
					: 'http'
			}://${req.getHeader('host')}`

		setupCors(res)

		res.end('', true) // end the request
	})

	if (!_serverconfig2.default.isRemoteCrawler) {
		app.get('/robots.txt', (res, req) => {
			try {
				const body = _fs2.default.readFileSync(
					_path2.default.resolve(__dirname, '../../robots.txt')
				)
				res.end(body, true)
			} catch (e) {
				res.writeStatus('404')
				res.end('File not found', true)
			}
		})
	}

	;(await require('../api/index.uws').default).init(app)
	;(await require('../puppeteer-ssr/index.uws').default).init(app)

	app.listen(Number(port), (token) => {
		if (token) {
			console.log(`Server started port ${port}. Press Ctrl+C to quit`)
			_optionalChain([
				process,
				'access',
				(_3) => _3.send,
				'optionalCall',
				(_4) => _4('ready'),
			])
			process.title = 'web-scraping'
		} else {
			console.log(`Failed to listen to port ${port}`)
		}
	})

	process.on('SIGINT', async function () {
		await app.close()
		process.exit(0)
	})

	return app.getDescriptor()
}
exports.startServerWorker = startServerWorker // startServerWorker
