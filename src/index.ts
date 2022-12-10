import express = require('express');

// Create a new express application instance
const app: express.Application = express();

app.get('/', (req, res) => {
    res.send('Hello World!12aaa3333');
});

app.listen(3000, ()=> {
    console.log('Example app listening on port 3000!');
});
