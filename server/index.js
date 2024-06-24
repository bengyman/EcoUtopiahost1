const express = require('express');
const path = require('path');
const cors = require('cors');
const db = require('./models');
require('dotenv').config();


const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));

// Enable CORS
app.use(cors({
    origin: process.env.CLIENT_URL
}));

// Simple Route
app.get("/", (req, res) => {
    res.json({ message: "Welcome to the EcoUtopia API" });
});

app.use('/uploads', express.static('uploads'));

// Routes

const courseRoute = require('./routes/course');
const userRoute = require('./routes/user');
const ordersRoute = require('./routes/orders');

app.use("/courses", courseRoute);
app.use('/user', userRoute);
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use("/orders", ordersRoute);


db.sequelize.sync({ alter: true }).then(() => {
    let port = process.env.APP_PORT;

    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}).catch((err) => {
    console.log(err);
});