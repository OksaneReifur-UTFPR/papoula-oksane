Passo 1: Acessar a Função de Backup
No pgAdmin 4, expanda a árvore de servidores e bases de dados.

Clique com o botão direito do mouse sobre o nome da Base de Dados que você deseja exportar.

No menu de contexto, selecione Backup... .

Passo 2: Configurar a Aba "Geral" (General)
Filename: Clique no botão "..." para escolher o local e o nome do arquivo de saída (ex: meu_banco_backup.sql).

Format: Selecione a opção Plain (Simples).

Por que Plain? O formato Plain gera um arquivo SQL puro (.sql) com comandos CREATE TABLE, INSERT, etc., que é o formato mais compatível e o que você solicitou.

Passo 3: Configurar a Aba "Opções de Dump" (Dump Options)
Esta é a seção crucial para garantir que o dump seja "limpo" e contenha apenas a estrutura e os dados.

A. Seção I: Tipo de Conteúdo (Type of objects)
Garanta que as opções que definem o que será incluído no dump estejam configuradas assim:

Pre-data: Mantenha ativada. (Isso inclui comandos como CREATE TABLE, CREATE SCHEMA, etc.)

Data: Mantenha ativada. (Isso inclui os comandos INSERT para os dados.)

Post-data: Mantenha ativada. (Isso inclui comandos como CREATE INDEX, ALTER TABLE, etc., para finalizar a estrutura.)

B. Seção II: Seletividade (Do not save)
Para um dump "limpo", evite incluir comandos que possam causar problemas ao restaurar em outro ambiente.

Clean (Drop objects): Mantenha desativada. (Se ativada, adicionará comandos DROP antes de cada CREATE, o que é bom para sobrescrever, mas não essencial para um "dump limpo" de estrutura/dados.)

Owner: Mantenha desativada. (Isso evita a inclusão do comando ALTER OWNER TO..., que geralmente falha se o usuário de destino não existir.)

Privilege: Mantenha desativada. (Isso evita a inclusão de comandos GRANT e REVOKE, que podem ser específicos do ambiente de origem.)

Tablespace: Mantenha desativada. (Evita comandos TABLESPACE que podem não ser válidos no novo servidor.)

Passo 4: Executar e Finalizar
Clique no botão Backup na parte inferior da janela.

O pgAdmin 4 mostrará uma janela de status para acompanhar o progresso.

Após a conclusão, a janela de status deve mostrar Processo concluído com sucesso (Process returned success).

O arquivo .sql estará disponível no local que você especificou no Passo 2.

Resultado: O arquivo .sql resultante conterá a estrutura completa (tabelas, índices, sequences) e todos os dados do seu banco de dados, sem as especificações de proprietários e permissões que costumam complicar a restauração em um ambiente diferente.