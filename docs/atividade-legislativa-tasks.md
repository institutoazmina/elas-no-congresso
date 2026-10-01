# Atividade legislativa — tarefas acionáveis

## API / gerenciador

- [x] Publicar somente tipos editoriais (`PEC`, `PL`, `PLP`, `PLV`, `PDC`, `PRC`, `PLS`, `PLN`, `PRS`, `PDS`).
  - Critério: `SBT`, `REQ`, `RIC` e demais documentos acessórios retornam 404 nos endpoints públicos de atividade.
- [x] Criar a aprovação editorial da proposição.
  - Critério: `is_approved` fica disponível e editável na lista de Proposições do Django Admin; novas coletas começam pendentes; itens existentes são preservados como aprovados na migração. Alertas diários e semanais também ignoram itens pendentes, e a aprovação dispara o matching diário.
- [x] Exibir a avaliação automática da QuitérIA quando não houver anotação humana.
  - Critério: uma análise `succeeded` retorna `assessment_organization: "QuitérIA"`, `is_favorable` e categoria; a anotação humana continua tendo prioridade.
- [x] Enviar nomes editoriais de categoria e temas no contrato de atividade.
  - Critério: `violencias_de_genero` retorna `category_label: "Violências de Gênero"` e `themes` preserva os temas associados.
- [ ] Aplicar a migração `propositions.0010_proposition_is_approved` no ambiente de homologação e testar a aprovação de `PL 2086/2026` no admin.
  - Critério: a proposição não aparece em `/api/v1/activity/` antes do checkbox; aparece depois de salvar a aprovação.

## Site

- [x] Incluir `QuitérIA` em “Quem avaliou?” e usar o valor retornado pela API no filtro.
- [x] Exibir categoria com o rótulo editorial, sem hashtags ou slugs no painel, tabela, cards e página da proposição.
- [x] Usar avatar de iniciais para foto ausente/quebrada e impedir truncamento do nome na visão por autoria.
- [x] Repriorizar os painéis acima da tabela e armazenar por cinco minutos a resposta compacta na sessão para acelerar reaberturas.
- [x] Usar `themes` na página de autoria, com categoria como fallback quando não houver tema granular.
- [ ] Publicar site e API juntos e fazer smoke test no navegador em homologação.
  - Critério: filtrar “UF de quem propôs” muda simultaneamente “Por autoria” e o mapa “Por unidade federativa”; o filtro QuitérIA retorna somente avaliações automáticas.
