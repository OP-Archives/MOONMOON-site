import AlertCircle from 'lucide-react/dist/esm/icons/alert-circle.mjs';
import Gamepad2 from 'lucide-react/dist/esm/icons/gamepad-2.mjs';
import Home from 'lucide-react/dist/esm/icons/home.mjs';
import Library from 'lucide-react/dist/esm/icons/library.mjs';
import MenuIcon from 'lucide-react/dist/esm/icons/menu.mjs';
import Video from 'lucide-react/dist/esm/icons/video.mjs';
import { useState, useEffect } from 'react';
import CustomLink from '../utils/CustomLink';

interface SocialLink {
  path: string;
  icon: React.ReactNode;
}

interface DrawerProps {
  socials: SocialLink[];
}

const mainLinks = [
  { title: 'Home', path: '/', icon: <Home className="text-blue-500" size={20} /> },
  { title: 'Vods', path: '/vods', icon: <Video className="text-blue-500" size={20} /> },
  { title: 'Library', path: '/library', icon: <Library className="text-blue-500" size={20} /> },
  {
    title: 'Issues',
    path: `${import.meta.env.VITE_GITHUB}/issues`,
    icon: <AlertCircle className="text-blue-500" size={20} />,
  },
  { title: 'Game Jam', path: 'https://jam.moon2.tv', icon: <Gamepad2 className="text-blue-500" size={20} /> },
];

export default function DrawerComponent({ socials }: DrawerProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  return (
    <>
      {drawerOpen && <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setDrawerOpen(false)} />}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-dark-light shadow-xl transform transition-transform duration-200 z-50 ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <nav>
          {mainLinks.map(({ title, path, icon }) => (
            <div key={title} className="border-b border-gray-700">
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-full flex items-center px-4 py-3 hover:bg-dark-hover transition-colors text-left"
              >
                <span className="mr-3">{icon}</span>
                <CustomLink href={path} className="text-blue-500 block flex-1">
                  {title}
                </CustomLink>
              </button>
            </div>
          ))}
          <div className="flex p-4 gap-4">
            {socials.map(({ path, icon }) => (
              <a
                key={path}
                href={path}
                rel="noopener noreferrer"
                target="_blank"
                className="hover:opacity-70 transition-opacity"
              >
                {icon}
              </a>
            ))}
          </div>
        </nav>
      </div>
      <button onClick={() => setDrawerOpen(!drawerOpen)} className="p-2 hover:bg-dark-hover rounded transition-colors">
        <MenuIcon className="text-blue-500" size={24} />
      </button>
    </>
  );
}
