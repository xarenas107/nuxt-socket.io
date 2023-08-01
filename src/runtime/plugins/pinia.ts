import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin({
  name: 'socketIO:plugin:pinia',
	enforce:'post',
	parallel:true,
	setup(app) {
		if (!app?.$pinia || !app?.$socket) return
		app.$pinia?.use(() => ({ '$socketIO':app.$socketIO }))
	}
})
