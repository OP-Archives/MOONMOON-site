import { useState } from "react";
import { Box, IconButton, Menu, MenuItem, Typography, Tooltip, Button, Link } from "@mui/material";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import humanize from "humanize-duration";
import { toHMS, toSeconds } from "../utils/helpers";
import { useVods } from "./Vods";

export default function Chapters(props) {
  const { vod } = props;
  const { setGameFilter } = useVods();
  const [anchorEl, setAnchorEl] = useState(null);
  const DEFAULT_VOD = vod.youtube.length > 0 ? `/youtube/${vod.id}` : `/manual/${vod.id}`;

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  return (
    <Box>
      <Tooltip title={vod.chapters[0].name}>
        <IconButton onClick={handleClick}>
          <img alt="" src={getImage(vod.chapters[0].image)} style={{ width: "40px", height: "53px" }} />
        </IconButton>
      </Tooltip>
      <Menu anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose}>
        {vod.chapters.map((data, _) => {
          return (
            <MenuItem key={vod.id + (data?.gameId || data.name) + (data?.start || data.duration)} sx={{ display: "flex" }}>
              <Tooltip title={`Go To VOD`} placement="top">
                <Link href={`${DEFAULT_VOD}?t=${toHMS(data?.start || toSeconds(data.duration) || 1)}`}>
                    <Box sx={{ display: "flex" }}>
                      <Box sx={{ mr: 1 }}>
                        <img alt="" src={getImage(data.image)} style={{ width: "40px", height: "53px" }} />
                      </Box>
                      <Box sx={{ display: "flex", flexDirection: "column", minWidth: "135px" }}>
                        <Typography color="primary" variant="body2">{`${data.name}`}</Typography>
                        {data.end !== undefined && <Typography variant="caption" color="textSecondary">{`${humanize(data.end * 1000, { largest: 2 })}`}</Typography>}
                      </Box>
                    </Box>
                </Link>
              </Tooltip>
              <Tooltip title={`Filter By Game`} placement="top">
                <Button onClick={() => setGameFilter(data.name)} color="primary" variant="outlined" aria-label="Go To Vods" rel="noopener noreferrer" target="_blank" size="small" sx={{minWidth: "40px", minHeight: "40px", ml: 1}}>
                  <FilterAltIcon />
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
