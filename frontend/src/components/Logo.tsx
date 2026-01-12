export default function Logo({ 
  className = "w-12 h-12", 
  showText = false, 
  textClassName = "text-nubank-text" 
}: { 
  className?: string; 
  showText?: boolean; 
  textClassName?: string;
}) {
  const Icon = (
    <div className={`${className} flex items-center justify-center bg-white rounded-xl`}>
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        className="w-2/3 h-2/3 text-nubank-purple"
      >
        <path d="M20 4H4C2.89 4 2.01 4.89 2.01 6L2 18C2 19.11 2.89 20 4 20H20C21.11 20 22 19.11 22 18V6C22 4.89 21.11 4 20 4ZM20 18H4V12H20V18ZM20 8H4V6H20V8Z" />
      </svg>
    </div>
  );

  if (showText) {
    return (
      <div className="flex items-center gap-3">
        {Icon}
        <span className={`font-bold tracking-tight ${textClassName}`}>BancoCred</span>
      </div>
    );
  }

  return Icon;
}
