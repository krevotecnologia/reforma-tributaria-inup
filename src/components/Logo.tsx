interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Logo = ({ className = '', size = 'md' }: LogoProps) => {
  const sizes = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-14',
  };

  return (
    <img
      src="/logo-inup.png"
      alt="Inup Contabilidade"
      className={`${sizes[size]} w-auto object-contain ${className}`}
    />
  );
};

export default Logo;
