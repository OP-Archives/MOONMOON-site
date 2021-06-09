import React from "react";
import {
  AppBar,
  Toolbar,
  makeStyles,
  List,
  ListItem,
  ListItemText,
  Typography,
  Divider,
  IconButton,
  Drawer,
} from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";

const mainLinks = [
  { title: `Home`, path: `/` },
  { title: `Vods`, path: `/vods` },
];
const socialLinks = [
  { title: `Twitch`, path: `https://twitch.tv/moonmoon` },
  { title: `Twitter`, path: `https://twitter.com/MOONMOON_OW` },
  { title: `Youtube`, path: `https://www.youtube.com/channel/UCykE3qY-wFLmUMSuryhnS1g` },
];

export default function NavBar(props) {
  const { window } = props;
  const classes = useStyles();

  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const drawer = (
    <div>
      <div className={classes.toolbar} />
      <Typography variant="h6" noWrap className={classes.content}>
        Moonmoon
      </Typography>
      <Divider classes={{ root: classes.divider }} />
      <List>
        {mainLinks.map(({ title, path }) => (
          <ListItem
            key={title}
            component="a"
            href={path}
            className={classes.linkText}
          >
            <ListItemText primary={title} />
          </ListItem>
        ))}
      </List>
      <Divider classes={{ root: classes.divider }} />
      <List>
        {socialLinks.map(({ title, path }) => (
          <ListItem
            key={title}
            component="a"
            href={path}
            target="_blank"
            rel="noreferrer noopener"
            className={classes.linkText}
          >
            <ListItemText primary={title} />
          </ListItem>
        ))}
      </List>
      <Divider classes={{ root: classes.divider }} />
      <div style={{marginTop: "1rem"}}>
        <Typography
          variant="caption"
          className={classes.content}
          style={{ padding: "14px" }}
        >
          <a
            href="https://twitter.com/overpowered"
            target="_blank"
            rel="noreferrer noopener"
            className={classes.linkText}
          >
            Made by OP with 💜
          </a>
        </Typography>
      </div>
    </div>
  );

  const container =
    window !== undefined ? () => window().document.body : undefined;

  return (
    <div style={{ display: "flex" }}>
      <AppBar position="static" color="inherit" className={classes.appBar}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            className={classes.menuButton}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <nav className={classes.drawer} aria-label="navigation">
        <Drawer
          container={container}
          variant="temporary"
          anchor={"left"}
          open={drawerOpen}
          onClose={handleDrawerToggle}
          classes={{
            paper: classes.drawerPaper,
          }}
          ModalProps={{
            keepMounted: true,
          }}
        >
          {drawer}
        </Drawer>
      </nav>
    </div>
  );
}

const useStyles = makeStyles((theme) => ({
  appBar: {
    boxShadow: "none",
    backgroundColor: "inherit",
  },
  divider: {
    backgroundColor: "#868686",
  },
  drawer: {
    width: "10rem",
    flexShrink: 0,
  },
  menuButton: {
    marginRight: theme.spacing(2),
    color: "#fff",
  },
  toolbar: theme.mixins.toolbar,
  drawerPaper: {
    width: "10rem",
    backgroundColor: "#0e0e10",
    color: "#fff",
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  linkText: {
    textDecoration: `none`,
    color: `#fff`,
    "&:hover": {
      opacity: "50%",
    },
  },
}));
