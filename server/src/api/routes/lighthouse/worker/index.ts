import path from 'path'
import { resourceExtension } from '../../../../constants'
import Console from '../../../../utils/ConsoleHandler'
import WorkerManager from '../../../../utils/WorkerManager'
import { getStore } from '../../../../store'

const workerManager = WorkerManager.init(
	path.resolve(__dirname, `./worker.${resourceExtension}`),
	{
		minWorkers: 1,
		maxWorkers: 5,
	},
	['runPageSpeed', 'getPageSpeedUrl']
)

export const runPageSpeed = async (url: string) => {
	const freePool = await workerManager.getFreePool()
	const pool = freePool.pool
	let result

	try {
		const wsEndpoint = getStore('browser')?.wsEndpoint
		result = await pool.exec('runPageSpeed', [url, wsEndpoint])
	} catch (err) {
		Console.error(err)
	}

	freePool.terminate()
	return result
} // runPageSpeed

export const getPageSpeedUrl = async (url: string) => {
	const freePool = await workerManager.getFreePool()
	const pool = freePool.pool
	let result

	try {
		const wsEndpoint = getStore('browser')?.wsEndpoint
		result = await pool.exec('getPageSpeedUrl', [url, wsEndpoint])
	} catch (err) {
		Console.error(err)
	}

	freePool.terminate()
	return result
} // getPageSpeedUrl
