import './spinner.css';

export default function Spinner({ size = 16 }) {
  return <span className="spin" style={{ width: size, height: size }} />;
}
