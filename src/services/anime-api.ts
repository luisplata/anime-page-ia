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

// --- Internal API Response Interfaces (matching Postman collection) ---

interface ApiAnimeBase {
  id: number; // Numeric ID from API
  name: string[];
  slug: string;
  description: string;
  image: string;
  // Add other fields if needed, e.g., status, type, etc.
}

interface ApiAnimeListItem extends ApiAnimeBase {
  // Specific fields for list items if any
}

interface ApiEpisodeSource {
  name: string;
  url: string;
}

interface ApiEpisodeCap {
  id: number; // Numeric ID
  title?: string;
  number: number;
  // link: string; // Relative link like /ver/slug-ep_number
  source: ApiEpisodeSource[];
}

interface ApiAnimeDetailResponse extends ApiAnimeBase {
  caps: ApiEpisodeCap[];
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

interface ApiEpisodeListItem {
  id: number; // Numeric ID for the episode entry itself
  title?: string; // Episode title
  number: number; // Episode number
  anime: {
    id: number; // Numeric anime ID
    name: string[];
    slug: string;
    image: string;
    // Add other anime fields if present in this nested object
  };
  source: ApiEpisodeSource[];
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
   * The URL where the episode can be streamed (first available source).
   */
  streamingUrl: string;
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
   * The URL where the episode can be streamed (first available source).
   */
  streamingUrl: string;
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

  const url = `${API_BASE_URL}${endpoint}`;
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    'X-Client-UUID': generateUUID(), // As per Postman collection
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    next: { revalidate: 3600 } // Revalidate every hour, adjust as needed
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
      animeId: ep.anime.slug,
      animeTitle: ep.anime.name.join(' '),
      episodeNumber: ep.number,
      thumbnailUrl: ep.anime.image,
      streamingUrl: ep.source.length > 0 ? ep.source[0].url : 'https://example.com/placeholder-stream', // Fallback
    }));
  } catch (error) {
    console.error("Failed to fetch latest episodes:", error);
    // Return a limited number of mock items on error to prevent breaking UI
    return Array.from({ length: 5 }, (_, i) => ({ // Reduced mock count
      animeId: `error-ep-${i + 1}`,
      animeTitle: `Error Anime ${i + 1}`,
      episodeNumber: 1,
      thumbnailUrl: `https://picsum.photos/seed/error-ep-${i+1}/300/300`,
      streamingUrl: 'https://example.com/error-stream',
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
      id: anime.slug,
      title: anime.name.join(' '),
      thumbnailUrl: anime.image,
    }));
  } catch (error) {
    console.error("Failed to fetch anime directory:", error);
    return Array.from({ length: 5 }, (_, i) => ({ // Reduced mock count
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
    return {
      id: anime.slug,
      title: anime.name.join(' '),
      description: anime.description.startsWith('/') ? `Description for ${anime.name.join(' ')} (placeholder from API)` : anime.description, // Handle relative description
      coverUrl: anime.image,
      episodes: anime.caps.map((cap): Episode => ({
        episodeNumber: cap.number,
        streamingUrl: cap.source.length > 0 ? cap.source[0].url : 'https://example.com/placeholder-stream', // Fallback
        title: cap.title || `Episodio ${cap.number}`,
      })).sort((a, b) => a.episodeNumber - b.episodeNumber), // Ensure episodes are sorted
    };
  } catch (error) {
    console.error(`Failed to fetch details for anime ${animeId}:`, error);
    // Provide a minimal fallback to prevent page crash
    return {
      id: animeId,
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
    // Assuming the default order of /api/animes returns latest added first, or use a specific query param if API supports it.
    const response = await fetchFromApi<ApiPagedResponse<ApiAnimeListItem>>('/api/animes?page=1&per_page=20'); // Fetch first 20
    return response.data.map((anime): AnimeListing => ({
      id: anime.slug,
      title: anime.name.join(' '),
      thumbnailUrl: anime.image,
    }));
  } catch (error) {
    console.error("Failed to fetch latest added anime:", error);
    return Array.from({ length: 5 }, (_, i) => ({ // Reduced mock count
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
    // The API seems to return a direct array for search, not a paginated response.
    const results = await fetchFromApi<ApiAnimeListItem[]>(`/api/animes/search?q=${encodeURIComponent(query)}`);
    return results.map((anime): AnimeListing => ({
      id: anime.slug,
      title: anime.name.join(' '),
      thumbnailUrl: anime.image,
    }));
  } catch (error) {
    console.error(`Failed to search for anime with query "${query}":`, error);
    return []; // Return empty array on error
  }
}


/**
 * Retrieves a specific episode's details, primarily its streaming sources.
 * Corresponds to Postman's "specific_episode" request.
 * The API endpoint seems to be `/api/episodes/{anime_slug}-{episode_number}`.
 * This function might be used if we need more details than what `getAnimeDetail` provides per episode.
 * For the current app structure, `getAnimeDetail` should be sufficient as it includes episode sources.
 * However, implementing this for completeness or future use.
 *
 * @param animeSlug The slug of the anime.
 * @param episodeNumber The episode number.
 * @returns A promise that resolves to an Episode object or null if not found/error.
 */
export async function getEpisodeDetails(animeSlug: string, episodeNumber: number): Promise<Episode | null> {
  const episodeId = `${animeSlug}-${episodeNumber}`;
  try {
    // The API for specific episode seems to return an object with structure similar to ApiEpisodeListItem or a direct ApiEpisodeCap
    // Assuming it returns an object that contains at least title, number, and source.
    // Let's assume it's like ApiEpisodeListItem for mapping
    const episodeData = await fetchFromApi<ApiEpisodeListItem>(`/api/episodes/${episodeId}`);

    if (!episodeData) return null;

    return {
      episodeNumber: episodeData.number,
      streamingUrl: episodeData.source.length > 0 ? episodeData.source[0].url : 'https://example.com/placeholder-stream',
      title: episodeData.title || `Episodio ${episodeData.number}`,
    };
  } catch (error) {
    console.error(`Failed to fetch details for episode ${episodeId}:`, error);
    return null;
  }
}
