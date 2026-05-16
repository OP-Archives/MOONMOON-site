import { Link } from 'react-router-dom';
import sadge from '../assets/sadge.jpg';
import { type VodData } from '../utils/archive-client';
import CustomLink from '../utils/CustomLink';
import CustomWidthTooltip from '../utils/CustomToolTip';
import { toHHMMSS } from '../utils/helpers';
import Chapters from './ChaptersMenu';
import WatchMenu from './WatchMenu';

interface VodProps {
  vod: VodData;
  isMobile?: boolean;
  priority?: boolean;
}

const DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

const getVodLink = (vod: VodData) => {
  if (vod.vod_uploads?.length > 0) return `/youtube/${vod.id}`;
  if (vod.games?.length > 0) return `/games/${vod.id}`;
  return `/manual/${vod.id}`;
};

const getThumbnail = (vod: VodData) => {
  return vod.vod_uploads?.[0]?.thumbnail_url || vod.games?.[0]?.thumbnail_url || vod.thumbnail_url || sadge;
};

const prefetchPlayerChunk = () => {
  import('@op-archives/vod-components').catch(() => {});
};

export default function Vod({ vod, priority }: VodProps) {
  const DEFAULT_VOD = getVodLink(vod);
  const DEFAULT_THUMBNAIL = getThumbnail(vod);

  return (
    <div className="w-full">
      <div className="overflow-hidden relative aspect-video w-full bg-dark-light">
        <Link to={DEFAULT_VOD} className="absolute inset-0 block" onMouseEnter={prefetchPlayerChunk}>
          <img
            className="thumbnail"
            alt=""
            src={DEFAULT_THUMBNAIL}
            width={640}
            height={360}
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'auto'}
            decoding="async"
          />
        </Link>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-0">
            <span className="text-xs p-1.5 bg-black/60 text-white">
              {DATE_FORMATTER.format(new Date(vod.created_at))}
            </span>
          </div>
        </div>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 right-0">
            <span className="text-xs p-1.5 bg-black/60 text-white">{`${toHHMMSS(vod.duration)}`}</span>
          </div>
        </div>
      </div>
      <div className="mt-1 mb-1 flex items-center">
        {vod.chapters && vod.chapters.length > 0 && <Chapters vod={vod} />}
        <div className="min-w-0 flex-1 pl-2">
          <div className="p-0.5 min-w-0 w-full">
            <CustomWidthTooltip title={vod.title}>
              <CustomLink href={DEFAULT_VOD} className="block overflow-hidden">
                <span className="text-blue-500 font-medium text-xs block truncate">{vod.title}</span>
              </CustomLink>
            </CustomWidthTooltip>
          </div>
          <div className="flex justify-center mt-0.5">
            <WatchMenu vod={vod} />
          </div>
        </div>
      </div>
    </div>
  );
}
