const express = require("express");
const path = require("path")
const app = express();
const server = require('http').createServer(app)
const mqtt = require('mqtt');
const WebSocket = require('ws')

const ROOT_TOPIC = "flightInfo/";
const MQTT_SERVER = "mqtt://localhost:1883";
const MQTT_TOPICS = [ROOT_TOPIC+"gpsData", ROOT_TOPIC+"verticalSpeed", ROOT_TOPIC+"offsetInfo"];

const GPSDATA_TOPIC = ROOT_TOPIC+"gpsData";
const VERTICALSPEED_TOPIC = ROOT_TOPIC+"verticalSpeed";
const OFFSETINFO_TOPIC = ROOT_TOPIC+"offsetInfo";


let count = 0;

const wss = new WebSocket.Server({ port:8888 });


app.use(express.static(path.join(__dirname, "public")));
let obj = {}

wss.on('connection', function connection(ws) {
    console.log('Client Connected')
    //Here we need to get the current offset data and send it to the client


    obj.debugData = function(data){
        ws.send(JSON.stringify(data));
    }
    obj.gpsData = function(data){
        ws.send(JSON.stringify(data));
    }
    obj.verticalSpeed = function(data){
        ws.send(JSON.stringify(data));
    }
    obj.offsetInfo = function(data){
        ws.send(JSON.stringify(data));
    }

});

async function startMQTT() {
    const client = mqtt.connect(MQTT_SERVER);

    client.on('connect', function () {
        console.log('connected to MQTT');
    });

    client.on("error",function(error){
        console.log("Can't connect" + error);
        process.exit(1)
    });

    client.subscribe(MQTT_TOPICS, {qos:0});

    client.on('message',async function(topic, message, packet){
        console.log("message is "+ message);
        console.log("topic is "+ topic);
        if (topic === GPSDATA_TOPIC){
            const data = JSON.parse(message.toString());
            obj.gpsData(data);
        } else if (topic === VERTICALSPEED_TOPIC){
            const data = JSON.parse(message.toString());
            obj.verticalSpeed(data);
        } else if (topic === OFFSETINFO_TOPIC){
            const data = JSON.parse(message.toString());
            obj.offsetInfo(data);
        }
    });

}

startMQTT();




app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname,"views/index.html"))
});

app.get('/style.css', function(req, res) {
    res.sendFile(__dirname + "/public/css/" + "style.css");
});

app.get('/style.scss', function(req, res) {
    res.sendFile(__dirname + "/public/scss/" + "style.scss");
});


server.listen(5001, () => {
    console.log("server started on port 5001");
});


const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

