const mpcpp = require("mpcpp");
const express = require("express");
const path = require("path");
const albumArt = require("album-art");

const app = express();
const port = 3000;

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

var title = "";
var artist = "";
var album = "";

app.use(express.static("./public"));
app.get("/", function (req, res) {
  res.render("pages/status_small");
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
        });
      } else {
        res.send({
          image: false,
          image_url: "",
          title: title,
          artist: artist,
          album: album,
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
    });
  }
});

app.listen(port, () => console.log(`Web server started on port ${port}!`));

const mpcpp_client = mpcpp.connect({
  port: 6600, // Change if your MPD is on a different port.
  host: "localhost", // Change if mpd is not running locally on your PC.
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