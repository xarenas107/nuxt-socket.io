import type { useSocketIO } from "../composables/useSocketIO"

export interface SocketIOStoreActions {
	setup(event: string, listener:(...args:any[]) => void,component?:string):void
	on(event: string, listener:(...args:any[]) => void,component?:string):() => void
	off(event: string):void
	emit(event:string,...args:any[]):ReturnType<typeof useSocketIO>
}

export interface SocketIOStoreState {
	id:string
	value:Map<string,Set<string>>
}
