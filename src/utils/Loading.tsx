import LoadingLogo from '../assets/dribble.avif';

export default function Loading() {
  return (
    <div className="flex justify-center items-center h-full w-full flex-col">
      <div className="flex flex-col justify-center items-center">
        <img alt="" src={LoadingLogo} style={{ height: 'auto', maxWidth: '100%', maxHeight: 150 }} />
        <div className="mt-8 h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );
}
