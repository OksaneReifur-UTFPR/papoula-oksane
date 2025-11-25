#!/bin/bash

# ===============================================
# Script de Manutenção e Limpeza do Linux Mint
# ===============================================

echo "Iniciando a manutenção do sistema..."

# 1. ATUALIZAR LISTA DE PACOTES
echo -e "\n---> 1. Atualizando a lista de pacotes (apt update)..."
sudo apt update

# Verifica o código de saída do comando anterior. Se for 0, continua.
if [ $? -eq 0 ]; then
    # 2. ATUALIZAR PACOTES E INSTALAR NOVAS DEPENDÊNCIAS
    echo -e "\n---> 2. Verificando e instalando atualizações (apt upgrade)..."
    # O '-y' (yes) aceita automaticamente as atualizações
    sudo apt upgrade -y

    # 3. INSTALAR E REMOVER PACOTES AUTOMATICAMENTE (autoremove)
    echo -e "\n---> 3. Removendo pacotes e dependências desnecessárias (autoremove)..."
    sudo apt autoremove -y

    # 4. LIMPAR CACHE DE PACOTES
    echo -e "\n---> 4. Limpando o cache local de pacotes (autoclean)..."
    sudo apt autoclean

    echo -e "\n✅ Manutenção concluída com sucesso!"
else
    echo -e "\n❌ Erro ao executar 'apt update'. A manutenção foi interrompida."
fi

# Limpa o terminal para uma saída limpa
echo -e "\n"
