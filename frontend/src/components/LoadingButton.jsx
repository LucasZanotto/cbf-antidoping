import Spinner from './Spinner';
import './loadingButton.css';

export default function LoadingButton({ loading, children, className = '', ...props }) {
  return (
    <button className={`btn ${className} ${loading ? 'is-loading' : ''}`} disabled={loading || props.disabled} {...props}>
      {loading && <Spinner size={14} />} 
      <span className="btn-label">{children}</span>
    </button>
  );
}
