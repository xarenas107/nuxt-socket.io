<script lang="ts" setup>
import { ref, onMounted } from 'vue-demi'
import { useSocketIOStore } from '#imports'

const response = ref('Request from client')
const { execute } = useFetch('api/ping',{ immediate:false })

const io = useSocketIOStore()
io.on('pong',msg => response.value = msg)

</script>

<template>
  <button @click="execute()">
    Fetch
  </button>
  <span :style="{ paddingLeft: '1rem' }"> {{ response }} </span>
  <client-only>
    <template #fallback>
      <div :style="{ paddingLeft: '1rem' }">
        Connecting...
      </div>
    </template>

    <div :style="{ paddingLeft: '1rem' }">
      Connected with id: {{ io.id }}
    </div>
  </client-only>
</template>
