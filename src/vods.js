import React, { useEffect } from "react";
import {
  makeStyles,
  Typography,
  Link,
  Container,
  Button,
  Menu,
  MenuItem,
  CircularProgress,
  useMediaQuery,
  Box,
  FormControlLabel,
  Switch,
  withStyles,
} from "@material-ui/core";
import SimpleBar from "simplebar-react";
import ListIcon from "@material-ui/icons/List";
import Logo from "./assets/logo.jpg";
import { blue, grey } from "@material-ui/core/colors";

export default function Vods(props) {
  const isMobile = useMediaQuery("(max-width: 800px)");
  const classes = useStyles();
  const [vods, setVods] = React.useState([]);
  const [skip, setSkip] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [showLiveVods, setShowLiveVods] = React.useState(false);
  const [vodList, setVodList] = React.useState([]);
  const [allVodsLoaded, setAllVodsLoaded] = React.useState(false);
  const channel = props.channel;

  useEffect(() => {
    document.title = "VODS - Moonmoon";
    const fetchVods = async () => {
      await fetch(
        `https://archive.overpowered.tv/${channel}/vods?$limit=50&$sort[createdAt]=-1`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
        .then((response) => response.json())
        .then((data) => {
          //don't display vods without a video link
          let vods = data.data.filter((vod) => {
            return vod.youtube.length !== 0;
          });

          setVodList(
            vods.filter((vod) =>
              vod.youtube.some((data) => {
                return data.type === (showLiveVods ? "live" : "vod");
              })
            )
          );
        })
        .catch((e) => {
          console.error(e);
        });
    };
    fetchVods();
    return;
  }, [classes, channel, showLiveVods]);

  const IsolatedMenu = (props) => {
    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleClose = () => {
      setAnchorEl(null);
    };

    const handleClick = (event) => {
      setAnchorEl(event.currentTarget);
    };

    const filteredArray = props.vod.youtube.filter(
      (data) => data.type === (showLiveVods ? "live" : "vod")
    );

    return (
      <React.Fragment>
        <Button className={classes.partButton} onClick={handleClick}>
          <ListIcon />
          Parts
        </Button>
        <Menu
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          classes={{
            paper: classes.menuPaper,
          }}
          onClose={handleClose}
        >
          {filteredArray.map((data, index) => {
            return (
              <Link
                key={data.id}
                href={`/${data.type === "live" ? "live" : "vods"}/${props.vod.id}?part=${index + 1}`}
                style={{ textDecoration: "none" }}
              >
                <MenuItem className={classes.item}>Part {index + 1}</MenuItem>
              </Link>
            );
          })}
        </Menu>
      </React.Fragment>
    );
  };

  useEffect(() => {
    setVods(
      vodList.map((vod, i) => {
        return (
          <div
            key={vod.id}
            style={{ width: isMobile ? "6rem" : "18rem" }}
            className={classes.paper}
          >
            <div className={classes.lower}>
              <div style={{ display: "flex", flexWrap: "nowrap" }}>
                <div
                  style={{
                    flexGrow: 1,
                    flexShrink: 1,
                    width: "100%",
                    order: 2,
                    minWidth: 0,
                  }}
                >
                  <div style={{ marginBottom: "0.1rem" }}>
                    <Link
                      className={classes.title}
                      href={`/${showLiveVods ? "live" : "vods"}/${vod.id}`}
                      variant="caption"
                    >
                      {vod.title}
                    </Link>
                  </div>
                </div>
              </div>
              {vod.youtube.length > 1 ? <IsolatedMenu vod={vod} /> : <></>}
            </div>
            <div className={classes.imageBox}>
              <Link href={`/${showLiveVods ? "live" : "vods"}/${vod.id}`}>
                <img alt="" src={vod.thumbnail_url} className={classes.image} />
              </Link>
              <div className={classes.corners}>
                <div className={classes.bottomLeft}>
                  <Typography variant="caption" className={classes.cornerText}>
                    {`${vod.date}`}
                  </Typography>
                </div>
              </div>
              <div className={classes.corners}>
                <div className={classes.bottomRight}>
                  <Typography variant="caption" className={classes.cornerText}>
                    {`${vod.duration}`}
                  </Typography>
                </div>
              </div>
            </div>
          </div>
        );
      })
    );
    setLoading(false);
    return;
  }, [vodList, classes, isMobile, showLiveVods]);

  const fetchNextVods = async () => {
    if (allVodsLoaded) return;
    let next = skip + 50;
    await fetch(
      `https://archive.overpowered.tv/${channel}/vods?$limit=50&$skip=${next}&$sort[createdAt]=-1`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.data.length === 0) {
          setAllVodsLoaded(true);
          return;
        }
        //don't display vods without a video link
        let vods = data.data.filter((vod) => {
          return vod.youtube.length !== 0;
        });

        setVodList(
          vods.filter((vod) =>
            vod.youtube.every(
              (data) => data.type === (showLiveVods ? "live" : "vod")
            )
          )
        );
      })
      .catch((e) => {
        console.error(e);
      });
    setSkip(next);
  };

  const toggleShowVods = () => {
    setShowLiveVods(!showLiveVods);
  };

  return loading ? (
    <div className={classes.parent}>
      <div style={{ textAlign: "center" }}>
        <div>
          <img alt="" src={Logo} height="auto" width="75%" />
        </div>
        <CircularProgress style={{ marginTop: "2rem" }} size="2rem" />
      </div>
    </div>
  ) : (
    <Container maxWidth={false} disableGutters style={{ height: "100%" }}>
      <SimpleBar className={classes.scroll}>
        <Box display="flex">
          <Typography className={classes.header} variant="h4">
            {`Vods`}
          </Typography>
          <FormControlLabel
            className={classes.header}
            control={
              <BlueSwitch checked={showLiveVods} onChange={toggleShowVods} />
            }
            label="Live Vods"
          />
        </Box>
        <div className={classes.root}>{vods}</div>
        {!allVodsLoaded ? (
          <div className={classes.center}>
            <Button
              onClick={fetchNextVods}
              variant="contained"
              color="primary"
              className={classes.loadMore}
            >
              Load More
            </Button>
          </div>
        ) : (
          <></>
        )}
      </SimpleBar>
    </Container>
  );
}

const BlueSwitch = withStyles({
  switchBase: {
    color: blue[300],
    "&$checked": {
      color: blue[500],
    },
    "&$checked + $track": {
      backgroundColor: blue[500],
    },
  },
  checked: {},
  track: {
    borderRadius: 26 / 2,
    backgroundColor: grey[500],
    opacity: 1,
  },
})(Switch);

const useStyles = makeStyles(() => ({
  parent: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
  root: {
    marginLeft: "2rem",
    marginTop: "2rem",
    display: "flex",
    flexWrap: "wrap",
    height: "100%",
  },
  center: {
    textAlign: "center",
  },
  loadMore: {
    color: `#fff`,
    "&:hover": {
      opacity: "0.7",
    },
    whiteSpace: "nowrap",
    textTransform: "none",
  },
  header: {
    marginTop: "3rem",
    marginLeft: "2rem",
    color: "#fff",
  },
  page: {
    marginTop: "2rem",
    marginLeft: "2rem",
    color: "#fff",
  },
  paper: {
    maxWidth: "30%",
    flex: "0 0 auto",
    padding: "0 .5rem",
    display: "flex",
    flexDirection: "column",
  },
  title: {
    color: "#fff",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    display: "block",
  },
  imageBox: {
    overflow: "hidden",
    height: 0,
    paddingTop: "56.25%",
    position: "relative",
    order: 1,
    "&:hover": {
      boxShadow: "0 0 8px #fff",
    },
  },
  image: {
    verticalAlign: "top",
    maxWidth: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  lower: {
    order: 2,
    marginTop: "1rem",
    marginBottom: "1rem",
  },
  scroll: {
    height: "calc(100% - 4rem)",
    position: "relative",
  },
  corners: {
    pointerEvents: "none",
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  bottomLeft: {
    position: "absolute",
    bottom: 0,
    left: 0,
    marginLeft: "5px",
  },
  bottomRight: {
    position: "absolute",
    bottom: 0,
    right: 0,
    marginRight: "5px",
  },
  cornerText: {
    color: "#fff",
    backgroundColor: "rgba(0,0,0,.6)",
    padding: "0 .2rem",
  },
  partButton: {
    paddingRight: "1rem",
    marginTop: "0.3rem",
    color: "#fff",
    backgroundColor: "rgba(0,0,0,.6)",
    "&:hover": {
      opacity: "50%",
    },
  },
  menuPaper: {
    backgroundColor: "#0e0e10",
    color: "#fff",
  },
  item: {
    color: "#fff",
    "&:hover": {
      opacity: "50%",
      color: "#fff",
    },
  },
}));
