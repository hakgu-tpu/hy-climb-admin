const defaultMeeting = {
  active: false,
  centerId: '',
  date: '',
  time: '',
}

const inputClass = 'w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm'
const labelClass = 'block text-xs font-medium text-zinc-500 mb-1'

const MeetingFields = ({ value, onChange, centers }) => {
  const meeting = { ...defaultMeeting, ...value }
  const set = (key) => (e) => onChange({ ...meeting, [key]: e.target.value })
  const setChecked = (key) => (e) => onChange({ ...meeting, [key]: e.target.checked })

  return (
    <div className="border border-zinc-200 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-zinc-900">Regular meeting banner</p>
        <label className="flex items-center gap-2 text-sm text-zinc-700">
          <input type="checkbox" checked={meeting.active} onChange={setChecked('active')} />
          Active
        </label>
      </div>

      <div>
        <label className={labelClass}>Center</label>
        <select value={meeting.centerId} onChange={set('centerId')} className={inputClass}>
          <option value="">(unset — shows "venue TBD")</option>
          {centers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.id})
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Date</label>
          <input type="date" value={meeting.date} onChange={set('date')} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Time</label>
          <input type="time" value={meeting.time} onChange={set('time')} className={inputClass} />
        </div>
      </div>
    </div>
  )
}

export default MeetingFields
