const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const port = 3000;

app.use(
  cors({
    // origin: 'https://main--ucc-bus-tracking.netlify.app',
    // origin: "http://localhost:5173"
    origin: "*",
  })
);

const payloads = [];

app.use(bodyParser.json());

function Decoder(bytes) {
  var lat_coord = bytes[0] << 24 | bytes[1] << 16 | bytes[2] << 8 | bytes[3];
  var lat = lat_coord / 1000000 - 90;

  var lon_coord = bytes[4] << 24 | bytes[5] << 16 | bytes[6] << 8 | bytes[7];
  var lon = lon_coord / 1000000 - 180;
  
  var alt = (bytes[8] << 8 | bytes[9]);
  
  var sats = bytes[10];

    return {
      latitude:  Math.round(lat*1000000)/1000000,
      longitude:  Math.round(lon*1000000)/1000000,
      altitude: alt,
      sat: sats
    }
}

app.post("/webhook", (req, res) => {
  const payload = req.body;
  // payloads.push(payload);
  // console.log('Received payload:', payload);
  // res.status(200).send('Webhook received successfully!');

  if (payload.deviceName && payload.data) {
    const decodedData = Buffer.from(payload.data, "base64").toString("binary");
    const bytes = Array.from(decodedData, (char) => char.charCodeAt(0));
    const decodedPayload = Decoder(bytes);

    const modifiedPayload = {
      deviceName: payload.deviceName,
      decodedPayload: decodedPayload,
    };

    payloads.push(modifiedPayload);
    console.log("Received and processed payload:", modifiedPayload);
    res.status(200).send("Webhook received and processed successfully!");
  } else {
    console.log(
      "Received payload does not contain necessary fields (deviceName and data)."
    );
    res.status(400).send("Received payload is missing necessary fields.");
  }
});

app.get("/payloads", (req, res) => {
  res.status(200).json(payloads);
});

app.listen(port, () => {
  console.log(`Webhook server is running on port ${port}`);
});
