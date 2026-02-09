import { Link } from 'react-router';
import { Button } from '@components/ui/Button';

export function NotFound() {
  return (
    <div className="app-main app-main-center">
      <div
        className="app-stack-4"
        style={{ textAlign: 'center', maxWidth: 420, width: '100%' }}
      >
        <h1 className="heading-xl app-404-code">404</h1>
        <p className="body-l">
          The page you’re looking for doesn’t exist or may have been moved.
        </p>
        <Link to="/">
          <Button variant="primary" size="large">
            Go to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
