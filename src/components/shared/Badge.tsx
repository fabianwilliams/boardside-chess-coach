import { HTMLAttributes } from 'react';
import styles from './Badge.module.css';

export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

export function Badge({
  variant = 'default',
  children,
  className = '',
  ...rest
}: BadgeProps) {
  const classNames = [styles.badge, styles[variant], className]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classNames} {...rest}>
      {children}
    </span>
  );
}

/**
 * Archetype-specific badge component
 * Maps chess learning archetypes to badge variants
 */
export interface ArchetypeBadgeProps extends Omit<BadgeProps, 'variant' | 'children'> {
  archetype: 'TJ' | 'TP' | 'FJ' | 'FP' | 'Neutral';
  children?: React.ReactNode;
}

export function ArchetypeBadge({
  archetype,
  children,
  ...rest
}: ArchetypeBadgeProps) {
  const variantMap: Record<ArchetypeBadgeProps['archetype'], BadgeVariant> = {
    TJ: 'primary',
    TP: 'info',
    FJ: 'success',
    FP: 'secondary',
    Neutral: 'default',
  };

  const labelMap: Record<ArchetypeBadgeProps['archetype'], string> = {
    TJ: 'Thinking-Judging',
    TP: 'Thinking-Perceiving',
    FJ: 'Feeling-Judging',
    FP: 'Feeling-Perceiving',
    Neutral: 'Neutral',
  };

  return (
    <Badge variant={variantMap[archetype]} {...rest}>
      {children || labelMap[archetype]}
    </Badge>
  );
}
