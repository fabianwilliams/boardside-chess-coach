import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div
      style={{
        padding: '2rem',
        textAlign: 'center',
        marginTop: '4rem',
      }}
    >
      <h1>404 - Page Not Found</h1>
      <p style={{ marginTop: '1rem', color: '#888' }}>
        The page you are looking for does not exist.
      </p>
      <Link
        to="/"
        style={{
          display: 'inline-block',
          marginTop: '2rem',
          padding: '0.75rem 1.5rem',
          backgroundColor: '#4a9eff',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '0.25rem',
        }}
      >
        Return to Home
      </Link>
    </div>
  );
}
