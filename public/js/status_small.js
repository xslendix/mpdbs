$(document).ready(() => {
  let interval = setInterval(update, 500);

  console.log(interval);
});

function update() {
  fetch("/current_song")
    .then((response) => response.json())
    .then((data) => {
      $(".card").css("display", "flex");
      if (data.state == "play") {
        if (data.title) {
          $("#title").text(data.title);
        }
        if (data.artist) {
          $("#artist").text(data.artist);
        }
        $("#album_image").attr("src", data.image_url);
        if (data.image) {
          if (!$(".left-card").is(":visible")) {
            $(".left-card").animate({ width: "auto" });
            $(".left-card").removeAttr("style");
          }
        } else {
          if ($(".left-card").is(":visible"))
            $(".left-card").animate({ width: "toggle" });
        }
      } else {
        $(".card").css("display", "none");
      }
    })
    .catch((err) => {});
}
