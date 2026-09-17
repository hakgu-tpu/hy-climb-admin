import { useEffect, useState } from 'react'

const JsonField = ({ label, value, onChange, placeholder }) => {
  const [text, setText] = useState(() => (value == null ? '' : JSON.stringify(value, null, 2)))
  const [error, setError] = useState(null)

  useEffect(() => {
    setText(value == null ? '' : JSON.stringify(value, null, 2))
  }, [value])

  const handleBlur = () => {
    if (text.trim() === '') {
      setError(null)
      onChange(null)
      return
    }
    try {
      onChange(JSON.parse(text))
      setError(null)
    } catch (err) {
      setError(`Invalid JSON: ${err.message}`)
    }
  }

  return (
    <div>
      <label className="block text-xs font-medium text-zinc-500 mb-1">{label}</label>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleBlur}
        placeholder={placeholder}
        rows={5}
        className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-xs font-mono"
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

export default JsonField
