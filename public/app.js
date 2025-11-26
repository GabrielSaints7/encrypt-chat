// public/app.js - VERSÃO SIMPLIFICADA E CORRIGIDA
class ChatApp {
    constructor() {
        this.currentUser = null;
        this.users = [];
        this.currentChat = null;
        this.chatType = null;
        this.messages = new Map(); // userId -> array de mensagens
        
        this.initializeApp();
    }

    initializeApp() {
        console.log('🚀 Inicializando Chat App...');
        this.initializeDOMElements();
        this.setupEventListeners();
        this.loadUsers();
    }

    initializeDOMElements() {
        console.log('🔍 Inicializando elementos DOM...');
        
        // Telas
        this.screens = {
            userSelection: document.getElementById('user-selection'),
            createUser: document.getElementById('create-user'),
            chatMain: document.getElementById('chat-main')
        };

        // Elementos da tela de seleção de usuário
        this.usersList = document.getElementById('users-list');
        this.createUserBtn = document.getElementById('create-user-btn');

        // Elementos da tela de criação de usuário
        this.createUserForm = document.getElementById('create-user-form');
        this.userNameInput = document.getElementById('user-name');
        this.userPhoneInput = document.getElementById('user-phone');
        this.userEmailInput = document.getElementById('user-email');
        this.backToSelectionBtn = document.getElementById('back-to-selection');

        // Elementos da tela principal do chat
        this.currentUserInfo = document.getElementById('current-user-info');
        this.logoutBtn = document.getElementById('logout-btn');
        this.directChatsList = document.getElementById('direct-chats-list');
        this.currentChatName = document.getElementById('current-chat-name');
        this.messagesContainer = document.getElementById('messages');
        this.messageInputContainer = document.getElementById('message-input-container');
        this.messageInput = document.getElementById('message-input');
        this.sendMessageBtn = document.getElementById('send-message-btn');

        // Modais
        this.newChatModal = document.getElementById('new-chat-modal');
        this.availableUsersList = document.getElementById('available-users-list');
        this.closeModalBtn = document.getElementById('close-modal');

        console.log(' Elementos DOM inicializados');
    }

    setupEventListeners() {
        console.log('🔗 Configurando event listeners...');
        
        // Navegação
        this.createUserBtn.addEventListener('click', () => {
            console.log('🎯 Botão criar usuário clicado!');
            this.showScreen('create-user');
        });

        this.backToSelectionBtn.addEventListener('click', () => {
            this.showScreen('user-selection');
        });

        this.logoutBtn.addEventListener('click', () => this.logout());

        // Formulários
        this.createUserForm.addEventListener('submit', (e) => {
            console.log(' Formulário de criar usuário submetido!');
            this.handleCreateUser(e);
        });

        // Chat
        this.sendMessageBtn.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        // Modais
        this.closeModalBtn.addEventListener('click', () => this.hideModal(this.newChatModal));

        console.log(' Event listeners configurados');
    }

    // Gerenciamento de Telas
    showScreen(screenName) {
        console.log(` Alterando para tela: ${screenName}`);
        Object.values(this.screens).forEach(screen => {
            screen.classList.remove('active');
        });
        this.screens[screenName].classList.add('active');
    }

    showModal(modal) {
        modal.classList.add('active');
    }

    hideModal(modal) {
        modal.classList.remove('active');
    }

    // Usuários
    async loadUsers() {
        try {
            console.log(' Carregando lista de usuários...');
            const response = await fetch('/api/users');
            
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            
            this.users = await response.json();
            this.renderUsers();
            console.log(` ${this.users.length} usuários carregados`);
        } catch (error) {
            console.error(' Erro ao carregar usuários:', error);
            this.showError('Erro ao carregar usuários');
        }
    }

    renderUsers() {
        if (!this.usersList) return;
        
        this.usersList.innerHTML = '';
        
        if (this.users.length === 0) {
            this.usersList.innerHTML = '<div class="no-users">Nenhum usuário cadastrado</div>';
            return;
        }

        this.users.forEach(user => {
            const userElement = document.createElement('div');
            userElement.className = 'user-item';
            userElement.innerHTML = `
                <div class="user-info">
                    <strong>${user.name}</strong>
                </div>
                <div class="user-details">
                    <small>${user.email}</small><br>
                    <small>${user.phone}</small>
                </div>
            `;
            userElement.addEventListener('click', () => this.selectUser(user));
            this.usersList.appendChild(userElement);
        });
    }

    async handleCreateUser(e) {
        e.preventDefault();
        console.log(' Iniciando criação de usuário...');
        
        // Obter valores dos campos
        const name = this.userNameInput.value.trim();
        const phone = this.userPhoneInput.value.trim();
        const email = this.userEmailInput.value.trim();

        console.log(' Dados do formulário:', { name, phone, email });

        // Validação básica
        if (!name || !phone || !email) {
            this.showError('Por favor, preencha todos os campos');
            return;
        }

        const userData = { name, phone, email };

        try {
            // Mostrar loading
            this.setFormLoading(true);

            const response = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });

            console.log('📡 Resposta da API:', response.status);

            if (response.ok) {
                const newUser = await response.json();
                console.log(' Usuário criado com sucesso:', newUser);
                
                // Adicionar à lista local
                this.users.push(newUser);
                this.renderUsers();
                
                // Limpar formulário e voltar para seleção
                this.createUserForm.reset();
                this.showScreen('user-selection');
                
                this.showSuccess('Usuário criado com sucesso!');
            } else {
                const errorData = await response.json();
                console.error(' Erro na resposta:', errorData);
                this.showError(`Erro: ${errorData.error}`);
            }
        } catch (error) {
            console.error(' Erro na requisição:', error);
            this.showError('Erro de conexão com o servidor');
        } finally {
            this.setFormLoading(false);
        }
    }

    setFormLoading(loading) {
        const submitBtn = this.createUserForm.querySelector('button[type="submit"]');
        if (submitBtn) {
            if (loading) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '⏳ Criando...';
            } else {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Criar Usuário';
            }
        }
    }

    selectUser(user) {
        console.log(` Selecionando usuário: ${user.name}`);
        this.currentUser = user;
        
        // Atualizar interface
        if (this.currentUserInfo) {
            this.currentUserInfo.innerHTML = `
                <strong>${user.name}</strong><br>
                <small>${user.email}</small>
            `;
        }
        
        this.showScreen('chat-main');
        this.loadConversations();
        this.showSuccess(`Bem-vindo, ${user.name}!`);
    }

    loadConversations() {
        if (!this.directChatsList) return;
        
        this.directChatsList.innerHTML = '';
        const otherUsers = this.users.filter(user => user.id !== this.currentUser.id);
        
        if (otherUsers.length === 0) {
            this.directChatsList.innerHTML = '<div class="no-chats">Nenhum outro usuário para conversar</div>';
            return;
        }

        otherUsers.forEach(user => {
            const chatElement = document.createElement('div');
            chatElement.className = 'chat-item';
            chatElement.innerHTML = `
                <strong>${user.name}</strong>
                <small>${user.email}</small>
            `;
            chatElement.addEventListener('click', () => this.startChat(user));
            this.directChatsList.appendChild(chatElement);
        });
    }

    startChat(otherUser) {
        console.log(`💬 Iniciando chat com: ${otherUser.name}`);
        this.currentChat = otherUser;
        this.chatType = 'direct';
        
        // Atualizar interface
        if (this.currentChatName) {
            this.currentChatName.textContent = `Conversando com ${otherUser.name}`;
        }
        
        if (this.messageInputContainer) {
            this.messageInputContainer.style.display = 'flex';
        }
        
        // Carregar mensagens existentes
        this.loadMessages();
        
        // Focar no input de mensagem
        if (this.messageInput) {
            this.messageInput.focus();
        }
    }

    loadMessages() {
        if (!this.messagesContainer) return;
        
        // Inicializar array de mensagens se não existir
        if (!this.messages.has(this.currentChat.id)) {
            this.messages.set(this.currentChat.id, []);
        }
        
        const chatMessages = this.messages.get(this.currentChat.id);
        this.renderMessages(chatMessages);
    }

    renderMessages(messages) {
        if (!this.messagesContainer) return;
        
        this.messagesContainer.innerHTML = '';
        
        if (messages.length === 0) {
            this.messagesContainer.innerHTML = `
                <div class="no-messages">
                    Nenhuma mensagem ainda. Envie a primeira mensagem!
                </div>
            `;
            return;
        }

        messages.forEach(message => {
            const messageElement = document.createElement('div');
            messageElement.className = `message ${message.isOwn ? 'own' : 'other'}`;
            
            messageElement.innerHTML = `
                <div class="message-sender">${message.isOwn ? 'Você' : this.currentChat.name}</div>
                <div class="message-content">${message.content}</div>
                <div class="message-time">${message.timestamp}</div>
            `;
            
            this.messagesContainer.appendChild(messageElement);
        });
        
        // Rolagem para a última mensagem
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    sendMessage() {
        if (!this.messageInput || !this.currentChat) return;
        
        const content = this.messageInput.value.trim();
        if (!content) return;

        console.log(`📤 Enviando mensagem para ${this.currentChat.name}: ${content}`);

        // Criar objeto de mensagem
        const message = {
            content: content,
            isOwn: true,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            senderId: this.currentUser.id,
            receiverId: this.currentChat.id
        };

        // Adicionar à lista local
        if (!this.messages.has(this.currentChat.id)) {
            this.messages.set(this.currentChat.id, []);
        }
        this.messages.get(this.currentChat.id).push(message);
        
        // Atualizar interface
        this.renderMessages(this.messages.get(this.currentChat.id));
        
        // Limpar input
        this.messageInput.value = '';
        
        // Simular resposta (em um app real, isso viria do WebSocket)
        setTimeout(() => {
            this.simulateReply();
        }, 1000 + Math.random() * 2000);
    }

    simulateReply() {
        if (!this.currentChat) return;
        
        const replies = [
            "Olá! Como você está?",
            "Obrigado pela mensagem!",
            "Estou bem, e você?",
            "Interessante, conte me mais!",
            "Vamos marcar de nos encontrar?",
            "Que bom ouvir você!"
        ];
        
        const randomReply = replies[Math.floor(Math.random() * replies.length)];
        
        const replyMessage = {
            content: randomReply,
            isOwn: false,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            senderId: this.currentChat.id,
            receiverId: this.currentUser.id
        };

        if (!this.messages.has(this.currentChat.id)) {
            this.messages.set(this.currentChat.id, []);
        }
        this.messages.get(this.currentChat.id).push(replyMessage);
        this.renderMessages(this.messages.get(this.currentChat.id));
        
        console.log(`🤖 Resposta simulada de ${this.currentChat.name}: ${randomReply}`);
    }

    logout() {
        console.log('🚪 Efetuando logout...');
        this.currentUser = null;
        this.currentChat = null;
        this.messages.clear();
        this.showScreen('user-selection');
        console.log(' Logout realizado');
    }

    // Feedback visual
    showError(message) {
        alert(` ${message}`);
    }

    showSuccess(message) {
        alert(` ${message}`);
    }
}

// Inicializar aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM carregado, inicializando aplicação...');
    window.chatApp = new ChatApp();
});