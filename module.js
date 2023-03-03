const axios = require('axios');
const fs = require('fs');
const cron = require('node-cron');

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

module.exports = {
  RTikDown,
  tasktemp,
  taskmidnight
}