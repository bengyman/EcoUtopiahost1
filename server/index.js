const express = require('express');
const cors = require('cors');
const db = require('./models');
require('dotenv').config();

const app = express();
app.use(express.json());

// Enable CORS
app.use(cors({
    origin: process.env.CLIENT_URL
}));

// Simple Route
app.get("/", (req, res) => {
    res.json({ message: "Welcome to the EcoUtopia API" });
});

// Routes
//const tutorialRoute = require('./routes/tutorial');
//app.use("/tutorial", tutorialRoute);
//const courseRoute = require('./routes/course');
//app.use("/courses", courseRoute);
const userRoute = require('./routes/user');
app.use('/user', userRoute);

db.sequelize.sync({ alter: true }).then(() => {
    let port = process.env.APP_PORT;

    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}).catch((err) => {
    console.log(err);
});