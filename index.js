const express     = require('express');
const fs          = require('fs');
const ejs         = require('ejs');
const https       = require("https");
const axios       = require('axios');
const cron        = require('node-cron');
const bodyParser  = require("body-parser");
const cors        = require('cors');
const app         = express();

function RTikDown(url) {
  return new Promise(async (resolve, reject) => {
    axios.get(`https://www.tikwm.com/api/?url=${url}`)
      .then(({ data }) => {
        resolve(data)
      })
      .catch(e => {
        reject(e)
      })
  })
}

cron.schedule("*/60 * * * *", () => {
		try {
			console.log("Delete Cache Temp");
			file = fs.readdirSync("./temp/media/mp4").map((a) => "./temp/media/mp4/" + a);
			file2 = fs.readdirSync("./temp/media/mp3").map((a) => "./temp/media/mp3/" + a);
			file.map((a) => {
			  if (a == `./temp/media/mp4/media`) {
			    return
			  } else {
			    console.log(a)
			    fs.unlinkSync(a)
			  }
			});
			file2.map((a) => {
			  if (a == `./temp/media/mp3/media`) {
			    return
			  } else {
			    console.log(a)
			    fs.unlinkSync(a)
			  }
			});
		} catch (e) {
			console.log(e);
		}
	},
	{ scheduled: false, timezone: "Asia/Jakarta" }
);

//tasktemp.start()

setInterval(() => {
  fs.readdirSync("./temp/media/mp4").map((a) => {
    if (a == `media`) { return } else {
      console.log(a)
      fs.unlinkSync(`./temp/media/mp4/${a}`)
    }
  })
}, 1000 * 60 * 60); //one hour

app.set('views', __dirname + '/public');
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.get('/', async (req, res) => {
  res.status(200);
  res.render('pages/index');
});
app.post('/download', async (req, res) => {
  let url = req.body.url;
  const rtik = await RTikDown(url)
  if (rtik.code == -1) {
    app.redirect("/")
  } else {
    let id = 'RTik-' + rtik.data.id
    console.log(`Starting download: \nURL: ${url}`)
    res.status(200);
    res.render('pages/download', { rtik: rtik, url: url, id: id })
  }
})
app.get('/download', async (req, res) => {
  let url = req.query.url;
  let type = req.query.type;
  let id = req.query.id;
  const rtik = await RTikDown(url)
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
        res.status(200);
        try {
          res.download(`./temp/media/${type}/${id}.mp4`, { root: __dirname });
        } catch (error) {
          console.error(error);
        }
        //res.redirect(`/rdown/mp4/${id}.mp4`);
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
        res.status(200);
        try {
          res.download(`./temp/media/${type}/${id}.mp3`, { root: __dirname });
        } catch (error) {
          console.error(error);
        }
        //res.redirect(`/rdown/mp3/${id}.mp3`);
      });
    });
    requ.on("err", (error) => {
      console.log("error", error);
    });
  }
})
app.get('*', async (req, res) => { res.redirect('/'); });
app.listen(process.env.PORT, () => { console.log(`[SYSTEM] RTikDown is Running..!`); });