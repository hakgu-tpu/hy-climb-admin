const TYPES = ['instagram', 'blog', 'youtube', 'website']

const SnsLinksEditor = ({ items, onChange }) => {
  const update = (i, key, value) => {
    const next = items.slice()
    next[i] = { ...next[i], [key]: value }
    onChange(next)
  }
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i))
  const add = () => onChange([...items, { type: 'instagram', url: '' }])

  return (
    <div>
      <p className="text-xs font-medium text-zinc-500 mb-1">SNS links</p>
      <div className="space-y-2">
        {items.map((row, i) => (
          <div key={i} className="flex gap-2 items-start">
            <select
              value={row.type}
              onChange={(e) => update(i, 'type', e.target.value)}
              className="border border-zinc-300 rounded-lg px-2 py-1.5 text-xs"
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <input
              value={row.url}
              onChange={(e) => update(i, 'url', e.target.value)}
              placeholder="https://..."
              className="flex-1 border border-zinc-300 rounded-lg px-2 py-1.5 text-xs"
            />
            <button type="button" onClick={() => remove(i)} className="text-red-500 text-xs px-1">
              ✕
            </button>
          </div>
        ))}
      </div>
      <button type="button" onClick={add} className="mt-2 text-xs text-zinc-600 underline">
        + add link
      </button>
    </div>
  )
}

export default SnsLinksEditor
