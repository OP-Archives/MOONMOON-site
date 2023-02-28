import { useState } from "react";
import YouTubeIcon from "@mui/icons-material/YouTube";
import OpenInBrowserIcon from "@mui/icons-material/OpenInBrowser";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { Box, Button, Typography, MenuItem, Menu } from "@mui/material";
import CustomLink from "../utils/CustomLink";

export default function WatchMenu(props) {
  const { vod } = props;
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  return (
    <Box>
      <Button color="primary" variant="outlined" onClick={handleClick} endIcon={<PlayArrowIcon />}>
        <Typography fontWeight={600} variant="body1">
          Watch
        </Typography>
      </Button>
      <Menu anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose}>
        {vod.youtube.length > 0 && (
          <CustomLink href={`/youtube/${vod.id}`}>
            <MenuItem>
              <YouTubeIcon sx={{ mr: 1 }} />
              Youtube
            </MenuItem>
          </CustomLink>
        )}
        {vod.games.length > 0 && (
          <CustomLink href={`/games/${vod.id}`}>
            <MenuItem>
              <YouTubeIcon sx={{ mr: 1 }} />
              Only Games
            </MenuItem>
          </CustomLink>
        )}
        <CustomLink href={`/manual/${vod.id}`}>
          <MenuItem>
            <OpenInBrowserIcon sx={{ mr: 1 }} />
            Manual
          </MenuItem>
        </CustomLink>
      </Menu>
    </Box>
  );
}
