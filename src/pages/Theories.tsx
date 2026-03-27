import { useQuery } from '@tanstack/react-query'
import { api, type Theory } from '../lib/api'
import { Link } from 'react-router-dom'
import { Plus, ClipboardList } from 'lucide-react'

function TheoryRow({ t }: { t: Theory }) {
  const dirColor =
    t.direction === 'LONG'  ? 'var(--buy)'     :
    t.direction === 'SHORT' ? 'var(--sell)'    : 'var(--warning)'

  const dirBg =
    t.direction === 'LONG'  ? 'var(--buy-bg)'  :
    t.direction === 'SHORT' ? 'var(--sell-bg)' : 'var(--warn-bg)'

  return (
    <Link
      to={`/theories/${t.id}`}
      className="card-sm theory-card-link"
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      {/* Left: name + meta */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
        {/* Active indicator */}
        <span
          className={t.isActive ? 'dot dot--live' : 'dot dot--muted'}
          title={t.isActive ? 'Active' : 'Inactive'}
        />
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontWeight: 600,
              color: 'var(--text)',
              fontSize: '14px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {t.name}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
            {t.instrument} · v{t.version}
          </div>
        </div>
      </div>

      {/* Right: direction badge + stats */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        <span
          className="badge"
          style={{ background: dirBg, color: dirColor, border: `1px solid ${dirColor}30` }}
        >
          {t.direction}
        </span>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Threshold
            </div>
            <div className="mono" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>
              {t.threshold}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Min P
            </div>
            <div className="mono" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent)' }}>
              {t.minConfidence}%
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

function SkeletonRow() {
  return (
    <div
      className="card-sm"
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pointerEvents: 'none' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div className="skeleton" style={{ width: 8, height: 8, borderRadius: '50%' }} />
        <div>
          <div className="skeleton" style={{ width: '180px', height: '14px', marginBottom: '6px' }} />
          <div className="skeleton" style={{ width: '100px', height: '11px' }} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <div className="skeleton" style={{ width: '60px', height: '22px', borderRadius: '999px' }} />
        <div className="skeleton" style={{ width: '80px', height: '34px' }} />
      </div>
    </div>
  )
}

export default function Theories() {
  const { data: theories = [], isLoading } = useQuery({
    queryKey: ['theories'],
    queryFn: api.listTheories,
  })

  return (
    <div className="page-container">
      {/* Top bar */}
      <div className="page-topbar">
        <h1 className="page-heading">Theories</h1>
        <Link to="/builder" className="btn-primary">
          <Plus size={15} aria-hidden="true" /> New Theory
        </Link>
      </div>

      {/* Loading state — skeleton */}
      {isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)}
        </div>
      )}

      {/* Theory list */}
      {!isLoading && theories.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {theories.map(t => <TheoryRow key={t.id} t={t} />)}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && theories.length === 0 && (
        <div className="empty-state">
          <ClipboardList
            size={40}
            style={{ color: 'var(--text-faint)', opacity: 0.5 }}
            aria-hidden="true"
          />
          <div style={{ fontWeight: 600, color: 'var(--text-muted)' }}>
            No theories yet
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-faint)' }}>
            Create your first trading theory to get started.
          </div>
          <Link to="/builder" className="btn-primary" style={{ marginTop: '8px' }}>
            <Plus size={15} /> Create Theory
          </Link>
        </div>
      )}
    </div>
  )
}
