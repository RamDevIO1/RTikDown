const express = require('express');
const axios = require('axios')
const https = require("https");
const app = express();
const fs = require('fs');
const ejs = require('ejs');

function RTikDown(url) {
  return new Promise((resolve, reject) => {
    axios.get(`https://developers.tiklydown.me/api/download?url=${url}`)
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


app.get('/', async (req, res) => {
    res.render('pages/index');
});

app.get('/download/', async (req, res) => {
  let url = req.query.url;
  let type = req.query.type;
  const rtik = await RTikDown(url);
  let str = strRandom(8);
  let id = 'RTik-' + str 
  res.render('pages/download', { rtik: rtik, url: url, id: id })
})


app.get('/down/', async (req, res) => {
  let url = req.query.url;
  let type = req.query.type;
  let id = req.query.id
  const rtik = await RTikDown(url);
  if (type == "mp4") {
    const path = process.cwd() + `/temp/media/${type}/${id}.mp4`;
    const requ = https.get(rtik.video.noWatermark, (response) => {
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
    const path = process.cwd() + `/temp/media/${type}/${id}.mp4`;
    const requ = https.get(rtik.music.play_url, (response) => {
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



async function savemp4(rtik_data, res, req) {
  
}


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



app.listen(4560 || process.env.PORT, () => {
    console.log(`[SYS] RTikDown is Running..!`);
});
