# RELATÓRIO DE ANÁLISE — RJT NEXUS PEOPLE SaaS
**Data:** 02/06/2026 | **Analista:** PDCA Brain + Consultor SGI ISO 9001:2015  
**Projeto:** RJT-NEXUS PEOPLE | **Stack:** React + TypeScript + Vite + Turso + Cloudflare R2 + Vercel

---

## 1. VISÃO GERAL DO SISTEMA

O RJT Nexus People é um SaaS de gestão de pessoas e competências voltado para conformidade ISO 9001:2015, com foco em mapeamento de vulnerabilidades operacionais, matrizes de polivalência, planos de ação e controle de evidências. A arquitetura técnica foi projetada em camadas modernas (edge computing), mas a integração entre camadas ainda está incompleta.

---

## 2. ESTRUTURA ATUAL — O QUE EXISTE

### 2.1 Frontend (React/TypeScript)
| Módulo | Arquivo | Status |
|--------|---------|--------|
| Executive Dashboard | `ExecutiveDashboardPage.tsx` | ✅ Implementado com demo data |
| People Intelligence | `PeopleIntelligencePage.tsx` | ✅ Implementado |
| Import Center | `ImportCenterPage.tsx` | ✅ Implementado |
| Workforce Map | `WorkforceMapPage.tsx` | ⚠️ Placeholder (EmptyState) |
| Critical Functions | `CriticalFunctionsPage.tsx` | ⚠️ Placeholder |
| Polyvalence Matrix | `PolyvalenceMatrixPage.tsx` | ⚠️ Placeholder |
| Backup & Succession | `BackupSuccessionPage.tsx` | ⚠️ Placeholder |
| Training & OJT | `TrainingOJTPage.tsx` | ⚠️ Placeholder |
| Knowledge Hub | `KnowledgeHubPage.tsx` | ⚠️ Placeholder |
| Evidence Center | `EvidenceCenterPage.tsx` | ⚠️ Placeholder |
| Vulnerability Analytics | `VulnerabilityAnalyticsPage.tsx` | ⚠️ Placeholder |
| Action Plans | `ActionPlansPage.tsx` | ✅ Implementado com filtros |
| **PDCA Brain** | ❌ Não existe | ❌ **AUSENTE** |

### 2.2 Backend / Infraestrutura
| Camada | Definição | Status Real |
|--------|-----------|-------------|
| Banco Relacional | Turso (Edge SQLite) | ✅ Schema SQL definido (17 tabelas) — ❌ Não conectado |
| Object Storage | Cloudflare R2 | ✅ Contratos definidos — ❌ Não conectado |
| Deploy | Vercel | ✅ Planejado — ❌ Status desconhecido |
| Autenticação | Não identificada | ❌ **AUSENTE** |

### 2.3 Feature Modules (Selectors)
Todos os 9 módulos possuem `selectors.ts` com lógica validada e `selectors.test.ts`:
- workforce-map, critical-functions, polyvalence-matrix, backup-succession
- training-ojt, knowledge-hub, evidence-center, vulnerability-analytics, action-plans

A lógica de negócio está **correta e testada**, mas **desconectada da UI** em 7 dos 9 módulos.

---

## 3. NÃO CONFORMIDADES CRÍTICAS

### NC-01 — DUPLICIDADE DE ARQUITETURA (CRÍTICA)
**Evidência:** Existem dois arquivos `App.tsx` ativos simultaneamente:
- `src/App.tsx` — Arquitetura legada com `localStorage`, páginas antigas e estado local
- `src/app/App.tsx` — Arquitetura nova com `AppShell`, `RouteRenderer` e registry moderno

**Risco:** O `main.tsx` provavelmente aponta para um dos dois, tornando o outro código morto. Isso gera confusão na manutenção, build inconsistente e risco de regressão.

**Ação Corretiva:** Identificar qual é o entry point ativo. Eliminar o App.tsx legado e migrar qualquer dado útil para a nova arquitetura.

---

### NC-02 — PDCA BRAIN AUSENTE DO SISTEMA (CRÍTICA)
**Evidência:** Nenhum módulo, página, rota ou componente relacionado ao PDCA Brain foi encontrado no código. O documento PDCA 01 (36 subações, 6 ações macro) não tem representação alguma no sistema.

**Risco:** O produto principal vendido pela RJT Consultoria — o PDCA Brain — não existe no SaaS. O sistema gerencia competências e vulnerabilidades, mas não executa o ciclo PDCA estruturado que é o diferencial do negócio.

**Conformidade ISO 9001:2015:** Não atende cláusulas 7.1.6, 7.2, 7.3, 8.5.1, 9.1, 9.3 de forma rastreável e auditável dentro do próprio sistema.

**Ação Corretiva:** Criar módulo `pdca-brain` com: pipeline de ações macro → subações → evidências → dashboard de efetividade.

---

### NC-03 — 7 DE 9 MÓDULOS SÃO PLACEHOLDERS (ALTA)
**Evidência:** WorkforceMap, CriticalFunctions, PolyvalenceMatrix, BackupSuccession, TrainingOJT, KnowledgeHub, EvidenceCenter retornam `EmptyState` na UI. Os selectors estão prontos mas a UI não os consome.

**Risco:** O produto não entrega o que promete. Usuário abre o módulo e vê uma mensagem de "pending integration". Isso destrói a credibilidade e impede a venda.

**Ação Corretiva:** Conectar os selectors validados às páginas de módulo. Cada módulo já tem a lógica — falta apenas a camada de apresentação.

---

### NC-04 — AUSÊNCIA DE AUTENTICAÇÃO (CRÍTICA)
**Evidência:** Nenhum sistema de auth foi identificado no codebase (sem Clerk, Auth.js, Supabase Auth, middleware de sessão, etc.).

**Risco:** Sem autenticação, o SaaS não pode ser vendido. Qualquer usuário acessa qualquer dado. A arquitetura multitenant (tenant_id) não tem proteção de fronteira.

**Ação Corretiva:** Implementar autenticação antes do lançamento. Recomendado: Clerk (compatível com Vercel edge) ou Supabase Auth.

---

### NC-05 — BANCO DE DADOS NÃO CONECTADO (ALTA)
**Evidência:** O schema Turso está definido em `schema.sql` e os contratos de repositório em `repository-contracts.ts`, mas nenhuma chamada real ao banco foi identificada. O sistema usa `localStorage` e dados demo (`peopleDemoDataset.ts`).

**Risco:** Sistema roda inteiramente em memória/local. Dados não persistem entre dispositivos, não há multitenancy real, não há rastreabilidade conforme ISO 9001:2015.

**Ação Corretiva:** Implementar os repositórios Turso e substituir as chamadas a `DEMO_*` pelas queries reais.

---

### NC-06 — LOCALSTORAGE NÃO É COMPATÍVEL COM MULTITENANT (MÉDIA)
**Evidência:** `src/App.tsx` (legado) usa `localStorage` para persistir `funcoes`, `collaborators`, `assessments`, etc.

**Risco:** Em um SaaS multitenant, localStorage armazena dados de um cliente no navegador de outro potencialmente. Violação de isolamento de dados.

**Ação Corretiva:** Eliminar uso de localStorage como persistência de dados de negócio. Usar apenas para preferências de UI (ex: tema, sidebar aberta).

---

### NC-07 — AUSÊNCIA DE LANDING PAGE / PÁGINA DE VENDA (ALTA)
**Evidência:** O `index.html` aponta diretamente para o app React. Não existe landing page, página de preços, demonstração pública ou qualquer material de conversão.

**Risco:** Ninguém descobre, entende ou compra o produto. SaaS sem landing page = produto sem vitrine.

**Ação Corretiva:** Criar landing page premium com proposta de valor clara, demonstração do PDCA Brain, benefícios ISO 9001, depoimentos e CTA de contratação.

---

## 4. PONTOS POSITIVOS (O QUE ESTÁ BEM)

| Item | Avaliação |
|------|-----------|
| Arquitetura feature-based (selectors + types + index) | ✅ Padrão profissional, escalável |
| Schema Turso com 17 tabelas e FK constraints | ✅ Bem modelado para multitenant |
| Testes unitários em todos os selectors | ✅ Boa cobertura de lógica de negócio |
| Registry de features (`peopleFeatureRegistry`) | ✅ Facilita expansão modular |
| Infraestrutura planejada (Vercel + Turso + R2) | ✅ Stack moderna e de baixo custo |
| Design visual do dashboard executivo | ✅ Interface premium com identidade forte |
| Action Plans com filtros dinâmicos | ✅ Funcional e bem estruturado |
| Separação clara entre domain, features e infrastructure | ✅ Arquitetura limpa (Clean Architecture) |

---

## 5. RANKING DE PRIORIDADES (GUT)

| # | Problema | G | U | T | GUT | Prioridade |
|---|----------|---|---|---|-----|------------|
| 1 | PDCA Brain ausente | 5 | 5 | 5 | 125 | 🔴 CRÍTICA |
| 2 | Autenticação ausente | 5 | 5 | 5 | 125 | 🔴 CRÍTICA |
| 3 | Banco não conectado (demo data) | 5 | 4 | 4 | 80 | 🔴 ALTA |
| 4 | 7 módulos como placeholder | 4 | 5 | 4 | 80 | 🔴 ALTA |
| 5 | Sem landing page | 4 | 5 | 4 | 80 | 🔴 ALTA |
| 6 | Duplicidade de App.tsx | 4 | 4 | 3 | 48 | 🟠 MÉDIA |
| 7 | localStorage em multitenant | 3 | 3 | 3 | 27 | 🟡 BAIXA |

---

## 6. ROADMAP RECOMENDADO

### SPRINT 1 — Fundação (Semana 1–2)
- [ ] Resolver duplicidade App.tsx — definir entry point único
- [ ] Implementar autenticação (Clerk recomendado)
- [ ] Conectar Turso — implementar repositories para `action_plans` e `evidence_records`

### SPRINT 2 — PDCA Brain (Semana 3–4)
- [ ] Criar módulo `pdca-brain` com as 36 subações do PDCA 01
- [ ] Implementar pipeline: Ação Macro → Subações → Evidências → Status
- [ ] Dashboard de efetividade com progresso automático (% concluído)
- [ ] Padrão de nomenclatura `PDCA-[N]-A[AÇÃO]-[SUBAÇÃO]`

### SPRINT 3 — Módulos (Semana 5–6)
- [ ] Conectar selectors aos 7 módulos placeholder
- [ ] Polyvalence Matrix — prioridade por ser central no ISO 9001:2015
- [ ] Critical Functions + Vulnerability Analytics

### SPRINT 4 — Go-to-Market (Semana 7–8)
- [ ] Criar landing page premium (Tech Innovation theme)
- [ ] Página de preços com planos
- [ ] Onboarding guiado para novo cliente
- [ ] Deploy verificado em Vercel

---

## 7. AVALIAÇÃO FINAL

| Dimensão | Nota | Comentário |
|----------|------|------------|
| Arquitetura técnica | 8/10 | Moderna, bem estruturada, falta conexão real |
| Completude funcional | 3/10 | 7 de 9 módulos são placeholders |
| Conformidade ISO 9001 | 2/10 | PDCA Brain ausente, sem rastreabilidade real |
| Pronto para venda | 1/10 | Sem auth, sem landing page, sem backend |
| Potencial do produto | 9/10 | Base sólida, diferencial real de mercado |

### Diagnóstico Final
O produto tem **arquitetura correta e diferencial de mercado real**, mas não está pronto para ser vendido nem para atender os requisitos ISO que promete. O PDCA Brain — que é o coração da proposta de valor — não existe no sistema. A prioridade imediata é: (1) criar o módulo PDCA Brain, (2) implementar autenticação, (3) criar a landing page de venda.

---

*RJT Consultoria | PDCA Brain | Análise Técnica SGQ | ISO 9001:2015*  
*"Sem evidência, não existe execução." — Regra Fundamental do PDCA Brain*
