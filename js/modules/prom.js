// js/modules/prom.js - Модуль рапорта о повышении (05-REP-PROM)
class PromReportModule {
    constructor() {
        // Не вызываем setupListeners автоматически — ждём загрузки HTML
    }

    setupListeners() {
        const promoFields = document.querySelectorAll('#promotion-form input, #promotion-form select, #promotion-form textarea');
        promoFields.forEach(field => {
            field.removeEventListener('input', this._boundUpdatePreview);
            field.removeEventListener('change', this._boundUpdatePreview);
            this._boundUpdatePreview = () => this.updatePreview();
            field.addEventListener('input', this._boundUpdatePreview);
            field.addEventListener('change', this._boundUpdatePreview);
        });

        const basisSelect = document.getElementById('promo-basis');
        if (basisSelect) {
            basisSelect.removeEventListener('change', this._boundBasisHandler);
            this._boundBasisHandler = (e) => this.toggleBasisBlocks(e.target.value);
            basisSelect.addEventListener('change', this._boundBasisHandler);
        }

        const typeSelect = document.getElementById('promo-type');
        if (typeSelect) {
            typeSelect.removeEventListener('change', this._boundTypeHandler);
            this._boundTypeHandler = (e) => this.togglePromotionType(e.target.value);
            typeSelect.addEventListener('change', this._boundTypeHandler);
        }

        const serviceSelect = document.getElementById('promo-service2');
        if (serviceSelect) {
            serviceSelect.removeEventListener('change', this._boundServiceHandler);
            this._boundServiceHandler = (e) => this.updateSpecializedGrades(e.target.value);
            serviceSelect.addEventListener('change', this._boundServiceHandler);
        }

        this.updatePreview();
    }

    toggleBasisBlocks(value) {
        const operationBlock = document.getElementById('promo-operation-block');
        const eventBlock = document.getElementById('promo-event-block');

        if (operationBlock) operationBlock.classList.toggle('hidden', value !== 'operation');
        if (eventBlock) eventBlock.classList.toggle('hidden', value !== 'event');
        this.updatePreview();
    }

    togglePromotionType(value) {
        const combatBlock = document.getElementById('promo-combat-block');
        const specializedBlock = document.getElementById('promo-specialized-block');

        if (combatBlock) combatBlock.classList.toggle('hidden', value !== 'combat');
        if (specializedBlock) specializedBlock.classList.toggle('hidden', value !== 'specialized');
        this.updatePreview();
    }

    updateSpecializedGrades(service) {
        const gradeSelect = document.getElementById('promo-specialized-grade');
        if (!gradeSelect) return;

        let options = [];
        switch(service) {
            case 'SSC': options = ['SSC-1', 'SSC-2', 'SSC-3', 'SSC-4']; break;
            case 'RSC': options = ['RSC-1', 'RSC-2', 'RSC-3', 'RSC-4']; break;
            case 'MSC': options = ['MSC-1', 'MSC-2', 'MSC-3']; break;
            case 'TSC': options = ['TSC-1', 'TSC-2', 'TSC-3', 'TSC-4']; break;
            default: options = [];
        }

        gradeSelect.innerHTML = '<option value="">-- ВЫБЕРИТЕ --</option>';
        options.forEach(opt => {
            gradeSelect.innerHTML += `<option value="${opt}">${opt}</option>`;
        });
        this.updatePreview();
    }

    getFormattedDate(dateValue) {
        if (!dateValue) return '[ДД.ММ.ГГГГ]';
        const date = new Date(dateValue);
        return date.toLocaleDateString('ru-RU');
    }

    getCurrentDateTime() {
        const now = new Date();
        const date = now.toLocaleDateString('ru-RU');
        const time = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        return { date, time };
    }

    updatePreview() {
        const { date: currentDate, time: currentTime } = this.getCurrentDateTime();

        const callsign1 = document.getElementById('promo-callsign1')?.value || '[НЕ ЗАПОЛНЕНО]';
        const msfcode1 = document.getElementById('promo-msfcode1')?.value || '[НЕ ЗАПОЛНЕНО]';
        const grade1 = document.getElementById('promo-grade1')?.value || '[НЕ ЗАПОЛНЕНО]';
        const service1 = document.getElementById('promo-service1')?.value || '[НЕ ВЫБРАНА]';
        const position = document.getElementById('promo-position')?.value || '[НЕ ЗАПОЛНЕНО]';

        const callsign2 = document.getElementById('promo-callsign2')?.value || '[НЕ ЗАПОЛНЕНО]';
        const msfcode2 = document.getElementById('promo-msfcode2')?.value || '[НЕ ЗАПОЛНЕНО]';
        const grade2 = document.getElementById('promo-grade2')?.value || '[НЕ ЗАПОЛНЕНО]';
        const service2 = document.getElementById('promo-service2')?.value || '[НЕ ВЫБРАНА]';

        const eventDate = this.getFormattedDate(document.getElementById('promo-date')?.value);
        const basis = document.getElementById('promo-basis')?.value;

        let operationName = '', operationDesc = '', eventType = '', eventDesc = '';
        if (basis === 'operation') {
            operationName = document.getElementById('promo-operation-name')?.value || '';
            operationDesc = document.getElementById('promo-operation-desc')?.value || '';
        } else if (basis === 'event') {
            eventType = document.getElementById('promo-event-type')?.value || '';
            eventDesc = document.getElementById('promo-event-desc')?.value || '';
        }

        const tactical = document.getElementById('promo-tactical')?.value || '';
        const teamwork = document.getElementById('promo-teamwork')?.value || '';
        const weapon = document.getElementById('promo-weapon')?.value || '';
        const leadership = document.getElementById('promo-leadership')?.value || '';
        const extra = document.getElementById('promo-extra')?.value || '';

        const promoType = document.getElementById('promo-type')?.value;
        let newGrade = '', specializedGrade = '';
        if (promoType === 'combat') {
            newGrade = document.getElementById('promo-new-grade')?.value || '';
        } else if (promoType === 'specialized') {
            specializedGrade = document.getElementById('promo-specialized-grade')?.value || '';
        }

        const justification = document.getElementById('promo-justification')?.value || '';

        let preview = `# Форма 05-REP-PROM\n`;
        preview += `**[ДАТА ЗАПОЛНЕНИЯ]**: ${currentDate}\n`;
        preview += `**[ВРЕМЯ ПОДАЧИ]**: ${currentTime} МСК\n\n`;
        preview += `———————————————————————\n\n`;
        preview += `### Данные заявителя\n`;
        preview += `**[ПОЗЫВНОЙ]**: ${callsign1}\n`;
        preview += `**[ИДЕНТИФИКАТОР]**: ${msfcode1}\n`;
        preview += `**[ТЕКУЩИЙ ОСНОВНОЙ ГРЕЙД]**: ${grade1}\n`;
        preview += `**[ТЕКУЩИЙ КОРПУС]**: ${service1}\n`;
        preview += `**[ДОЛЖНОСТЬ]**: ${position}\n\n`;
        preview += `———————————————————————\n\n`;
        preview += `### Данные предоставляемого оперативника\n`;
        preview += `**[ПОЗЫВНОЙ]**: ${callsign2}\n`;
        preview += `**[ИДЕНТИФИКАТОР]**: ${msfcode2}\n`;
        preview += `**[ТЕКУЩИЙ ОСНОВНОЙ ГРЕЙД]**: ${grade2}\n`;
        preview += `**[ТЕКУЩИЙ КОРПУС]**: ${service2}\n\n`;
        preview += `———————————————————————\n\n`;
        preview += `### Обстоятельство, послужившие основанием\n`;
        preview += `**[ДАТА ОПЕРАЦИИ / МЕРОПРИЯТИЯ]**: ${eventDate}\n`;

        if (basis === 'operation') {
            preview += `**[НАИМЕНОВАНИЕ ОПЕРАЦИИ]**: "${operationName}"\n`;
            preview += `### Описание:\n${operationDesc || '[НЕ ЗАПОЛНЕНО]'}\n`;
        } else if (basis === 'event') {
            preview += `**[ТИП МЕРОПРИЯТИЯ]**: ${eventType || '[НЕ ВЫБРАН]'}\n`;
            preview += `### Описание:\n${eventDesc || '[НЕ ЗАПОЛНЕНО]'}\n`;
        } else {
            preview += `**[ОСНОВАНИЕ НЕ ВЫБРАНО]**\n`;
        }

        preview += `\n———————————————————————\n\n`;
        preview += `### Оценка действий представляемого\n`;
        preview += `В ходе мероприятия оперативник ${callsign2} проявил следующие качества:\n\n`;
        preview += `ТАКТИЧЕСКАЯ ГРАМОТНОСТЬ:\n${tactical || '[НЕ ЗАПОЛНЕНО]'}\n\n`;
        preview += `ВЗАИМОДЕЙСТВИЕ С ГРУППОЙ:\n${teamwork || '[НЕ ЗАПОЛНЕНО]'}\n\n`;
        preview += `ВЛАДЕНИЕ ОРУЖИЕМ И СНАРЯЖЕНИЕМ:\n${weapon || '[НЕ ЗАПОЛНЕНО]'}\n\n`;
        preview += `ИНИЦИАТИВА И ЛИДЕРСКИЕ КАЧЕСТВА:\n${leadership || '[НЕ ЗАПОЛНЕНО]'}\n\n`;
        preview += `ДОПОЛНИТЕЛЬНЫЕ НАБЛЮДЕНИЯ:\n${extra || '[НЕ ЗАПОЛНЕНО]'}\n\n`;
        preview += `———————————————————————\n\n`;
        preview += `### Рекомендация\n`;
        preview += `На основании вышеизложенного ХОДАТАЙСТВУЮ:\n`;

        if (promoType === 'combat') {
            preview += `[X] О повышении основного боевого грейда: ${grade2} → ${newGrade || '[НЕ ВЫБРАН]'}\n`;
            preview += `[ ] О повышении уровня корпуса\n`;
        } else if (promoType === 'specialized') {
            preview += `[ ] О повышении основного боевого грейда\n`;
            preview += `[X] О повышении уровня корпуса: ${service2} → ${specializedGrade || '[НЕ ВЫБРАН]'}\n`;
        } else {
            preview += `[ ] О повышении основного боевого грейда\n`;
            preview += `[ ] О повышении уровня корпуса\n`;
        }

        preview += `[ ] О присвоении первичного уровня корпуса: [ОТСУТСТВУЕТ] → [НОВЫЙ]\n\n`;
        preview += `#### Обоснование соответствия новому грейду:\n${justification || '[НЕ ЗАПОЛНЕНО]'}\n\n`;
        preview += `———————————————————————\n\n`;
        preview += `### Подпись заявителя\n`;
        preview += `${position} | ${callsign1} | ${msfcode1}\n`;

        const previewDiv = document.getElementById('report-preview');
        if (previewDiv) previewDiv.innerHTML = preview.replace(/\n/g, '<br>');
    }
}