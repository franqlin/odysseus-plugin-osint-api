
O **Odysseus** é um plugin para o Obsidian que permite integrar diversas APIs externas, como Instagram Scraper, Pesquisa Web em Tempo Real e Truecaller, para enriquecer suas notas com dados dinâmicos. Abaixo estão as instruções para configurar e usar o plugin.

---

## **Configuração do Plugin**

### 1. **RapidAPI Key**
   - **Descrição:** Chave de API fornecida pelo RapidAPI para acessar o serviço `instagram-scraper-api2`.
   - **Campo:** `RapidAPI Key`
   - **Exemplo:** `d71bd39b97msh2d2f248d6e03`

### 2. **RapidAPI Host**
   - **Descrição:** Host da API do RapidAPI para o serviço `instagram-scraper-api2`.
   - **Campo:** `RapidAPI Host`
   - **Exemplo:** `instagram-scraper-api2.p.rapidapi.com`

### 3. **Pasta de Armazenamento**
   - **Descrição:** Especifique a pasta onde as imagens baixadas serão armazenadas.
   - **Campo:** `Pasta de armazenamento`
   - **Valor Padrão:** `Default`

### 4. **Nome da Pasta Customizada**
   - **Descrição:** Defina um nome personalizado para a pasta onde as mídias serão salvas.
   - **Campo:** `Nome da pasta customizada`
   - **Exemplo:** `Custom folder name`

### 5. **Caminho do Arquivo JSON**
   - **Descrição:** Caminho para o arquivo JSON que contém a lista de sites ou dados a serem processados.
   - **Campo:** `Caminho do arquivo JSON`
   - **Exemplo:** `Insira o caminho para o arquivo`

### 6. **Chave API para Pesquisa Web em Tempo Real**
   - **Descrição:** Chave de API para acessar o serviço de Pesquisa Web em Tempo Real.
   - **Campo:** `Chave API para Pesquisa Web em Tempo Real`
   - **Exemplo:** `d71bd39b97msh2d2f248d6e03`

### 7. **Limite para Resultados de Pesquisa Web em Tempo Real**
   - **Descrição:** Defina o número máximo de resultados a serem retornados pela Pesquisa Web em Tempo Real.
   - **Campo:** `Limite para resultados de Pesquisa Web em Tempo Real`
   - **Exemplo:** `300`

### 8. **Chave API para Truecaller**
   - **Descrição:** Chave de API para acessar o serviço Truecaller.
   - **Campo:** `Chave API para Truecaller`
   - **Exemplo:** `d71bd39b97msh2d2f248d6e03`

### 9. **Host API para Truecaller**
   - **Descrição:** Host da API para o serviço Truecaller.
   - **Campo:** `Host API para Truecaller`
   - **Exemplo:** `truecaller-data2.p.rapidapi.com`

---

## **Como Usar o Plugin**

### 1. **Instalação**
   - Acesse a aba **Community Plugins** no Obsidian.
   - Procure por **Odysseus** e instale o plugin.
   - Ative o plugin nas configurações.

### 2. **Configuração Inicial**
   - Abra as configurações do plugin e preencha os campos conforme descrito acima.

### 3. **Uso do Instagram Scraper**
   - Utilize o comando do plugin para baixar mídias do Instagram diretamente para a pasta especificada.

### 4. **Pesquisa Web em Tempo Real**
   - Execute pesquisas dinâmicas na web e insira os resultados diretamente em suas notas.

### 5. **Integração com Truecaller**
   - Use o plugin para buscar informações de contatos diretamente no Truecaller.

---

## **Exemplos de Uso**

### Exemplo 1: Baixar Mídias do Instagram
```markdown
![[Instagram Media/Custom folder name/image1.png]]
```

### Exemplo 2: Resultados de Pesquisa Web
```markdown
- Resultado 1: [Link](https://exemplo.com)
- Resultado 2: [Link](https://outroexemplo.com)
```

### Exemplo 3: Informações do Truecaller
```markdown
Nome: João Silva  
Telefone: +55 11 99999-9999  
Localização: São Paulo, Brasil
```

---

## **Dicas e Melhores Práticas**
- Mantenha suas chaves de API seguras e não as compartilhe publicamente.
- Utilize pastas personalizadas para organizar melhor os arquivos baixados.
- Atualize o plugin regularmente para garantir compatibilidade com novas versões do Obsidian.

---
