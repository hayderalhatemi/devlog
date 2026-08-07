import 'dotenv/config';
import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/health', (_req, res) => {
    res.status(200).json({
        success: true,
        message: 'DevLog API is running',
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});