import { createContext, useContext } from 'react';

export interface FilmState {
  /** Authored seconds — key all choreography to this. */
  T: number;
  /** Playback seconds. */
  time: number;
  playing: boolean;
}

export const FilmContext = createContext<FilmState>({ T: 0, time: 0, playing: false });

export const useFilm = () => useContext(FilmContext);
