// eslint-disable-next-line import-x/no-named-as-default
import i18n from 'i18next'
import detector from 'i18next-browser-languagedetector'
import resourcesToBackend from 'i18next-resources-to-backend'
import { initReactI18next } from 'react-i18next'

await i18n
	.use(detector)
	.use(initReactI18next)
	.use(
		resourcesToBackend(
			(language: string, namespace: string) =>
				import(`Locales/${language}/${namespace}.json`),
		),
	)
	.init({
		supportedLngs: ['en'],
		lng: 'en',
		fallbackLng: 'en',
		ns: ['common', 'errors'],
		defaultNS: 'common',
		fallbackNS: 'common',
		interpolation: {
			escapeValue: false,
		},
		debug: import.meta.env.DEV,
	})

export default i18n
