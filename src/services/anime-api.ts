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

const API_BASE_URL = process.env.NEXT_PUBLIC_ANIME_API_ENDPOINT || 'https://backend.animebell.peryloth.com';

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
    // Assuming 'name' can be string[] as per previous error, or string.
    // The provided Postman for /api/episodes had 'title' as string for anime.
    // Let's assume API is consistent with anime having 'title' (string) and 'slug' (string)
    title: string; // Preferring 'title' as string based on other endpoints. If it's 'name: string[]', adjust mapping.
    image: string; // Thumbnail for anime
  };
  sources: ApiEpisodeSource[];
}
interface ApiEpisodesResponse {
  data: ApiEpisodeListItem[];
  current_page?: number;
  last_page?: number;
  // ... other pagination fields if present
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
  // ... other pagination fields
}
interface ApiAnimesSearchResponse { // For /api/animes/search
  data: ApiAnimeListItem[];
  current_page?: number;
  last_page?: number;
  // ... other pagination fields
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
  // title?: string; // title of the episode itself - AnimeCard handles this as "Anime Title - Episode X"
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
      // If response is not JSON, try to get text
      try {
        errorBody = await response.text();
      } catch (textError) {
        errorBody = `Status: ${response.statusText}`;
      }
    }
    console.error(`API Error (${response.status}) for ${url}:`, errorBody);
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }
  // Handle cases where response might be empty but OK (e.g., 204 No Content)
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
    return response.json();
  }
  // @ts-ignore If not JSON, but OK, return as is or handle as needed
  return {} as T; // Or throw an error if JSON is always expected
}


// --- API Service Functions ---

export async function getLatestEpisodes(): Promise<NewEpisode[]> {
  try {
    // Postman collection for /api/episodes returns a paginated response with `data` field.
    const response = await fetchFromApi<ApiEpisodesResponse>('/api/episodes?sort=latest&per_page=20'); // Example: Fetch 20 latest
    if (!response || !response.data) {
        console.warn('Received empty or invalid data from /api/episodes');
        return [];
    }
    return response.data.map((ep): NewEpisode => {
      // Assuming ep.anime.name was a string array causing previous issues.
      // If ep.anime.title is now a string (more consistent), use it directly.
      // Let's use ep.anime.title as string for now, based on consistency with other anime objects.
      // If it's truly `name: string[]`, then `ep.anime.name.join(' ')` is correct.
      // Given the provided postman for /api/episodes, it has `anime.title` (string).
      const animeTitle = ep.anime.title;

      return {
        animeId: ep.anime.slug,
        animeTitle: animeTitle,
        episodeNumber: ep.number,
        thumbnailUrl: ep.anime.image,
      };
    });
  } catch (error) {
    console.error("Failed to fetch latest episodes:", error);
    return [];
  }
}

export async function getLatestAddedAnime(): Promise<AnimeListing[]> {
  try {
    // Assuming /api/animes by default returns latest, or add query param if available e.g. ?sort_by=created_at&order=desc
    const response = await fetchFromApi<ApiAnimesDirectoryResponse>('/api/animes?per_page=10'); // Example: Fetch 10 latest added
     if (!response || !response.data) {
        console.warn('Received empty or invalid data from /api/animes for latest added');
        return [];
    }
    return response.data.map((anime): AnimeListing => ({
      id: anime.slug,
      title: anime.title,
      thumbnailUrl: anime.image,
    }));
  } catch (error) {
    console.error("Failed to fetch latest added anime:", error);
    return [];
  }
}

export async function getAnimeDirectory(): Promise<AnimeListing[]> {
  try {
    // Fetch all pages if pagination exists, or just the first page.
    // For simplicity, fetching first page. Add pagination handling if needed.
    const response = await fetchFromApi<ApiAnimesDirectoryResponse>('/api/animes?per_page=100'); // Fetch a large number for "all"
    if (!response || !response.data) {
        console.warn('Received empty or invalid data from /api/animes for directory');
        return [];
    }
    return response.data.map((anime): AnimeListing => ({
      id: anime.slug,
      title: anime.title,
      thumbnailUrl: anime.image,
    }));
  } catch (error) {
    console.error("Failed to fetch anime directory:", error);
    return [];
  }
}

export async function getAnimeDetail(animeSlug: string): Promise<AnimeDetail> {
  try {
    const anime = await fetchFromApi<ApiAnimeDetailResponse>(`/api/anime/${animeSlug}`);
    return {
      id: anime.slug,
      title: anime.title,
      description: anime.description?.startsWith('/') 
        ? `Información sobre ${anime.title}.` // Placeholder if description is a path
        : (anime.description || "No hay descripción disponible."),
      coverUrl: anime.image, // API's `image` field is the cover for detail view
      episodes: (anime.episodes || []).map((ep): Episode => ({
        episodeNumber: ep.number,
        streamingSources: ep.sources.map(source => ({
          name: source.name,
          url: source.url,
          quality: source.quality,
        })),
        title: ep.title || `Episodio ${ep.number}`,
      })).sort((a, b) => a.episodeNumber - b.episodeNumber), // Ensure episodes are sorted
    };
  } catch (error) {
    console.error(`Failed to fetch details for anime ${animeSlug}:`, error);
    return { // Return a structured error object for the page to handle
      id: `error-detail-${animeSlug}`,
      title: `Anime no encontrado: ${animeSlug}`,
      description: "No se pudo cargar la información de este anime. Puede que el enlace sea incorrecto, el anime no exista, o haya un problema con la API.",
      coverUrl: 'https://picsum.photos/seed/error-detail-not-found/400/600',
      episodes: [],
    };
  }
}

export async function searchAnimes(query: string): Promise<AnimeListing[]> {
  if (!query.trim()) return [];
  try {
    const response = await fetchFromApi<ApiAnimesSearchResponse>(`/api/animes/search?q=${encodeURIComponent(query)}`);
     if (!response || !response.data) {
        console.warn(`Received empty or invalid data from /api/animes/search for query: ${query}`);
        return [];
    }
    return response.data.map((anime): AnimeListing => ({
      id: anime.slug,
      title: anime.title,
      thumbnailUrl: anime.image,
    }));
  } catch (error) {
    console.error(`Failed to search for anime with query "${query}":`, error);
    return [];
  }
}
