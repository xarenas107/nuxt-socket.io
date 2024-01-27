import type { SocketOptions, ManagerOptions } from "socket.io-client"

export const clientOptions:Partial<SocketOptions & ManagerOptions> = { withCredentials:true }
