import { QueryClientProvider } from '@tanstack/react-query';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import 'simplebar-react/dist/simplebar.min.css';
import EnvironmentError from './utils/EnvironmentError';
import { queryClient } from './utils/queryClient';

const envChecks: Record<string, string | undefined> = {
  VITE_ARCHIVE_API_BASE: import.meta.env.VITE_ARCHIVE_API_BASE,
  VITE_TWITCH_ID: import.meta.env.VITE_TWITCH_ID,
  VITE_CHANNEL: import.meta.env.VITE_CHANNEL,
  VITE_DEFAULT_DELAY: import.meta.env.VITE_DEFAULT_DELAY,
  VITE_DOMAIN: import.meta.env.VITE_DOMAIN,
};

const missingVars = Object.entries(envChecks)
  .filter(([, value]) => !value)
  .map(([key]) => key);

const container = document.getElementById('root');
const root = createRoot(container!);

if (missingVars.length === 0) {
  root.render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
} else {
  root.render(<EnvironmentError missingVars={missingVars} />);
}
