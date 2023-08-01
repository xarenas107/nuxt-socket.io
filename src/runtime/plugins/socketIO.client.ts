import { io } from "socket.io-client"
import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin({
    name: 'socketIO:client',
    enforce:'post',
    parallel:true,
	setup(app) {
    if (!process.client) return
		const { protocol, host } = window.location
		const socketIO = io(`${ protocol }//${ host }`)
		app.provide('socketIO', socketIO)
	}
})
