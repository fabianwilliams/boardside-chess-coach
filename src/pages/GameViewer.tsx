import { useParams } from 'react-router-dom';

export function GameViewer() {
  const { gameId } = useParams<{ gameId: string }>();

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Game Viewer</h1>
      <p>Game ID: {gameId || 'Not specified'}</p>
      <p style={{ color: '#888', marginTop: '2rem' }}>
        Chess board, move list, and annotations coming soon (Task 20)
      </p>
    </div>
  );
}
