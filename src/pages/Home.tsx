import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useArchetype } from '@providers/ArchetypeContext';
import { Button } from '@components/shared/Button';
import { ArchetypeBadge } from '@components/shared/Badge';
import sampleGames from '@data/sample-games.json';
import styles from './Home.module.css';

interface Game {
  id: string;
  title: string;
  opening: string;
  difficulty: string;
  tags: string[];
  description: string;
}

export function Home() {
  const { archetype, hasArchetype } = useArchetype();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  const games: Game[] = sampleGames.games.map((game) => ({
    id: game.id,
    title: game.title,
    opening: game.opening,
    difficulty: game.difficulty,
    tags: game.tags,
    description: game.description,
  }));

  // Filter games based on search and difficulty
  const filteredGames = games.filter((game) => {
    const matchesSearch =
      searchQuery === '' ||
      game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.opening.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesDifficulty =
      selectedDifficulty === 'all' || game.difficulty === selectedDifficulty;

    return matchesSearch && matchesDifficulty;
  });

  const difficulties = ['all', 'beginner', 'intermediate', 'advanced'];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Chess Game Library</h1>
          <p className={styles.subtitle}>
            Learn chess through annotated master games, adapted to your
            learning style
          </p>
        </div>
        {archetype && (
          <div className={styles.archetypeDisplay}>
            <span className={styles.archetypeLabel}>Your learning style:</span>
            <ArchetypeBadge archetype={archetype} />
          </div>
        )}
      </div>

      {!hasArchetype() && (
        <div className={styles.quizBanner}>
          <div className={styles.quizBannerContent}>
            <h2 className={styles.quizBannerTitle}>
              Personalize Your Learning
            </h2>
            <p className={styles.quizBannerText}>
              Take a quick 5-10 question quiz to discover your learning style.
              We'll adapt game annotations to match how you think about chess.
            </p>
            <Link to="/quiz">
              <Button variant="primary" size="large">
                Start Learning Style Quiz
              </Button>
            </Link>
          </div>
        </div>
      )}

      <div className={styles.filters}>
        <input
          type="text"
          placeholder="Search games, openings, or tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
          aria-label="Search games"
        />

        <div className={styles.difficultyFilters}>
          {difficulties.map((diff) => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              className={`${styles.difficultyButton} ${
                selectedDifficulty === diff ? styles.active : ''
              }`}
              aria-pressed={selectedDifficulty === diff}
            >
              {diff.charAt(0).toUpperCase() + diff.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {filteredGames.length === 0 ? (
        <div className={styles.noResults}>
          <p>No games found matching your search criteria.</p>
          <Button variant="ghost" onClick={() => setSearchQuery('')}>
            Clear Search
          </Button>
        </div>
      ) : (
        <div className={styles.gameGrid}>
          {filteredGames.map((game) => (
            <Link
              key={game.id}
              to={`/game/${game.id}`}
              className={styles.gameCard}
            >
              <div className={styles.gameCardHeader}>
                <h3 className={styles.gameTitle}>{game.title}</h3>
                <span
                  className={`${styles.difficulty} ${
                    styles[`difficulty-${game.difficulty}`]
                  }`}
                >
                  {game.difficulty}
                </span>
              </div>

              <div className={styles.gameOpening}>{game.opening}</div>

              <p className={styles.gameDescription}>{game.description}</p>

              <div className={styles.gameTags}>
                {game.tags.map((tag) => (
                  <span key={tag} className={styles.tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className={styles.footer}>
        <p className={styles.footerText}>
          {filteredGames.length}{' '}
          {filteredGames.length === 1 ? 'game' : 'games'} available
        </p>
      </div>
    </div>
  );
}
