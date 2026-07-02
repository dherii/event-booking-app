'use client';

interface PixCopyButtonProps {
  codigo: string;
}

export default function PixCopyButton({ codigo }: PixCopyButtonProps) {
  async function copiarPix() {
    try {
      await navigator.clipboard.writeText(codigo);
      alert('Código Pix copiado!');
    } catch {
      alert('Não foi possível copiar o código.');
    }
  }

  return (
    <button
      onClick={copiarPix}
      className="w-full bg-gray-900 p-2 rounded text-blue-400 break-all text-left border border-gray-800 hover:border-blue-600 transition-colors"
    >
      {codigo}
    </button>
  );
}