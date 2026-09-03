export function SetupScreen() {
  return (
    <div className="flex min-h-svh items-center justify-center px-4">
      <div className="max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <p className="text-sm font-medium text-emerald-400">SemDP</p>
        <h1 className="mt-2 text-2xl font-semibold text-zinc-50">Falta configurar o Firebase</h1>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-zinc-300">
          <li>Crie um projeto em firebase.google.com</li>
          <li>Ative Authentication e Firestore Database</li>
          <li>
            Copie <code className="text-emerald-300">.env.example</code> para{' '}
            <code className="text-emerald-300">.env</code>
          </li>
          <li>Preencha as chaves do Web SDK do Firebase</li>
          <li>
            Reinicie com <code className="text-emerald-300">npm run dev</code>
          </li>
        </ol>
      </div>
    </div>
  )
}
