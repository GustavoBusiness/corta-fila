import { useTheme } from '@/contexts/ThemeContext';

import logoLight from '@/assets/logo-light.png';
import logoDark from '@/assets/logo-dark.png';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Logo = ({ className = '', size = 'md' }: LogoProps) => {
  const { theme } = useTheme(); // pega o tema atualizado

  const sizes = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-14'
  };

  const imgSrc = theme === 'dark' ? logoLight : logoDark;

  return (
    <img
      src={imgSrc}
      alt="Corta Fila"
      className={`${sizes[size]} w-auto object-contain ${className}`}
    />
  );
};

export default Logo;
