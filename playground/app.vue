<script lang="ts" setup>
import { ref, onMounted } from 'vue-demi'
import { useClientSocketIO } from '#imports'

const response = ref('Request from client')
const io = useClientSocketIO()


const onClick = () => $fetch('api/ping')
onMounted(() => io.on('pong',msg => response.value = msg))
</script>

<template>
  <button @click="onClick">
    Fetch
  </button>
  <span :style="{ paddingLeft: '1rem' }"> {{ response }} </span>
</template>
