import { $fetch } from 'ofetch'
import type { NitroFetchOptions, NitroFetchRequest } from 'nitropack'
import { defineNuxtPlugin, useRuntimeConfig, useSocketIO } from '#imports'

export default defineNuxtPlugin(() => {
	const runtime = useRuntimeConfig()

	const options:NitroFetchOptions<NitroFetchRequest> = {
		baseURL: runtime.app.baseURL,
		onRequest: ({ options }) => {
			const socket = useSocketIO()

			options.headers = {
				...options.headers,
				'x-socket': socket?.id ?? '',
			}
		}
	}

	globalThis.$fetch = $fetch.create(options)
})
