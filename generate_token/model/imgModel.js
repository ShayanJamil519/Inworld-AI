const mongoose = require('mongoose')

const imgSchema = mongoose.Schema({
        images: [{
            public_id: {
                type: String,
                required: true
            },
            url: {
                type: String,
                required: true
            }
        }],
    },
)
module.exports = mongoose.model('Img', imgSchema)