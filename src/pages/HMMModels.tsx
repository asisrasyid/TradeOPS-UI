import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useState } from 'react'
import { Cpu, BarChart2 } from 'lucide-react'

export default function HMMModels() {
  const qc = useQueryClient()
  const [instrument, setInstrument] = useState('XAUUSD')
  const [timeframe,  setTimeframe]  = useState('H1')
  const [dateFrom,   setDateFrom]   = useState('2024-01-01')
  const [dateTo,     setDateTo]     = useState('2025-01-01')

  const { data: models = [], isLoading } = useQuery({
    queryKey: ['hmm-models'],
    queryFn: api.listHmmModels,
  })

  const train = useMutation({
    mutationFn: () => api.trainHmm({
      instrument, timeframe,
      dateFrom: new Date(dateFrom),
      dateTo: new Date(dateTo),
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hmm-models'] }),
  })

  return (
    <div className="page-container">
      <div className="page-topbar">
        <h1 className="page-heading">HMM Models</h1>
        {models.length > 0 && (
          <span className="badge badge--neutral">
            {models.length} model{models.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Train form */}
      <div className="card">
        <div className="section-title">Train New Model</div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '12px',
            alignItems: 'end',
          }}
        >
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
              disabled={train.isPending}
              onClick={() => train.mutate()}
              style={{ width: '100%' }}
            >
              {train.isPending
                ? <><span className="spinner spinner--sm" style={{ borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} /> Queuing…</>
                : <><Cpu size={13} /> Train Model</>
              }
            </button>
          </div>
        </div>

        {train.isSuccess && (
          <div className="alert-success" style={{ marginTop: '12px' }}>
            Training job queued · <span className="mono font-semibold">{train.data}</span>
          </div>
        )}

        <div style={{ marginTop: '10px', fontSize: '12px', color: 'var(--text-faint)', lineHeight: 1.6 }}>
          BIC-based K selection (K = 4–8). Training runs as background job via Hangfire.
        </div>
      </div>

      {/* Models table */}
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">Version</th>
              <th scope="col">Instrument</th>
              <th scope="col">TF</th>
              <th scope="col">K States</th>
              <th scope="col">BIC Score</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} style={{ padding: '12px 14px' }}>
                      <div className="skeleton" style={{ height: '13px', width: j === 0 ? '80px' : '60px' }} />
                    </td>
                  ))}
                </tr>
              ))
            )}
            {!isLoading && models.map(m => (
              <tr key={m.id}>
                <td className="mono" style={{ color: 'var(--accent)', fontWeight: 700 }}>{m.version}</td>
                <td className="mono" style={{ fontWeight: 600 }}>{m.instrument}</td>
                <td className="mono" style={{ color: 'var(--text-muted)' }}>{m.timeframe}</td>
                <td className="mono" style={{ fontWeight: 600 }}>{m.nStates}</td>
                <td className="mono" style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                  {m.bicScore?.toFixed(2) ?? '—'}
                </td>
                <td>
                  <span className={`badge ${m.isActive ? 'badge--buy' : 'badge--neutral'}`}>
                    {m.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
            {!isLoading && models.length === 0 && (
              <tr>
                <td colSpan={6}>
                  <div className="empty-state">
                    <BarChart2 size={32} style={{ color: 'var(--text-faint)', opacity: 0.5 }} aria-hidden="true" />
                    <div style={{ fontWeight: 600, color: 'var(--text-muted)' }}>No trained models yet</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-faint)' }}>
                      Configure parameters above and click Train Model.
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
