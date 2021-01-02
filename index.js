const mpcpp = require("mpcpp");
const express = require("express");
const path = require("path");
const albumArt = require("album-art");
const config = require("./config");

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

var title = "";
var artist = "";
var album = "";
var state = "play";

app.use(express.static("./public"));
app.get("/", function (req, res) {
  res.render("pages/status_small", {
    layout: config.layout,
  });
});

app.get("/current_song", (req, res) => {
  if (album != {} && album) {
    albumArt(artist, { album: album, size: "small" }).then((url) => {
      if (typeof url != "object") {
        res.send({
          image: url != "" ? true : false,
          image_url: url,
          title: title,
          artist: artist,
          album: album,
          state: state,
        });
      } else {
        res.send({
          image: false,
          image_url: "",
          title: title,
          artist: artist,
          album: album,
          state: state,
        });
      }
    });
  } else {
    res.send({
      image: false,
      image_url: "",
      title: title,
      artist: artist,
      album: album,
      state: state,
    });
  }
});

app.listen(config.port, () =>
  console.log(`Web server started on port ${config.port}!`)
);

const mpcpp_client = mpcpp.connect({
  port: config.mpd_port, // Change if your MPD is on a different port.
  host: config.mpd_address, // Change if mpd is not running locally on your PC.
});

mpcpp_client.on("ready", () => {
  console.log("Connected to MPD.");

  mpcpp_client.currentSong((err, song) => {
    if (err) throw err;
    console.log("Current song:", song);
    updatePlaying(song);

    mpcpp_client.currentAlbum((err, alb) => {
      if (err) throw err;
      console.log("Current album:", alb);
      album = alb.title;
    });
  });
});

mpcpp_client.on("system", (name) => {
  console.log("A system update in MPD has updated. Acting accordingly.");
  console.log(` Event name: ${name}`);
});

mpcpp_client.on("system-player", () => {
  mpcpp_client.status((err, status) => {
    if (err) throw err;
    console.log("Status:", status);
    if (status.state != undefined) state = status.state;
    //state = 'pause',
  });

  mpcpp_client.currentSong((err, song) => {
    if (err) throw err;
    console.log("Current song:", song);
    updatePlaying(song);

    mpcpp_client.currentAlbum((err, alb) => {
      if (err) throw err;
      console.log("Current album:", alb);
      album = alb.title;
    });
  });
});

function updatePlaying(song) {
  title = song.title != undefined ? song.title : song.file;
  artist = song.artist != undefined ? song.artist : undefined;

  console.log(` * Now playing ${title}` + (artist ? ` by ${artist}` : ""));
}
