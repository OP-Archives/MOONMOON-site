import { useState } from "react";
import { Box, Tooltip, IconButton, Menu, MenuItem, Typography, Button } from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import humanize from "humanize-duration";
import { toSeconds } from "../utils/helpers";
import { FILTER_ALTS } from "./Vods";

export default function Chapters(props) {
  const { chapters, chapter, setPart, youtube, setChapter, setTimestamp } = props;
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleChapterClick = (data) => {
    if (youtube) {
      let part = 1,
        timestamp = data?.start || toSeconds(data.duration);
      if (timestamp > 1) {
        for (let data of youtube) {
          if (data.duration > timestamp) {
            part = data?.part || 1;
            break;
          }
          timestamp -= data.duration;
        }
      }
      setPart({ part: part, timestamp: timestamp });
    } else {
      setTimestamp(data?.start || toSeconds(data.duration));
    }
    setChapter(data);
    setAnchorEl(null);
  };

  const handleGameClick = (name) => {
    window.open(`${window.location.origin}?filter=${FILTER_ALTS.Game}&value=${name}`)
  }

  return (
    <Box sx={{ pr: 1 }}>
      <Tooltip title={chapter.name}>
        <IconButton onClick={handleClick}>
          <img alt="" src={getImage(chapter.image)} style={{ width: "40px", height: "53px" }} />
        </IconButton>
      </Tooltip>
      <Menu anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose} sx={{ maxWidth: "280px", maxHeight: "400px" }}>
        {chapters.map((data, _) => {
          return (
            <MenuItem key={(data?.gameId || data.name) + (data?.start || data.duration)} selected={data.start === chapter.start} sx={{ display: "flex" }}>
              <Tooltip title={`Go To Timestamp`} placement="top">
                <Box onClick={() => handleChapterClick(data)} sx={{ display: "flex" }}>
                  <Box sx={{ mr: 1 }}>
                    <img alt="" src={getImage(data.image)} style={{ width: "40px", height: "53px" }} />
                  </Box>
                  <Box sx={{ display: "flex", flexDirection: "column", minWidth: "135px" }}>
                    <Typography color="primary" variant="body2" noWrap>{`${data.name}`}</Typography>
                    {data.end !== undefined && <Typography variant="caption" color="textSecondary" noWrap>{`${humanize(data.end * 1000, { largest: 2 })}`}</Typography>}
                  </Box>
                </Box>
              </Tooltip>
              <Tooltip title={`Filter By Game`} placement="top" >
                <Button onClick={() => handleGameClick(data.name)} color="primary" variant="outlined" aria-label="Go To Vods" rel="noopener noreferrer" target="_blank" sx={{ minWidth: "40px", minHeight: "40px", px: 1 }}>
                  <OpenInNewIcon />
                </Button>
              </Tooltip>
            </MenuItem>
          );
        })}
      </Menu>
    </Box>
  );
}

//Support older vods that had {width}x{height} in the link
const getImage = (link) => {
  if (!link) return "https://static-cdn.jtvnw.net/ttv-static/404_boxart.jpg";
  return link.replace("{width}x{height}", "40x53");
};
