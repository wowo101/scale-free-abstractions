import { Link } from 'react-router-dom';

export default function BackButton({ to = "/", title = "Back to Gallery" }) {
  return (
    <Link
      to={to}
      className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-slate-100 hover:bg-white/10 transition-colors"
      title={title}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
    </Link>
  );
}
