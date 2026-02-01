import express from 'express';
import cors from 'cors';
import UsersRouter from './routes/UsersRouter.route.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());


// Obtener todos los usuarios
app.use('/users', UsersRouter);

// Not found route
app.use((req, res, next) => {
    res.status(404).send('Endpoint not found');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


export default app;