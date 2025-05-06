/**
 * Represents a simplified anime object for directory listings.
 */
export interface AnimeListing {
  /**
   * The unique identifier for the anime.
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
   * The unique identifier for the anime.
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
   * The URL where the episode can be streamed.
   */
  streamingUrl: string;
  /**
   * The title of the episode. Defaults to "Episode <episodeNumber>" if not available.
   */
  title?: string;
}

/**
 * Represents a newly released anime episode.
 */
export interface NewEpisode {
  /**
   * The unique identifier for the anime.
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
   * The URL of the episode's thumbnail.
   */
  thumbnailUrl: string;
  /**
   * The URL where the episode can be streamed.
   */
  streamingUrl: string;
}

/**
 * Asynchronously retrieves the latest anime episodes.
 *
 * @returns A promise that resolves to an array of NewEpisode objects.
 */
export async function getLatestEpisodes(): Promise<NewEpisode[]> {
  // TODO: Implement this by calling an API.
  // Mock 20 items for a 4x5 grid
  return Array.from({ length: 20 }, (_, i) => ({
    animeId: `${i + 1}`,
    animeTitle: `Anime Épico ${String.fromCharCode(65 + (i % 5))}`, // Cycle through 5 anime titles
    episodeNumber: i + 1,
    thumbnailUrl: 'https://example.com/thumbnail_ep.jpg', // Placeholder, AnimeCard will change this
    streamingUrl: `https://example.com/stream_ep_${i + 1}`,
  }));
}

/**
 * Asynchronously retrieves a list of anime for the directory.
 *
 * @returns A promise that resolves to an array of AnimeListing objects.
 */
export async function getAnimeDirectory(): Promise<AnimeListing[]> {
  // TODO: Implement this by calling an API.
  // Mocking more items for directory potentially
  return Array.from({ length: 25 }, (_, i) => ({
    id: `dir-${i + 1}`,
    title: `Serie de Anime ${i + 1}`,
    thumbnailUrl: 'https://example.com/thumbnail_dir.jpg', // Placeholder
  }));
}

/**
 * Asynchronously retrieves detailed information about a specific anime.
 *
 * @param animeId The unique identifier of the anime.
 * @returns A promise that resolves to an AnimeDetail object.
 */
export async function getAnimeDetail(animeId: string): Promise<AnimeDetail> {
  // TODO: Implement this by calling an API.
  const exampleTitle = animeId.startsWith('dir-') ? `Serie de Anime ${animeId.split('-')[1]}` : `Anime Épico ${String.fromCharCode(65 + (parseInt(animeId,10)-1 % 5))}`;
  return {
    id: animeId,
    title: `Detalles de ${exampleTitle}`,
    description: `Esta es una descripción detallada para ${exampleTitle}. Contiene información sobre la trama, personajes y más.`,
    coverUrl: 'https://example.com/cover.jpg', // Placeholder
    episodes: Array.from({ length: 12 }, (_, i) => ({ // Mock 12 episodes
      episodeNumber: i + 1,
      streamingUrl: `https://example.com/stream_detail_${animeId}_ep_${i + 1}`,
      title: `Episodio ${i + 1}: La Aventura Comienza`,
    })),
  };
}

/**
 * Asynchronously retrieves the latest added anime series.
 *
 * @returns A promise that resolves to an array of AnimeListing objects.
 */
export async function getLatestAddedAnime(): Promise<AnimeListing[]> {
  // TODO: Implement this by calling an API.
  // Mock 20 items for a 4x5 grid
  return Array.from({ length: 20 }, (_, i) => ({
    id: `new-${i + 1}`,
    title: `Anime Recién Agregado ${i + 1}`,
    thumbnailUrl: 'https://example.com/thumbnail_new.jpg', // Placeholder
  }));
}
