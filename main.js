// Node Libs.
import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import WebSocket, { WebSocketServer } from 'ws'

// Enable .env configuration.
dotenv.config()

// Etc.
import authController from './controllers/auth.js'

const HTTP_PORT = 8080
const WS_PORT = 8081

const server = express()
const wss = new WebSocketServer({ port: WS_PORT })

// List of WebSocket connected clients.
const connectedClients = [] // FIXME: not used.

// List of chat rooms.
const chatRooms = {}

// WebSocket server. {{{
const handleConnection = (ws, req) => {
    // console.log(ws)

    // Inject custom properties.
    ws.roomId = ''

    const handleMessage = (data, isBinary) => {
        // Perform broadcast.
        wss.clients.forEach((cli) => {
            if (cli.readyState === WebSocket.OPEN && cli !== ws && cli.roomId === ws.roomId) {
                // Sending text messages.
                cli.send(data, { binary: isBinary })
            }
        })
    }

    const handleCloseConnection = () => {

    }

    ws.on('message', handleMessage)
    ws.on('close', handleCloseConnection)
}

wss.on('connection', handleConnection)

console.log(`WS server on PORT ${WS_PORT}.`)
// }}}

// Web HTTP server. {{{
server.use(cors())
server.use(express.json())
server.use('/', authController)

server.listen(HTTP_PORT, (err) => { console.log(!err ? `HTTP server on PORT ${HTTP_PORT}.` : err) })
// }}}
