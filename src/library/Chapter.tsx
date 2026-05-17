import { Link } from 'react-router-dom';
import CustomWidthTooltip from '../utils/CustomToolTip';
import { getImage } from '../utils/helpers';

interface ChapterProps {
  chapter: {
    game_id: string;
    name: string;
    image?: string;
    count: number;
  };
  priority?: boolean;
}

export default function Chapter({ chapter, priority }: ChapterProps) {
  return (
    <Link
      to={`/vods?game_id=${chapter.game_id}`}
      className="rounded cursor-pointer no-underline block hover:shadow-[0_0_8px_rgba(255,255,255,.6)] transition-shadow min-w-0"
    >
      <div className="w-full relative overflow-hidden rounded-t aspect-[400/530] bg-dark-light">
        {chapter.image ? (
          <img
            src={getImage(chapter.image, 400, 530)}
            alt=""
            width={400}
            height={530}
            className="absolute inset-0 w-full h-full object-cover"
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'auto'}
            decoding="async"
          />
        ) : (
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary text-xs">
            No image
          </span>
        )}
      </div>
      <div className="px-1 py-0.5 text-center min-w-0 w-full">
        <CustomWidthTooltip title={chapter.name}>
          <span className="text-primary font-medium block text-xs truncate">{chapter.name}</span>
        </CustomWidthTooltip>
        <span className="text-primary text-xs">{chapter.count || 0} EPs</span>
      </div>
    </Link>
  );
}
