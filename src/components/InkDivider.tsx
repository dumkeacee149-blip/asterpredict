export default function InkDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center py-4 ${className}`}>
      <svg viewBox="0 0 800 20" className="w-full max-w-2xl h-5 opacity-30" preserveAspectRatio="none">
        <path
          d="M0 10 Q100 2, 200 10 T400 10 T600 10 T800 10"
          stroke="url(#inkGrad)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="inkGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="30%" stopColor="#c9a85c" />
            <stop offset="50%" stopColor="#c9a85c" />
            <stop offset="70%" stopColor="#c9a85c" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
