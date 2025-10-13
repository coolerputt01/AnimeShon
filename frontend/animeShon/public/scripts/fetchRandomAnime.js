export let randomAnime = null;

const baseUrl = "https://2da7b613019fec531b7b56ed59b1fa0b.serveo.net";
const apiUrl = "/random-anime";
const streamingUrl = "/streaming";

let animeId = 0;
let mainStreamingUrl = "";

// DOM elements
const loader = document.querySelector("#loader");
const animeSection = document.querySelector("#anime-section");
const animeTitle = document.querySelector(".anime-header");
const animeDesc = document.querySelector(".anime-desc");
const buttons = document.querySelectorAll("button");
const pills = document.querySelector(".pills");

async function fetchStreamUrl(animeId) {
  try {
    const streamingEndpoint = `${baseUrl}/${animeId}${streamingUrl}`;
    const response = await fetch(streamingEndpoint);
    const data = await response.json();

    if (data.length > 0) {
      console.log("Streaming data found");
      mainStreamingUrl = data.data.url;
    } else {
      document.querySelector(".stream").style.display = "none";
    }
  } catch (error) {
    console.error("An error occurred: ", error);
  }
}

export async function fetchRandomAnime() {
  try {
    const response = await fetch(baseUrl + apiUrl);
    const data = await response.json();
    randomAnime = data;

    const anime = data.data;
    animeTitle.textContent = anime.title;
    animeDesc.textContent = anime.synopsis || "No available synopsis.";

    pills.innerHTML = "";
    anime.genres.forEach((gen) => {
      const genElement = document.createElement("div");
      genElement.textContent = gen.name;
      genElement.classList.add("genre");
      pills.appendChild(genElement);
    });

    animeId = anime.mal_id;
    await fetchStreamUrl(animeId);

    // Hide loader and show anime section
    loader.style.display = "none";
    animeSection.style.display = "block";

    // Button handlers
    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        if (button.textContent === "Watch Now!") {
          window.location.href = mainStreamingUrl;
        } else {
          window.location.href = anime.url;
        }
      });
    });

  } catch (error) {
    console.error("Fetch error:", error);
  }
}