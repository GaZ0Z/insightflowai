export interface ProgressProps {
  value?: number;
  className?: string;
}

export const Progress = ({ value = 0, className = '' }: ProgressProps) => {
  const percentage = Math.min(Math.max(value, 0), 100);

  return (
    <div className={`relative h-2 w-full overflow-hidden rounded-full bg-slate-800 ${className}`}>
      <div
        className="h-full w-full flex-1 bg-brand transition-all duration-300 ease-in-out"
        style={{ transform: `translateX(-${100 - percentage}%)` }}
      />
    </div>
  );
};
