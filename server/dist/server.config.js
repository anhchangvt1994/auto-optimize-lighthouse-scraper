'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
var _ServerConfigHandler = require('./utils/ServerConfigHandler')

const ServerConfig = _ServerConfigHandler.defineServerConfig.call(void 0, {
	crawl: {
		enable: true,
		routes: {
			'/login': {
				enable: false,
			},
		},
		custom: (url) => {
			if (url.startsWith('https://github.com')) {
				return {
					cache: true,
					enable: true,
					compress: false,
					optimize: false,
					onContentCrawled: (payload) => {
						if (!payload.html) return ''

						const tmpHtml = payload.html
							.replace(
								/<\/head>/,
								`
                  <meta name="robots" content="noindex,nofollow">
                  <style>
                    body {
                      padding-top: 24px;
                    }
                    header {
                      display: none !important;
                    }
                    @media (min-width: 768px) {
                      x-banner + .d-md-block {
                        display: none !important
                      }
                    }
                    .user-profile-sticky-bar {
                      display: none
                    }

                    div[itemtype="http://schema.org/Person"].mt-md-n5 {
                      position: sticky;
                      top: 24px;
                      margin-top: 24px !important;
                      z-index: 10;
                    }
                    a[href="/login?return_to=https%3A%2F%2Fgithub.com%2Fanhchangvt1994"] {
                      display: none !important;
                    }
                    .user-following-container {
                      display: none !important;
                    }
                    .UnderlineNav {
                      display: none !important;
                    }
                    #user-profile-frame .text-mono {
                      display: none !important;
                    }
                    #js-contribution-activity {
                      display: none !important;
                    }
                    #year-list-container {
                      display: none !important;
                    }
                    .js-profile-editable-replace > div:nth-child(6) {
                      display: none !important;
                    }
                    .js-profile-editable-replace > button {
                      display: none !important;
                    }
                    a.anchor {
                      outline: none;
                      user-select: none;
                    }
                  </style>
                </head>
              `
							)
							.replace(
								/\"\/anhchangvt1994/g,
								'"https://github.com/anhchangvt1994'
							)
							.replace(
								/<link\s+(?=.*(rel=["']?(manifest|search)["']?).*?(\/|)?)(?:.*?\/?>)/g,
								''
							)
							.replace(
								/https:\/\/github.githubassets.com\/favicons\/favicon.png|https:\/\/github.githubassets.com\/favicons\/favicon.svg|https:\/\/github.githubassets.com\/assets\/pinned-octocat-093da3e6fa40.svg|https:\/\/github.com\/fluidicon.png/g,
								'/images/anhchangvt1994-avatar-rounded.ico'
							)
							.replace(/<a\s/g, '<a target="_blank" ')
						// .replace(/<header(\s[^>]+)*>(.|[\r\n])*?<\/header>/g, '')
						// .replace(
						// 	/<x-banner(\s[^>]+)*>(.|[\r\n])*?<\/x-banner>(.|[\r\n])*?<div(\s[^>]+)*>(.|[\r\n])*?<\/div>|<div class="user-profile-sticky-bar js-user-profile-sticky-bar d-none d-md-block is-follow-stuck is-stuck">(.|[\r\n])*?<\/div>|<div class="UnderlineNav width-full box-shadow-none js-responsive-underlinenav overflow-md-x-hidden">(.|[\r\n])*?<\/div>/g,
						// 	''
						// )
						// .replace(/<a\s/g, '<a target="_blank" ')

						return tmpHtml
					},
				}
			}

			return {
				cache: true,
				enable: true,
				compress: true,
				optimize: true,
			}
		},
	},
	routes: {
		'/': {
			pointsTo: 'https://github.com/anhchangvt1994',
		},
	},
	api: {
		list: {
			'http://localhost:3000/api': 'XXX',
		},
	},
})

exports.default = ServerConfig
