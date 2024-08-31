export default defineNitroPlugin(nitro => {
  console.log('Server is running')

  nitro.hooks.hook('request',() => {
    console.log(`Request recieved on server`)
  })


  nitro.hooks.hook('io:server:config',() => {
    console.log('socket.io config ook is working')
  })

  nitro.hooks.hook('io:server:done',() => {
    console.log('socket.io done hook is working')
  })
})
