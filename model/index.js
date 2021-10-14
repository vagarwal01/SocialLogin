const mongoose = require('mongoose')
    // mongodb://localhost:27017/ocera-edtech
mongoose.connect(process.env.MONGODB_PATH, { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log('success')
    }
})

// this is storing the schema created in educators.model.js file into the educator variable
const educator = require('./educators.model')