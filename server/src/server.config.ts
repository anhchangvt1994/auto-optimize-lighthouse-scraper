import { defineServerConfig } from './utils/ServerConfigHandler'

const ServerConfig = defineServerConfig({
	crawl: {
		enable: true,
		routes: {
			'/login': {
				enable: false,
			},
		},
		cache: {
			enable: true,
			time: 24 * 3600,
			renewTime: 3600,
		},
	},
	api: {
		list: {
			'http://localhost:3000/api': 'XXX',
		},
	},
})

export default ServerConfig
