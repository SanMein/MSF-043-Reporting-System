// js/main.js - Главный контроллер
class ReportMain {
    constructor() {
        this.currentAccessLevel = 'delta';
        this.currentReportType = null;
        this.modules = {};
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.setupAccessControl();
        await this.initModules();
    }

    async initModules() {
        this.modules.prom = new PromReportModule();
        this.modules.disc = new DiscReportModule();
        this.modules.abs = new AbsReportModule();
        this.modules.leave = new LeaveReportModule();
        this.modules.operation = new OperationReportModule();

        window.promModule = this.modules.prom;
        window.discModule = this.modules.disc;
        window.absModule = this.modules.abs;
        window.leaveModule = this.modules.leave;
        window.operationModule = this.modules.operation;
    }

    setupEventListeners() {
        document.querySelectorAll('input[name="reportType"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.handleReportTypeChange(e.target.value);
            });
        });

        const copyBtn = document.getElementById('copy-preview-btn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => this.copyPreview());
        }

        const sendBtn = document.getElementById('send-webhook-btn');
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendToWebhook());
        }

        const accessInput = document.getElementById('access-code-input');
        if (accessInput) {
            accessInput.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    this.handleAccessCode(event.target.value.trim());
                    event.target.value = '';
                }
            });
        }
    }

    setupAccessControl() {
        const accessLevelSpan = document.getElementById('access-level');
        if (accessLevelSpan) {
            accessLevelSpan.textContent = 'Δ-DELTA';
            accessLevelSpan.className = 'access-level delta';
        }
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
        if (accessLevelSpan) {
            accessLevelSpan.textContent = level;
            accessLevelSpan.className = `access-level ${color}`;
        }

        this.showNotification(`Уровень доступа: ${level}`, 'success');

        if (this.currentReportType) {
            this.checkAccessAndReset();
        }
    }

    checkAccessAndReset() {
        const isGammaOrHigher = ['gamma', 'beta', 'alpha'].includes(this.currentAccessLevel);

        if (!isGammaOrHigher && (this.currentReportType === 'promotion' || this.currentReportType === 'discipline' || this.currentReportType === 'operation')) {
            this.showNotification('Недостаточно прав для заполнения данного типа рапорта', 'warning');
            document.querySelectorAll('input[name="reportType"]').forEach(radio => {
                radio.checked = false;
            });
            const container = document.getElementById('report-form-container');
            if (container) container.classList.add('hidden');
            this.currentReportType = null;
        }
    }

    async handleReportTypeChange(type) {
        const isGammaOrHigher = ['gamma', 'beta', 'alpha'].includes(this.currentAccessLevel);
        const isDeltaOrHigher = ['delta', 'gamma', 'beta', 'alpha'].includes(this.currentAccessLevel);

        // Promotion и Discipline требуют Gamma и выше
        if ((type === 'promotion' || type === 'discipline') && !isGammaOrHigher) {
            this.showNotification('Доступ запрещён. Требуется уровень Gamma и выше.', 'error');
            const radio = document.querySelector(`input[value="${type}"]`);
            if (radio) radio.checked = false;
            return;
        }

        // Operation также требует Gamma и выше (ИСПРАВЛЕНО)
        if (type === 'operation' && !isGammaOrHigher) {
            this.showNotification('Доступ запрещён. Требуется уровень Gamma и выше.', 'error');
            const radio = document.querySelector(`input[value="${type}"]`);
            if (radio) radio.checked = false;
            return;
        }

        // Absence и Leave требуют Delta и выше
        if ((type === 'absence' || type === 'leave') && !isDeltaOrHigher) {
            this.showNotification('Доступ запрещён. Требуется уровень Delta и выше.', 'error');
            const radio = document.querySelector(`input[value="${type}"]`);
            if (radio) radio.checked = false;
            return;
        }

        this.currentReportType = type;
        const container = document.getElementById('report-form-container');
        if (container) container.classList.remove('hidden');

        await window.templateLoader.loadForm(type, 'form-column');

        const module = this.getModuleByType(type);
        if (module && typeof module.setupListeners === 'function') {
            module.setupListeners();
            setTimeout(() => module.updatePreview(), 50);
        }
    }

    getModuleByType(type) {
        const mapping = {
            'promotion': this.modules.prom,
            'discipline': this.modules.disc,
            'absence': this.modules.abs,
            'leave': this.modules.leave,
            'operation': this.modules.operation
        };
        return mapping[type];
    }

    copyPreview() {
        const previewDiv = document.getElementById('report-preview');
        if (!previewDiv) return;

        let textToCopy = previewDiv.innerText;
        if (!textToCopy || textToCopy === 'Выберите тип рапорта и заполните форму') {
            this.showNotification('Нет данных для копирования', 'warning');
            return;
        }

        navigator.clipboard.writeText(textToCopy).then(() => {
            this.showNotification('Рапорт скопирован в буфер обмена', 'success');
        }).catch(() => {
            this.showNotification('Не удалось скопировать рапорт', 'error');
        });
    }

    sendToWebhook() {
        const previewDiv = document.getElementById('report-preview');
        if (!previewDiv) return;

        let reportText = previewDiv.innerText;

        if (!reportText || reportText === 'Выберите тип рапорта и заполните форму') {
            this.showNotification('Нет данных для отправки. Заполните форму рапорта.', 'warning');
            return;
        }

        const webhookUrl = 'https://discord.com/api/webhooks/1372820167075041330/VIn6cK4PQ0WAN3ADJJ8VdGhKDp_xfEpJgREEbTVgwQcxZ7laxc-mwIy6R9sUWsuLILye';

        const reportTitle = this.getReportTitle(this.currentReportType);

        const payload = {
            content: null,
            embeds: [{
                title: reportTitle,
                description: reportText.substring(0, 4000) + (reportText.length > 4000 ? '\n...[ТЕКСТ ОБРЕЗАН]' : ''),
                color: 0x7c4dff,
                footer: {
                    text: `MSF Reporting System | ${new Date().toLocaleString('ru-RU')}`
                },
                timestamp: new Date().toISOString()
            }]
        };

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
                throw new Error(`Ошибка ${response.status}`);
            }
        })
        .catch(error => {
            console.error('Webhook error:', error);
            this.showNotification('Ошибка отправки: ' + error.message, 'error');
        });
    }

    getReportTitle(type) {
        const titles = {
            'promotion': 'РАПОРТ О ПОВЫШЕНИИ | 05-REP-PROM',
            'discipline': 'РАПОРТ О ВЗЫСКАНИИ | 05-REP-DISC',
            'absence': 'РАПОРТ ОБ ОТСУТСТВИИ | 05-REP-ABS',
            'leave': 'РАПОРТ ОБ ОТПУСКЕ | 05-REP-LVE',
            'operation': 'РАПОРТ О РЕЗУЛЬТАТЕ ОПЕРАЦИИ | 05-REP-OPR'
        };
        return titles[type] || 'РАПОРТ MSF';
    }

    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        if (!notification) return;

        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.classList.remove('hidden');

        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';

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