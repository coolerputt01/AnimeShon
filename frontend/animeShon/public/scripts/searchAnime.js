// src/scripts/searchAnime.js

const searchBar = document.querySelector(".search-bar");
const searchIcon = document.querySelector(".search-icon");
// You can change this to your own search endpoint
const apiUrl = "https://49f72665eb6fb07a870e7e3d82b7c8ea.serveo.net/search?q=";

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
