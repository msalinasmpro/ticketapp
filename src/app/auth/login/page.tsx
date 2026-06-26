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
      <div className="w-full max-w-[360px]">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
            <svg className="h-5 w-5 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Bienvenido de vuelta
          </h1>
          <p className="mt-1 text-sm text-light">
            Inicia sesión para continuar
          </p>
        </div>

        <div className="rounded-lg bg-surface border border-border p-6">
          {error && (
            <div className="mb-5 rounded-md bg-red-light border border-red/20 px-3 py-2.5 text-sm text-red">
              {error}
            </div>
          )}

          <div className="space-y-2 mb-5">
            <button
              onClick={() => signIn('google', { callbackUrl: '/' })}
              type="button"
              className="w-full flex items-center justify-center gap-3 rounded-md border border-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground hover:bg-surface-hover active:scale-[0.97] transition-all duration-150"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continuar con Google
            </button>

            <button
              onClick={() => signIn('azure-ad', { callbackUrl: '/' })}
              type="button"
              className="w-full flex items-center justify-center gap-3 rounded-md border border-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground hover:bg-surface-hover active:scale-[0.97] transition-all duration-150"
            >
              <svg className="h-4 w-4" viewBox="0 0 23 23">
                <path fill="#f35325" d="M1 1h10v10H1z"/>
                <path fill="#81bc06" d="M12 1h10v10H12z"/>
                <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                <path fill="#ffba08" d="M12 12h10v10H12z"/>
              </svg>
              Continuar con Microsoft
            </button>
          </div>

          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-surface px-2.5 text-light">o ingresa con tu email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-muted mb-1.5">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="tu@email.com"
                className="block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-light focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-150"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-muted mb-1.5">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-light focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-150"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-black hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent/30 focus:ring-offset-2 focus:ring-offset-surface disabled:opacity-50 active:scale-[0.97] transition-all duration-150"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Ingresando...
                </span>
              ) : 'Ingresar'}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-light">
          ¿No tienes cuenta?{' '}
          <Link href="/auth/register" className="font-medium text-accent hover:text-accent-hover transition-colors">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  )
}
