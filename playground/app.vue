<script lang="ts" setup>
import { shallowRef } from 'vue-demi'
import { useSocketIOStore } from '#imports'

const response = shallowRef('Request from client')
const { execute } = useFetch('api/ping',{ immediate:false })

const io = useSocketIOStore()
const socket = useSocketIO()
io.on('pong',msg => response.value = msg)
</script>

<template>
  <button @click="io.connect()">
    Connect
  </button>
  <button @click="socket.disconnect()">
    Disconnect
  </button>
  <button @click="execute()">
    Fetch
  </button>
  <div style="padding-top: 1rem">{{ response }}</div>
  <div>Connected with id: {{ io.id }}</div>
  <div>Connected: {{ io.status.connected }}</div>
  <div>Loading: {{ io.status.pending }}</div>
  <div>Active: {{ io.status.active }}</div>
  <div>Transport: {{ io.transport }}</div>
  <div>Error: {{ `${io.status.error?.message}` }}</div>
</template>
