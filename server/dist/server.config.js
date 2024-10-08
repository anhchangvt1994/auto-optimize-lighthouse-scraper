'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
function _interopRequireDefault(obj) {
	return obj && obj.__esModule ? obj : { default: obj }
}
var _path = require('path')
var _path2 = _interopRequireDefault(_path)
var _ServerConfigHandler = require('./utils/ServerConfigHandler')
var _InitEnv = require('./utils/InitEnv')

const ServerConfig = _ServerConfigHandler.defineServerConfig.call(void 0, {
	crawl: {
		enable: true,
		routes: {
			'/login': {
				enable: false,
			},
		},

		cache: {
			enable: true,
			time: 'infinite',
			renewTime: 3600,
			path: _InitEnv.PROCESS_ENV.IS_SERVER
				? _path2.default.resolve(__dirname, '../../../cache')
				: '',
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
								/(<script(?![\s\S]type="application\/(ld\+json|xml|rdf\+xml)")(\s[^>]+)*>(.|[\r\n])*?<\/script>|<script(?![\s\S]type="application\/(ld\+json|xml|rdf\+xml)")(\s[^>]+)*\/>)/g,
								''
							)
							.replace(
								'</head>',
								`
                  <style type="text/css">
                    body {
                      padding: 0 0 24px;
                    }
                    @media (min-width: 768px) {
                      body {
                        padding: 24px 0 32px;
                      }
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
                      display: none !important;
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
                    h1.vcard-names {
                      text-align: center !important;
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
                    #user-activity-overview {
                      display: none !important;
                    }
                    .position-relative div:nth-child(3) .col-12 {
                      width: 100% !important;
                    }
                    .position-relative div:nth-child(3) .col-12 .calendar-graph > div:nth-child(1) {
                      margin: auto !important;
                    }
                    .js-profile-editable-replace > div:nth-child(1) {
                      display: block !important;
                      text-align: center;
                      margin-bottom: 0 !important;
                    }
                    .js-profile-editable-replace > div:nth-child(1) > div:nth-child(1) {
                      margin-right: 0 !important;
                    }
                    .js-profile-editable-replace > div:nth-child(2) {
                      margin-top: 0 !important;
                    }
                    .js-profile-editable-replace > div:nth-child(2) div[data-team-hovercards-enabled] {
                      justify-content: center;
                    }
                    .js-profile-editable-replace > div:nth-child(3) {
                      text-align: center !important;
                    }
                    .js-profile-editable-replace > div:nth-child(4) {
                      text-align: center !important;
                    }
                    .js-profile-editable-replace > div:nth-child(4) > .d-flex {
                      justify-content: center !important;
                    }
                    .js-profile-editable-replace > div:nth-child(5) {
                      text-align: center !important;
                    }
                    .js-profile-editable-replace > div:nth-child(5) > .d-flex {
                      justify-content: center !important;
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
                    footer {
                      display: none !important;
                    }
                  </style>
                </head>
              `
							)
							.replace(
								'width=device-width',
								'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'
							)
							.replace(
								'<meta property="og:url" content="https://github.com/anhchangvt1994">',
								'<meta property="og:url" content="https://anhchangvt1994.site">'
							)
							.replace(
								'<link rel="canonical" href="https://github.com/anhchangvt1994" data-turbo-transient="">',
								'<link rel="canonical" href="https://anhchangvt1994.site" data-turbo-transient="">'
							)
							.replace(
								/\"\/anhchangvt1994/g,
								'"https://github.com/anhchangvt1994'
							)
							.replace(
								/<link\s+(?=.*(rel=["']?(manifest|search)["']?).*?(\/|)?)(?:.*?\/?>)|<meta\s+(?=.*(name=["']?(turbo-cache-control|route-pattern|route-controller|route-action|current-catalog-service-hash|request-id|github-keyboard-shortcuts|selected-link|google-site-verification|octolytics-url|user-login|fb:app_id|apple-itunes-app|hostname|expected-hostname|octolytics-dimension-user_id|turbo-body-classes|browser-stats-url|browser-errors-url)["']?).*?(\/|)?)(?:.*?\/?>)|<meta\s+(?=.*(http-equiv=["']?(x-pjax(-csp-|-css-|-js-|-)version|Content-Security-Policy)["']?).*?(\/|)?)(?:.*?\/?>)/g,
								''
							)
							.replace(
								/https:\/\/github.githubassets.com\/favicons\/favicon.png|https:\/\/github.githubassets.com\/favicons\/favicon.svg|https:\/\/github.githubassets.com\/assets\/pinned-octocat-093da3e6fa40.svg|https:\/\/github.com\/fluidicon.png/g,
								'/images/anhchangvt1994-avatar-rounded-v1.svg'
							)
							.replace(/<a\s/g, '<a target="_blank" ')

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
	api: {
		list: {
			'http://localhost:3000/api': 'XXX',
		},
	},
})

exports.default = ServerConfig
