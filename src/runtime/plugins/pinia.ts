import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin({
  name: 'socket.io/pinia',
	enforce:'post',
	parallel:true,
	setup(app) {
		if (!app?.$pinia || !app?.$socket) return
		app.$pinia?.use(() => ({ '$socket':app.$socket }))
	}
})
