const express = require('express');
const axios = require('axios');
const fs = require('fs');
const ejs = require('ejs');
const https = require("https");

const { instrument } = require("@socket.io/admin-ui");
const app = express();
const http = require('http');
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

function RTikDown(url) {
  return new Promise((resolve, reject) => {
    axios.get(`https://www.tikwm.com/api/?url=${url}`)
      .then(({ data }) => {
        resolve(data)
      })
      .catch(e => {
        reject(e)
      })
  })
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function strRandom(length) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}


  
app.set('json spaces', 4);
app.use(express.json());

app.set('views', __dirname + '/public');
app.set('view engine', 'ejs');
app.use(express.static('public'));


let rdata = {
  url: '',
  rtik: null,
  id: null
}

async function getrtikdata() {
  const rtik = await RTikDown(rdata.url);
  rdata.rtik = rtik
  let id = 'RTik-' + rtik.data.id
  rdata.id = id
}

app.get('/', async (req, res) => {
  res.render('pages/index');
});

app.get('/download/', async (req, res) => {
  //let url = req.query.url;
  
  const rtik = await RTikDown(rdata.url);
  
  console.log(rdata.url)
  res.render('pages/download', { rtik: rdata.rtik, url: rdata.url, id: rdata.id })
})


app.get('/down/', async (req, res) => {
  let url = req.query.url;
  let type = req.query.type;
  let id = req.query.id
  const rtik = await RTikDown(url);
  if (type == "mp4") {
    const path = process.cwd() + `/temp/media/${type}/${id}.mp4`;
    const requ = https.get(rtik.data.play, (response) => {
      const file = fs.createWriteStream(path);
      response.pipe(file);
      file.on("error", function(err) {
        console.log("err", err);
      });
      file.on("finish", function() {
        file.close();
        res.status(200)
        res.redirect(`/rdown/mp4/${id}.mp4`);
      });
    });
    requ.on("err", (error) => {
      console.log("error", error);
    });
  } else if (type == "mp3") {
    const path = process.cwd() + `/temp/media/${type}/${id}.mp3`;
    const requ = https.get(rtik.data.music, (response) => {
      const file = fs.createWriteStream(path);
      response.pipe(file);
      file.on("error", function(err) {
        console.log("err", err);
      });
      file.on("finish", function() {
        file.close();
        res.status(200)
        res.redirect(`/rdown/mp3/${id}.mp3`);
      });
    });
    requ.on("err", (error) => {
      console.log("error", error);
    });
  }
})

app.get('/rdown/:type/:id', (req, res) => {
  let type = req.params.type;
  let id = req.params.id;
  let path = `./temp/media/${type}`;
  try {
    fs.readdirSync(path).forEach(v => {
      if (v == `${id}`) {
        try {
          res.download(`${path}/${id}`, { root: __dirname });
        } catch (error) {
          console.error(error);
        }
      }
    });
  } catch (err) {
    console.log(err);
  }
})

io.on('connection', (socket) => {
  socket.on('download', (inpdata) => {
    rdata.url = inpdata
    getrtikdata()
  })
});


server.listen(4560 || process.env.PORT, () => {
    console.log(`[SYS] RTikDown is Running..!`);
});
