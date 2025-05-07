
// src/services/anime-api.ts

// Helper to get cookie value by name (client-side)
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') {
    return null; // Not in a browser environment
  }
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for(let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

// Vite uses import.meta.env for environment variables
const API_BASE_URL = import.meta.env.VITE_ANIME_API_ENDPOINT || 'https://backend.animebell.peryloth.com';

// --- Interfaces for API responses ---

// Source for an episode stream
interface ApiEpisodeSource {
  id: number;
  episode_id: number;
  name: string;
  url: string;
  quality?: string;
  created_at: string;
  updated_at: string;
}

// For /api/episodes -> data array items
interface ApiEpisodeListItem {
  id: number; // Episode ID
  anime_id: number;
  number: number; // Episode number
  title: string; // Episode title
  created_at: string;
  updated_at: string;
  published_at: string;
  anime: { // Nested anime object
    id: number; // Anime ID
    slug: string;
    title: string; 
    image: string; // Thumbnail for anime
  };
  sources: ApiEpisodeSource[];
}
interface ApiEpisodesResponse {
  data: ApiEpisodeListItem[];
  current_page?: number;
  last_page?: number;
}


// For /api/animes -> data array items & /api/animes/search -> data array items
interface ApiAnimeListItem {
  id: number;
  slug: string;
  title: string;
  image: string; // Thumbnail
  description?: string | null;
  created_at: string;
  updated_at: string;
}
interface ApiAnimesDirectoryResponse { // For /api/animes
  data: ApiAnimeListItem[];
  current_page?: number;
  last_page?: number;
}
interface ApiAnimesSearchResponse { // For /api/animes/search -> data object
  data: ApiAnimeListItem[]; // The actual search results are in a nested 'data' array
  current_page?: number;
  last_page?: number;
}


// For /api/anime/{slug}
interface ApiAnimeEpisodeDetail { // Episode structure within AnimeDetail
  id: number; // Episode ID
  anime_id: number;
  number: number;
  title?: string;
  created_at: string;
  updated_at: string;
  published_at: string;
  sources: ApiEpisodeSource[];
}
interface ApiAnimeDetailResponse {
  id: number; // Anime ID
  slug: string;
  title: string;
  description?: string | null;
  image: string; // Cover URL for the anime
  created_at: string;
  updated_at: string;
  episodes: ApiAnimeEpisodeDetail[];
}


// --- Interfaces for components ---
export interface EpisodeSource {
  name: string;
  url: string;
  quality?: string;
}

export interface Episode {
  episodeNumber: number;
  streamingSources: EpisodeSource[];
  title?: string;
}

export interface AnimeDetail {
  id: string; // This will be the slug
  title: string;
  description: string;
  coverUrl: string;
  episodes: Episode[];
}

export interface AnimeListing { // Used for directory, search results, latest added
  id: string; // This will be the slug
  title: string;
  thumbnailUrl: string;
}

export interface NewEpisode { // Used for latest episodes feed ("Capítulos del Día")
  animeId: string; // slug of the anime
  animeTitle: string;
  episodeNumber: number;
  thumbnailUrl: string; // thumbnail of the anime (from ep.anime.image)
}


// --- API Fetcher ---
async function fetchFromApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options?.headers,
  };

  if (typeof window !== 'undefined') { // Check if running in browser
    const clientUUID = getCookie('client-uuid');
    if (clientUUID) {
      headers['X-Client-UUID'] = clientUUID;
    }
  }
  
  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    let errorBody;
    try {
      errorBody = await response.json();
    } catch (e) {
      try {
        errorBody = await response.text();
      } catch (textError) {
        errorBody = `Status: ${response.statusText}`;
      }
    }
    console.error(`API Error (${response.status}) for ${url}:`, errorBody);
    throw new Error(`API request failed: ${response.status} ${response.statusText} - ${JSON.stringify(errorBody)}`);
  }
  
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
    const text = await response.text();
    if (text === "") {
      if (endpoint.includes('/api/anime/')) { 
          console.warn(`Received empty JSON response for detail endpoint ${url}. Returning null-like structure.`);
          return null as T; 
      }
      // Check if T is expected to be an object with a 'data' array (like paginated responses)
      // This is a heuristic. A more robust solution might involve type guards or specific parsers per endpoint.
      if ( (endpoint.includes('/api/episodes') || endpoint.includes('/api/animes')) && !endpoint.includes('/api/animes/search') ) {
        return { data: [] } as T; 
      }
      if (endpoint.includes('/api/animes/search')){ // Search endpoint has data nested one level deeper
        return { data: [] } as T;
      }
      return {} as T; // For other non-list cases where empty JSON might be valid empty object
    }
    try {
        return JSON.parse(text) as T;
    } catch (e) {
        console.error(`Failed to parse JSON for ${url}:`, e, "\nResponse text:", text);
        throw new Error(`Failed to parse JSON response from API for ${url}`);
    }
  }
  console.warn(`Received non-JSON 200 OK response for ${url}. Content-Type: ${contentType}`);
  if (endpoint.includes('/api/anime/')) {
      return null as T;
  }
  // For list-like non-JSON responses (highly unlikely for this API structure), return an empty data array.
  // Consider if this default is appropriate or if an error should be thrown.
  return { data: [] } as T; 
}


// --- API Service Functions ---

export async function getLatestEpisodes(): Promise<NewEpisode[]> {
  try {
    const response = await fetchFromApi<ApiEpisodesResponse>('/api/episodes?sort=latest&per_page=20');
    if (!response || !Array.isArray(response.data)) {
        console.warn('Received empty or invalid data array from /api/episodes. Response:', response);
        return [];
    }
    return response.data
      .map((ep): NewEpisode | null => {
        if (
          !ep.anime ||
          typeof ep.anime.slug !== 'string' ||
          typeof ep.anime.title !== 'string' ||
          typeof ep.anime.image !== 'string' || 
          typeof ep.number !== 'number'
        ) {
          console.warn('Skipping episode due to incomplete/invalid anime data from API:', ep);
          return null;
        }
        const img = ep.anime.image;
        const placeholder = `https://picsum.photos/seed/ep-${ep.anime.slug || ep.anime.id || 'unknown'}-${ep.number}/300/300`;
        
        return {
          animeId: ep.anime.slug,
          animeTitle: ep.anime.title,
          episodeNumber: ep.number,
          thumbnailUrl: (img && img.trim() !== '' && !img.includes('https://example.com/missing.jpg')) ? img : placeholder,
        };
      })
      .filter((ep): ep is NewEpisode => ep !== null);
  } catch (error) {
    console.error("Failed to fetch latest episodes:", error);
    return [];
  }
}

export async function getLatestAddedAnime(): Promise<AnimeListing[]> {
  try {
    const response = await fetchFromApi<ApiAnimesDirectoryResponse>('/api/animes?sort_by=created_at&order=desc&per_page=10');
     if (!response || !Array.isArray(response.data)) {
        console.warn('Received empty or invalid data array from /api/animes for latest added. Response:', response);
        return [];
    }
    return response.data
      .map((anime): AnimeListing | null => {
        if (
          typeof anime.slug !== 'string' ||
          typeof anime.title !== 'string' ||
          typeof anime.image !== 'string' 
        ) {
          console.warn('Skipping anime listing due to incomplete/invalid data from API:', anime);
          return null;
        }
        const img = anime.image;
        const placeholder = `https://picsum.photos/seed/la-${anime.slug || anime.id || 'unknown'}/300/300`;

        return {
          id: anime.slug,
          title: anime.title,
          thumbnailUrl: (img && img.trim() !== '' && !img.includes('https://example.com/missing.jpg')) ? img : placeholder,
        };
      })
      .filter((anime): anime is AnimeListing => anime !== null);
  } catch (error) {
    console.error("Failed to fetch latest added anime:", error);
    return [];
  }
}

export async function getAnimeDirectory(): Promise<AnimeListing[]> {
  try {
    const response = await fetchFromApi<ApiAnimesDirectoryResponse>('/api/animes?per_page=100'); 
    if (!response || !Array.isArray(response.data)) {
        console.warn('Received empty or invalid data array from /api/animes for directory. Response:', response);
        return [];
    }
    return response.data
      .map((anime): AnimeListing | null => {
        if (
          typeof anime.slug !== 'string' ||
          typeof anime.title !== 'string' ||
          typeof anime.image !== 'string' 
        ) {
          console.warn('Skipping anime listing (directory) due to incomplete/invalid data from API:', anime);
          return null;
        }
        const img = anime.image;
        const placeholder = `https://picsum.photos/seed/dir-${anime.slug || anime.id || 'unknown'}/300/300`;
        return {
          id: anime.slug,
          title: anime.title,
          thumbnailUrl: (img && img.trim() !== '' && !img.includes('https://example.com/missing.jpg')) ? img : placeholder,
        };
      })
      .filter((anime): anime is AnimeListing => anime !== null);
  } catch (error) {
    console.error("Failed to fetch anime directory:", error);
    return [];
  }
}

export async function getAnimeDetail(animeSlug: string): Promise<AnimeDetail | null> {
  try {
    const anime = await fetchFromApi<ApiAnimeDetailResponse>(`/api/anime/${animeSlug}`);
    if (!anime || typeof anime.slug !== 'string' || typeof anime.title !== 'string') {
      console.error(`Fetched anime detail for slug '${animeSlug}' is invalid or missing essential fields. Response:`, anime);
      return null;
    }

    const title = anime.title || `Anime Desconocido ${anime.id}`;
    const coverImg = anime.image;
    const defaultCover = `https://picsum.photos/seed/detail-${anime.slug || animeSlug}/400/600`;
    
    return {
      id: anime.slug,
      title: title,
      description: anime.description?.startsWith('/') 
        ? `Información sobre ${title}.` 
        : (anime.description || "No hay descripción disponible."),
      coverUrl: (coverImg && coverImg.trim() !== '' && !coverImg.includes('https://example.com/missing.jpg')) ? coverImg : defaultCover,
      episodes: (Array.isArray(anime.episodes) ? anime.episodes : []).map((ep): Episode => ({
        episodeNumber: ep.number,
        streamingSources: (Array.isArray(ep.sources) ? ep.sources : []).map(source => ({
          name: source.name || 'Fuente Desconocida',
          url: source.url || 'https://example.com/placeholder-stream',
          quality: source.quality,
        })).filter(s => s.url && s.url !== 'https://example.com/placeholder-stream'),
        title: ep.title || `Episodio ${ep.number}`,
      })).sort((a, b) => a.episodeNumber - b.episodeNumber),
    };
  } catch (error) {
    console.error(`Failed to fetch details for anime ${animeSlug}:`, error);
    return null;
  }
}

export async function searchAnimes(query: string): Promise<AnimeListing[]> {
  if (!query.trim()) return [];
  try {
    // The search response has the anime list under a 'data' property
    const response = await fetchFromApi<ApiAnimesSearchResponse>(`/api/animes/search?q=${encodeURIComponent(query)}`);
     if (!response || !Array.isArray(response.data)) { // Check response.data which contains the array
        console.warn(`Received empty or invalid data array from /api/animes/search for query: ${query}. Response:`, response);
        return [];
    }
    return response.data // Access the nested 'data' array
      .map((anime): AnimeListing | null => {
         if (
          typeof anime.slug !== 'string' ||
          typeof anime.title !== 'string' ||
          typeof anime.image !== 'string' 
        ) {
          console.warn('Skipping anime listing (search) due to incomplete/invalid data from API:', anime);
          return null;
        }
        const img = anime.image;
        const placeholder = `https://picsum.photos/seed/search-${anime.slug || anime.id || 'unknown'}/300/300`;
        return {
          id: anime.slug,
          title: anime.title,
          thumbnailUrl: (img && img.trim() !== '' && !img.includes('https://example.com/missing.jpg')) ? img : placeholder,
        };
      })
      .filter((anime): anime is AnimeListing => anime !== null);
  } catch (error) {
    console.error(`Failed to search for anime with query "${query}":`, error);
    return [];
  }
}
