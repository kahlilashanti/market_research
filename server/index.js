const http = require('http')
const path = require('path')
const express = require('express')
const socketIo = require('socket.io')
const needle = require('needle');
const config = require('dotenv').config()
const TOKEN = process.env.TWITTER_BEARER_TOKEN

const PORT = process.env.PORT || 3000

//initialize express
const app = express()

// create sockets
const server = http.createServer(app)

const io = socketIo(server)

//to load the html page from the client side
app.get('/', (req, res) => {
    //when we hit this route we want to load the html page
    res.sendFile(path.resolve(__dirname, '../', 'client', 'index.html'))
})

//create variables for the endpoint urls
const rulesURL = 'https://api.twitter.com/2/tweets/search/stream/rules'
const streamURL = 'https://api.twitter.com/2/tweets/search/stream?tweet.fields=public_metrics&expansions=author_id'

// create an array called rules to hold the rules we want to add
//we are looking for tweets with the keyword webxr
const rules = [{ value: 'obama' }]

//we need a function to get the stream rules

async function getRules() {
    const response = await needle('get', rulesURL, {
        headers: {
            Authorization: `Bearer ${TOKEN}`
        }
    })
    // console.log(response.body)
    return response.body
}

//we need a function to set stream rules

async function setRules() {

    const data = {
        add: rules
    }

    const response = await needle('post', rulesURL, data, {
        headers: {
            'content-type': 'application/json',
            Authorization: `Bearer ${TOKEN}`
        }
    })
    console.log(response.body)
    return response.body
}

//we need a function to delete stream rules
async function deleteRules(rules) {
    //we want to make sure that rules.data is an array
    if (!Array.isArray(rules.data)) {
        return null
    }

    const ids = rules.data.map((rule) => rule.id)

    const data = {
        delete: {
            ids: ids
        }
    }

    const response = await needle('post', rulesURL, data, {
        headers: {
            'content-type': 'application/json',
            Authorization: `Bearer ${TOKEN}`
        }
    })
    // console.log(response.body)
    return response.body
}

//get stream of tweets
function streamTweets() {
    const stream = needle.get(streamURL, {
        headers: {
            Authorization: `Bearer ${TOKEN}`
        }
    })
    //this gives us a stream we can call events on
    stream.on('data', (data) => {
        try {
            //data is going to be a buffer so we need to parse it to json
            const json = JSON.parse(data)
            console.log(json)
        } catch (error) {

        }
    })
}

io.on('connection', () => {
    console.log('client connected...')
})


// (async () => {
//     let currentRules

//     try {
//         //this gets all stream rules
//         currentRules = await getRules()

//         //this deletes all stream rules
//         await deleteRules(currentRules)

//         // set rules based on rules array above
//         await setRules()

//     } catch (error) {
//         console.error(error)
//         process.exit(1)
//     }

//     streamTweets()
// })()

server.listen(PORT, () => console.log(`listening on port ${PORT}`))



