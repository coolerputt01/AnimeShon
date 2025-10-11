const apiUrl = 'https://f3a26cabd6ec52dd7e20f26a12020a39.serveo.net/random-anime';

var randomAnime;

async function fetchRandomAnime(){
  try {
     const response = await fetch(apiUrl);
     const data = await response.json();
     randomAnime = data;
     prompt(randomAnime);
  }catch(error){
    console.error(error);
  }
}

export {randomAnime, fetchRandomAnime}