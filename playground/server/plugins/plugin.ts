export default defineNitroPlugin(nitro => {
  console.log('Server is running')

  nitro.hooks.hook('request',event => {
    const url = getRequestURL(event)
    console.log(`Request recieved on server`)
  })
})
