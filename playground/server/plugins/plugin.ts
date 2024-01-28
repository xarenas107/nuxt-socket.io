export default defineNitroPlugin(nitro => {
  console.log('Server is running')

  nitro.hooks.hook('request',event => {
    console.log(`Request recieved on server`)
  })
})
