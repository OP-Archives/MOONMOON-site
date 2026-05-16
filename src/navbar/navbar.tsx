import Gamepad2 from 'lucide-react/dist/esm/icons/gamepad-2.mjs';
import { TwitterIcon } from '../assets/icons';
import CustomLink from '../utils/CustomLink';
import { useMediaQuery } from '../utils/useMediaQuery';
import Drawer from './drawer';

const socials = [
  {
    path: 'https://twitter.com/moonmoon_ow',
    icon: <TwitterIcon className="text-blue-500" />,
  },
  {
    path: 'https://twitch.tv/moonmoon',
    icon: (
      <svg className="text-blue-500" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
      </svg>
    ),
  },
];

interface NavbarProps {
  channel: string;
  logo: string;
}

export default function Navbar({ channel, logo }: NavbarProps) {
  const isMobile = useMediaQuery('(max-width: 800px)');

  return (
    <div className="flex-1">
      <header className="bg-dark-light shadow-lg">
        <div className="flex items-center px-4 py-2">
          <div className="flex items-center flex-1">
            {isMobile && <Drawer socials={socials} />}

            <div className="mr-2">
              <CustomLink href="/">
                <img alt="" style={{ maxWidth: '45px', height: 'auto' }} src={logo} />
              </CustomLink>
            </div>

            <span className="mr-1 text-lg">
              <CustomLink color="inherit" href="/">
                <span className="text-blue-500 font-semibold">{channel}</span>
              </CustomLink>
            </span>

            {!isMobile && (
              <>
                <hr className="h-6 border-l border-gray-600 mx-2" />

                {socials.map(({ path, icon }) => (
                  <div key={path} className="mr-2">
                    <CustomLink href={path}>{icon}</CustomLink>
                  </div>
                ))}
              </>
            )}
          </div>

          {!isMobile && (
            <div className="flex items-center justify-center flex-1">
              <div className="mr-2">
                <CustomLink href="https://jam.moon2.tv">
                  <div className="flex justify-center items-center gap-1">
                    <Gamepad2 className="text-blue-500 mr-0.5" size={24} />
                    <span className="text-blue-500 font-semibold text-lg">Game Jam</span>
                  </div>
                </CustomLink>
              </div>
              <div className="mr-2">
                <CustomLink href="/vods">
                  <div className="flex justify-center items-center gap-1">
                    <svg
                      className="text-blue-500 mr-0.5"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 12.5v-9l6 4.5-6 4.5z" />
                    </svg>
                    <span className="text-blue-500 font-semibold text-lg">Vods</span>
                  </div>
                </CustomLink>
              </div>
              <div className="mr-2">
                <CustomLink href="/library">
                  <div className="flex justify-center items-center gap-1">
                    <svg
                      className="text-blue-500 mr-0.5"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m16 6 4 14" />
                      <path d="M12 6v14" />
                      <path d="M8 8v12" />
                      <path d="M4 4v16" />
                    </svg>
                    <span className="text-blue-500 font-semibold text-lg">Library</span>
                  </div>
                </CustomLink>
              </div>
            </div>
          )}

          {!isMobile && (
            <div className="flex justify-end flex-1">
              <div className="mr-2">
                <CustomLink href={`${import.meta.env.VITE_GITHUB}/issues`}>
                  <div className="flex justify-center items-center gap-1">
                    <svg
                      className="text-blue-500 mr-0.5"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                    </svg>
                    <span className="text-blue-500 font-semibold text-lg">Issues</span>
                  </div>
                </CustomLink>
              </div>
            </div>
          )}
        </div>
      </header>
    </div>
  );
}
