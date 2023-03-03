const express = require('express')
const fs = require('fs');
const https = require("https");
const { RTikDown } = require('../module')
const rdownRouter = express.Router()
const rdownRouter2 = express.Router()

rdownRouter.get('/down/', async (req, res) => {
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
rdownRouter2.get('/rdown/:type/:id', (req, res) => {
  let type = req.params.type;
  let id = req.params.id;
  let path = `../temp/media/${type}`;
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

module.exports = {
  router,
  router2
}
