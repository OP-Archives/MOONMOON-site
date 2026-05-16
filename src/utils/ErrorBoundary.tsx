import { Component } from 'react';
import CustomLink from './CustomLink';

interface ErrorProps {
  channel: string;
  logo: string;
}

const ErrorView = ({ channel, logo }: ErrorProps) => {
  return (
    <div className="flex flex-col justify-center items-center h-full w-full">
      <title>{`Error - ${channel}`}</title>
      <img src={logo} alt="" style={{ height: 'auto', maxWidth: '200px' }} />
      <div className="flex justify-center mt-4">
        <h5 className="text-red-400 text-xl font-semibold">Something went wrong</h5>
      </div>
      <div className="flex justify-center mt-4">
        <CustomLink
          href="/"
          className="border border-blue-500 text-blue-500 px-4 py-2 rounded hover:bg-blue-500/10 transition-colors inline-block"
        >
          Go Home
        </CustomLink>
      </div>
    </div>
  );
};

export default class ErrorBoundary extends Component<
  { channel: string; logo: string; children?: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { channel: string; logo: string }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error', { error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return <ErrorView channel={this.props.channel} logo={this.props.logo} />;
    }
    return this.props.children;
  }
}
