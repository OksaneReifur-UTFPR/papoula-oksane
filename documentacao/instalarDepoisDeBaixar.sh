#!/bin/bash

# Script genérico para instalar programas a partir de arquivos .deb
# Uso: sudo ./instalar_deb.sh [nome-do-arquivo.deb]

# Verificar se o script está sendo executado como root
if [ "$EUID" -ne 0 ]; then
    echo "Por favor, execute este script como root ou com sudo:"
    echo "sudo ./instalar_deb.sh [arquivo.deb]"
    exit 1
fi

# Verificar se foi passado algum parâmetro
if [ $# -eq 0 ]; then
    echo "Erro: Nenhum arquivo especificado."
    echo ""
    echo "Uso: sudo ./instalar_deb.sh [arquivo.deb]"
    echo "Ou:   sudo ./instalar_deb.sh [padrao*.deb]"
    echo ""
    echo "Exemplos:"
    echo "  sudo ./instalar_deb.sh google-chrome-stable.deb"
    echo "  sudo ./instalar_deb.sh google-chrome*.deb"
    echo "  sudo ./instalar_deb.sh programa*.deb"
    exit 1
fi

# Armazenar o padrão do arquivo
ARQUIVO_DEB="$1"

echo "=========================================="
echo "Instalador genérico de pacotes .deb"
echo "=========================================="
echo "Procurando por: $ARQUIVO_DEB"

# Verificar se existem arquivos que correspondem ao padrão
if ! ls $ARQUIVO_DEB >/dev/null 2>&1; then
    echo "Erro: Nenhum arquivo encontrado com o padrão: $ARQUIVO_DEB"
    echo ""
    echo "Arquivos .deb disponíveis no diretório atual:"
    ls -la *.deb 2>/dev/null || echo "Nenhum arquivo .deb encontrado no diretório atual."
    exit 1
fi

# Listar arquivos que serão instalados
echo "Arquivos encontrados:"
ls -la $ARQUIVO_DEB

# Confirmar instalação
echo ""
echo "Deseja instalar estes pacotes? (s/N)"
read -r resposta

if [ "$resposta" != "s" ] && [ "$resposta" != "S" ]; then
    echo "Instalação cancelada."
    exit 0
fi

# Instalar o pacote .deb
echo "Instalando pacote(s)..."
sudo dpkg -i $ARQUIVO_DEB

# Verificar resultado da instalação
if [ $? -eq 0 ]; then
    echo "✅ Pacote(s) instalado(s) com sucesso!"
else
    echo "⚠️  Houve dependências não resolvidas."
    echo "Resolvendo dependências..."
    
    # Instalar dependências
    sudo apt install -f -y
fi

# Verificar se a instalação foi bem sucedida após resolver dependências
if [ $? -eq 0 ]; then
    echo "✅ Instalação concluída com sucesso!"
    
    # Tentar identificar o nome do programa instalado
    echo ""
    echo "📦 Informações do pacote:"
    
    # Extrair nome do primeiro arquivo .deb
    PRIMEIRO_ARQUIVO=$(ls $ARQUIVO_DEB 2>/dev/null | head -1)
    if [ -n "$PRIMEIRO_ARQUIVO" ]; then
        # Extrair nome do pacote sem versão
        NOME_PACOTE=$(dpkg -I "$PRIMEIRO_ARQUIVO" 2>/dev/null | grep "Package:" | awk '{print $2}')
        
        if [ -n "$NOME_PACOTE" ]; then
            echo "   Nome: $NOME_PACOTE"
            
            # Verificar versão instalada
            VERSAO=$(dpkg -l | grep "^ii" | grep "$NOME_PACOTE" | awk '{print $3}')
            if [ -n "$VERSAO" ]; then
                echo "   Versão: $VERSAO"
            fi
            
            # Mostrar como executar (se for um aplicativo gráfico)
            if [ -d "/usr/share/applications" ]; then
                DESKTOP_FILE=$(find /usr/share/applications -name "*$NOME_PACOTE*.desktop" 2>/dev/null | head -1)
                if [ -n "$DESKTOP_FILE" ]; then
                    NOME_APLICATIVO=$(grep "^Name=" "$DESKTOP_FILE" | head -1 | cut -d'=' -f2)
                    echo "   Aplicativo: $NOME_APLICATIVO"
                    echo "   Execute: Procure por '$NOME_APLICATIVO' no menu de aplicações"
                fi
            fi
        fi
    fi
else
    echo "❌ Erro na instalação. Verifique o arquivo .deb e tente novamente."
    exit 1
fi

echo ""
echo "=========================================="
echo "Instalação finalizada!"
echo "=========================================="