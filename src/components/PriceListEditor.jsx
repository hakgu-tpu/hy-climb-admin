const emptyRow = { name: '', name_en: '', price: '' }

const PriceListEditor = ({ label, items, onChange }) => {
  const update = (i, key, value) => {
    const next = items.slice()
    next[i] = { ...next[i], [key]: value }
    onChange(next)
  }
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i))
  const add = () => onChange([...items, { ...emptyRow }])

  return (
    <div>
      <p className="text-xs font-medium text-zinc-500 mb-1">{label}</p>
      <div className="space-y-2">
        {items.map((row, i) => (
          <div key={i} className="flex gap-2 items-start">
            <input
              value={row.name}
              onChange={(e) => update(i, 'name', e.target.value)}
              placeholder="Name"
              className="flex-1 border border-zinc-300 rounded-lg px-2 py-1.5 text-xs"
            />
            <input
              value={row.name_en}
              onChange={(e) => update(i, 'name_en', e.target.value)}
              placeholder="Name (EN)"
              className="flex-1 border border-zinc-300 rounded-lg px-2 py-1.5 text-xs"
            />
            <input
              type="number"
              value={row.price}
              onChange={(e) => update(i, 'price', e.target.value)}
              placeholder="Price"
              className="w-24 border border-zinc-300 rounded-lg px-2 py-1.5 text-xs"
            />
            <button type="button" onClick={() => remove(i)} className="text-red-500 text-xs px-1">
              ✕
            </button>
          </div>
        ))}
      </div>
      <button type="button" onClick={add} className="mt-2 text-xs text-zinc-600 underline">
        + add row
      </button>
    </div>
  )
}

export default PriceListEditor
