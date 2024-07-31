const express = require('express');
const path = require('path');
const cors = require('cors');
const cron = require('node-cron');
const db = require('./models');
const seedAdmin = require('./initialize'); // Adjust the path as needed
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
// const rewardsRoute = require('./routes/rewards'); // Remove this line
const ordersRoute = require('./routes/orders');
const paymentRoute = require('./routes/payment');
const postsRoute = require('./routes/post');
const pointRecordRoutes = require('./routes/pointrecord');

app.use("/courses", courseRoute);
app.use('/user', userRoute);
// app.use('/rewards', rewardsRoute); // Remove this line
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use("/orders", ordersRoute); 
app.use("/payment", paymentRoute);
app.use("/posts", postsRoute);
app.use('/pointrecords', pointRecordRoutes);

// Schedule the job to run every 15 minutes
cron.schedule('*/15 * * * *', async () => {
    console.log('Running the point record status update job...');
    await updatePointRecordStatus();
});

db.sequelize.sync({ alter: true }).then(async () => {
    await seedAdmin(); // Seed the admin user
    let port = process.env.APP_PORT;

    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}).catch((err) => {
    console.log(err);
});
