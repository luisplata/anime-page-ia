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
  return [
    {
      animeId: '1',
      animeTitle: 'Example Anime',
      episodeNumber: 1,
      thumbnailUrl: 'https://example.com/thumbnail1.jpg',
      streamingUrl: 'https://example.com/stream1',
    },
    {
      animeId: '2',
      animeTitle: 'Another Anime',
      episodeNumber: 5,
      thumbnailUrl: 'https://example.com/thumbnail2.jpg',
      streamingUrl: 'https://example.com/stream2',
    },
  ];
}

/**
 * Asynchronously retrieves a list of anime for the directory.
 *
 * @returns A promise that resolves to an array of AnimeListing objects.
 */
export async function getAnimeDirectory(): Promise<AnimeListing[]> {
  // TODO: Implement this by calling an API.
  return [
    {
      id: '1',
      title: 'Example Anime',
      thumbnailUrl: 'https://example.com/thumbnail1.jpg',
    },
    {
      id: '2',
      title: 'Another Anime',
      thumbnailUrl: 'https://example.com/thumbnail2.jpg',
    },
  ];
}

/**
 * Asynchronously retrieves detailed information about a specific anime.
 *
 * @param animeId The unique identifier of the anime.
 * @returns A promise that resolves to an AnimeDetail object.
 */
export async function getAnimeDetail(animeId: string): Promise<AnimeDetail> {
  // TODO: Implement this by calling an API.
  return {
    id: animeId,
    title: 'Example Anime',
    description: 'This is an example anime description.',
    coverUrl: 'https://example.com/cover.jpg',
    episodes: [
      {
        episodeNumber: 1,
        streamingUrl: 'https://example.com/stream1',
        title: 'Episode 1',
      },
      {
        episodeNumber: 2,
        streamingUrl: 'https://example.com/stream2',
        title: 'Episode 2',
      },
    ],
  };
}
