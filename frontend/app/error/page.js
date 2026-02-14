export default function ErrorPage() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-red-400">Pagamento não aprovado</h1>
        <p className="mt-4">Você pode tentar novamente ou escolher outro método.</p>
      </div>
    </div>
  );
}
