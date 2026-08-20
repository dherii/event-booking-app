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
      className="w-full bg-background p-2 rounded text-primary break-all text-left border border-border hover:border-primary transition-colors"
    >
      {codigo}
    </button>
  );
}
