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

app.set('json spaces', 4);
app.use(express.json());
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.static('public'));


app.get('/', async (req, res) => {
    res.render('pages/index');
});

app.get('/download/:url', async (req, res) => {
  let url = req.query.url;
  const rtik = await tiklydown(url);
  
  res.render('pages/download', { rtik, url })
})

app.get('/download/:url/:type/', async (req, res) => {
    let url = req.params.url;
    let type = req.params.type;
    const rtik = await tiklydown(url);
    function strRandom(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
    }

    if (type == "mp4") {
      let str = strRandom(5);
      let id = 'RTik_'+str
      const path = process.cwd() + `/temp/media/${type}/${id}.mp4`;
      
      https.get(rtik.video.noWatermark, (response) => {
        const file = fs.createWriteStream(path);
        response.pipe(file);
        file.on("error", function(err) {
          console.log("err", err);
        });
        file.on("finish", function() {
          file.close();
          res.download(path, {
            root: __dirname
          });
          console.log("done");
        });
      });
      
    } else if (type == "mp3") {
      let rid = strRandom(5);
      let id = 'RTik_' + rid
      const path = process.cwd() + `/temp/media/${type}/${id}.mp3`;
      https.get(rtik.music.play_url, (response) => {
        const file = fs.createWriteStream(path);
        response.pipe(file);
        file.on("error", function(err) {
          console.log("err", err);
        });
        file.on("finish", function() {
          file.close();
          res.download(path, {
            root: __dirname
          });
          console.log("done");
        });
      });
    }
});

app.get('*', async (req, res) => {
    res.redirect('/');
});

app.listen(3000 || process.env.PORT, () => {
    console.log(`[SYS] RTikDown is Running..!`);
});
