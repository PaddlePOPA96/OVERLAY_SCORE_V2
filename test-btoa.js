const url = 'https://flv.play.folaplay.com/live/grupd_paraguayvsaustralia_26062026_SD.flv?hwSecret=956accce5f9b0d91d23253cb8701dae22446c6bbc2a60fb64379198db3f3ac6a&hwTime=6a3dd1bc';
console.log(Buffer.from(url).toString('base64') === btoa(url));
