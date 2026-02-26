import React from 'react';
import { createRoot } from 'react-dom/client';
import './css/index.css';
import 'simplebar-react/dist/simplebar.min.css';
import EnvironmentError from './components/EnvironmentError';

const requiredEnvVars = ['REACT_APP_ARCHIVE_API_BASE', 'REACT_APP_TWITCH_ID', 'REACT_APP_CHANNEL', 'REACT_APP_DEFAULT_DELAY'];

const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

const container = document.getElementById('root');
const root = createRoot(container);

const App = React.lazy(() => import('./App'));

if (missingVars.length === 0) {
  root.render(<App />);
} else {
  root.render(<EnvironmentError missingVars={missingVars} />);
}
