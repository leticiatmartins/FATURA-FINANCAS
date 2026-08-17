# Minhas Finanças

App para organizar sua fatura do Nubank (ou qualquer CSV com colunas `date,title,amount`)
por categoria e responsável, todo mês.

## Como rodar

Você precisa ter o [Node.js](https://nodejs.org) instalado (versão 18 ou mais recente).

1. Abra um terminal dentro desta pasta.
2. Instale as dependências (só precisa fazer isso uma vez):
   ```
   npm install
   ```
3. Rode o app:
   ```
   npm run dev
   ```
4. O terminal vai mostrar um endereço, algo como `http://localhost:5173` — abra ele no navegador.

Da próxima vez que quiser usar, basta rodar `npm run dev` de novo dentro desta pasta.

## Como usar

1. Clique em **Importar CSV** e selecione o extrato exportado do Nubank (ou arraste o
   arquivo para a tela).
2. O app categoriza os lançamentos automaticamente (Alimentação, Transporte, Compras, etc).
   Se alguma categoria estiver errada, é só trocar no menu ao lado do lançamento — o app
   memoriza a categoria daquele estabelecimento e vai acertar sozinho nos próximos meses.
3. Digite o nome do responsável em cada lançamento (ele sugere nomes já usados).
4. Use o filtro no topo para ver o total gasto por uma pessoa específica. Deixando em
   "Todos os responsáveis", o total geral aparece.
5. Clique em **Exportar** para baixar a fatura já organizada em CSV.

Tudo fica salvo no seu navegador (não sai da sua máquina). Se importar uma fatura de outro
mês, ela entra como um novo item no menu superior, sem apagar os meses anteriores.

## Formato esperado do CSV

```
date,title,amount
2026-08-07,Pagamento recebido,"- 2.000,00"
2026-08-06,Uber Uber *Trip Help.U,"21,61"
```

É exatamente o formato exportado pelo Nubank na área de fatura → exportar CSV.
