// js/main.js
class ReportMain {
    constructor() {
        this.currentAccessLevel = 'delta';
        this.currentReportType = null;
        this.promModule = null;
        this.discModule = null;
        this.absModule = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupAccessControl();
        this.initModules();
    }

    initModules() {
        this.promModule = new PromReportModule();
        this.discModule = new DiscReportModule();
        this.absModule = new AbsReportModule();
    }

    sendToWebhook() {
        const previewDiv = document.getElementById('report-preview');
        let reportText = previewDiv.innerText;

        if (!reportText || reportText === 'Выберите тип рапорта и заполните форму') {
            this.showNotification('Нет данных для отправки. Заполните форму рапорта.', 'warning');
            return;
        }

        const webhookUrl = 'https://discord.com/api/webhooks/1372820167075041330/VIn6cK4PQ0WAN3ADJJ8VdGhKDp_xfEpJgREEbTVgwQcxZ7laxc-mwIy6R9sUWsuLILye';

        const payload = {
            content: null,
            embeds: [{
                title: `РАПОРТ | ${this.currentReportType ? this.currentReportType.toUpperCase() : 'UNKNOWN'}`,
                description: '```' + reportText + '```',
                color: 0x7c4dff,
                footer: {
                    text: `MSF-043 | Reporting System | ${new Date().toLocaleString('ru-RU')}`
                },
                timestamp: new Date().toISOString()
            }]
        };

        // Ограничение Discord: embed description не более 4096 символов
        if (reportText.length > 4096) {
            payload.embeds[0].description = '```' + reportText.substring(0, 3950) + '\n...[ТЕКСТ ОБРЕЗАН ИЗ-ЗА ЛИМИТА DISCORD]```';
        }

        this.showNotification('Отправка рапорта в Discord...', 'info');

        fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        })
        .then(response => {
            if (response.ok) {
                this.showNotification('Рапорт успешно отправлен в Discord', 'success');
            } else {
                return response.text().then(text => { throw new Error(`Ошибка ${response.status}: ${text}`); });
            }
        })
        .catch(error => {
            console.error('Webhook error:', error);
            this.showNotification('Ошибка отправки: ' + error.message, 'error');
        });
    }

    setupEventListeners() {
        document.querySelectorAll('input[name="reportType"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.handleReportTypeChange(e.target.value);
            });
        });

        document.getElementById('copy-preview-btn').addEventListener('click', () => {
            this.copyPreview();
        });

        document.getElementById('send-webhook-btn').addEventListener('click', () => {
            this.sendToWebhook();
        });

        document.getElementById('access-code-input').addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                this.handleAccessCode(event.target.value.trim());
                event.target.value = '';
            }
        });
    }

    setupAccessControl() {
        const accessLevelSpan = document.getElementById('access-level');
        accessLevelSpan.textContent = 'Δ-DELTA';
        accessLevelSpan.className = 'access-level delta';
    }

    handleAccessCode(code) {
        let level, color, newLevel;

        switch(code) {
            case "GAMMAC-917230485619827364012398172034-TACOPS":
                newLevel = 'gamma';
                level = "Γ-GAMMA";
                color = "gamma";
                break;
            case "BETACX-042918637561290837465120934576-CMDOPS":
                newLevel = 'beta';
                level = "Β-BETA";
                color = "beta";
                break;
            case "ALPHAC-781296540128399317460325120458-GENCOM":
                newLevel = 'alpha';
                level = "Α-ALPHA";
                color = "alpha";
                break;
            default:
                newLevel = 'delta';
                level = "Δ-DELTA";
                color = "delta";
        }

        this.currentAccessLevel = newLevel;
        const accessLevelSpan = document.getElementById('access-level');
        accessLevelSpan.textContent = level;
        accessLevelSpan.className = `access-level ${color}`;

        this.showNotification(`Уровень доступа: ${level}`, 'success');

        if (this.currentReportType) {
            this.checkAccessAndReset();
        }
    }

    checkAccessAndReset() {
        const isGammaOrHigher = ['gamma', 'beta', 'alpha'].includes(this.currentAccessLevel);

        if (!isGammaOrHigher && (this.currentReportType === 'promotion' || this.currentReportType === 'discipline')) {
            this.showNotification('Недостаточно прав для заполнения данного типа рапорта', 'warning');
            document.querySelectorAll('input[name="reportType"]').forEach(radio => {
                radio.checked = false;
            });
            document.getElementById('report-form-container').classList.add('hidden');
            this.currentReportType = null;
        }
    }

    handleReportTypeChange(type) {
        const isGammaOrHigher = ['gamma', 'beta', 'alpha'].includes(this.currentAccessLevel);

        if ((type === 'promotion' || type === 'discipline') && !isGammaOrHigher) {
            this.showNotification('Доступ запрещён. Требуется уровень Gamma и выше.', 'error');
            document.querySelector(`input[value="${type}"]`).checked = false;
            return;
        }

        this.currentReportType = type;
        document.getElementById('report-form-container').classList.remove('hidden');

        document.getElementById('promotion-form').classList.add('hidden');
        document.getElementById('discipline-form').classList.add('hidden');
        document.getElementById('absence-form').classList.add('hidden');

        if (type === 'promotion') {
            document.getElementById('promotion-form').classList.remove('hidden');
            this.promModule.updatePreview();
        } else if (type === 'discipline') {
            document.getElementById('discipline-form').classList.remove('hidden');
            this.discModule.updatePreview();
        } else if (type === 'absence') {
            document.getElementById('absence-form').classList.remove('hidden');
            this.absModule.updatePreview();
        }
    }

    copyPreview() {
        const previewDiv = document.getElementById('report-preview');
        let textToCopy = previewDiv.innerText;

        navigator.clipboard.writeText(textToCopy).then(() => {
            this.showNotification('Рапорт скопирован в буфер обмена', 'success');
        }).catch(() => {
            this.showNotification('Не удалось скопировать рапорт', 'error');
        });
    }

    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.classList.remove('hidden');

        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 10);

        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.classList.add('hidden'), 300);
        }, 4000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.reportMain = new ReportMain();
});