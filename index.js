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
app.set('views', __dirname + '/public');
app.set('view engine', 'ejs');
app.use(express.static('public'));


app.get('/', async (req, res) => {
    res.render('pages/index');
});

app.get('/download/', async (req, res) => {
  let url = req.query.url;
  const rtik = await RTikDown(url);
  
  res.render('pages/download', { rtik: rtik, url: url })
})

app.get('/down/', async (req, res) => {
    let data = req.params.data;
    let type = req.params.type;
    
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
      
      const requ = https.get(data, (response) => {
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
      requ.on("err", (error) => {
        console.log("error", error);
      });
    } else if (type == "mp3") {
      let rid = strRandom(5);
      let id = 'RTik_' + rid
      const path = process.cwd() + `/temp/media/${type}/${id}.mp3`;
      https.get(data, (response) => {
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



app.listen(3000 || process.env.PORT, () => {
    console.log(`[SYS] RTikDown is Running..!`);
});
