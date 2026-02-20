import { useEffect, useState } from "react";
import { Box, Typography, Tooltip, IconButton, Collapse, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import Loading from "../utils/Loading";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Chapters from "./VodChapters";
import ExpandMore from "../utils/CustomExpandMore";
import CustomWidthTooltip from "../utils/CustomToolTip";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { toHMS } from "../utils/helpers";
import YoutubePlayer from "./YoutubePlayer";
import CustomPlayer from "./CustomPlayer";

export default function BaseVod(props) {
  const { isYoutubeVod, youtube, handlePartChange, playerRef, part, setPart, vod, type, delay, setDelay, timestamp, setTimestamp, setPlayerState } = props;
  const [chapter, setChapter] = useState(undefined);
  const [showMenu, setShowMenu] = useState(true);
  const [currentTime, setCurrentTime] = useState(undefined);

  useEffect(() => {
    if (!vod) return;
    setChapter(vod.chapters.length > 0 ? vod.chapters[0] : null);
  }, [vod]);

  useEffect(() => {
    if (!playerRef.current || !vod || !vod.chapters) return;
    for (let chapter of vod.chapters) {
      if (currentTime > chapter.start && currentTime < chapter.start + chapter.end) {
        setChapter(chapter);
        break;
      }
    }
    return;
  }, [currentTime, vod, playerRef]);

  const handleExpandClick = () => {
    setShowMenu(!showMenu);
  };

  const copyTimestamp = () => {
    navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}?t=${toHMS(currentTime)}`);
  };

  if (vod === undefined) return <Loading />;

  return (
    <Box sx={{ display: "flex", height: "100%", width: "100%", flexDirection: "column", alignItems: "flex-start", minWidth: 0, overflow: "hidden", position: "relative" }}>
      {isYoutubeVod ? (
        <YoutubePlayer playerRef={playerRef} part={part} youtube={youtube} setCurrentTime={setCurrentTime} setPart={setPart} delay={delay} setPlayerState={setPlayerState} />
      ) : (
        <CustomPlayer playerRef={playerRef} setCurrentTime={setCurrentTime} delay={delay} setDelay={setDelay} type={type} vod={vod} timestamp={timestamp} setPlayerState={setPlayerState} />
      )}
      <Box sx={{ position: "absolute", bottom: 0, left: "50%" }}>
        <Tooltip title={showMenu ? "Collapse" : "Expand"}>
          <ExpandMore expand={showMenu} onClick={handleExpandClick} aria-expanded={showMenu} aria-label="show menu">
            <ExpandMoreIcon />
          </ExpandMore>
        </Tooltip>
      </Box>
      <Collapse in={showMenu} timeout="auto" unmountOnExit sx={{ minHeight: "auto !important", width: "100%" }}>
        <Box sx={{ display: "flex", p: 1, alignItems: "center" }}>
          {chapter && <Chapters chapters={vod.chapters} chapter={chapter} setChapter={setChapter} setTimestamp={setTimestamp} setPart={setPart} youtube={youtube} isYoutubeVod={isYoutubeVod} />}
          <CustomWidthTooltip title={vod.title}>
            <Typography fontWeight={550} variant="body1" noWrap={true}>{`${vod.title}`}</Typography>
          </CustomWidthTooltip>
          <Box sx={{ marginLeft: "auto", display: "flex", alignItems: "center" }}>
            {isYoutubeVod && (
              <Box sx={{ ml: 0.5 }}>
                <FormControl variant="outlined">
                  <InputLabel id="select-label">Part</InputLabel>
                  <Select labelId="select-label" label="Part" value={part.part - 1} onChange={handlePartChange} autoWidth>
                    {youtube.map((data, i) => {
                      return (
                        <MenuItem key={data.id} value={i}>
                          {data?.part || i + 1}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Box>
            )}
            <Box sx={{ ml: 0.5 }}>
              <Tooltip title={`Copy Current Timestamp`}>
                <IconButton onClick={copyTimestamp} color="primary" aria-label="Copy Current Timestamp" rel="noopener noreferrer" target="_blank">
                  <ContentCopyIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
}
