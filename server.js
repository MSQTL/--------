const express = require('express')

const  app = express()

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})

app.get('Storage/scan', (req, res) => {
    res.sendFile(__dirname + '/scanning.html')
})

const PORT = 80

app.listen(PORT, () => {
    console.log('Сервер запущен! Порт: ' + PORT)
})


