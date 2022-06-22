import { useState } from "react";
import { Drawer, ListItem, List, ListItemText, IconButton, Divider, Box, Link, ListItemIcon } from "@mui/material";
import { Menu } from "@mui/icons-material";
import TwitterIcon from "@mui/icons-material/Twitter";
import SvgIcon from "@mui/material/SvgIcon";
import HomeIcon from "@mui/icons-material/Home";
import OndemandVideoIcon from "@mui/icons-material/OndemandVideo";

const mainLinks = [
  { title: `Home`, path: `/`, icon: <HomeIcon color="primary" /> },
  { title: `Vods`, path: `/vods`, icon: <OndemandVideoIcon color="primary" /> },
];

const socials = [
  {
    path: `https://twitter.com/moonmoon`,
    icon: <TwitterIcon color="primary" />,
  },
  {
    path: `https://twitch.tv/moonmoon`,
    icon: (
      <SvgIcon color="primary">
        <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
      </SvgIcon>
    ),
  },
];

export default function DrawerComponent() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <Box sx={{ mr: 1 }}>
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <List>
          {mainLinks.map(({ title, path, icon }) => (
            <Box key={title}>
              <ListItem onClick={() => setDrawerOpen(false)}>
                <ListItemIcon>{icon}</ListItemIcon>
                <ListItemText>
                  <Link color="primary" href={path}>
                    {title}
                  </Link>
                </ListItemText>
              </ListItem>
              <Divider />
            </Box>
          ))}
          <Divider />
          <Box sx={{ display: "flex", p: 2 }}>
            {socials.map(({ path, icon }) => (
              <Box key={path} sx={{ mr: 2 }}>
                <Link href={path} rel="noopener noreferrer" target="_blank">
                  {icon}
                </Link>
              </Box>
            ))}
          </Box>
        </List>
      </Drawer>
      <IconButton onClick={() => setDrawerOpen(!drawerOpen)}>
        <Menu color="primary" />
      </IconButton>
    </Box>
  );
}
