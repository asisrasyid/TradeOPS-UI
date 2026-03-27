import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { Plus, Brain, X } from 'lucide-react'

const STATE_COLORS: Record<string, string> = {
  S0: '#10B981', S1: '#EF4444', S2: '#F59E0B',
  S3: '#3B82F6', S4: '#8B5CF6', S5: '#F97316',
}

function StateSeq({ repr }: { repr?: string }) {
  if (!repr) return null
  return (
    <div className="flex gap-1 flex-wrap">
      {repr.match(/S\d/g)?.map((st, i) => (
        <span
          key={i}
          className="state-chip"
          style={{
            background: `${STATE_COLORS[st] ?? '#94a3b8'}22`,
            color: STATE_COLORS[st] ?? '#94a3b8',
          }}
        >
          {st}
        </span>
      ))}
    </div>
  )
}

const STATES = ['0', '1', '2', '3', '4', '5']

export default function Patterns() {
  const qc = useQueryClient()
  const { data: patterns = [], isLoading } = useQuery({
    queryKey: ['patterns'],
    queryFn: api.listPatterns,
  })

  const [showForm, setShowForm] = useState(false)
  const [code,     setCode]     = useState('')
  const [name,     setName]     = useState('')
  const [tf,       setTf]       = useState('H1')
  const [seq,      setSeq]      = useState<string[]>(['0', '3', '4'])

  const addState    = () => setSeq(s => [...s, '0'])
  const removeState = (i: number) => setSeq(s => s.filter((_, idx) => idx !== i))
  const updateState = (i: number, v: string) => setSeq(s => s.map((x, idx) => idx === i ? v : x))
  const seqRepr     = seq.map(s => `S${s}`).join('')

  const createMutation = useMutation({
    mutationFn: () => api.createPattern({
      code,
      name,
      description: null,
      patternType: 'state_sequence',
      timeframe: tf,
      stateSequence: JSON.stringify(seq.map(Number)),
      stateSeqRepr: seqRepr,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['patterns'] })
      setShowForm(false)
      setCode('')
      setName('')
    },
  })

  return (
    <div className="page-container">
      <div className="page-topbar">
        <h1 className="page-heading">HMM Patterns</h1>
        <button
          onClick={() => setShowForm(v => !v)}
          className={showForm ? 'btn-secondary' : 'btn-primary'}
        >
          {showForm ? <><X size={14} /> Cancel</> : <><Plus size={14} /> New Pattern</>}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="card" style={{ animation: 'fade-in 0.15s ease-out' }}>
          <div className="section-title">New Pattern</div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '12px',
              marginBottom: '16px',
            }}
          >
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Code</label>
              <input
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="BnR_BULL_S0S3S4"
                className="form-input mono"
              />
            </div>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Name</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Break and Retest Bullish"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Timeframe</label>
              <select value={tf} onChange={e => setTf(e.target.value)} className="form-input">
                {['M1', 'M5', 'M15', 'H1', 'H4', 'D1'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* State sequence builder */}
          <div className="form-group">
            <label className="form-label">
              State Sequence — Preview:{' '}
              <span className="mono font-semibold" style={{ color: 'var(--accent)' }}>{seqRepr}</span>
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
              {seq.map((s, i) => {
                const key = `S${s}`
                const color = STATE_COLORS[key] ?? '#94a3b8'
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <select
                      value={s}
                      onChange={e => updateState(i, e.target.value)}
                      style={{
                        background: `${color}20`,
                        border: `1px solid ${color}50`,
                        color: color,
                        borderRadius: 'var(--radius-sm)',
                        padding: '4px 8px',
                        fontSize: '12px',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        outline: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {STATES.map(st => (
                        <option key={st} value={st} style={{ background: 'var(--surface)', color: 'var(--text)' }}>
                          S{st}
                        </option>
                      ))}
                    </select>
                    {seq.length > 1 && (
                      <button
                        onClick={() => removeState(i)}
                        className="btn-remove-state"
                        aria-label={`Remove S${s}`}
                      >
                        <X size={11} />
                      </button>
                    )}
                  </div>
                )
              })}
              <button
                onClick={addState}
                className="btn-secondary"
                style={{ height: '30px', padding: '0 12px', fontSize: '12px' }}
              >
                <Plus size={12} /> State
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '16px' }}>
            <button
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending || !code || !name}
              className="btn-primary"
            >
              {createMutation.isPending
                ? <><span className="spinner spinner--sm" style={{ borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} /> Saving…</>
                : 'Create Pattern'
              }
            </button>
            {createMutation.isError && (
              <span className="alert-error" style={{ padding: '4px 10px', fontSize: '12px' }}>
                {String(createMutation.error)}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Patterns table */}
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">Code</th>
              <th scope="col">Name</th>
              <th scope="col">Type</th>
              <th scope="col">Timeframe</th>
              <th scope="col">Sequence</th>
              <th scope="col">Source</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} style={{ padding: '12px 14px' }}>
                      <div className="skeleton" style={{ height: '13px', width: j === 0 ? '120px' : '80px' }} />
                    </td>
                  ))}
                </tr>
              ))
            )}
            {!isLoading && patterns.map(p => (
              <tr key={p.id}>
                <td className="mono" style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '12px' }}>
                  {p.code}
                </td>
                <td style={{ fontWeight: 500 }}>{p.name}</td>
                <td>
                  <span className="tag">{p.patternType}</span>
                </td>
                <td className="mono" style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                  {p.timeframe}
                </td>
                <td><StateSeq repr={p.stateSeqRepr} /></td>
                <td style={{ fontSize: '12px', color: 'var(--text-faint)' }}>{p.source}</td>
              </tr>
            ))}
            {!isLoading && patterns.length === 0 && (
              <tr>
                <td colSpan={6}>
                  <div className="empty-state">
                    <Brain size={32} style={{ color: 'var(--text-faint)', opacity: 0.5 }} aria-hidden="true" />
                    <div style={{ fontWeight: 600, color: 'var(--text-muted)' }}>No patterns yet</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-faint)' }}>
                      Create your first HMM state pattern above.
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
