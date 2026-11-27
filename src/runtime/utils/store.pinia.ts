import { useSocketIO, reactive, toRefs } from '#imports'
import { configKey } from './constants'
import { defineStore, acceptHMRUpdate } from 'pinia'
import shared, { defaults } from './store.shared'

import type { State } from './types'

export const store = defineStore(configKey, () => {
  const io = useSocketIO()
  const { id } = io

  const state = reactive<State>({ ...defaults, id })
  const store = shared(io, state)

  return {
    ...toRefs(store.state),
    ...store.actions,
  }
})

// Support hot module replacement
if (import.meta?.hot) {
  import.meta.hot.accept(acceptHMRUpdate(store, import.meta.hot))
}
