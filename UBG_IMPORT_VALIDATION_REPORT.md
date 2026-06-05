# UBG Import Validation Report

Data da validacao: 2026-06-05  
Arquivo validado: `E:\2026-Cofre\02-PROJETOS\SGQ-UNIAO-BAG\Entrega\UBG_Cópia-Controladas\UBG-Recursos_Humanos\RJT_NEXUS_PEOPLE_UBG_Extracao_RH_PDCA01.xlsx`  
Tenant alvo: `tenant_ubg` / UNIÃO BAG  
Escopo: validacao do Import Center e do motor RH/PDCA contra a planilha oficial UBG.

## Status geral da importacao

Status: **REPROVADO PARA A ROTA REAL ATUAL DO IMPORT CENTER; APROVADO PARA A TABELA OFICIAL QUANDO O CABECALHO DA LINHA 5 E USADO CORRETAMENTE.**

A planilha oficial e estruturalmente consistente: a aba principal `CATALOGO_MESTRE` possui 71 funcoes ativas, cabecalho real na linha 5, 20 colunas obrigatorias e zero inconsistencias de preenchimento nos campos criticos avaliados.

Porem, a rota atual do `DefaultXLSXAdapter` usada pelo Import Center le a primeira linha da aba como cabecalho. Como a planilha controlada possui tres linhas de titulo e o cabecalho real esta na linha 5, o upload direto pelo Import Center nao importa as funcoes. Resultado observado na rota real:

- Linhas lidas pelo adapter: 74
- Linhas importadas com sucesso: 0
- Erros criticos: 519
- Primeiros erros: `functionName`, `sectorName`, `processName`, `scoreGut`, `trainingTimeRecommended`, `requiredCompetencies`, `sgqImpact`

Conclusao: o motor de transformacao consegue gerar inteligencia coerente se recebe as linhas oficiais corretamente mapeadas, mas o adapter de XLSX ainda nao esta pronto para planilhas oficiais com preambulo/titulo antes do cabecalho.

## Evidencia da estrutura da planilha

Abas identificadas:

- `CATALOGO_MESTRE`
- `DICIONARIO_DADOS`
- `ANALISE_GAP`

Cabecalho real da aba `CATALOGO_MESTRE`: linha 5.

Colunas oficiais identificadas:

`ID da Função`, `Nome da Função`, `Setor`, `Processo`, `Gravidade (G)`, `Urgência (U)`, `Tendência (T)`, `Score G×U×T`, `Criticidade G.U.T`, `Tempo de Treinamento Recomendado`, `Qtd. de Backup Recomendada`, `Descrição da Função`, `Principais Responsabilidades`, `Competências Requeridas`, `Justificativa da Criticidade`, `Nível de Competência Requerido`, `Requisito de Backup`, `Impacto no SGQ`, `Cláusula ISO 9001`, `Status`.

## 1. Total de funcoes importadas

Extracao controlada da tabela oficial: **71 funcoes**.

Rota real atual do Import Center: **0 funcoes importadas**, por falha de deteccao do cabecalho real.

## 2. Total por setor

| Setor | Total |
|---|---:|
| Administrativo | 7 |
| Administrativo / Financeiro | 2 |
| Recursos Humanos | 4 |
| Comercial | 3 |
| Compras | 4 |
| Operações | 3 |
| Produção / Costura | 12 |
| Produção / Corte | 6 |
| Produção | 5 |
| Qualidade | 4 |
| Expedição | 2 |
| Almoxarifado | 3 |
| Logística / Transporte | 3 |
| Manutenção | 3 |
| Limpeza | 1 |
| Restaurante | 5 |
| Diretoria | 4 |

## 3. Total por processo

| Processo | Total |
|---|---:|
| Administração e Governança | 1 |
| Controladoria | 1 |
| Financeiro | 2 |
| Gestão de Pessoas | 3 |
| Gestão Comercial | 1 |
| Administração de Vendas | 1 |
| Suporte Comercial | 1 |
| Apoio Administrativo | 4 |
| Suprimentos | 4 |
| Planejamento e Controle da Produção | 1 |
| Gestão da Produção | 2 |
| Costura | 8 |
| Abastecimento de Linha | 2 |
| Confecção e Dobra | 2 |
| Corte | 6 |
| Operação de Máquinas | 4 |
| Prensagem e Enfardamento | 1 |
| Gestão da Qualidade | 3 |
| Inspeção da Qualidade | 1 |
| Qualidade e Expedição | 1 |
| Almoxarifado | 3 |
| Logística e Transporte | 3 |
| Manutenção | 2 |
| Limpeza e 5S | 1 |
| Alimentação | 4 |
| Gestão Administrativa | 1 |
| Departamento Pessoal | 1 |
| Gestão do Restaurante | 1 |
| Expedição | 1 |
| Manutenção Industrial | 1 |
| Direção Estratégica | 1 |
| Direção Comercial | 1 |
| Relações Institucionais | 1 |
| Gestão Geral | 1 |

## 4. Quantidade por criticidade

| Criticidade G.U.T | Total |
|---|---:|
| Crítica | 28 |
| Alta | 27 |
| Média | 15 |
| Baixa | 1 |

Observacao: a aba `ANALISE_GAP` confirma distribuicao equivalente: 28 criticas, 27 altas, 15 medias, 1 baixa, total 71.

## 5. Top 10 funcoes mais criticas por Score GxUxT

| Rank | ID | Funcao | Setor | Processo | Score | Criticidade | Backups | ISO |
|---:|---|---|---|---|---:|---|---:|---|
| 1 | ADM-002 | CONTROLLER | Administrativo | Controladoria | 125 | Crítica | 2 | 7.1 / 9.1 |
| 2 | COM-001 | VENDEDOR(A) | Comercial | Gestão Comercial | 125 | Crítica | 2 | 8.2 |
| 3 | SUP-003 | COMPRADOR II | Compras | Suprimentos | 125 | Crítica | 2 | 8.4 |
| 4 | PCP-001 | PLANEJAMENTO | Operações | Planejamento e Controle da Produção | 125 | Crítica | 2 | 8.5.1 / 8.1 |
| 5 | PRD-001 | SUPERVISORA DE PRODUÇÃO | Operações | Gestão da Produção | 125 | Crítica | 2 | 8.5.1 / 8.1 |
| 6 | COR-005 | OPERADOR DE CORTE III | Produção / Corte | Corte | 125 | Crítica | 2 | 8.5.1 / 8.1 |
| 7 | QUA-001 | ANALISTA DE GESTÃO DA QUALIDADE | Qualidade | Gestão da Qualidade | 125 | Crítica | 2 | 9.1 / 8.5 / 8.7 |
| 8 | QUA-002 | SUPERVISOR DE QUALIDADE | Qualidade | Gestão da Qualidade | 125 | Crítica | 2 | 9.1 / 8.5 / 8.7 |
| 9 | FIN-002 | COORDENADOR FINANCEIRO | Administrativo / Financeiro | Financeiro | 125 | Crítica | 2 | 7.1 / 9.1 |
| 10 | PRD-004 | COORDENADOR(A) DE OPERAÇÕES | Operações | Gestão da Produção | 125 | Crítica | 2 | 8.5.1 / 8.1 |

## 6. Soma total de backups recomendados

Soma oficial da coluna `Qtd. de Backup Recomendada`: **114 backups**.

Validacao cruzada: a aba `ANALISE_GAP` tambem apresenta `Backup Mín. Exigido` total de **114**.

## 7. Funcoes com backup obrigatorio

Funcoes com `Qtd. de Backup Recomendada > 0`: **71/71**.

Interpretacao: todas as funcoes do catalogo oficial exigem ao menos uma cobertura de backup, ainda que o requisito varie entre desejavel, recomendado e obrigatorio.

## 8. Funcoes com plano de sucessao necessario

Funcoes identificadas com plano de sucessao necessario: **29**.

Criterio aplicado: campo `Requisito de Backup` contendo regra de sucessao ou criticidade `Crítica`. A distribuicao oficial indica 28 funcoes criticas; a contagem 29 sugere ao menos uma regra textual adicional de sucessao que deve ser revisada manualmente na coluna `Requisito de Backup`.

## 9. Funcoes que exigem OJT/Treinamento

Funcoes com `Tempo de Treinamento Recomendado` preenchido: **71/71**.

Interpretacao: todas as funcoes importadas exigem plano de treinamento/OJT. O motor, quando alimentado pela tabela correta, gera programas de treinamento para 71 funcoes.

## 10. Clausulas ISO 9001 identificadas

Clausulas identificadas na coluna `Cláusula ISO 9001`:

`5.1`, `5.2`, `5.3`, `7.1`, `7.1.2`, `7.1.3`, `7.1.4`, `7.2`, `7.3`, `7.5`, `8.1`, `8.2`, `8.4`, `8.5`, `8.5.1`, `8.5.4`, `8.6`, `8.7`, `9.1`.

## 11. Consumo do dataset importado pelos modulos

Evidencia textual no codigo:

- `ImportCenterPage.tsx` chama `saveImportedPeopleDataset(intelligenceResult.dataset)`.
- `peopleDatasetStore.ts` persiste em `localStorage` na chave `rjt_nexus_people_imported_dataset_v1`.
- `usePeopleDataset.ts` resolve `getImportedPeopleDataset()` antes do fallback demo.
- Modulos conectados ao dataset resolvido:
  - `ExecutiveDashboardPage.tsx`
  - `WorkforceMapPage.tsx`
  - `CriticalFunctionsPage.tsx`
  - `BackupSuccessionPage.tsx`
  - `TrainingOJTPage.tsx`
  - `EvidenceCenterPage.tsx`
  - `ActionPlansPage.tsx`

Conclusao: os modulos gerados estao preparados para consumir o dataset importado. Contudo, como o upload oficial falha antes de salvar o dataset, esses modulos permanecem no fallback demo na rota atual.

## 12. Dados demo apos importacao

Resultado da validacao: **nao foi possivel confirmar ausencia de demo na UI apos upload real**, porque a rota real atual nao conclui a importacao oficial.

Analise estatica:

- Os modulos principais listados acima usam `usePeopleDataset()`.
- Os identificadores locais ainda se chamam `DEMO_EMPLOYEES`, `DEMO_FUNCTIONS` etc. em alguns arquivos, mas nesses modulos eles recebem `dataset.employees`, `dataset.functions` etc. Nesses casos, o nome da variavel e legado; a fonte de dados e o dataset resolvido.
- Risco residual: se o dataset nao for salvo por falha de importacao, `getResolvedPeopleDataset()` retorna o fallback demo.

## 13. Isolamento do tenant UNIAO BAG

Dataset gerado por extracao controlada:

- `tenantId`: `tenant_ubg`
- Tenants no dataset gerado: 1
- Todas as entidades geradas recebem `tenantId = tenant_ubg`

Conclusao: o motor respeita isolamento tenant-aware quando recebe linhas validas. O ponto bloqueante esta antes, no adapter XLSX da rota real.

## 14. Evidence Center e evidencia objetiva

Extracao controlada gerou:

- Knowledge assets: 71
- Evidence records reais: 0
- Acoes PDCA geradas: 284
- Acoes com texto de evidencia objetiva obrigatoria: 284/284

Evidencia textual de acao gerada:

> Definir titular da função crítica. Competências: Gestão administrativa, análise financeira, liderança, compliance, comunicação, Excel/ERP. Impacto SGQ: Direto. Evidência objetiva obrigatória: matriz de competência assinada, OJT validado, registro de treinamento (90 dias) e vínculo à 5.1 / 5.3 / 7.5.

Conclusao: o Evidence Center gera exigencia objetiva, mas como a planilha oficial e catalogo de funcoes e nao contem colaboradores/evidencias anexadas, todos os registros de evidencia concreta permanecem pendentes.

## 15. PDCA Action Plan e PDCA 01 - Gestao do Conhecimento Tecnico

O plano PDCA gerado por extracao controlada e coerente com PDCA 01 porque transforma cada funcao em acoes vinculadas a:

- titularidade da funcao critica;
- cobertura de backup;
- capacitacao por competencias requeridas;
- evidencia objetiva de competencia, OJT, impacto SGQ e clausula ISO.

Volume gerado: **284 acoes**, equivalente a 4 acoes por funcao para 71 funcoes, pois a planilha oficial nao informa titulares, backups nominados ou evidencias anexadas.

Risco de excesso: o motor gera uma acao de titularidade para todas as funcoes por ausencia de colaborador principal na planilha. Isso e correto pela regra "nao inventar dados", mas deve ser tratado como backlog de enriquecimento de dados RH, nao necessariamente como nao conformidade operacional real.

## Erros encontrados

1. **Adapter XLSX nao detecta cabecalho real na linha 5.**  
   Impacto: upload oficial pelo Import Center gera 0 funcoes importadas e 519 erros criticos.

2. **Matcher de coluna do motor e permissivo demais para `functionName`.**  
   Evidencia: em extracao controlada com os headers oficiais, o motor pode casar `ID da Função` antes de `Nome da Função`, gerando nomes internos como `func_adm_001` em vez do nome oficial da funcao.  
   Impacto: rankings e dashboards podem exibir codigos onde deveriam exibir nomes, se o mapeamento automatico nao for endurecido.

3. **Planilha oficial nao contem titulares, backups nominados ou evidencias anexadas.**  
   Impacto: o motor corretamente nao cria dados ficticios, mas gera 0 colaboradores, 0 assignments, 0 backups, 0 sucessores e 0 evidencias reais na extracao controlada.

## Alertas

- 142 alertas gerados na extracao controlada: 71 por ausencia de colaborador principal e 71 por cobertura real de backup inferior ao recomendado.
- Todas as funcoes exigem treinamento/OJT; sem matriz de pessoas, o modulo de Treinamento & OJT fica como plano requerido, nao como execucao validada.
- A contagem de sucessao necessaria ficou em 29, enquanto a distribuicao oficial tem 28 criticas. Recomendado revisar uma linha com regra textual adicional de sucessao.
- O fallback demo ainda existe por design; ele so deixa de aparecer se a importacao for salva com sucesso.

## Dados inconsistentes

Na tabela oficial `CATALOGO_MESTRE`, usando a linha 5 como cabecalho, foram encontrados **0 registros inconsistentes** nos campos obrigatorios analisados:

- ID da Funcao
- Nome da Funcao
- Setor
- Processo
- Score GxUxT
- Criticidade G.U.T
- Tempo de Treinamento Recomendado
- Qtd. de Backup Recomendada
- Competencias Requeridas
- Impacto no SGQ
- Clausula ISO 9001

As inconsistencias estao no comportamento de importacao atual, nao no conteudo da planilha oficial.

## Oportunidades de melhoria

1. Detectar automaticamente linha de cabecalho em XLSX procurando colunas obrigatorias (`ID da Função`, `Nome da Função`, `Score G×U×T`, `Criticidade G.U.T`) em vez de assumir a primeira linha.
2. Priorizar aliases exatos antes de aliases parciais; `Nome da Função` deve prevalecer sobre qualquer coluna contendo apenas `Função`.
3. Guardar no resultado do Import Center o nome da aba e numero da linha de cabecalho detectada.
4. Diferenciar planos requeridos de dados reais: `backup recomendado = 114`, `backup real informado = 0`.
5. Incluir uma etapa de pre-commit visual/funcional apos upload real para bloquear fallback demo quando a importacao falhar.
6. Criar validacao especifica para planilhas controladas da UBG com preambulo institucional.

## Prints ou evidencias textuais dos modulos

Como evidencia textual de modulo e persistencia:

- Import Center publica dataset: `saveImportedPeopleDataset(intelligenceResult.dataset)`.
- Store tenant-aware: chave `rjt_nexus_people_imported_dataset_v1`.
- Dataset resolvido: `getImportedPeopleDataset() || getFallbackPeopleDataset()`.
- Modulos ligados ao dataset importado: Workforce Map, Critical Functions, Backup/Succession, Training/OJT, Evidence Center, PDCA Action Plans e Executive Dashboard.

Evidencia textual de rota real falhando:

```text
adapterRows: 74
successCount: 0
criticalErrors: 519
firstErrors: functionName, sectorName, processName, scoreGut, trainingTimeRecommended, requiredCompetencies, sgqImpact
```

Evidencia textual de extracao oficial controlada:

```text
officialRowCount: 71
headerRow: 5
criticalErrors: 0
functions: 71
assessments: 71
programs: 71
assets: 71
snapshots: 71
actionPlans: 284
sumBackup: 114
objectiveEvidenceActions: 284/284
```

## Proximas acoes recomendadas

1. Corrigir o adapter XLSX para localizar a linha de cabecalho real da aba `CATALOGO_MESTRE`.
2. Ajustar o matcher de aliases para nao mapear `ID da Função` como `Nome da Função`.
3. Reexecutar upload real no Import Center apos a correcao e validar que o `localStorage` recebe 71 funcoes no tenant `tenant_ubg`.
4. Validar visualmente os modulos apos importacao salva, confirmando ausencia de Kaiky/Eliane/Arthur e demais dados demo.
5. Complementar a planilha RH com colaboradores titulares, backups reais, status de treinamento/OJT e links de evidencias, se o objetivo for operar Evidence Center e Workforce Map com execucao real, nao apenas plano requerido.
6. Manter a regra atual de nao gerar pessoas ficticias; os gaps devem permanecer como acoes PDCA ate que dados nominados sejam fornecidos.
