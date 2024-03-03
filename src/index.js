const express = require('express');
require('dotenv/config')

// app & middleware setup
const app = express();
app.use(require('cors')());
app.use(express.json())
app.use(express.urlencoded({ extended: false }));

// routes
app.use("/power", require('./routes/power'));

// listener
app.listen(process.env.PORT || 3000, () => {
    if (!process.env.NOTIFICATIONS_ENABLED) console.warn("Notifications aren't enabled, nothing will be sent!")
    console.log("PManager listening on port " + (process.env.PORT || 3000));
})