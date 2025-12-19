import { Link } from 'react-router-dom';
import styles from './Header.module.css';

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoIcon}>♔</span>
          <span className={styles.logoText}>Boardside</span>
        </Link>
        <nav className={styles.nav} aria-label="Main navigation">
          <Link to="/" className={styles.navLink}>
            Games
          </Link>
          <Link to="/quiz" className={styles.navLink}>
            Quiz
          </Link>
          <Link to="/settings" className={styles.navLink}>
            Settings
          </Link>
        </nav>
      </div>
    </header>
  );
}
