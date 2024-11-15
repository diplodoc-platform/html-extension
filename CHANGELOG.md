# Changelog

## [2.4.0](https://github.com/diplodoc-platform/html-extension/compare/v2.3.2...v2.4.0) (2024-11-15)


### Features

* **plugin:** use config-object to register directive ([d853d00](https://github.com/diplodoc-platform/html-extension/commit/d853d001c63e4decffa40e9cf57423bf8a1a12c4))
* replace markdown-it-directive with @diplodoc/directive ([d040c13](https://github.com/diplodoc-platform/html-extension/commit/d040c13e321a0a2ab341e67db7a14ffcfab15625))

## [2.3.2](https://github.com/diplodoc-platform/html-extension/compare/v2.3.1...v2.3.2) (2024-10-08)


### Bug Fixes

* PluginOptions type export ([dd514eb](https://github.com/diplodoc-platform/html-extension/commit/dd514ebaeb6fcd68ae8f0e4873cd2dffb5a5f4d1))

## [2.3.1](https://github.com/diplodoc-platform/html-extension/compare/v2.3.0...v2.3.1) (2024-10-07)


### Bug Fixes

* added typesVersions ([d0cd2e8](https://github.com/diplodoc-platform/html-extension/commit/d0cd2e83f8471d5821f8e128607128aaaab7d537))

## [2.3.0](https://github.com/diplodoc-platform/html-extension/compare/v2.2.0...v2.3.0) (2024-10-07)


### Features

* **srcDoc:** added onload arg ([8fadb91](https://github.com/diplodoc-platform/html-extension/commit/8fadb91e68de8a6098ee4907f8b2f8aace5396fa))
* **srcDoc:** added onload arg ([546251e](https://github.com/diplodoc-platform/html-extension/commit/546251ea684717b38d431f4e952be3b6432d3432))
* **srcDoc:** added onload arg ([5913371](https://github.com/diplodoc-platform/html-extension/commit/5913371e2653217db827e24b94da5cb3a8125891))
* **srcDoc:** added scroll to hash ([113f842](https://github.com/diplodoc-platform/html-extension/commit/113f84283a066e1d697c701074e6ef3a6c5e73d6))
* **srcDoc:** updtaed handleHashChange logic ([0e76f51](https://github.com/diplodoc-platform/html-extension/commit/0e76f5189abdb5dd9f9dd548aec73d48aecaac5b))

## [2.2.0](https://github.com/diplodoc-platform/html-extension/compare/v2.1.0...v2.2.0) (2024-09-06)


### Features

* disable inline directives ([2d0f24f](https://github.com/diplodoc-platform/html-extension/commit/2d0f24f4a9bb57700a53546f4f976a66ba74a4d1))


### Bug Fixes

* Fix prod dependencies ([005a30d](https://github.com/diplodoc-platform/html-extension/commit/005a30d6c208df68267555140efcc10a885d29a8))
* **release:** use master as main branch ([673ff81](https://github.com/diplodoc-platform/html-extension/commit/673ff817879d712705e27fdd58822f0f4b1df147))

## [2.1.0](https://github.com/diplodoc-platform/html-extension/compare/v2.0.1...v2.1.0) (2024-09-03)


### Features

* **srcDoc:** added code for anchor links ([221f9a4](https://github.com/diplodoc-platform/html-extension/commit/221f9a4d2e092d94d7847fcecdfb4965a9b399f7))
* **srcDoc:** added code for anchor links ([0b9ba32](https://github.com/diplodoc-platform/html-extension/commit/0b9ba32d296dd2f522621778952b8ed9847cc8a3))
* **srcDoc:** deleted TODO ([2cf9b87](https://github.com/diplodoc-platform/html-extension/commit/2cf9b874dfd496c922de6074e3e346b917202549))
* **srcDoc:** fixed type null ([c8628e0](https://github.com/diplodoc-platform/html-extension/commit/c8628e04ac2dbb76a3de94367979026342b86730))

## [2.0.1](https://github.com/diplodoc-platform/html-extension/compare/v2.0.0...v2.0.1) (2024-09-02)


### Bug Fixes

* make dispose function correctly ([f14a50b](https://github.com/diplodoc-platform/html-extension/commit/f14a50bf38f49418b4d07abc1c10467f9d0edc6f))

## [2.0.0](https://github.com/diplodoc-platform/html-extension/compare/v1.5.0...v2.0.0) (2024-08-23)


### ⚠ BREAKING CHANGES

* move `embeddingMode` resolution into plugin options
* implement new api for root controller

### Features

* add React runtime component ([ff96911](https://github.com/diplodoc-platform/html-extension/commit/ff969115f8efde431c3d3a4426bfd5d983575cd0))
* allow supplying the runtime an override for iframes' src attribute ([82ee85e](https://github.com/diplodoc-platform/html-extension/commit/82ee85e7770c2f388a10d2e285f531fe306e8c2a))
* change transform function to support the isolated mode ([36bc0b8](https://github.com/diplodoc-platform/html-extension/commit/36bc0b8306f85a6d8065a57934099b66397d8859))
* implement `collect` plugin extension ([ece5ec6](https://github.com/diplodoc-platform/html-extension/commit/ece5ec6fe7dfb75b34914781b9f99963e1cb8b4d))
* implement new api for root controller ([48c03cb](https://github.com/diplodoc-platform/html-extension/commit/48c03cbaaef9ec1fe8317f3672b6b82cfb6b1559))
* implement upstream healthchecks in PostMessageChannel ([ea190dc](https://github.com/diplodoc-platform/html-extension/commit/ea190dc8c022cd57582f3b5def2dc20cf48193f4))
* move `embeddingMode` resolution into plugin options ([4719361](https://github.com/diplodoc-platform/html-extension/commit/4719361b484bdd7adb23e0d47a4c882e81da6961))
* proper DX and demo ([03eae43](https://github.com/diplodoc-platform/html-extension/commit/03eae43154ef431176e50a227e9bbdf61a1714f5))
* restore functionality to embed via `srcdoc` iframe ([6f9e200](https://github.com/diplodoc-platform/html-extension/commit/6f9e200c75e0e643dbe883aeb0100f01f79fe72c))
* rpc consumer implementation ([88d00ef](https://github.com/diplodoc-platform/html-extension/commit/88d00ef21c27496a28310a4d87907e48636a2331))
* use iframe runtime instead of direct DOM manipulations ([a2341a0](https://github.com/diplodoc-platform/html-extension/commit/a2341a08fbfd96f75008c716872ffd0dde38dc90))
* use non-declarative shadow root ([6d0e3cf](https://github.com/diplodoc-platform/html-extension/commit/6d0e3cfb58c42a284c4353c67c1a11d5ddb53b52))


### Bug Fixes

* disable generation of git tags upon running `npm version` ([186ca51](https://github.com/diplodoc-platform/html-extension/commit/186ca514b07c439473c3e691672591ebbbcece40))
* force srcdoc resize to work as intended ([7f58293](https://github.com/diplodoc-platform/html-extension/commit/7f58293e0fa687e885a8aa3fb60c435c4fd7d50f))
* make symbols consistent across different runtime components ([db338fa](https://github.com/diplodoc-platform/html-extension/commit/db338fa7f1bdae1d535c15559cdaea3718d8c9aa))

## [1.5.0](https://github.com/diplodoc-platform/html-extension/compare/v1.4.0...v1.5.0) (2024-08-20)


### Features

* **plugin:** added head option ([33d4712](https://github.com/diplodoc-platform/html-extension/commit/33d4712c7e64532d187403b73190c2f3f0ebb31c))
* **plugin:** fixed lint error ([f578423](https://github.com/diplodoc-platform/html-extension/commit/f578423592e7cbba3ce0c7ff876b0fdbf6332eba))
* **plugin:** updated created iframe (without quirks mode) ([296c13e](https://github.com/diplodoc-platform/html-extension/commit/296c13ea5daa23fc1d8526e09b0d3350fc531ba0))

## [1.4.0](https://github.com/diplodoc-platform/html-extension/compare/v1.3.3...v1.4.0) (2024-08-15)


### Features

* implement a workflow to publish prerelease versions from a branch ([460e900](https://github.com/diplodoc-platform/html-extension/commit/460e90032a9e70768846969ea1196025273e1610))

## [1.3.3](https://github.com/diplodoc-platform/html-extension/compare/v1.3.2...v1.3.3) (2024-08-15)


### Bug Fixes

* **plugin:** added export getStyles ([0b8bc97](https://github.com/diplodoc-platform/html-extension/commit/0b8bc97a7951f37f21c11ff61f6ef70d23da17f1))

## [1.3.2](https://github.com/diplodoc-platform/html-extension/compare/v1.3.1...v1.3.2) (2024-08-14)


### Bug Fixes

* added types.d.ts to package ([992c7b9](https://github.com/diplodoc-platform/html-extension/commit/992c7b90918ed5ed1c29192a4b2aec169319d8fc))

## [1.3.1](https://github.com/diplodoc-platform/html-extension/compare/v1.3.0...v1.3.1) (2024-08-08)


### Bug Fixes

* **plugin:** Added types re-export ([7b117e0](https://github.com/diplodoc-platform/html-extension/commit/7b117e09b889814a82f1e383bb1584adc61a9d30))

## [1.3.0](https://github.com/diplodoc-platform/html-extension/compare/v1.2.7...v1.3.0) (2024-08-08)


### Features

* **plugin:** added baseTarget and styles options ([5c62e61](https://github.com/diplodoc-platform/html-extension/commit/5c62e61732374719894506f3d4b8d072f0361716))

## [1.2.7](https://github.com/diplodoc-platform/html-extension/compare/v1.2.6...v1.2.7) (2024-07-15)


### Bug Fixes

* **runtime, react:** added IHTMLIFrameElementConfig export, deleted useMemo ([5d1b913](https://github.com/diplodoc-platform/html-extension/commit/5d1b9132157696d1c7e9ef27e8d04b934d9312d1))

## [1.2.6](https://github.com/diplodoc-platform/html-extension/compare/v1.2.5...v1.2.6) (2024-07-12)


### Bug Fixes

* **react:** added export types ([a374ce5](https://github.com/diplodoc-platform/html-extension/commit/a374ce57c695991aaec0f6a932e7ad1f426e9edc))
* **react:** fixed lint errors ([308b8c1](https://github.com/diplodoc-platform/html-extension/commit/308b8c13943575d78de866bbe44aa12706d9dee7))
* **react:** fixed types ([cc6d6ab](https://github.com/diplodoc-platform/html-extension/commit/cc6d6abdb2ff063675dc70fb2836e6e13380bbaa))
* **react:** fixed types ([e4f2092](https://github.com/diplodoc-platform/html-extension/commit/e4f2092eb740b28c761c2519393f6af48ba5e30c))
* **react:** fixed types ([f9596fd](https://github.com/diplodoc-platform/html-extension/commit/f9596fd735f564fa63572e46a25b824b82331d7b))
* **react:** fixed types ([12b8826](https://github.com/diplodoc-platform/html-extension/commit/12b88268d1484ded0b1e4ee8969b1245f76d454c))
* **runtime:** added setClassNames, setStyles methods to HtmlIFrameController ([4eb3db9](https://github.com/diplodoc-platform/html-extension/commit/4eb3db99b5ae58fc48518187335bb0a0b676b342))

## [1.2.5](https://github.com/diplodoc-platform/html-extension/compare/v1.2.4...v1.2.5) (2024-07-11)


### Bug Fixes

* **runtime:** added destroy methods ([dcc0629](https://github.com/diplodoc-platform/html-extension/commit/dcc06293ca57de06bdb11153d13c176b341baa16))
* **runtime:** fixed lint errors ([e34e893](https://github.com/diplodoc-platform/html-extension/commit/e34e8937906eb0dad73e1a0d0aeb39b7668839a2))
* **runtime:** fixed lint errors ([9abf094](https://github.com/diplodoc-platform/html-extension/commit/9abf094361ba9757f14efa006e0f0b4c9f48424e))
* **runtime:** updated runtime load logic, updated hook methods ([5e194a7](https://github.com/diplodoc-platform/html-extension/commit/5e194a7596cd6b7475fceff48ca5563f6c137149))

## [1.2.4](https://github.com/diplodoc-platform/html-extension/compare/v1.2.3...v1.2.4) (2024-07-10)


### Bug Fixes

* **build:** fixed exports ([90e72a7](https://github.com/diplodoc-platform/html-extension/commit/90e72a7318c1c79dd7f7eacd4398a9a61082c4fe))

## [1.2.3](https://github.com/diplodoc-platform/html-extension/compare/v1.2.2...v1.2.3) (2024-07-10)


### Bug Fixes

* **build:** fixed exports ([eae3c83](https://github.com/diplodoc-platform/html-extension/commit/eae3c8319d26ec24ef9dbd87912dbeea5ee0cf2f))

## [1.2.2](https://github.com/diplodoc-platform/html-extension/compare/v1.2.1...v1.2.2) (2024-07-10)


### Bug Fixes

* **import:** fixed generate-id ([1be36ed](https://github.com/diplodoc-platform/html-extension/commit/1be36edf5562d293bff226f91218bd44bdfd1276))

## [1.2.1](https://github.com/diplodoc-platform/html-extension/compare/v1.2.0...v1.2.1) (2024-07-10)


### Bug Fixes

* **release:** fixed .npmignore ([ad7057e](https://github.com/diplodoc-platform/html-extension/commit/ad7057e635026d9619ff9182b6d6e9ce136d53cf))
* **release:** fixed .npmignore ([9dd6766](https://github.com/diplodoc-platform/html-extension/commit/9dd676633a80f0aec97ee02157271e09dd366542))

## [1.2.0](https://github.com/diplodoc-platform/html-extension/compare/v1.1.0...v1.2.0) (2024-07-10)


### Features

* **hook:** updated useDiplodocHtml ([030de2d](https://github.com/diplodoc-platform/html-extension/commit/030de2dcb8fe0aa2f054f0160f07d05a22ae86c8))


### Bug Fixes

* **package:** fixed private ([0f574fa](https://github.com/diplodoc-platform/html-extension/commit/0f574faeb340491703ad3a33103850051983a1e8))
* **release:** updated main branch ([4373f6e](https://github.com/diplodoc-platform/html-extension/commit/4373f6e875e369859898b211799dd165f94281ef))

## [1.1.0](https://github.com/diplodoc-platform/html-extension/compare/v1.0.0...v1.1.0) (2024-06-28)


### Features

* **html:** add public methods ([2133370](https://github.com/diplodoc-platform/html-extension/commit/2133370abf5576625a2bef3904b472c7b9ae86ec))
* **html:** add resizeIframeToFitContent ([aaade5b](https://github.com/diplodoc-platform/html-extension/commit/aaade5b9f4b59e7fd81b6b761e764433b396428f))
* **html:** added html-extension ([2be4c31](https://github.com/diplodoc-platform/html-extension/commit/2be4c3182901ccb36e87fc2f9225b4bb2a38b7e7))
* **html:** deleted shouldUseIframe, runtime css ([67432ef](https://github.com/diplodoc-platform/html-extension/commit/67432ef4b3cf439320689863c3d540f2daf5651d))
* **html:** fixed HtmlController lint errors ([1617a59](https://github.com/diplodoc-platform/html-extension/commit/1617a59626e463a09a1ac9fa3bc3953ed7999665))
* **html:** updated HtmlController ([3ba1618](https://github.com/diplodoc-platform/html-extension/commit/3ba16188bf3fcb1752a3980eb2a81ac7f62d8086))


### Bug Fixes

* improve html-plugin example ([80dc3a0](https://github.com/diplodoc-platform/html-extension/commit/80dc3a0bb36b5356f8ba7a5f577c74718865de5d))

## 1.0.0 (2024-06-28)


### Features

* **html:** add public methods ([2133370](https://github.com/diplodoc-platform/html-extension/commit/2133370abf5576625a2bef3904b472c7b9ae86ec))
* **html:** add resizeIframeToFitContent ([aaade5b](https://github.com/diplodoc-platform/html-extension/commit/aaade5b9f4b59e7fd81b6b761e764433b396428f))
* **html:** added html-extension ([2be4c31](https://github.com/diplodoc-platform/html-extension/commit/2be4c3182901ccb36e87fc2f9225b4bb2a38b7e7))
* **html:** deleted shouldUseIframe, runtime css ([67432ef](https://github.com/diplodoc-platform/html-extension/commit/67432ef4b3cf439320689863c3d540f2daf5651d))
* **html:** fixed HtmlController lint errors ([1617a59](https://github.com/diplodoc-platform/html-extension/commit/1617a59626e463a09a1ac9fa3bc3953ed7999665))
* **html:** updated HtmlController ([3ba1618](https://github.com/diplodoc-platform/html-extension/commit/3ba16188bf3fcb1752a3980eb2a81ac7f62d8086))


### Bug Fixes

* improve html-plugin example ([80dc3a0](https://github.com/diplodoc-platform/html-extension/commit/80dc3a0bb36b5356f8ba7a5f577c74718865de5d))
