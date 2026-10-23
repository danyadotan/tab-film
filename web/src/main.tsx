import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Player } from './engine/Player';
import { Film } from './film/Film';
import { SCENES, VOICEOVER_END } from './film/scenes';
import './styles/broadsheet.css';
import './styles/app.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Player width={1920} height={1080} bg="#f3f2f2" scenes={SCENES} audioSrc={`${import.meta.env.BASE_URL}voiceover.mp3`} audioEnd={VOICEOVER_END}>
      <Film />
    </Player>
  </StrictMode>,
);
