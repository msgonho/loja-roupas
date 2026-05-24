export default function Loading() {
  return (
    <div className="flex min-h-[calc(100svh-68px)] items-center justify-center bg-[var(--background)]">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-neutral-200 border-t-black" />
        <p className="mt-4 text-sm font-black uppercase text-neutral-500">
          Carregando...
        </p>
      </div>
    </div>
  );
}
