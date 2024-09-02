import type { Socket } from "socket.io-client"

export interface Actions {
  connect(): void
	setup(event: string, listener:(...args:any[]) => void,component?:string):() => void
	on(event: string, listener:(...args:any[]) => void,component?:string):() => void
	off(event: string):void
	emit(event:string,...args:any[]): Socket
}


export interface State {
	id:string | undefined
	value: Map<string,Set<string>>
  transport: 'polling' | 'websocket' | 'webtransport' | (string & {}) | undefined
  status: {
    active: boolean
    pending: boolean
    connected: boolean
    error: Error | null
  }
}
