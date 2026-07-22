import { LightningElement } from 'lwc';
import answerQuestion from '@salesforce/apex/SkillMapChatController.answerQuestion';

export default class SkillMapChat extends LightningElement {
    question = '';
    isLoading = false;
    messageCounter = 1;

    messages = [
        {
            id: 1,
            text:
                'Hello! I am the AceInt Career Assistant.\n\n' +
                'Ask me about the occupation, important skills, knowledge, ' +
                'abilities, tasks, software, or work environment.',
            senderName: 'AceInt Assistant',
            isBot: true,
            isUser: false,
            rowClass: 'message-row bot-row',
            bubbleClass: 'message-bubble bot-bubble'
        }
    ];

    get isSendDisabled() {
        return this.isLoading || !this.question.trim();
    }

    handleQuestionChange = (event) => {
        this.question = event.target.value;
        this.resizeTextarea(event.target);
    }

    handleKeyDown = (event) => {
        if (
            event.key === 'Enter' &&
            !event.shiftKey &&
            !this.isLoading
        ) {
            event.preventDefault();
            this.sendQuestion();
        }
    }

    handleSuggestion = (event) => {
        if (this.isLoading) {
            return;
        }

        this.question = event.currentTarget.dataset.question;
        this.sendQuestion();
    }

    handleSend = () => {
        this.sendQuestion();
    }

    async sendQuestion() {
        const currentQuestion = this.question.trim();

        if (!currentQuestion || this.isLoading) {
            return;
        }

        this.addMessage(currentQuestion, 'user');

        this.question = '';
        this.resetTextarea();
        this.isLoading = true;
        this.scrollToLatestMessage();

        try {
            const response = await answerQuestion({
                question: currentQuestion
            });

            this.addMessage(
                response || 'No answer was returned.',
                'bot'
            );
        } catch (error) {
            console.error('Chatbot error:', error);

            const errorMessage =
                error?.body?.message ||
                error?.message ||
                'Something went wrong while retrieving the answer.';

            this.addMessage(
                `Sorry, I could not complete that request.\n\n${errorMessage}`,
                'bot'
            );
        } finally {
            this.isLoading = false;
            this.scrollToLatestMessage();
        }
    }

    addMessage(text, sender) {
        this.messageCounter += 1;

        const isUser = sender === 'user';

        const newMessage = {
            id: this.messageCounter,
            text,
            senderName: isUser ? 'You' : 'AceInt Assistant',
            isUser,
            isBot: !isUser,
            rowClass: isUser
                ? 'message-row user-row'
                : 'message-row bot-row',
            bubbleClass: isUser
                ? 'message-bubble user-bubble'
                : 'message-bubble bot-bubble'
        };

        this.messages = [...this.messages, newMessage];

        this.scrollToLatestMessage();
    }

    resizeTextarea(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height =
            `${Math.min(textarea.scrollHeight, 120)}px`;
    }

    resetTextarea() {
        requestAnimationFrame(() => {
            const textarea =
                this.template.querySelector('.question-input');

            if (textarea) {
                textarea.value = '';
                textarea.style.height = '48px';
            }
        });
    }

    scrollToLatestMessage() {
        requestAnimationFrame(() => {
            const conversation =
                this.template.querySelector('[data-id="conversation"]');

            if (conversation) {
                conversation.scrollTop =
                    conversation.scrollHeight;
            }
        });
    }
}