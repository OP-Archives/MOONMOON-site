import { Collapse } from "@mui/material";
import { styled } from "@mui/material/styles";
import { collapseClasses } from "@mui/material/Collapse";

const CustomCollapse = styled(({ _, ...props }) => <Collapse {...props} />)({
  [`& .${collapseClasses.wrapper}`]: {
    height: "100%",
  },
});

export default CustomCollapse;