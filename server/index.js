const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose')
require('dotenv').config()
const router = require('./router/index.js')

const app = express()
const PORT = process.env.PORT || 5000;
const DB_URL = process.env.DB_URL

app.use(express.json())
app.use(cors())
app.use(cookieParser())
app.use('/api', router)

async function start() {
    try {
        await mongoose.connect(DB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        app.listen(PORT, () => console.log('server is working'))
    } catch (error) {
        console.log(e)
    }
}

start()