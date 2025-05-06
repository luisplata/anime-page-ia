/**
 * @fileOverview Service for fetching anime data from the AniView API.
 *
 * This service provides functions to interact with the anime API,
 * fetching lists of anime, details for specific anime, episode information, etc.
 * It maps the API responses to an internal data structure for consistent use
 * throughout the application.
 */

// Base URL for the anime API, configured via environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_ANIME_API_ENDPOINT;

// --- Internal API Response Interfaces (matching Postman collection and new structure) ---

export interface EpisodeSource { // Exported for use in components
  name: string;
  url: string;
  quality?: string;
}

interface ApiEpisode { // Represents an episode object within AnimeDetail or as a standalone specific episode
  id: number; // Numeric ID of the episode
  title?: string;
  number: number;
  sources: EpisodeSource[]; 
  anime_id?: number; // Present in specific_episode response from API
}

interface ApiAnimeBase {
  id: number; // Numeric ID from API
  title: string; 
  slug: string;
  description: string;
  image: string;
}

interface ApiAnimeListItem extends ApiAnimeBase {
  // Specific fields for list items if any
}

interface ApiAnimeDetailResponse extends ApiAnimeBase {
  episodes: ApiEpisode[]; 
}

interface ApiPagedResponse<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: { url: string | null; label: string; active: boolean }[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

interface ApiEpisodeListItem { // For the /api/episodes endpoint (list of latest episodes)
  id: number; // Numeric ID for the episode entry itself
  title?: string; // Episode title
  number: number; // Episode number
  anime: { // Nested anime object
    id: number; // Numeric anime ID
    title: string; 
    slug: string;
    image: string;
  };
  sources: EpisodeSource[]; 
}


// --- Application-facing Data Structures ---

/**
 * Represents a simplified anime object for directory listings.
 */
export interface AnimeListing {
  /**
   * The unique slug for the anime (used as ID in app).
   */
  id: string;
  /**
   * The title of the anime.
   */
  title: string;
  /**
   * The URL of the anime's thumbnail image.
   */
  thumbnailUrl: string;
}

/**
 * Represents detailed information about a specific anime.
 */
export interface AnimeDetail {
  /**
   * The unique slug for the anime (used as ID in app).
   */
  id: string;
  /**
   * The title of the anime.
   */
  title: string;
  /**
   * A comprehensive description or plot summary of the anime.
   */
  description: string;
  /**
   * The URL of the anime's cover image.
   */
  coverUrl: string;
  /**
   * An array of episode objects, each containing information about an episode.
   */
  episodes: Episode[];
}

/**
 * Represents a single episode of an anime.
 */
export interface Episode {
  /**
   * The episode number (e.g., 1, 2, 3).
   */
  episodeNumber: number;
  /**
   * The available streaming sources for the episode.
   */
  streamingSources: EpisodeSource[];
  /**
   * The title of the episode. Can be undefined.
   */
  title?: string;
}

/**
 * Represents a newly released anime episode for homepage display.
 */
export interface NewEpisode {
  /**
   * The unique slug for the anime (used as ID in app).
   */
  animeId: string;
  /**
   * The title of the anime.
   */
  animeTitle: string;
  /**
   * The episode number.
   */
  episodeNumber: number;
  /**
   * The URL of the episode's thumbnail (usually the anime's cover).
   */
  thumbnailUrl: string;
  /**
   * The available streaming sources for the episode.
   */
  streamingSources: EpisodeSource[];
}

// --- Helper Functions ---

/**
 * Generates a UUID.
 * In Node.js environments, crypto.randomUUID is available.
 * For browsers, it's also widely supported.
 */
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older environments (less robust but functional)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Fetches data from the API with common headers and error handling.
 * @param endpoint The API endpoint path (e.g., '/api/animes').
 * @param options Additional fetch options.
 * @returns A promise that resolves to the JSON response.
 * @throws Error if the API request fails.
 */
async function fetchFromApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error("API base URL is not configured. Please set NEXT_PUBLIC_ANIME_API_ENDPOINT.");
  }

  let clientUUID = '';
  if (typeof window !== 'undefined') { // Check if running in the browser
    clientUUID = localStorage.getItem('client-uuid'); // Primary source: localStorage (set by ClientUuidProvider)
    if (!clientUUID) {
      // Fallback: try to read from cookie if localStorage is empty (e.g., first hit before useEffect in provider runs)
      const cookieString = document.cookie;
      const cookiesArray = cookieString.split('; ');
      const uuidCookie = cookiesArray.find(row => row.startsWith('client-uuid='));
      if (uuidCookie) {
        clientUUID = uuidCookie.split('=')[1];
      }
    }
    // If clientUUID is still not found after checking localStorage and cookies,
    // ClientUuidProvider will generate it on mount. For this specific fetch, it might go without.
    // Or, to ensure it's always present for client-side calls:
    if (!clientUUID) {
        clientUUID = generateUUID();
        localStorage.setItem('client-uuid', clientUUID); // Store it for next time
    }
  }
  // On the server, clientUUID remains empty for this generic function.
  // Specific server-side calls needing X-Client-UUID would need to handle it,
  // or rely on standard cookie forwarding if the backend API supports it.

  const url = `${API_BASE_URL}${endpoint}`;
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (clientUUID) {
    defaultHeaders['X-Client-UUID'] = clientUUID;
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    next: { revalidate: 3600 } // Revalidate every hour, adjust as needed (Next.js specific)
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`API Error (${response.status}) for ${url}: ${errorBody}`);
    throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

// --- API Service Functions ---

/**
 * Asynchronously retrieves the latest anime episodes.
 * Corresponds to Postman's "all_episodes" request.
 * @returns A promise that resolves to an array of NewEpisode objects.
 */
export async function getLatestEpisodes(): Promise<NewEpisode[]> {
  try {
    const response = await fetchFromApi<ApiPagedResponse<ApiEpisodeListItem>>('/api/episodes?page=1&per_page=20'); // Fetch first 20
    return response.data.map((ep): NewEpisode => ({
      animeId: ep.anime?.slug || `unknown-anime-${ep.anime?.id || ep.id}`,
      animeTitle: ep.anime?.title || `Episodio ${ep.number} (Título Desconocido)`,
      episodeNumber: ep.number,
      thumbnailUrl: ep.anime?.image || `https://picsum.photos/seed/ep-${ep.anime?.id || ep.id}/300/300`,
      streamingSources: ep.sources?.map(s => ({ name: s.name, url: s.url, quality: s.quality })) || [{ name: "Default", url: 'https://example.com/placeholder-stream', quality: 'HD' }],
    }));
  } catch (error) {
    console.error("Failed to fetch latest episodes:", error);
    return Array.from({ length: 20 }, (_, i) => ({ 
      animeId: `error-ep-${i + 1}`,
      animeTitle: `Error Anime ${i + 1}`,
      episodeNumber: 1,
      thumbnailUrl: `https://picsum.photos/seed/error-ep-${i+1}/300/300`,
      streamingSources: [{ name: "ErrorSource", url: 'https://example.com/error-stream', quality: 'Unknown' }],
    }));
  }
}

/**
 * Asynchronously retrieves a list of anime for the directory.
 * Corresponds to Postman's "all_animes" request.
 * @returns A promise that resolves to an array of AnimeListing objects.
 */
export async function getAnimeDirectory(): Promise<AnimeListing[]> {
   try {
    const response = await fetchFromApi<ApiPagedResponse<ApiAnimeListItem>>('/api/animes?page=1&per_page=25'); // Fetch first 25
    return response.data.map((anime): AnimeListing => ({
      id: anime.slug || `unknown-anime-${anime.id}`,
      title: anime.title || `Anime Desconocido ${anime.id}`,
      thumbnailUrl: anime.image || `https://picsum.photos/seed/anime-${anime.id}/300/300`,
    }));
  } catch (error) {
    console.error("Failed to fetch anime directory:", error);
    return Array.from({ length: 20 }, (_, i) => ({ 
      id: `error-dir-${i + 1}`,
      title: `Error Anime Series ${i + 1}`,
      thumbnailUrl: `https://picsum.photos/seed/error-dir-${i+1}/300/300`,
    }));
  }
}

/**
 * Asynchronously retrieves detailed information about a specific anime.
 * Corresponds to Postman's "specific_anime" request.
 * @param animeId The unique slug (used as ID) of the anime.
 * @returns A promise that resolves to an AnimeDetail object.
 */
export async function getAnimeDetail(animeId: string): Promise<AnimeDetail> {
  try {
    const anime = await fetchFromApi<ApiAnimeDetailResponse>(`/api/anime/${animeId}`);
    const title = anime.title || `Anime Desconocido ${anime.id}`;
    return {
      id: anime.slug || animeId,
      title: title,
      description: anime.description?.startsWith('/') ? `Description for ${title} (placeholder from API)` : (anime.description || "No description available."),
      coverUrl: anime.image || `https://picsum.photos/seed/${animeId}/400/600`,
      episodes: (anime.episodes || []).map((ep): Episode => ({
        episodeNumber: ep.number,
        streamingSources: ep.sources?.map(source => ({ 
          name: source.name,
          url: source.url,
          quality: source.quality
        })) || [{ name: "Default", url: 'https://example.com/placeholder-stream', quality: 'HD' }],
        title: ep.title || `Episodio ${ep.number}`,
      })).sort((a, b) => a.episodeNumber - b.episodeNumber),
    };
  } catch (error) {
    console.error(`Failed to fetch details for anime ${animeId}:`, error);
    return {
      id: `error-detail-${animeId}`, // Keep animeId for identification if possible
      title: `Anime no encontrado: ${animeId}`,
      description: "No se pudo cargar la descripción de este anime.",
      coverUrl: 'https://picsum.photos/seed/error-detail/400/600',
      episodes: [],
    };
  }
}


/**
 * Asynchronously retrieves the latest added anime series.
 * This might be similar to getAnimeDirectory or a specific endpoint if available.
 * For now, let's assume it's similar to the directory but could be a different sort order or endpoint.
 * We will use the `/api/animes` endpoint and sort by a hypothetical 'added_date' if available,
 * or just use the first page as a proxy for "latest added".
 * @returns A promise that resolves to an array of AnimeListing objects.
 */
export async function getLatestAddedAnime(): Promise<AnimeListing[]> {
  try {
    const response = await fetchFromApi<ApiPagedResponse<ApiAnimeListItem>>('/api/animes?page=1&per_page=20'); // Fetch first 20
    return response.data.map((anime): AnimeListing => ({
      id: anime.slug || `unknown-anime-${anime.id}`,
      title: anime.title || `Anime Desconocido ${anime.id}`,
      thumbnailUrl: anime.image || `https://picsum.photos/seed/new-anime-${anime.id}/300/300`,
    }));
  } catch (error) {
    console.error("Failed to fetch latest added anime:", error);
    return Array.from({ length: 20 }, (_, i) => ({ 
      id: `error-new-${i + 1}`,
      title: `Error Anime Nuevo ${i + 1}`,
      thumbnailUrl: `https://picsum.photos/seed/error-new-${i+1}/300/300`,
    }));
  }
}

/**
 * Searches for anime based on a query string.
 * Corresponds to Postman's "animes_search" request.
 * @param query The search term.
 * @returns A promise that resolves to an array of AnimeListing objects.
 */
export async function searchAnime(query: string): Promise<AnimeListing[]> {
  if (!query.trim()) {
    return [];
  }
  try {
    const response = await fetchFromApi<ApiPagedResponse<ApiAnimeListItem>>(`/api/animes/search?q=${encodeURIComponent(query)}`);
    return response.data.map((anime): AnimeListing => ({
      id: anime.slug || `unknown-search-${anime.id}`,
      title: anime.title || `Anime Desconocido ${anime.id}`,
      thumbnailUrl: anime.image || `https://picsum.photos/seed/search-${anime.id}/300/300`,
    }));
  } catch (error) {
    console.error(`Failed to search for anime with query "${query}":`, error);
    return [];
  }
}


/**
 * Retrieves a specific episode's details, primarily its streaming sources.
 * Corresponds to Postman's "specific_episode" request.
 * The API endpoint seems to be `/api/episodes/{anime_slug}-{episode_number}`.
 *
 * @param animeSlug The slug of the anime.
 * @param episodeNumber The episode number.
 * @returns A promise that resolves to an Episode object or null if not found/error.
 */
export async function getEpisodeDetails(animeSlug: string, episodeNumber: number): Promise<Episode | null> {
  const episodeIdPath = `${animeSlug}-${episodeNumber}`;
  try {
    const episodeData = await fetchFromApi<ApiEpisode>(`/api/episodes/${episodeIdPath}`);

    if (!episodeData) return null;

    return {
      episodeNumber: episodeData.number,
      streamingSources: episodeData.sources?.map(s => ({ name: s.name, url: s.url, quality: s.quality })) || [{ name: "Default", url: 'https://example.com/placeholder-stream', quality: 'HD' }],
      title: episodeData.title || `Episodio ${episodeData.number}`,
    };
  } catch (error) {
    console.error(`Failed to fetch details for episode ${episodeIdPath}:`, error);
    return null;
  }
}


    