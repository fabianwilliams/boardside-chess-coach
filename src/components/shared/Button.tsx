import { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  fullWidth?: boolean;
  isLoading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'medium',
  children,
  fullWidth = false,
  isLoading = false,
  disabled,
  className = '',
  ...rest
}: ButtonProps) {
  const classNames = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth ? styles.fullWidth : '',
    isLoading ? styles.loading : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      className={classNames}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading && (
        <span className={styles.spinner} aria-hidden="true">
          ⏳
        </span>
      )}
      <span className={isLoading ? styles.loadingText : ''}>{children}</span>
    </button>
  );
}
