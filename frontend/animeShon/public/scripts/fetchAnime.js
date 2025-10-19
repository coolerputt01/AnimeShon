export let animeData = null;

const baseUrl = "https://49f72665eb6fb07a870e7e3d82b7c8ea.serveo.net";
const apiUrl = "/anime/"; // expects an ID like /anime/1
const streamingUrl = "/streaming";

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
    const streamingEndpoint = `${baseUrl}${apiUrl}${animeId}${streamingUrl}`;
    const response = await fetch(streamingEndpoint);
    const data = await response.json();

    if (data?.data?.url) {
      console.log("Streaming data found");
      mainStreamingUrl = data.data.url;
    } else {
      document.querySelector(".stream").style.display = "none";
    }
  } catch (error) {
    console.error("An error occurred while fetching stream URL:", error);
  }
}

export async function fetchAnime(animeId) {
  try {
    const response = await fetch(baseUrl + apiUrl + animeId);
    const data = await response.json();
    animeData = data;

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