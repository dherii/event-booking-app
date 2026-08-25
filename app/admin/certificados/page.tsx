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
    // Iniciando na aba 'regras' por ser a primeira da lista, mas você pode voltar para 'design' se preferir
    const [tab, setTab] = useState<Tab>('regras');
    const [template, setTemplate] = useState<TemplateConfig>(TEMPLATE_DEFAULT);

    function updateTemplate(patch: Partial<TemplateConfig>) {
        setTemplate((prev) => ({ ...prev, ...patch }));
    }

    return (
        <div className="space-y-6">

            {/* Cabeçalho */}
            <div>
                <h1 className="text-xl font-bold text-foreground">Certificados</h1>
                <p className="text-sm text-muted mt-0.5">
                    Configure as regras, o template visual e emita certificados em lote para os participantes.
                </p>
            </div>

            {/* Tabs */}
            <div className="border-b border-border">
                <div className="flex gap-1 -mb-px">
                    {TABS.map(({ id, label, icon: Icon }) => {
                        const active = tab === id;
                        return (
                            <button
                                key={id}
                                type="button"
                                onClick={() => setTab(id)}
                                className={`
                                  flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors
                                  ${active
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-muted hover:text-foreground hover:border-border'
                                    }
                                `}
                            >
                                <Icon size={15} />
                                {label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Conteúdo */}
            {tab === 'regras' && (
                <RegrasEmissao />
            )}
            {tab === 'design' && (
                <TemplateStudio config={template} onChange={updateTemplate} />
            )}
            {tab === 'emissao' && (
                <PainelEmissao />
            )}
        </div>
    );
}