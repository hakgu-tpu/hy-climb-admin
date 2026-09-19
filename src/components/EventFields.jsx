const defaultEvent = {
  active: false,
  title: '',
  titleEn: '',
  description: '',
  descriptionEn: '',
  date: '',
  endDate: '',
  linkUrl: '',
  linkLabel: '',
  linkLabelEn: '',
}

const inputClass = 'w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm'
const labelClass = 'block text-xs font-medium text-zinc-500 mb-1'

const EventFields = ({ value, onChange }) => {
  const event = { ...defaultEvent, ...value }
  const set = (key) => (e) => onChange({ ...event, [key]: e.target.value })
  const setChecked = (key) => (e) => onChange({ ...event, [key]: e.target.checked })

  return (
    <div className="border border-zinc-200 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-zinc-900">Event banner</p>
        <label className="flex items-center gap-2 text-sm text-zinc-700">
          <input type="checkbox" checked={event.active} onChange={setChecked('active')} />
          Active
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Title</label>
          <input value={event.title} onChange={set('title')} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Title (EN)</label>
          <input value={event.titleEn} onChange={set('titleEn')} className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Description</label>
          <textarea value={event.description} onChange={set('description')} rows={3} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Description (EN)</label>
          <textarea value={event.descriptionEn} onChange={set('descriptionEn')} rows={3} className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Date</label>
          <input type="date" value={event.date} onChange={set('date')} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>End date</label>
          <input type="date" value={event.endDate} onChange={set('endDate')} className={inputClass} />
        </div>
      </div>

      <div>
        <label className={labelClass}>Link URL</label>
        <input value={event.linkUrl} onChange={set('linkUrl')} className={inputClass} placeholder="https://..." />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Link label</label>
          <input value={event.linkLabel} onChange={set('linkLabel')} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Link label (EN)</label>
          <input value={event.linkLabelEn} onChange={set('linkLabelEn')} className={inputClass} />
        </div>
      </div>

      <p className="text-[11px] text-zinc-400">
        The link button only shows when the banner is expanded, a description is set, and Link URL
        is set.
      </p>
    </div>
  )
}

export default EventFields
