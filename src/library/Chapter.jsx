import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';
import CustomWidthTooltip from '../utils/CustomToolTip';
import { getImage } from '../utils/helpers';

export default function Chapter({ chapter }) {
  return (
    <Box
      component={Link}
      to={`/vods?game_id=${chapter.game_id}`}
      sx={{
        borderRadius: 1,
        overflow: 'hidden',
        cursor: 'pointer',
        textDecoration: 'none',
        '&:hover': { boxShadow: '0 0 8px rgba(255,255,255,.6)' },
      }}
    >
      <Box
        sx={{
          width: '100%',
          paddingTop: '132.5%',
          position: 'relative',
          bgcolor: 'action.disabledBackground',
        }}
      >
        {chapter.image ? (
          <img
            src={getImage(chapter.image, 400, 530)}
            alt=""
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <Typography
            variant="caption"
            color="primary"
            sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
          >
            No image
          </Typography>
        )}
      </Box>
      <Box sx={{ px: 1, py: 0.5, textAlign: 'center' }}>
        <CustomWidthTooltip title={chapter.name} placement="top">
          <span>
            <Typography
              variant="caption"
              color="primary"
              noWrap
              sx={{ fontWeight: '550', display: 'block' }}
            >
              {chapter.name}
            </Typography>
          </span>
        </CustomWidthTooltip>
        <Typography variant="caption" color="primary">
          {chapter.count || 0} EPs
        </Typography>
      </Box>
    </Box>
  );
}
