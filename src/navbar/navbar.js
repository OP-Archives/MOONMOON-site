import React from "react";
import { AppBar, Toolbar, Typography, useMediaQuery, Box, Divider } from "@mui/material";
import Logo from "../assets/logo.jpg";
import CustomLink from "../utils/CustomLink";
import TwitterIcon from "@mui/icons-material/Twitter";
import SvgIcon from "@mui/material/SvgIcon";
import Drawer from "./drawer";
import OndemandVideoIcon from "@mui/icons-material/OndemandVideo";
import ReportIcon from "@mui/icons-material/Report";
import VideogameAssetIcon from "@mui/icons-material/VideogameAsset";

const socials = [
  {
    path: `https://twitter.com/moonmoon_ow`,
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

export default function Navbar(props) {
  const { channel } = props;
  const isMobile = useMediaQuery("(max-width: 800px)");

  return (
    <Box sx={{ flex: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Box sx={{ display: "flex", alignItems: "center", flex: 1 }}>
            {isMobile && <Drawer socials={socials} />}

            <Box sx={{ mr: 2 }}>
              <a href="/">
                <img alt="" style={{ maxWidth: "45px", height: "auto" }} src={Logo} />
              </a>
            </Box>

            <Typography variant="h6" component="div" sx={{ mr: 1 }}>
              <CustomLink color="inherit" href="/">
                <Typography color="primary" variant="h6">
                  {channel}
                </Typography>
              </CustomLink>
            </Typography>

            {!isMobile && (
              <>
                <Divider orientation="vertical" flexItem variant="middle" sx={{ ml: 1, mr: 1 }} />

                {socials.map(({ path, icon }) => (
                  <Box key={path} sx={{ mr: 2 }}>
                    <CustomLink href={path} rel="noopener noreferrer" target="_blank">
                      {icon}
                    </CustomLink>
                  </Box>
                ))}
              </>
            )}
          </Box>

          {!isMobile && (
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}>
              <Box sx={{ mr: 2 }}>
                <CustomLink href="https://jam.moon2.tv" rel="noopener noreferrer" target="_blank">
                  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <VideogameAssetIcon color="primary" sx={{ mr: 0.5 }} />
                    <Typography color="primary" variant="h6">
                      Game Jam
                    </Typography>
                  </Box>
                </CustomLink>
              </Box>
              <Box sx={{ mr: 2 }}>
                <CustomLink href="/vods">
                  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <OndemandVideoIcon color="primary" sx={{ mr: 0.5 }} />
                    <Typography color="primary" variant="h6">
                      Vods
                    </Typography>
                  </Box>
                </CustomLink>
              </Box>
            </Box>
          )}

          {!isMobile && (
            <Box sx={{ display: "flex", justifyContent: "end", flex: 1 }}>
              <Box sx={{ mr: 2 }}>
                <CustomLink href={`${process.env.REACT_APP_GITHUB}/issues`} rel="noopener noreferrer" target="_blank">
                  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <ReportIcon color="primary" sx={{ mr: 0.5 }} />
                    <Typography color="primary" variant="h6">
                      Issues
                    </Typography>
                  </Box>
                </CustomLink>
              </Box>
            </Box>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
}
