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
  let type = req.query.type;
  const rtik = await RTikDown(url);
  
  res.render('pages/download', { rtik: rtik, url: url })
})


app.get('/down/', async (req, res) => {
  let url = req.query.url;
  let type = req.query.type;
  const rtik = await RTikDown(url);
  if (type == "mp4") {
    let str = strRandom(5);
    let id = 'RTik_' + str + '-' + rtik.id
    const path = process.cwd() + `/temp/media/${type}/${id}.mp4`;
    
    const requ = https.get(rtik.video.noWatermark, (response) => {
      const file = fs.createWriteStream(path);
      response.pipe(file);
      file.on("error", function(err) {
        console.log("err", err);
      });
      file.on("finish", function() {
        file.close();
        console.log("done");
        res.status(200)
        sleep(4000).then(() => {
          try {
            res.download(path, { root: __dirname });
          } catch (error) {
            console.error(error);
          }
        });
      });
    });
    requ.on("err", (error) => {
      console.log("error", error);
    });
  } else if (type == "mp3") {
  
  }
})


function strRandom(length) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

async function savemp4(rtik_data, res, req) {
  
}


app.get('/down/:type/:id', (req, res) => {
  let type = req.params.type;
  let id = req.params.id;
  
  if (type == 'mp4') {
    let path = `./temp/media/${type}`;
    try {
      fs.readdirSync(path).forEach(v => {
        if (v == `${id}`) {
          
        }
      });
    } catch (err) {
      console.log(err);
    }
  } else if (type == 'mp3') {
    let path = `./temp/media/${type}`;
    try {
      fs.readdirSync(path).forEach(v => {
        if (v == `${id}`) {
          res.download(`temp/media/${type}/${id}`, {
            root: __dirname
          });
        }
      });
    } catch (err) {
      console.log(err);
    }
  }

})



app.listen(4560 || process.env.PORT, () => {
    console.log(`[SYS] RTikDown is Running..!`);
});
