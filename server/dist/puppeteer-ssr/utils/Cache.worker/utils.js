'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
function _interopRequireDefault(obj) {
	return obj && obj.__esModule ? obj : { default: obj }
}
function _nullishCoalesce(lhs, rhsFn) {
	if (lhs != null) {
		return lhs
	} else {
		return rhsFn()
	}
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
var _crypto = require('crypto')
var _crypto2 = _interopRequireDefault(_crypto)
var _ConsoleHandler = require('../../../utils/ConsoleHandler')
var _ConsoleHandler2 = _interopRequireDefault(_ConsoleHandler)
var _constants = require('../../../constants')
var _path = require('path')
var _path2 = _interopRequireDefault(_path)
var _zlib = require('zlib')

if (!_fs2.default.existsSync(_constants.pagesPath)) {
	_fs2.default.mkdirSync(_constants.pagesPath)
}

const regexKeyConverter =
	/^https?:\/\/(www\.)?|^www\.|botInfo=([^&]*)&deviceInfo=([^&]*)&localeInfo=([^&]*)&environmentInfo=([^&]*)/g
exports.regexKeyConverter = regexKeyConverter

const getKey = (url) => {
	if (!url) {
		_ConsoleHandler2.default.error('Need provide "url" param!')
		return
	}

	url = url
		.replace('/?', '?')
		.replace(exports.regexKeyConverter, '')
		.replace(/\?(?:\&|)$/g, '')
	return _crypto2.default.createHash('md5').update(url).digest('hex')
}
exports.getKey = getKey // getKey

const getFileInfo = async (file) => {
	if (!file) {
		_ConsoleHandler2.default.error('Need provide "file" param!')
		return
	}

	const result = await new Promise((res) => {
		_fs2.default.stat(file, (err, stats) => {
			if (err) {
				_ConsoleHandler2.default.error(err)
				res(undefined)
				return
			}

			res({
				size: stats.size,
				createdAt: stats.birthtime,
				updatedAt: stats.mtimeMs > stats.ctimeMs ? stats.mtime : stats.ctime,
				requestedAt: stats.atime,
			})
		})
	})

	return result
}
exports.getFileInfo = getFileInfo // getFileInfo

const setRequestTimeInfo = async (file, value) => {
	if (!file || !_fs2.default.existsSync(file)) {
		_ConsoleHandler2.default.error('File does not exist!')
		return
	}

	let stats
	try {
		stats = _fs2.default.statSync(file)
	} catch (err) {
		_ConsoleHandler2.default.error(err)
	}

	try {
		const info = await exports.getFileInfo.call(void 0, file)
		_ConsoleHandler2.default.log('file info', info)
		const fd = _fs2.default.openSync(file, 'r')
		_fs2.default.futimesSync(
			fd,
			value,
			_nullishCoalesce(
				_optionalChain([info, 'optionalAccess', (_) => _.updatedAt]),
				() => new Date()
			)
		)
		_fs2.default.close(fd)
		_ConsoleHandler2.default.log('File access time updated.')
	} catch (err) {
		_ConsoleHandler2.default.error(err)
	}
}
exports.setRequestTimeInfo = setRequestTimeInfo // setRequestTimeInfo

const maintainFile = _path2.default.resolve(
	__dirname,
	'../../../../maintain.html'
)

const get = async (url, options) => {
	options = options || {
		autoCreateIfEmpty: true,
	}

	if (!url) {
		_ConsoleHandler2.default.error('Need provide "url" param!')
		return
	}

	const key = exports.getKey.call(void 0, url)

	let file = `${_constants.pagesPath}/${key}.br`
	let isRaw = false

	switch (true) {
		case _fs2.default.existsSync(file):
			break
		case _fs2.default.existsSync(`${_constants.pagesPath}/${key}.renew.br`):
			file = `${_constants.pagesPath}/${key}.renew.br`
			break
		default:
			file = `${_constants.pagesPath}/${key}.raw.br`
			isRaw = true
			break
	}

	if (!_fs2.default.existsSync(file)) {
		if (!options.autoCreateIfEmpty) return

		_ConsoleHandler2.default.log(`Create file ${file}`)

		try {
			_fs2.default.writeFileSync(file, '')
			_ConsoleHandler2.default.log(`File ${key}.br has been created.`)

			const curTime = new Date()

			return {
				file,
				response: maintainFile,
				status: 503,
				createdAt: curTime,
				updatedAt: curTime,
				requestedAt: curTime,
				ttRenderMs: 200,
				available: false,
				isInit: true,
				isRaw,
			}
		} catch (err) {
			if (err) {
				_ConsoleHandler2.default.error(err)
				return {
					ttRenderMs: 200,
					available: false,
					isInit: true,
				}
			}
		}
	}

	await exports.setRequestTimeInfo.call(void 0, file, new Date())
	const info = await exports.getFileInfo.call(void 0, file)

	if (!info || info.size === 0) {
		const curTime = new Date()
		_ConsoleHandler2.default.log(`File ${file} chưa có thông tin`)
		return {
			file,
			response: maintainFile,
			status: 503,
			createdAt: _nullishCoalesce(
				_optionalChain([info, 'optionalAccess', (_2) => _2.createdAt]),
				() => curTime
			),
			updatedAt: _nullishCoalesce(
				_optionalChain([info, 'optionalAccess', (_3) => _3.updatedAt]),
				() => curTime
			),
			requestedAt: _nullishCoalesce(
				_optionalChain([info, 'optionalAccess', (_4) => _4.requestedAt]),
				() => curTime
			),
			ttRenderMs: 200,
			available: false,
			isInit: false,
			isRaw,
		}
	}

	_ConsoleHandler2.default.log(`File ${file} is ready!`)

	return {
		file,
		response: file,
		status: 200,
		createdAt: info.createdAt,
		updatedAt: info.updatedAt,
		requestedAt: info.requestedAt,
		ttRenderMs: 200,
		available: true,
		isInit: false,
		isRaw,
	}
}
exports.get = get // get

const set = async (
	{ html, url, isRaw } = {
		html: '',
		url: '',
		isRaw: false,
	}
) => {
	const key = exports.getKey.call(void 0, url)

	if (!html) {
		_ConsoleHandler2.default.error('Need provide "html" param')
		return
	}

	const file = `${_constants.pagesPath}/${key}${isRaw ? '.raw' : ''}.br`

	if (!isRaw) {
		if (_fs2.default.existsSync(`${_constants.pagesPath}/${key}.renew.br`))
			try {
				_fs2.default.renameSync(`${_constants.pagesPath}/${key}.renew.br`, file)
			} catch (err) {
				_ConsoleHandler2.default.error(err)
				return
			}
		else if (_fs2.default.existsSync(`${_constants.pagesPath}/${key}.raw.br`))
			try {
				_fs2.default.renameSync(`${_constants.pagesPath}/${key}.raw.br`, file)
			} catch (err) {
				_ConsoleHandler2.default.error(err)
				return
			}
	}

	// NOTE - If file is exist and isRaw or not disable compress process, will be created new or updated
	if (_fs2.default.existsSync(file)) {
		const contentCompression = Buffer.isBuffer(html)
			? html
			: _zlib.brotliCompressSync.call(void 0, html)

		try {
			_fs2.default.writeFileSync(file, contentCompression)
			_ConsoleHandler2.default.log(`File ${file} was updated!`)
		} catch (err) {
			_ConsoleHandler2.default.error(err)
			return
		}
	}

	const result = (await exports.get.call(void 0, url, {
		autoCreateIfEmpty: false,
	})) || { html, status: 200 }

	return result
}
exports.set = set // set

const renew = async (url) => {
	if (!url) return _ConsoleHandler2.default.log('Url can not empty!')
	const key = exports.getKey.call(void 0, url)
	let hasRenew = true

	const file = `${_constants.pagesPath}/${key}.renew.br`

	if (!_fs2.default.existsSync(file)) {
		hasRenew = false
		const curFile = (() => {
			let tmpCurFile = `${_constants.pagesPath}/${key}.br`

			switch (true) {
				case _fs2.default.existsSync(tmpCurFile):
					break
				default:
					tmpCurFile = `${_constants.pagesPath}/${key}.raw.br`
			}

			return tmpCurFile
		})()

		try {
			_fs2.default.renameSync(curFile, file)
		} catch (err) {
			_ConsoleHandler2.default.error(err)
			return
		}
	}

	return hasRenew
}
exports.renew = renew // renew

const remove = (url) => {
	if (!url) return _ConsoleHandler2.default.log('Url can not empty!')
	const key = exports.getKey.call(void 0, url)
	let file = `${_constants.pagesPath}/${key}.raw.br`

	if (!_fs2.default.existsSync(file)) {
		_ConsoleHandler2.default.log('Does not exist file reference url!')
		return
	}

	try {
		_fs2.default.unlinkSync(file)
	} catch (err) {
		console.error(err)
		throw err
	}
}
exports.remove = remove // remove
