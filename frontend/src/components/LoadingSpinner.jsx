// LoadingSpinner.jsx
export function LoadingSpinner({ size = 'md', className = '' }) {
  const s = { sm: 'h-5 w-5 border-2', md: 'h-10 w-10 border-4', lg: 'h-16 w-16 border-4' };
  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div className={`${s[size]} animate-spin rounded-full border-green-100 border-t-green-500`} />
    </div>
  );
}

export default LoadingSpinner;
