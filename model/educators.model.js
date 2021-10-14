const mongoose = require('mongoose')

var educatorSchema = new mongoose.Schema({
    educatorName: String,
    educatorEmail: String,
    isActivated: Boolean,
    regDate: Date,
    isVerified: Number,
    educatorPassword: String,
})

mongoose.model('educators', educatorSchema)