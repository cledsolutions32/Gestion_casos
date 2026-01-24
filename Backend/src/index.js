import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

//Example route
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

//Not found route
app.use((req, res, next) => {
    res.status(404).send('Endpoint not found');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


export default app;