const express = require("express");
const configViewEngine = require("./config/viewEngine.js");
const bodyParser = require("body-parser");
const apiRoutes = require("./routes/api.js");
const connectDB = require("./config/database.js");
const cors = require('cors');
require('dotenv').config();

let app = express();

// config app

// Allow all domains to call API (CORS)
app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
configViewEngine(app);
apiRoutes(app);

connectDB(); // MongoDB connection

let port = process.env.PORT || 6969;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});