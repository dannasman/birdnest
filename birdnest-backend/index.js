require('dotenv').config()
const schedule = require('node-schedule')
const xml2js = require('xml2js')
const axios = require('axios').default
const express = require('express')
const http = require('http')
const mongoose = require('mongoose')
const { Server } = require("socket.io");

const Pilot = require('./models/pilots')

const app = express()
app.use(express.static('build'))
const server = http.createServer(app)
const io = new Server(server)

//connect to mongodb
mongoose.connect(process.env.MONGODB_URI)
    .then(result => {
        console.log('connected to MongoDB')
    })
    .catch((error) => {
        console.log('error connecting to MongoDB:', error.message)
    })

//scheduled job to handle drone and pilot data and save the pilots that have violated the NDZ within the last 10min
const parser = new xml2js.Parser()
const job = schedule.scheduleJob("*/2 * * * * *", async () => {

    //fetch drone data
    const response = await axios
        .get('https://assignments.reaktor.com/birdnest/drones', {
            "Content-Type": "application/xml; charset=utf-8"
        })

    //parse the fetched XML and filter it to get drones violating the NDZ
    const result = await parser.parseStringPromise(response.data)
    const drones = result.report.capture[0].drone
    const newDrones = drones.map(d => ({
        serialNumber: d.serialNumber[0],
        distance: Math.sqrt((Number(d.positionX[0]) - 250000) * (Number(d.positionX[0]) - 250000) + (Number(d.positionY[0]) - 250000) * (Number(d.positionY[0]) - 250000)),
        positionX: Number(d.positionX[0]),
        positionY: Number(d.positionY[0])
    })).filter(d => (
        d.distance <= 100000
    ))

    //fetch the pilots of the drones violating the NDZ
    const requests = newDrones.map(d => (
        axios.get(`https://assignments.reaktor.com/birdnest/pilots/${d.serialNumber.toString()}`)
    ))
    const responses = await axios.all(requests)
    const fetchedPilots = responses.map((r, i) => (
        {
            pilotId: r.data.pilotId,
            firstName: r.data.firstName,
            lastName: r.data.lastName,
            email: r.data.email,
            phoneNumber: r.data.phoneNumber,
            positionX: newDrones[i].positionX,
            positionY: newDrones[i].positionY,
            distance: newDrones[i].distance,
            timeDetected: Date.now()
        }
    ))

    //delete data that was collected more than 10min ago
    const currentTime = Date.now();
    await Pilot.deleteMany({ timeDetected: { $lt: currentTime - 600000 } })

    //get old pilot information
    const oldPilots = await Pilot.find({})
    const oldInfo = oldPilots.map(op => ({
        pilotId: op.pilotId,
        positionX: op.positionX,
        positionY: op.positionY,
        distance: op.distance,
        timeDetected: op.timeDetected
    }))

    //get new pilots from fetched data
    const newPilots = fetchedPilots.filter(fp => !oldPilots.map(op => op.pilotId).includes(fp.pilotId))

    //get and update old pilots from fetched data. not so fresh solution...
    const updatedPilots = fetchedPilots.filter(fp => oldPilots.map(op => op.pilotId).includes(fp.pilotId))
        .map(up => ({
            ...up,
            distance: (up.distance < oldInfo.find(o => o.pilotId.toString() === up.pilotId.toString()).distance) ? up.distance : oldInfo.find(o => o.pilotId.toString() === up.pilotId.toString()).distance,
            timeDetected: oldInfo.find(o => o.pilotId.toString() === up.pilotId.toString()).timeDetected,
        }))

    await Pilot.deleteMany({ pilotId: { $in: updatedPilots.map(up => up.pilotId) } }) //delete the old documents that have been updated
    await Pilot.create(newPilots.concat(updatedPilots)) // add new and updated pilots to db



})

//return all pilots that have violated the NDZ within the last 10min, not used by the frontend atm
app.get('/pilots', async (req, res) => {
    const pilots = await Pilot.find({})
    res.json(pilots)
})

//listen to 'connection' event and emit pilot data to connected sockets every 2 seconds
io.on('connection', (socket) => {
    setInterval(async () => {
        const pilots = await Pilot.find({})
        io.emit('pilot information', pilots)
    }, 2000)
})

const PORT = process.env.PORT || 8080
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})