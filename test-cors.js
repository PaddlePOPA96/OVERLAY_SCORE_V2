fetch("https://flv.play.folaplay.com/live/grupd_paraguayvsaustralia_26062026_SD.flv", { method: 'OPTIONS' })
  .then(r => { console.log(r.status); console.log(r.headers); })
  .catch(e => console.log(e));
