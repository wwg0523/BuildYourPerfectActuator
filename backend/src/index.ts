// src/index.ts
import express from 'express';
import cors from 'cors';
import testRouter from './routes/test';
import gameUsersRouter from './routes/gameUsers';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/test', testRouter);
app.use('/api/game-users', gameUsersRouter);

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
