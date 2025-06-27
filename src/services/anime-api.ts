
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
  number: number | string; // Episode number (can be string from API)
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

// Link object from API pagination
export interface ApiPaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

interface BasePaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  first_page_url: string;
  last_page_url: string;
  links: ApiPaginationLink[];
  next_page_url: string | null;
  prev_page_url: string | null;
  path: string;
  per_page: number;
  from: number | null; // API might send null if no items
  to: number | null;   // API might send null if no items
  total: number;
}

type ApiAnimesDirectoryResponse = BasePaginatedResponse<ApiAnimeListItem>;
type ApiAnimesSearchResponse = BasePaginatedResponse<ApiAnimeListItem>;


// For /api/anime/{slug}
interface ApiAlterName {
    id: number;
    anime_id: string; // API seems to send string here
    name: string;
    created_at: string;
    updated_at: string;
}

interface ApiGenre {
    id: number;
    anime_id: string; // API seems to send string here
    genre: string;
    created_at: string;
    updated_at: string;
}

interface ApiAnimeEpisodeDetail { // Episode structure within AnimeDetail
  id: number; // Episode ID
  anime_id: number;
  number: number | string; // Can be string from API
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
  alter_names: ApiAlterName[];
  genres: ApiGenre[];
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
  genres: string[];
  alternativeNames: string[];
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

// Public interface for paginated anime listing responses
export interface PaginatedAnimeResponse {
  animes: AnimeListing[];
  currentPage: number;
  lastPage: number;
  totalAnimes: number;
  perPage: number;
  nextPageUrl: string | null;
  prevPageUrl: string | null;
  links: ApiPaginationLink[];
}


// --- API Fetcher ---
async function fetchFromApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers = new Headers(options?.headers);
  headers.set('Content-Type', 'application/json');

  if (typeof window !== 'undefined') { 
    const clientUUID = getCookie('client-uuid');
    if (clientUUID) {
      headers.set('X-Client-UUID', clientUUID);
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
      // For paginated responses, an empty JSON might mean no data, so return a structure with an empty data array.
      if ( (endpoint.includes('/api/episodes') || endpoint.includes('/api/animes')) ) {
         return { data: [], links: [], current_page: 1, last_page: 1, total: 0, per_page: 20 } as unknown as T;
      }
      return {} as T; 
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
  return { data: [], links: [], current_page: 1, last_page: 1, total: 0, per_page: 20 } as unknown as T;
}

// Helper to map ApiAnimeListItem to AnimeListing
function mapApiAnimeListItemToAnimeListing(anime: ApiAnimeListItem): AnimeListing | null {
  if (
    typeof anime.slug !== 'string' ||
    typeof anime.title !== 'string' ||
    typeof anime.image !== 'string' 
  ) {
    console.warn('Skipping anime listing due to incomplete/invalid data from API:', anime);
    return null;
  }
  const img = anime.image;
  const placeholder = `https://picsum.photos/seed/${anime.slug || anime.id || 'unknown_anime'}/300/300`;
  return {
    id: anime.slug,
    title: anime.title,
    thumbnailUrl: (img && img.trim() !== '' && !img.includes('https://example.com/missing.jpg')) ? img : placeholder,
  };
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
        const episodeNumberNumeric = typeof ep.number === 'string' ? parseInt(ep.number, 10) : ep.number;

        if (
          !ep.anime ||
          typeof ep.anime.slug !== 'string' ||
          typeof ep.anime.title !== 'string' ||
          typeof ep.anime.image !== 'string' || 
          (typeof ep.number !== 'number' && typeof ep.number !== 'string') || // Allow string initially
          isNaN(episodeNumberNumeric) // Check if parsed number is valid
        ) {
          console.warn('Skipping episode due to incomplete/invalid anime data from API:', ep);
          return null;
        }
        const img = ep.anime.image;
        const placeholder = `https://picsum.photos/seed/ep-${ep.anime.slug || ep.anime.id || 'unknown'}-${episodeNumberNumeric}/300/300`;
        
        return {
          animeId: ep.anime.slug,
          animeTitle: ep.anime.title,
          episodeNumber: episodeNumberNumeric,
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
    // For "latest added", we typically only need the first page.
    const response = await fetchFromApi<ApiAnimesDirectoryResponse>('/api/animes?sort_by=created_at&order=desc&per_page=10');
     if (!response || !Array.isArray(response.data)) {
        console.warn('Received empty or invalid data array from /api/animes for latest added. Response:', response);
        return [];
    }
    return response.data
      .map(anime => mapApiAnimeListItemToAnimeListing(anime))
      .filter((anime): anime is AnimeListing => anime !== null);
  } catch (error) {
    console.error("Failed to fetch latest added anime:", error);
    return [];
  }
}

const defaultPaginatedResponse: PaginatedAnimeResponse = {
  animes: [],
  currentPage: 1,
  lastPage: 1,
  totalAnimes: 0,
  perPage: 20,
  nextPageUrl: null,
  prevPageUrl: null,
  links: [
    { url: null, label: "&laquo; Previous", active: false },
    { url: "?page=1", label: "1", active: true },
    { url: null, label: "Next &raquo;", active: false }
  ],
};


export async function getAnimeDirectory(page: number = 1): Promise<PaginatedAnimeResponse> {
  try {
    const response = await fetchFromApi<ApiAnimesDirectoryResponse>(`/api/animes?page=${page}&per_page=20`);
    if (!response || !Array.isArray(response.data)) {
        console.warn(`Received empty or invalid data array from /api/animes for page ${page}. Response:`, response);
        return defaultPaginatedResponse;
    }
    const animes = response.data
      .map(anime => mapApiAnimeListItemToAnimeListing(anime))
      .filter((anime): anime is AnimeListing => anime !== null);
    
    return {
      animes,
      currentPage: response.current_page,
      lastPage: response.last_page,
      totalAnimes: response.total,
      perPage: response.per_page,
      nextPageUrl: response.next_page_url,
      prevPageUrl: response.prev_page_url,
      links: response.links,
    };
  } catch (error) {
    console.error(`Failed to fetch anime directory for page ${page}:`, error);
    return defaultPaginatedResponse;
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
      genres: (Array.isArray(anime.genres) ? anime.genres : []).map(g => g.genre),
      alternativeNames: (Array.isArray(anime.alter_names) ? anime.alter_names : []).map(an => an.name),
      episodes: (Array.isArray(anime.episodes) ? anime.episodes : []).map((ep): Episode => {
        const episodeNumberNumeric = typeof ep.number === 'string' ? parseInt(ep.number, 10) : ep.number;
        if (isNaN(episodeNumberNumeric)) {
            console.warn(`Invalid episode number for anime ${animeSlug}, episode id ${ep.id}:`, ep.number);
        }
        return {
            episodeNumber: isNaN(episodeNumberNumeric) ? -1 : episodeNumberNumeric,
            streamingSources: (Array.isArray(ep.sources) ? ep.sources : []).map(source => ({
            name: source.name || 'Fuente Desconocida',
            url: source.url || 'https://example.com/placeholder-stream',
            quality: source.quality,
            })).filter(s => s.url && s.url !== 'https://example.com/placeholder-stream'),
            title: ep.title || `Episodio ${episodeNumberNumeric}`,
        }
      }).filter(ep => ep.episodeNumber !== -1)
      .sort((a, b) => a.episodeNumber - b.episodeNumber),
    };
  } catch (error) {
    console.error(`Failed to fetch details for anime ${animeSlug}:`, error);
    return null;
  }
}

export async function searchAnimes(query: string, page: number = 1): Promise<PaginatedAnimeResponse> {
  if (!query.trim()) return defaultPaginatedResponse;
  try {
    const response = await fetchFromApi<ApiAnimesSearchResponse>(`/api/animes/search?q=${encodeURIComponent(query)}&page=${page}&per_page=20`);
     if (!response || !Array.isArray(response.data)) { 
        console.warn(`Received empty or invalid data array from /api/animes/search for query: ${query}, page: ${page}. Response:`, response);
        return defaultPaginatedResponse;
    }
    const animes = response.data
      .map(anime => mapApiAnimeListItemToAnimeListing(anime))
      .filter((anime): anime is AnimeListing => anime !== null);

    return {
      animes,
      currentPage: response.current_page,
      lastPage: response.last_page,
      totalAnimes: response.total,
      perPage: response.per_page,
      nextPageUrl: response.next_page_url,
      prevPageUrl: response.prev_page_url,
      links: response.links,
    };
  } catch (error) {
    console.error(`Failed to search for anime with query "${query}", page ${page}:`, error);
    return defaultPaginatedResponse;
  }
}
