// src/scripts/searchAnime.js

const searchBar = document.querySelector(".search-bar");
const searchIcon = document.querySelector(".search-icon");
// You can change this to your own search endpoint
const apiUrl = "https://2da7b613019fec531b7b56ed59b1fa0b.serveo.net/search?q=";

// Simple debounce utility
function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// Redirect logic
function redirectToSearch(query) {
  const finalQuery = query.trim() || "__empty__";
  console.log(finalQuery);
  window.location.href = `/search?q=${finalQuery}`;
}

if (searchBar) {
  // Handle "Enter" key for searching
  searchBar.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    redirectToSearch(searchBar.value);
  }
});
}
