import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { createTheme, ThemeProvider, responsiveFontSizes } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { styled } from '@mui/material/styles';
import { blue } from '@mui/material/colors';
import Loading from './utils/Loading';
import ErrorBoundary from './utils/ErrorBoundary';
import Logo from './assets/logo.jpg';

const channel = import.meta.env.VITE_CHANNEL;
const origin = import.meta.env.VITE_DOMAIN || window.location.origin;
const archiveApiBase = import.meta.env.VITE_ARCHIVE_API_BASE;
const defaultDelay = import.meta.env.VITE_DEFAULT_DELAY;

const Vods = lazy(() => import('./vods/Vods'));
const Navbar = lazy(() => import('./navbar/navbar'));
const NotFound = lazy(() => import('./utils/NotFound'));
const YoutubeVod = lazy(() => import('@op-archives/vod-components').then((m) => ({ default: m.YoutubeVod })));
const CustomVod = lazy(() => import('@op-archives/vod-components').then((m) => ({ default: m.CustomVod })));
const Games = lazy(() => import('@op-archives/vod-components').then((m) => ({ default: m.Games })));

export default function App() {
  let darkTheme = createTheme({
    palette: {
      mode: 'dark',
      background: {
        default: '#0e0e10',
      },
      primary: {
        main: blue[500],
      },
      secondary: {
        main: '#292828',
      },
    },
    components: {
      MuiDrawer: {
        styleOverrides: {
          paper: {
            color: 'white',
            backgroundImage: 'none',
          },
        },
      },
    },
  });

  darkTheme = responsiveFontSizes(darkTheme);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <BrowserRouter>
        <Parent>
          <Suspense fallback={<Loading />}>
            <ErrorBoundary channel={channel}>
              <Routes>
                <Route path="*" element={<NotFound channel={channel} />} />
                <Route
                  exact
                  path="/"
                  element={
                    <>
                      <Navbar channel={channel} />
                      <Vods />
                    </>
                  }
                />
                <Route
                  exact
                  path="/vods"
                  element={
                    <>
                      <Navbar channel={channel} />
                      <Vods />
                    </>
                  }
                />
                <Route exact path="/vods/:vodId" element={<YoutubeVod type="vod" logo={Logo} origin={origin} channel={channel} archiveApiBase={archiveApiBase} />} defaultDelay={defaultDelay} />
                <Route exact path="/live/:vodId" element={<YoutubeVod type="live" logo={Logo} origin={origin} channel={channel} archiveApiBase={archiveApiBase} defaultDelay={defaultDelay} />} />
                <Route exact path="/youtube/:vodId" element={<YoutubeVod logo={Logo} origin={origin} channel={channel} archiveApiBase={archiveApiBase} defaultDelay={defaultDelay} />} />
                <Route exact path="/games/:vodId" element={<Games channel={channel} logo={Logo} origin={origin} archiveApiBase={archiveApiBase} />} />
                <Route exact path="/manual/:vodId" element={<CustomVod type="manual" logo={Logo} channel={channel} archiveApiBase={archiveApiBase} />} />
              </Routes>
            </ErrorBoundary>
          </Suspense>
        </Parent>
      </BrowserRouter>
    </ThemeProvider>
  );
}

const Parent = styled((props) => <div {...props} />)`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;
