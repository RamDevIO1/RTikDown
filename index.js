const express = require('express');
const fs = require('fs');
const ejs = require('ejs');
const http = require('http');
const { instrument } = require("@socket.io/admin-ui");
const { RTikDown, tasktemp, taskmidnight } = require('./module')
const { rdownRouter, rdownRouter2 } = require('./router/rdown')

const app = express();
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: ["https://admin.socket.io"],
    credentials: true
  }
});
instrument(io, {
  auth: false,
});
let rdata = { url: ''}

taskmidnight.start()
tasktemp.start()

app.set('json spaces', 4);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('views', __dirname + '/public');
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.get('/', async (req, res) => {
  res.render('pages/index');
});
app.get('/download/', async (req, res) => {
  const rtik = await RTikDown(rdata.url);
  let id = 'RTik-' + rtik.data.id
  console.log(`Starting download: \nurl: ${url}\nid: ${id}`)
  res.render('pages/download', { rtik: rtik, url: rdata.url, id: id })
})
app.use(rdownRouter);
app.get('*', async (req, res) => {
    res.redirect('/');
});

io.on('connection', (socket) => {
  socket.on('download', (inpdata) => { rdata.url = inpdata })
});

server.listen(4560 || process.env.PORT, () => {
    console.log(`[SYS] RTikDown is Running..!`);
});
