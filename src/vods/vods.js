import React, { useEffect } from "react";
import { Box, Typography, Button, MenuItem, Pagination, Grid, Tooltip, styled, Link, Menu } from "@mui/material";
import SimpleBar from "simplebar-react";
import CustomLink from "../utils/CustomLink";
import Footer from "../utils/Footer";
import Loading from "../utils/Loading";
import default_thumbnail from "../assets/sadge.jpg";
import { tooltipClasses } from "@mui/material/Tooltip";
import YouTubeIcon from "@mui/icons-material/YouTube";
import OpenInBrowserIcon from "@mui/icons-material/OpenInBrowser";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

const limit = 50;

export default function Vods(props) {
  const { VODS_API_BASE, channel } = props;
  const [vods, setVods] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(null);
  const [totalPages, setTotalPages] = React.useState(null);

  useEffect(() => {
    document.title = `VODS - ${channel}`;
    const fetchVods = async () => {
      await fetch(`${VODS_API_BASE}/vods?$limit=${limit}&$sort[createdAt]=-1`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((response) => {
          setPage(1);
          setVods(response.data);
          setTotalPages(Math.floor(response.total / limit));
          setLoading(false);
        })
        .catch((e) => {
          console.error(e);
        });
    };
    fetchVods();
    return;
  }, [VODS_API_BASE, channel]);

  const handlePageChange = (_, value) => {
    if (page === value) return;
    setLoading(true);
    setPage(value);

    fetch(`${VODS_API_BASE}/vods?$limit=${limit}&$skip=${(value - 1) * limit}&$sort[createdAt]=-1`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((response) => {
        if (response.data.length === 0) return;
        setVods(response.data);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
      });
  };

  if (loading) return <Loading />;

  return (
    <SimpleBar style={{ maxHeight: "calc(100% - 4rem)" }}>
      <Box sx={{ padding: 2 }}>
        <Grid container spacing={2} sx={{ mt: 1, justifyContent: "center" }}>
          {vods.map((vod, i) => (
            <Vod key={vod.id} vod={vod} />
          ))}
        </Grid>
      </Box>
      <Box sx={{ display: "flex", justifyContent: "center", mt: 2, mb: 2 }}>
        {totalPages !== null && <Pagination count={totalPages} disabled={totalPages <= 1} color="primary" page={page} onChange={handlePageChange} />}
      </Box>
      <Footer />
    </SimpleBar>
  );
}

const Vod = (props) => {
  const { vod } = props;

  return (
    <Grid item xs={2} sx={{ maxWidth: "18rem", flexBasis: "18rem" }}>
      <Box
        sx={{
          overflow: "hidden",
          height: 0,
          paddingTop: "56.25%",
          position: "relative",
          "&:hover": {
            boxShadow: "0 0 8px #fff",
          },
        }}
      >
        <Link href={vod.youtube.length > 0 ? `/youtube/${vod.id}` : `/manual/${vod.id}`}>
          <img className="thumbnail" alt="" src={vod.thumbnail_url ? vod.thumbnail_url : default_thumbnail} />
        </Link>
        <Box sx={{ pointerEvents: "none", position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}>
          <Box sx={{ position: "absolute", bottom: 0, left: 0 }}>
            <Typography variant="caption" sx={{ padding: "0 .2rem", backgroundColor: "rgba(0,0,0,.6)" }}>
              {`${vod.date}`}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ pointerEvents: "none", position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}>
          <Box sx={{ position: "absolute", bottom: 0, right: 0 }}>
            <Typography variant="caption" sx={{ padding: "0 .2rem", backgroundColor: "rgba(0,0,0,.6)" }}>
              {`${vod.duration}`}
            </Typography>
          </Box>
        </Box>
      </Box>
      <Box sx={{ mt: 1, mb: 1 }}>
        <Box sx={{ display: "flex", flexWrap: "nowrap", flexDirection: "column" }}>
          <Box sx={{ flexGrow: 1, flexShrink: 1, width: "100%", minWidth: 0 }}>
            <Box>
              <CustomWidthTooltip title={vod.title} placement="bottom">
                <span>
                  <CustomLink
                    component={Button}
                    href={vod.youtube.length > 0 ? `/youtube/${vod.id}` : `/manual/${vod.id}`}
                    sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}
                  >
                    <Typography variant="caption" color="primary">
                      {vod.title}
                    </Typography>
                  </CustomLink>
                </span>
              </CustomWidthTooltip>
            </Box>
          </Box>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <WatchMenu vod={vod} />
        </Box>
      </Box>
    </Grid>
  );
};

const CustomWidthTooltip = styled(({ className, ...props }) => <Tooltip {...props} classes={{ popper: className }} />)({
  [`& .${tooltipClasses.tooltip}`]: {
    maxWidth: "none",
  },
});

const WatchMenu = (props) => {
  const { vod } = props;
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  return (
    <Box>
      <Button onClick={handleClick}>
        <Typography variant="h7">Watch</Typography>
        <PlayArrowIcon />
      </Button>
      <Menu anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose}>
        {vod.youtube.length > 0 && (
          <CustomLink href={`/youtube/${props.vod.id}`}>
            <MenuItem>
              <YouTubeIcon sx={{ mr: 1 }} />
              Youtube
            </MenuItem>
          </CustomLink>
        )}
        <CustomLink href={`/manual/${props.vod.id}`}>
          <MenuItem>
            <OpenInBrowserIcon sx={{ mr: 1 }} />
            Manual
          </MenuItem>
        </CustomLink>
      </Menu>
    </Box>
  );
};
