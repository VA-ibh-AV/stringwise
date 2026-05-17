import { supabase } from './supabase'

const BASE = import.meta.env.VITE_API_URL || ''

async function req(path, opts = {}) {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token
  const res = await fetch(`${BASE}/api/v1${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...opts,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `HTTP ${res.status}`)
  }
  if (res.status === 204) return null
  return res.json()
}

export const api = {
  me: () => req('/auth/me', { method: 'POST' }),
  register: (role) => req('/auth/register', { method: 'POST', body: JSON.stringify({ role }) }),

  getBatches: () => req('/batches'),
  createBatch: (data) => req('/batches', { method: 'POST', body: JSON.stringify(data) }),
  updateBatch: (id, data) => req(`/batches/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteBatch: (id) => req(`/batches/${id}`, { method: 'DELETE' }),

  getStudents: () => req('/students'),
  createStudent: (data) => req('/students', { method: 'POST', body: JSON.stringify(data) }),
  updateStudent: (id, data) => req(`/students/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteStudent: (id) => req(`/students/${id}`, { method: 'DELETE' }),

  getLessons: () => req('/lessons'),
  getLesson: (id) => req(`/lessons/${id}`),
  createLesson: (data) => req('/lessons', { method: 'POST', body: JSON.stringify(data) }),
  updateLesson: (id, data) => req(`/lessons/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteLesson: (id) => req(`/lessons/${id}`, { method: 'DELETE' }),

  getStudentMe:       () => req('/students/me'),
  getPracticeSongs:   () => req('/practice'),
  getPracticeSong:    (id) => req(`/practice/${id}`),
  createPracticeSong: (body) => req('/practice', { method: 'POST', body: JSON.stringify(body) }),
  updatePracticeSong: (id, body) => req(`/practice/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deletePracticeSong: (id) => req(`/practice/${id}`, { method: 'DELETE' }),
  presignAudio: (data) => req('/audio/presign', { method: 'POST', body: JSON.stringify(data) }),
  deleteAudio: (id) => req(`/audio/${id}`, { method: 'DELETE' }),
  uploadAudio: async (measureId, blob, fileName) => {
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token
    const form = new FormData()
    form.append('measure_id', measureId)
    form.append('file', blob, fileName)
    const res = await fetch(`${BASE}/api/v1/audio/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.error || `HTTP ${res.status}`)
    }
    return res.json()
  },
}
