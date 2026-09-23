// Silueta de rostro con ojos y una montura insinuada.
interface FaceShapeIconProps {
  path: string;
  size?: number;
  /** Color de la silueta y los rasgos */
  stroke?: string;
  fill?: string;
  className?: string;
}

const FaceShapeIcon = ({
  path,
  size = 64,
  stroke = 'currentColor',
  fill = 'none',
  className,
}: FaceShapeIconProps) => (
  <svg viewBox="0 0 100 100" width={size} height={size} className={className} aria-hidden="true">
    <path d={path} fill={fill} stroke={stroke} strokeWidth="2.2" strokeLinejoin="round" />
    {/* Montura */}
    <circle cx="37" cy="46" r="8" fill="none" stroke={stroke} strokeWidth="1.6" opacity="0.8" />
    <circle cx="63" cy="46" r="8" fill="none" stroke={stroke} strokeWidth="1.6" opacity="0.8" />
    <path d="M45 45 Q50 42 55 45" fill="none" stroke={stroke} strokeWidth="1.6" opacity="0.8" />
    {/* Boca */}
    <path d="M43 70 Q50 74 57 70" fill="none" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" opacity="0.6" />
  </svg>
);

export default FaceShapeIcon;
