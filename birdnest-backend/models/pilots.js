const mongoose = require('mongoose')

const pilotSchema = new mongoose.Schema({
    pilotId: String,
    firstName: String,
    lastName: String,
    email: String,
    phoneNumber: String,
    positionX: Number,
    positionY: Number,
    distance: Number,
    timeDetected: Number,
})

module.exports= mongoose.model('Pilot', pilotSchema)