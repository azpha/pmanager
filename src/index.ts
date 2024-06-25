import express from 'express';
import cors from 'cors';
import 'dotenv/config';

// routes
import PowerRoute from './routes/power';
import InfoRoute from './routes/info';

// express app setup
const app = express();
app.disable("X-Powered-By");
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// routes
app.get('/', ({res}) => {
    return res?.status(200).json({
        status: 200
    });
})
app.use('/power', PowerRoute)
app.use('/info', InfoRoute)

app.listen(process.env.PORT || 3000, () => {
    if (!process.env.NOTIFICATIONS_ENABLED) {
        console.warn("Notifications aren't enabled!")
    }

    console.log("PManager listening on port " + (process.env.PORT || 3000))
})