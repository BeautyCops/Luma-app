import { SparkleFilled } from "./icons";

export const Logo = ({ size = 28, className = "" }: { size?: number; className?: string }) => (
  <div className={`inline-flex items-center gap-1.5 ${className}`} aria-label="Lumen">
    <span className="font-display leading-none" style={{ fontSize: size }}>
      Lumen
    </span>
    <SparkleFilled className="text-gold" style={{ width: size * 0.45, height: size * 0.45 }} />
  </div>
);
