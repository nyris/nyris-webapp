import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { bootstrapAuth0ApiKeyGuard } from 'utils/nyrisApiKey';

// Clear settings.js apiKey before any React tree can issue Nyris requests (Auth0 mode).
bootstrapAuth0ApiKeyGuard();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);
root.render(<App />);
