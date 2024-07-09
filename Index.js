document.addEventListener('DOMContentLoaded', () => {
  const animes = ['digimon', 'pokemon', 'onepiece', 'dragonball', 'papanokoto', 'bleach', 'sao', 'nanatsu'];
  const animeData = {};

  animes.forEach(anime => {
    animeData[anime] = { news: [], videos: [], details: {} };
  });

  // Funciones para obtener datos de las APIs
  async function fetchNewsAPI(anime) {
    const apiKey = '1e524e35149145f5a6a7992e90bfce59'; // Reemplaza con tu clave de API de NewsAPI
    const url = `https://newsapi.org/v2/everything?q=${anime}&apiKey=${apiKey}&sortBy=publishedAt`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      return data.articles.filter(article => article.title.toLowerCase().includes(anime));
    } catch (error) {
      console.error('Error al obtener noticias de NewsAPI:', error);
      return [];
    }
  }

  async function fetchYouTubeVideos(anime) {
    const apiKey = 'AIzaSyAsfjlhggGrzUyg74o5_SEV6QpTrTm73mQ'; // Reemplaza con tu clave de API de YouTube
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${anime}&type=video&key=${apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      return data.items;
    } catch (error) {
      console.error('Error al obtener videos de YouTube:', error);
      return [];
    }
  }

  async function fetchAnimeDetails(anime) {
    let url = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(anime)}&limit=1`;

    // URL específica para "Papa no Iu Koto wo Kikinasai!"
    if (anime === 'papanokoto') {
      url = 'https://api.jikan.moe/v4/anime?q=Listen to Me, Girls&sfw'; 
    }

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.data.length === 0) {
        console.error(`No se encontró información para el anime "${anime}" en Jikan.`);
        return {};
      } else {
        return data.data[0];
      }
    } catch (error) {
      console.error('Error al obtener detalles del anime:', error);
      return {};
    }
  }
 

  // Función para traducir texto (Google Translate API)
  async function translateText(text, targetLanguage = 'es') {
    const apiKey = 'AIzaSyAsfjlhggGrzUyg74o5_SEV6QpTrTm73mQ'; // Reemplaza con tu clave de API
    const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}&q=${encodeURIComponent(text)}&target=${targetLanguage}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      return data.data.translations[0].translatedText;
    } catch (error) {
      console.error('Error al traducir el texto:', error);
      return text; 
    }
  }

  // Función para detectar el idioma del texto (Google Translate API)
  async function detectLanguage(text) {
    const apiKey = 'AIzaSyAsfjlhggGrzUyg74o5_SEV6QpTrTm73mQ'; // Reemplaza con tu clave de API
    const url = `https://translation.googleapis.com/language/translate/v2/detect?key=${apiKey}&q=${encodeURIComponent(text)}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      return data.data.detections[0][0].language;
    } catch (error) {
      console.error('Error al detectar el idioma:', error);
      return 'en'; 
    }
  }

  // Funciones para mostrar datos en el HTML
  function displayNews(anime) {
    const newsGrid = document.querySelector(`#${anime} .news-grid`);
    newsGrid.innerHTML = '';

    animeData[anime].news.forEach(async (article) => {
      try {
        if (article.title) {
          article.title = await translateText(article.title);
        }
        if (article.description) {
          article.description = await translateText(article.description);
        }
        const newsItem = document.createElement('div');
        newsItem.classList.add('news-item');
        newsItem.innerHTML = `
          <h3>${article.title}</h3>
          <p>${article.description}</p>
          <a href="${article.url}" target="_blank">Leer más</a>
        `;
        newsGrid.appendChild(newsItem);
      } catch (error) {
        console.error(`Error al traducir y mostrar la noticia "${article.title}":`, error);
      }
    });
  }

  function displayVideos(anime) {
    const videosGrid = document.querySelector(`#${anime} .videos-grid`);
    videosGrid.innerHTML = ''; 

    animeData[anime].videos.forEach(video => {
      const videoItem = document.createElement('div');
      videoItem.classList.add('video-item');
      videoItem.innerHTML = `
        <h3>${video.snippet.title}</h3>
        <iframe width="560" height="315" src="https://www.youtube.com/embed/${video.id.videoId}" frameborder="0" allowfullscreen></iframe>
      `;
      videosGrid.appendChild(videoItem);
    });
  }

  async function displayAnimeDetails(anime) {
    const animeSection = document.getElementById(anime);
    const detailsContainer = document.createElement('div');
    detailsContainer.classList.add('anime-details');

    let synopsis = animeData[anime].details.synopsis || 'Sinópsis no disponible';
    if (synopsis) {
      const language = await detectLanguage(synopsis);
      if (language !== 'es') { // Traducir solo si no está en español
        synopsis = await translateText(synopsis);
      }
    }

    detailsContainer.innerHTML = `
      <img src="${animeData[anime].details.images?.jpg?.image_url || 'imagen_no_disponible.jpg'}" alt="${animeData[anime].details.title}">
      <p>${synopsis}</p>
    `;
    animeSection.insertBefore(detailsContainer, animeSection.firstChild);
  }


  // Lógica principal
  async function fetchAndDisplayAnimeData(anime) {
    try {
      animeData[anime].news = await fetchNewsAPI(anime);
      animeData[anime].videos = await fetchYouTubeVideos(anime);
      animeData[anime].details = await fetchAnimeDetails(anime); // Llama a fetchAnimeDetails para todos

      displayNews(anime);
      displayVideos(anime);
      displayAnimeDetails(anime); 
    } catch (error) {
      console.error(`Error al obtener datos para ${anime}:`, error);
    }
  }

  animes.forEach(fetchAndDisplayAnimeData);
});
