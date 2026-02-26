import React from 'react';
import { createRoot } from 'react-dom/client';
import './css/index.css';
import reportWebVitals from './reportWebVitals';
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

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
