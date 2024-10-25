## 🔨 Funcionalidades do projeto

O App gera certificados CCM, não sendo preciso editar um a um com o PowerPoint, basta adicionar os nomes, separados por vírgula. Cada vírgula gera um certificado diferente.

## ✔️ Técnicas e tecnologias utilizadas

As técnicas e tecnologias utilizadas para isso são:

- `JavaScript`: Lógica de manipulação de dados e geração dos certificados
- `CSS`: Estilização do layout da aplicação
- `HTML`: Estruturação das páginas

## 🎯 Desafio

Script para Gerar Certificados CCM

## 📁 Acesso ao projeto

Você pode [acessar o projeto inicial](https://lucasmercer.github.io/ccm/)

## 🚀 Como iniciar o projeto

1. **Clonar o repositório:**

   ```bash
   git clone https://github.com/lucasmercer/ccm.git
   cd ccm
   ```

2. **Instalar as dependências:**

   Antes de iniciar o projeto, você precisa instalar as dependências:

   ```bash
   yarn install
   ```

3. **Iniciar o projeto em ambiente de desenvolvimento:**

   Para iniciar o projeto localmente:

   ```bash
   yarn start
   ```

   Isso abrirá o projeto em seu navegador padrão, normalmente em `http://localhost:3000`.

## 📦 Como fazer o deploy

O deploy do projeto para o GitHub Pages é feito automaticamente usando o pacote `gh-pages`. Siga as etapas abaixo para realizar o deploy:

1. **Build do projeto:**

   Primeiro, você precisa gerar os arquivos estáticos para deploy:

   ```bash
   yarn build
   ```

2. **Deploy para GitHub Pages:**

   Para realizar o deploy, basta rodar o seguinte comando:

   ```bash
   yarn deploy
   ```

   Esse comando vai compilar o projeto e fazer o push do conteúdo da pasta `build` para a branch configurada (normalmente `gh-pages` ou outra branch específica) e atualizar o site no GitHub Pages.

3. **Configuração de branch (opcional):**

   Se você quiser mudar a branch onde o deploy será feito (por exemplo, para `feat/producao`), altere o script de deploy no arquivo `package.json`:

   ```json
   "scripts": {
     "deploy": "gh-pages -d build feat/producao"
   }
   ```
