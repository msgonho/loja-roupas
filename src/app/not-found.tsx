import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[calc(100svh-68px)] flex-col items-center justify-center bg-[var(--background)] px-4 text-center text-black">
      <p className="text-xs font-black uppercase text-[var(--accent)]">Erro 404</p>
      <h1 className="mt-3 text-5xl font-black uppercase md:text-7xl">
        Página não encontrada.
      </h1>
      <p className="mt-5 max-w-md text-base font-medium leading-7 text-neutral-600">
        O endereço que você tentou acessar não existe ou foi movido.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="focus-ring rounded-md bg-black px-6 py-4 text-center text-sm font-black uppercase text-white transition-colors hover:bg-neutral-800"
        >
          Voltar ao início
        </Link>
        <Link
          href="/colecao"
          className="focus-ring rounded-md border border-neutral-300 px-6 py-4 text-center text-sm font-black uppercase text-neutral-900 transition-colors hover:border-black hover:bg-neutral-100"
        >
          Ver coleção
        </Link>
      </div>
    </main>
  );
}
