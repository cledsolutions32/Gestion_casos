import express from 'express';
import cors from 'cors';
import CasesRouter from './routes/CasesRouter.route.js';
import UsersRouter from './routes/UsersRouter.route.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/users', UsersRouter);
app.use('/cases', CasesRouter);

// Not found route
app.use((req, res) => {
    res.status(404).send('Endpoint not found');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


export default app;