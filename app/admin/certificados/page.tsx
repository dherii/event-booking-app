// app/admin/certificados/page.tsx
'use client';

import { useState } from 'react';
import { Palette, Send, Settings } from 'lucide-react';
import { TemplateStudio } from '@/src/features/admin/certificados/components/TemplateStudio';
import { PainelEmissao } from '@/src/features/admin/certificados/components/PainelEmissao';
import { type TemplateConfig, TEMPLATE_DEFAULT } from '@/src/features/admin/certificados/types';
import { RegrasEmissao } from '@/src/features/admin/certificados/components/RegrasEmissao';

// ─── Tabs ─────────────────────────────────────────────────────────────────────

type Tab = 'regras' | 'design' | 'emissao';

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'regras', label: 'Regras de Emissão', icon: Settings },
    { id: 'design', label: 'Design do Template', icon: Palette },
    { id: 'emissao', label: 'Emissão em Lote', icon: Send },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CertificadosPage() {
    const [tab, setTab] = useState<Tab>('regras');
    const [template, setTemplate] = useState<TemplateConfig>(TEMPLATE_DEFAULT);

    function updateTemplate(patch: Partial<TemplateConfig>) {
        setTemplate((prev) => ({ ...prev, ...patch }));
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10">

            {/* Cabeçalho alinhado ao padrão do Dashboard */}
            <div>
                <h1 className="text-2xl font-bold text-foreground tracking-tight">Certificados</h1>
                <p className="text-sm text-muted mt-1">
                    Configure as regras, o template visual e emita certificados em lote para os participantes.
                </p>
            </div>

            {/* Navegação de Tabs Refinada */}
            <div className="border-b border-border">
                <nav className="flex gap-6 -mb-px overflow-x-auto hide-scrollbar" aria-label="Tabs">
                    {TABS.map(({ id, label, icon: Icon }) => {
                        const active = tab === id;
                        return (
                            <button
                                key={id}
                                type="button"
                                onClick={() => setTab(id)}
                                className={`
                  flex items-center gap-2 py-3 px-1 text-sm font-semibold border-b-2 transition-all whitespace-nowrap outline-none
                  ${active
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-muted hover:text-foreground hover:border-border/60'
                                    }
                `}
                                aria-current={active ? 'page' : undefined}
                            >
                                <Icon size={16} className={active ? 'text-primary' : 'text-muted-subtle'} />
                                {label}
                            </button>
                        );
                    })}
                </nav>
            </div>
            {/* Área de Conteúdo */}
            <div className="pt-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {tab === 'regras' && <RegrasEmissao />}
                {tab === 'design' && <TemplateStudio config={template} onChange={updateTemplate} />}
                {tab === 'emissao' && <PainelEmissao />}      
            </div>
        </div>
    );
}