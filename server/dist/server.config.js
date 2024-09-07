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
							.replace(/="js-/g, '="')
							.replace(/\sjs-/g, ' ')
							.replace(
								/(<script(?![\s\S]type="application\/(ld\+json|xml|rdf\+xml)")(\s[^>]+)*>(.|[\r\n])*?<\/script>|<script(?![\s\S]type="application\/(ld\+json|xml|rdf\+xml)")(\s[^>]+)*\/>)/g,
								''
							)
							.replace(
								'</head>',
								`
                  <meta name="robots" content="noindex,nofollow">
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
                    #contribution-activity {
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
                    .profile-editable-replace > div:nth-child(1) {
                      display: block !important;
                      text-align: center;
                      margin-bottom: 0 !important;
                    }
                    .profile-editable-replace > div:nth-child(1) > div:nth-child(1) {
                      margin-right: 0 !important;
                    }
                    .profile-editable-replace > div:nth-child(2) {
                      margin-top: 0 !important;
                    }
                    .profile-editable-replace > div:nth-child(2) div[data-team-hovercards-enabled] {
                      justify-content: center;
                    }
                    .profile-editable-replace > div:nth-child(3) {
                      text-align: center !important;
                    }
                    .profile-editable-replace > div:nth-child(4) {
                      text-align: center !important;
                    }
                    .profile-editable-replace > div:nth-child(4) > .d-flex {
                      justify-content: center !important;
                    }
                    .profile-editable-replace > div:nth-child(5) {
                      text-align: center !important;
                    }
                    .profile-editable-replace > div:nth-child(5) > .d-flex {
                      justify-content: center !important;
                    }
                    .profile-editable-replace > div:nth-child(6) {
                      display: none !important;
                    }
                    .profile-editable-replace > button {
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
                </.head>
              `
							)
							.replace(
								'width=device-width',
								'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'
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
