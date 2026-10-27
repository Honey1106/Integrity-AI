import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <div className="state-empty" style={{ minHeight: '100vh' }}>
      <div className="state-empty__icon">🔍</div>
      <h1 className="state-empty__title">Page not found</h1>
      <p>The page you are looking for does not exist.</p>
      <Link to="/" className="btn btn--primary">Go to home</Link>
    </div>
  )
}
