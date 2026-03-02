import { useState } from 'react';
import YouTubeIcon from '@mui/icons-material/YouTube';
import OpenInBrowserIcon from '@mui/icons-material/OpenInBrowser';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';

export default function WatchMenu(props) {
  const { vod } = props;
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  return (
    <>
      <Button color="primary" variant="outlined" onClick={handleClick} endIcon={<PlayArrowIcon />}>
        <Typography fontWeight={600} variant="body1">
          Watch
        </Typography>
      </Button>
      <Menu anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <Box sx={{ pl: 1 }}>
          <Box>
            <Button color="primary" disabled={vod.youtube.length === 0} href={`/youtube/${vod.id}`} startIcon={<YouTubeIcon />} size="large" fullWidth sx={{ justifyContent: 'flex-start' }}>
              Youtube (Vod)
            </Button>
          </Box>
          <Box>
            <Button color="primary" href={`/manual/${vod.id}`} startIcon={<OpenInBrowserIcon />} size="large" fullWidth sx={{ justifyContent: 'flex-start' }}>
              Manual (VOD)
            </Button>
          </Box>
          {vod.games.length !== 0 && (
            <Box>
              <Button color="primary" href={`/games/${vod.id}`} startIcon={<YouTubeIcon />} size="large" fullWidth sx={{ justifyContent: 'flex-start' }}>
                Youtube (Only Games)
              </Button>
            </Box>
          )}
        </Box>
      </Menu>
    </>
  );
}
