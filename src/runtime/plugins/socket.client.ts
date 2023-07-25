import { io } from "socket.io-client"
import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin({
    name: 'socket.io/client',
    enforce:'post',
    parallel:true,
	setup(app) {
    if (!process.client) return
		const { protocol, host } = window.location
		const socket = io(`${ protocol }//${ host }`)

    socket.on('error',() => { console.log('error') })
		app.provide('socket', socket)
	}
})
