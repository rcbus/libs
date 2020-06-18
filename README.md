# Libs

Bibliotecas para node.js

# Inicio do Projeto
Iniciamos o projeto em 18/06/2020

# Procedimentos GIT

<b>Resumo de comandos (antes de executa-los leia atenciosamente cada um deles logo abaixo)</b>

OBS.: Onde tem "||" entenda como "OU", ou seja, pode ser usado um comando ou outro.

$ git branch name

$ git checkout name

$ git branch

$ git branch -D branch (para deletar uma branch se necessário)

$ git pull origin master

OBS.: Alterar a versão no arquivo version-libs.js a cada pull origin master

$ git add . 		||		$ git add filename.ext		||		$ git reset HEAD filename.ext

$ git status

$ git commit -m "mensagem"

$ git push -u origin branch

$ git checkout --track origin/update_cleiton_24042020_1139 (para migrar para uma atualização especifica)

OBS.: Se houver algum problema do tipo "fatal: pathspec is in submodule" use o procedimento abaixo, inserindo o nome ou caminho do diretório no lugar de "directory".

$ git rm --cached directory

$ git add directory

OBS.: Se houver algum problema para realizar o "git pull origin master" use o procedimento abaixo.

$ git fetch --all

$ git reset --hard origin/master

$ git pull origin master


<b>1 - Criar branch (ramo)</b>

Sempre que for iniciar uma nova modificação no sistema, principalmente se essa modificação for específica de um modulo ou parte do sistema você deve criar uma nova branch (ramificação). Para criar um novo branch use o comando abaixo, não há necessidade de uso de aspas, e o nome deve manter o seguinte padrão update_seunome_YYYYMMDD_HHMM, por exemplo se eu fosse criar uma branch hoje dia 27 de março de 2020 as 09:38 da manhã, eu escreveria update_cleiton_20200327_0938. O uso de underline "_" é obrigatório pois o nome da branch não deve ter espaços. 

$ git branch name

<b>2 - Trocar de branch</b>

Após criar uma nova branch você deve migrar pra ela. Para isso use os comandos abaixo, o primeiro faz a troca, no lugar de "name" insira o nome da branch que acabou de criar. E o segundo verifica se você migrou para branch que acabou de criar, você saberá em qual branch está pois ela vai estar destacada em verde.

$ git checkout name

$ git branch

<b>3 - !!! IMPORTANTE !!! - Atualizar a nova branch com a versão mais recente</b>

Antes de fazer qualquer alteração de documento, é importante que você atualize a branch com a versão mais recente, a master remota, isso evita ramificações orfãs e sobreposições de código conflitante, e assim todo pull request que chegar no repositório remoto para mergear chega limpo e baseado na ultima versão válida.

$ git pull origin master

<b>4 - Adicionar arquivos alterados a nova branch</b>

Após fazer todas as alterações de arquivos e testar localmente você deve liberar essas alterações na branch, para isso você deve usar os comandos abaixo. O primeiro adiciona todos os arquivos alterados de uma só vez. O segundo adiciona um arquivo específico. O terceiro serve para você verificar o que foi adicionado ou não na branch, o que estiver em vermelho não foi adicionado, e o que estiver em verde foi adicionado. O quarto serve para você estornar um arquivo que não queira adicionar a sua branch por enquanto. 

$ git add .

$ git add filename.ext

$ git status

$ git reset HEAD filename.ext

<b>5 - Fazer um commit das alterações</b>

O commit é um comentário ou detalhamento das alterações feitas, sem fazer um commit não é possível enviar a branch para o repositório remoto. Você até pode fazer commit por arquivo, mas para o nosso sistema é melhor fazermos um commit geral. Para isso basta usar o comando abaixo, inserindo a mensagem de detalhamento no lugar de "mensagem". As aspas são obrigatória pois se trata de texto, e sempre inicio o commit com o nome da branch por exemplo $ git commit -m "update_cleiton_20200327_1038 - Feito alterações no README.md". Se preferir não inserir nenhum comentário adicional insira apenas o nome da branch. Obs.: Commit sem o nome da branch será recusado.

$ git commit -m "mensagem"

<b>6 - Enviar a branch para o repositório</b>

Após o commit você já pode enviar a branch. Para isso use o comando abaixo onde "branch" é o nome da sua branch. Atenção, certifique-se de que o nome da branch está correto para não haver divergencias.

$ git push -u origin branch

<b>7 - Como atualizar a mesma branch?</b>

Para atualizar a mesma branch, mesmo que você já tenha realizado o push, você pode repetir os passos 4, 5 e 6 novamente, apenas no passo 5 é bom descrever melhor a nova alteração para ser melhor rastreável.

