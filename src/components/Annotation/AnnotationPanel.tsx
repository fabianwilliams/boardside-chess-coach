import { Archetype } from '@domain/quiz/types';
import { EducationalAnnotation } from '@domain/chess/types';
import { adapt } from '@domain/language/languageAdapter';
import styles from './AnnotationPanel.module.css';

export interface AnnotationPanelProps {
  /** Move annotation to display */
  annotation: EducationalAnnotation | null;
  /** User's learning archetype for language adaptation */
  archetype: Archetype | null;
  /** Optional CSS class name */
  className?: string;
}

/**
 * Get principle badge color based on principle ID
 */
function getPrincipleBadgeColor(principleId: string): string {
  // Map common principle patterns to colors
  if (principleId.includes('king') || principleId.includes('safety')) {
    return 'error'; // Red for king safety
  }
  if (principleId.includes('development') || principleId.includes('tempo')) {
    return 'warning'; // Orange for development
  }
  if (principleId.includes('center') || principleId.includes('control')) {
    return 'primary'; // Blue for center control
  }
  if (principleId.includes('tactics') || principleId.includes('threat')) {
    return 'success'; // Green for tactics
  }
  if (principleId.includes('pawn') || principleId.includes('structure')) {
    return 'secondary'; // Purple for pawn structure
  }
  return 'default'; // Gray for everything else
}

/**
 * AnnotationPanel Component
 * Displays move annotations adapted to user's learning archetype
 */
export function AnnotationPanel({
  annotation,
  archetype,
  className = '',
}: AnnotationPanelProps) {
  if (!annotation) {
    return (
      <div className={`${styles.container} ${className}`}>
        <p className={styles.emptyState}>
          Click on a move to see its annotation
        </p>
      </div>
    );
  }

  // Adapt annotation text to user's archetype
  const adaptedText = archetype
    ? adapt(annotation.text, archetype)
    : annotation.text;

  const badgeColor = getPrincipleBadgeColor(annotation.principleId);

  return (
    <div className={`${styles.container} ${className}`}>
      {/* Principle Badge */}
      <div className={`${styles.principleBadge} ${styles[`badge-${badgeColor}`]}`}>
        <span className={styles.badgeIcon}>•</span>
        <span className={styles.badgeName}>{annotation.principle}</span>
      </div>

      {/* Annotation Text */}
      <div className={styles.annotationText}>{adaptedText}</div>

      {/* Optional: Show archetype indicator in dev */}
      {process.env.NODE_ENV === 'development' && archetype && (
        <div className={styles.debugInfo} title={`Adapted for ${archetype}`}>
          <small>Adapted for {archetype}</small>
        </div>
      )}
    </div>
  );
}
