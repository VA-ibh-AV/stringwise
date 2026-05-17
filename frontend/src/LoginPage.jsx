import { useState } from 'react'
import { supabase } from './supabase'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function signIn(role) {
    setLoading(true)
    setError('')
    sessionStorage.setItem('sw_intended_role', role)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-mark">
          <div className="login-mark-icon"><StringsIcon /></div>
          <span className="login-mark-name">StringWise</span>
        </div>

        <div className="login-hero-block">
          <h1 className="login-hero">Your digital<br/><em>teaching studio.</em></h1>
          <p className="login-hero-sub">
            Tab editor, lesson plans, student tracking —<br/>
            everything a guitar teacher needs in one place.
          </p>
        </div>

        <div className="login-features">
          <div className="login-feature"><CheckIcon /> Tab editor for every lesson</div>
          <div className="login-feature"><CheckIcon /> Batch &amp; student management</div>
          <div className="login-feature"><CheckIcon /> Audio &amp; YouTube integration</div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">
          <div className="login-card-mark">
            <div className="login-mark-icon login-mark-icon--sm"><StringsIcon size={14} /></div>
            <span className="login-mark-name" style={{ fontSize: 15 }}>StringWise</span>
          </div>

          <h2 className="login-headline">Welcome back</h2>
          <p className="login-sub">Sign in with your Google account</p>

          <button className="btn-google" onClick={() => signIn('teacher')} disabled={loading}>
            <GoogleIcon />
            {loading ? 'Redirecting…' : 'Continue as Teacher'}
          </button>

          <button className="btn-google btn-google--student" onClick={() => signIn('student')} disabled={loading} style={{ marginTop: 10 }}>
            <GoogleIcon />
            {loading ? 'Redirecting…' : 'Continue as Student'}
          </button>

          {error && <p className="login-error">{error}</p>}

          <div className="login-footer">
            Sign in with the Google account registered with your teacher.
          </div>
        </div>
      </div>
    </div>
  )
}

function StringsIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <line x1="2" y1="4"  x2="14" y2="4"  stroke="#0a0a0a" strokeWidth="1"   />
      <line x1="2" y1="7"  x2="14" y2="7"  stroke="#0a0a0a" strokeWidth="1.4" />
      <line x1="2" y1="10" x2="14" y2="10" stroke="#0a0a0a" strokeWidth="1.8" />
      <line x1="2" y1="13" x2="14" y2="13" stroke="#0a0a0a" strokeWidth="2.2" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
    </svg>
  )
}
