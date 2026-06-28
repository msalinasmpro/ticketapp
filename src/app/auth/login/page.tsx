'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const formData = new FormData(e.currentTarget)

    const result = await signIn('credentials', {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError('Email o contraseña inválidos')
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-[400px]">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-xl bg-accent flex items-center justify-center">
            <svg className="h-6 w-6 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 18v-6a9 9 0 0118 0v6" />
              <path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z" />
            </svg>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
            Bienvenido al sistema de soporte TECNODIOR/ISINET
          </h1>
          <p className="mt-1.5 text-sm text-light">
            Inicia sesión o regístrate para acceder al portal
          </p>
        </div>

        <div className="rounded-xl bg-surface border border-border p-6 sm:p-8 shadow-sm">
          {error && (
            <div className="mb-6 rounded-md bg-red-light border border-red/20 p-4 text-sm text-red">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="tu@email.com"
                className="block w-full rounded-md border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-light focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="block w-full rounded-md border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-light focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-foreground px-4 py-3 text-sm font-medium text-background hover:bg-foreground/90 focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 disabled:opacity-50 transition-all duration-200"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Ingresando...
                </span>
              ) : 'Ingresar'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-light">
          ¿No tienes cuenta?{' '}
          <Link href="/auth/register" className="font-medium text-accent hover:text-accent-hover transition-colors duration-200">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  )
}
