import { createRoot } from 'react-dom/client';
import { Desk } from './Desk';
import '../styles/broadsheet.css';
import './desk.css';

// No StrictMode here: the desk runs timers and speech from lifecycle methods,
// exactly as the prototype did, and a double mount would greet twice.
createRoot(document.getElementById('root')!).render(<Desk />);
