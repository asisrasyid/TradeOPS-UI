import { useQuery, useMutation } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useState } from 'react'
import { Play, FlaskConical } from 'lucide-react'

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    completed: { cls: 'badge--buy',     label: 'Completed' },
    failed:    { cls: 'badge--sell',    label: 'Failed' },
    running:   { cls: 'badge--warn',    label: 'Running' },
    queued:    { cls: 'badge--accent',  label: 'Queued' },
  }
  const { cls = 'badge--neutral', label = status } = map[status] ?? {}
  return <span className={`badge ${cls}`}>{label}</span>
}

export default function Backtest() {
  const [theoryId,   setTheoryId]   = useState('')
  const [instrument, setInstrument] = useState('XAUUSD')
  const [timeframe,  setTimeframe]  = useState('H1')
  const [dateFrom,   setDateFrom]   = useState('2024-01-01')
  const [dateTo,     setDateTo]     = useState('2025-01-01')

  const { data: theories = [] } = useQuery({ queryKey: ['theories'], queryFn: api.listTheories })
  const { data: sessions = [] } = useQuery({ queryKey: ['bt-sessions'], queryFn: () => api.listSessions() })

  const run = useMutation({
    mutationFn: () => api.runBacktest({ theoryId, instrument, timeframe, dateFrom: new Date(dateFrom), dateTo: new Date(dateTo) }),
  })

  return (
    <div className="page-container">
      <div className="page-topbar">
        <h1 className="page-heading">Backtest</h1>
      </div>

      {/* Run form */}
      <div className="card">
        <div className="section-title">Queue New Backtest</div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '12px',
            alignItems: 'end',
          }}
        >
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label">Theory</label>
            <select className="form-input" value={theoryId} onChange={e => setTheoryId(e.target.value)}>
              <option value="">Select theory…</option>
              {theories.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Instrument</label>
            <select className="form-input" value={instrument} onChange={e => setInstrument(e.target.value)}>
              {['XAUUSD', 'EURUSD', 'GBPUSD', 'NAS100'].map(i => <option key={i}>{i}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Timeframe</label>
            <select className="form-input" value={timeframe} onChange={e => setTimeframe(e.target.value)}>
              {['M5', 'M15', 'H1', 'H4', 'D1'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Date From</label>
            <input type="date" className="form-input" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Date To</label>
            <input type="date" className="form-input" value={dateTo} onChange={e => setDateTo(e.target.value)} />
          </div>
          <div className="form-group" style={{ justifyContent: 'flex-end' }}>
            <button
              className="btn-primary"
              disabled={!theoryId || run.isPending}
              onClick={() => run.mutate()}
              style={{ width: '100%' }}
            >
              {run.isPending
                ? <><span className="spinner spinner--sm" style={{ borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} /> Queuing…</>
                : <><Play size={13} /> Run Backtest</>
              }
            </button>
          </div>
        </div>

        {run.isSuccess && (
          <div className="alert-success" style={{ marginTop: '12px' }}>
            Queued successfully · Job ID: <span className="mono font-semibold">{run.data}</span>
          </div>
        )}
        {run.isError && (
          <div className="alert-error" style={{ marginTop: '12px' }}>
            {(run.error as Error).message}
          </div>
        )}
      </div>

      {/* Sessions table */}
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">Theory ID</th>
              <th scope="col">Instrument</th>
              <th scope="col">Timeframe</th>
              <th scope="col">Status</th>
              <th scope="col">Created</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map(s => (
              <tr key={s.id}>
                <td className="mono" style={{ fontSize: '12px', color: 'var(--accent)' }}>
                  {s.theoryId.slice(0, 8)}…
                </td>
                <td className="mono" style={{ fontWeight: 600 }}>{s.instrument}</td>
                <td className="mono" style={{ color: 'var(--text-muted)' }}>{s.timeframe}</td>
                <td><StatusBadge status={s.status} /></td>
                <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {new Date(s.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
            {sessions.length === 0 && (
              <tr>
                <td colSpan={5}>
                  <div className="empty-state">
                    <FlaskConical size={32} style={{ color: 'var(--text-faint)', opacity: 0.5 }} aria-hidden="true" />
                    <div style={{ fontWeight: 600, color: 'var(--text-muted)' }}>No backtest sessions yet</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-faint)' }}>
                      Configure parameters above and click Run Backtest.
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
