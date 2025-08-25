const mongoose = require('mongoose');
require('dotenv').config();

const dbState = [{
    value: 0,
    label: "Disconnected"
},
{
    value: 1,
    label: "Connected"
},
{
    value: 2,
    label: "Connecting"
},
{
    value: 3,
    label: "Disconnected"
}
]

let connectMongoDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        const state = Number(mongoose.connection.readyState);
        console.log('MongoDB connection state:', dbState.find(item => item.value === state)?.label);
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
};

module.exports = connectMongoDB;
