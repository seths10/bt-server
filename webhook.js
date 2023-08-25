const express = require('express');
const bodyParser = require('body-parser');
const cors = require("cors");

const app = express();
const port = 3000;

app.use(cors({
  origin: 'https://main--ucc-bus-tracking.netlify.app',
}));

const payloads = [];

app.use(bodyParser.json());

app.post('/webhook', (req, res) => {
  const payload = req.body;
  payloads.push(payload);
  console.log('Received payload:', payload);

  // Send a response back to The Things Stack
  res.status(200).send('Webhook received successfully!');
});

app.get('/payloads', (req, res) => {
  res.status(200).json(payloads);
});

app.listen(port, () => {
  console.log(`Webhook server is running on port ${port}`);
});
