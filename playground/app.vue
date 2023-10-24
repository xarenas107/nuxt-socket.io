<script lang="ts" setup>
import { ref, onMounted } from 'vue-demi'
import { useSocketIOStore } from '#imports'

const response = ref('Request from client')
const io = useSocketIOStore()

const { execute } = useFetch('api/ping',{ immediate:false })
onMounted(() => io.on('pong',msg => response.value = msg))
</script>

<template>
  <button @click="execute()">
    Fetch
  </button>
  <span :style="{ paddingLeft: '1rem' }"> {{ response }} </span>
</template>
