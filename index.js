const express = require('express');
const fs = require('fs');
const ejs = require('ejs');
const http = require('http');
const https = require("https");
const axios = require('axios');
const cron = require('node-cron');
const { instrument } = require("@socket.io/admin-ui");

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

let taskmidnight = cron.schedule('0 0 0 * * *', () => {
  console.log('Running a job at 00:00 at Asia/Jakarta timezone');
}, {
  scheduled: true,
  timezone: "Asia/Jakarta"
});

const tasktemp = cron.schedule(
	"*/60 * * * *", // 10 minutes per delete
	() => {
		try {
			console.log("Delete Cache Temp");
			file = fs.readdirSync("./temp/media/mp4").map((a) => "./temp/media/mp4/" + a);
			file2 = fs.readdirSync("./temp/media/mp3").map((a) => "./temp/media/mp3/" + a);
			file.map((a) => {
			  if (a == `./temp/media/mp4/media`) {
			    return console.log(`media file`)
			  } else {
			    console.log(a)
			    fs.unlinkSync(a)
			  }
			});
			file2.map((a) => {
			  if (a == `./temp/media/mp3/media`) {
			    return console.log(`media file`)
			  } else {
			    console.log(a)
			    fs.unlinkSync(a)
			  }
			});
			
		} catch (e) {
			console.log(e);
		}
	},
	{ scheduled: true, timezone: "Asia/Jakarta" }
);


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
  console.log(`Starting download: \nurl: ${rdata.url}\nid: ${id}`)
  res.render('pages/download', { rtik: rtik, url: rdata.url, id: id })
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

app.get('*', async (req, res) => {
    res.redirect('/');
});

io.on('connection', (socket) => {
  socket.on('download', (inpdata) => { rdata.url = inpdata })
});

server.listen(4560 || process.env.PORT, () => {
    console.log(`[SYS] RTikDown is Running..!`);
});
