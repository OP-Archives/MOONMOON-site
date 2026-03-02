import Tooltip from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';
import { tooltipClasses } from '@mui/material/Tooltip';

// eslint-disable-next-line no-unused-vars
const MessageTooltip = styled(({ className, ...props }) => <Tooltip {...props} PopperProps={{ disablePortal: true }} classes={{ popper: className }} />)(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: '#fff',
    color: 'rgba(0, 0, 0, 0.87)',
  },
}));

export default MessageTooltip;
