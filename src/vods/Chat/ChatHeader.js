import { Box, Tooltip, IconButton, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SettingsIcon from '@mui/icons-material/Settings';
import ExpandMore from './ExpandMore';

export default function ChatHeader(props) {
  const { isPortrait, showChat, setShowChat, setShowModal } = props;

  const handleExpandClick = () => {
    setShowChat(!showChat);
  };

  return (
    <Box sx={{ display: 'grid', alignItems: 'center', p: 1 }}>
      {!isPortrait && (
        <Box
          sx={{
            justifySelf: 'left',
            gridColumnStart: 1,
            gridRowStart: 1,
          }}
        >
          <Tooltip title="Collapse">
            <ExpandMore expand={showChat} onClick={handleExpandClick} aria-expanded={showChat}>
              <ExpandMoreIcon />
            </ExpandMore>
          </Tooltip>
        </Box>
      )}
      <Box
        sx={{
          justifySelf: 'center',
          gridColumnStart: 1,
          gridRowStart: 1,
        }}
      >
        <Typography variant="body1">Chat Replay</Typography>
      </Box>
      <Box sx={{ justifySelf: 'end', gridColumnStart: 1, gridRowStart: 1 }}>
        <IconButton title="Settings" onClick={() => setShowModal(true)} color="primary">
          <SettingsIcon />
        </IconButton>
      </Box>
    </Box>
  );
}
