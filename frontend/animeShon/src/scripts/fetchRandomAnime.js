const apiUrl = 'https://09cef626e0bc8ba9c57b1838c10af55f.serveo.net/random';

var randomAnime = [];

async function fetchRandomAnime(){
  try {
     const response = await fetch(apiUrl);
     const data = await response.json();
     randomAnime = data;
     console.log(randomAnime);
  }catch(error){
    console.error(error);
  }
}

// fetchRandomAnime();