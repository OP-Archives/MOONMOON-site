import { tooltipClasses } from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';

const CustomWidthTooltip = styled(({ className, ...props }) => <Tooltip {...props} PopperProps={{ disablePortal: true }} classes={{ popper: className }} />)({
  [`& .${tooltipClasses.tooltip}`]: {
    maxWidth: 'none',
  },
});

export default CustomWidthTooltip;
