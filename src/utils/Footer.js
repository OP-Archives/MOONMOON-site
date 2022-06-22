import { styled, Typography, Box } from "@mui/material";
import CustomLink from "./CustomLink";

const Footer = styled((props) => (
  <Box {...props}>
    <Box sx={{ mt: 0.5 }}>
      <Typography variant="caption" color="textSecondary">
        {`MOONMOON © ${new Date().getFullYear()}`}
      </Typography>
    </Box>
    <CustomLink href="https://twitter.com/overpowered" rel="noopener noreferrer" target="_blank">
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Typography variant="caption" color="textSecondary">
          made by OP with 💜
        </Typography>
      </Box>
    </CustomLink>
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", mt: 1, mb: 1 }}>
      <CustomLink href="https://twemoji.twitter.com/" rel="noopener noreferrer" target="_blank" sx={{ mr: 0.5 }}>
        <Typography variant="caption" color="textSecondary">
          Twemoji graphics made by Twitter and other contributors,
        </Typography>
      </CustomLink>
      <CustomLink href="https://creativecommons.org/licenses/by/4.0/" rel="noopener noreferrer" target="_blank">
        <Typography variant="caption" color="textSecondary">
          Licensed under CC-BY 4.0
        </Typography>
      </CustomLink>
    </Box>
  </Box>
))`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-bottom: 1rem;
`;

export default Footer;
