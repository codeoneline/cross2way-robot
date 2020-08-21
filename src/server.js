console.log('welcome to server!!')
console.log(`chain engine = ${process.env.WAN_CHAIN_ENGINE}`)

const express = require('express')
const app = express()
const port = 3200

app.get('/chains', (req, res) => {
  res.send(['wan', 'eth', 'btc', 'eos'])
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
})