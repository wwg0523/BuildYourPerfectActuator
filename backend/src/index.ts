import express from 'express';
import cors from 'cors';
import testRouter from './routes/test';
import gameRouter from './routes/game';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/test', testRouter);
app.use('/api/game', gameRouter);

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});