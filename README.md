
# TinkerPill

TinkerPill é uma aplicação para depuração de códigos Laravel, escrita em Electron e React, projetada para facilitar a execução de comandos no Tinker do Laravel, exibindo o JSON de retorno e a query SQL gerada.

## 🛠️ Funcionalidades

- **Edição de código em Eloquent**: Escreva consultas utilizando Eloquent diretamente.
- **Visualização estruturada**: Exibe o JSON do retorno formatado.
- **Query gerada**: Mostra a query SQL executada.
- **Execução flexível**: Roda dentro de um container Docker ou na máquina local (com PHP instalado).

## 🚀 Requisitos

- **Node.js**: Versão 16+.
- **PHP**: Necessário caso não esteja utilizando Docker.
- **Docker**: Opcional para execução dentro de um container.
- **Electron**: Configurado via dependências.

## 📦 Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/tinkerpill.git
   cd tinkerpill
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure o ambiente:
   - Certifique-se de ter o Laravel configurado na pasta do projeto.
   - Configure o Docker, se necessário.

4. Execute o projeto:
   - Modo desenvolvimento:
     ```bash
     npm run dev
     ```
   - Build para produção:
     ```bash
     npm run build
     ```

## 🔧 Configuração

- **Docker**: O TinkerPill detecta automaticamente o container Laravel rodando na máquina.
- **Local**: Certifique-se de que o PHP esteja instalado no sistema e acessível pelo terminal.

## 🖥️ Exemplo de Uso

1. Escreva o código no editor:
   ```php
   User::find(1);
   ```

2. O retorno será exibido como:
   - **JSON**:
     ```json
     {
       "id": 1,
       "name": "John Doe",
       "email": "john@example.com"
     }
     ```
   - **Query**:
     ```sql
     select * from users where id = 1 limit 1;
     ```

## 🎨 Tecnologias Utilizadas

- **Electron**: Para criar aplicações desktop multiplataforma.
- **React**: Interface dinâmica e reativa.
- **CodeMirror**: Editor de código leve e personalizável.
- **TailwindCSS**: Estilização moderna e rápida.
- **TypeScript**: Tipagem estática para maior confiabilidade.
- **Docker**: Execução isolada em ambiente de container.

## 🤝 Contribuição

1. Faça um fork do projeto.
2. Crie uma branch para a sua feature:
   ```bash
   git checkout -b minha-feature
   ```
3. Commit suas alterações:
   ```bash
   git commit -m "Adicionei uma nova feature"
   ```
4. Faça o push para a branch:
   ```bash
   git push origin minha-feature
   ```
5. Abra um Pull Request.

## 📝 Licença

Este projeto está sob a licença [MIT](LICENSE).

<!-- ## 📷 Capturas de Tela

(Adicione imagens ou GIFs mostrando o funcionamento da aplicação) -->