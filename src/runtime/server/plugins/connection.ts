import type { defineNitroPlugin } from '#imports'

export default defineNitroPlugin(nitro => {

	// Add nitro hook
	nitro.hooks.hook('render:response', (_,{ event }) => {
		const { io } = event.context

		io.server.on('connection', socket => {
			// Remove client socket id on disconnect
			socket.on('disconnect',() => {
				io?.server?.sockets?.adapter?.rooms.forEach(room => {
					if (room.has(socket.id)) room.delete(socket.id)
				})
			})
		})
	})
})
