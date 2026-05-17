import CustomLink from './CustomLink';

export default function NotFound({ channel, logo }: { channel: string; logo: string }) {
  return (
    <div className="flex flex-col justify-center items-center h-full w-full">
      <title>{`Not Found - ${channel}`}</title>
      <img src={logo} alt="" style={{ height: 'auto', maxWidth: '200px' }} />
      <div className="flex justify-center mt-4">
        <CustomLink href="/" className="text-muted hover:opacity-50 transition-opacity">
          Nothing over here..
        </CustomLink>
      </div>
    </div>
  );
}
