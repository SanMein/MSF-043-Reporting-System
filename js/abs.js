// js/abs.js - Модуль рапорта об отсутствии (05-REP-ABS)
class AbsReportModule {
    constructor() {
        this.setupListeners();
    }

    setupListeners() {
        const absFields = document.querySelectorAll('#absence-form input, #absence-form select, #absence-form textarea');
        absFields.forEach(field => {
            field.addEventListener('input', () => this.updatePreview());
            field.addEventListener('change', () => this.updatePreview());
        });

        document.getElementById('abs-reason-cat')?.addEventListener('change', (e) => {
            const otherBlock = document.getElementById('abs-reason-other-block');
            if (otherBlock) {
                otherBlock.classList.toggle('hidden', e.target.value !== 'Иное');
            }
            this.updatePreview();
        });

        document.getElementById('abs-substitution-need')?.addEventListener('change', (e) => {
            const subBlock = document.getElementById('abs-substitution-block');
            if (subBlock) {
                subBlock.classList.toggle('hidden', e.target.value !== 'Требуется замещение');
            }
            this.updatePreview();
        });
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

        const callsign = document.getElementById('abs-callsign')?.value || '[НЕ ЗАПОЛНЕНО]';
        const msfcode = document.getElementById('abs-msfcode')?.value || '[НЕ ЗАПОЛНЕНО]';
        const grade = document.getElementById('abs-grade')?.value || '[НЕ ВЫБРАН]';
        const service = document.getElementById('abs-service')?.value || 'Отсутствует';
        const position = document.getElementById('abs-position')?.value || 'Отсутствует';

        const startDate = this.getFormattedDate(document.getElementById('abs-start-date')?.value);
        const startTime = document.getElementById('abs-start-time')?.value || 'ЧЧ:ММ';
        const endDate = this.getFormattedDate(document.getElementById('abs-end-date')?.value);
        const duration = document.getElementById('abs-duration')?.value || '';

        const reasonCat = document.getElementById('abs-reason-cat')?.value || '';
        let reasonText = reasonCat;
        if (reasonCat === 'Иное') {
            const otherReason = document.getElementById('abs-reason-other')?.value || '';
            reasonText = `Иное: ${otherReason}`;
        }
        const reasonDetail = document.getElementById('abs-reason-detail')?.value || '';

        const availability = document.getElementById('abs-availability')?.value || '[НЕ ВЫБРАНО]';

        const substitutionNeed = document.getElementById('abs-substitution-need')?.value || 'Замещение не требуется';
        let substitutionText = '';
        if (substitutionNeed === 'Требуется замещение') {
            const subCallsign = document.getElementById('abs-sub-callsign')?.value || '';
            const subMsfcode = document.getElementById('abs-sub-msfcode')?.value || '';
            const subGrade = document.getElementById('abs-sub-grade')?.value || '';
            const subTasks = document.getElementById('abs-sub-tasks')?.value || '-';
            substitutionText = `\n**[ДАННЫЕ ЗАМЕЩАЮЩЕГО]**:\n**[ПОЗЫВНОЙ]**: ${subCallsign}\n**[ИДЕНТИФИКАТОР]**: ${subMsfcode}\n**[ГРЕЙД]**: ${subGrade}\n\n**[ПЕРЕДАННЫЕ ЗАДАЧИ / ОБЯЗАННОСТИ]**:\n> ${subTasks}`;
        } else {
            substitutionText = `\n**[ЗАМЕЩЕНИЕ]**: ${substitutionNeed}`;
        }

        const notes = document.getElementById('abs-notes')?.value || '-';

        let preview = `# Форма 05-REP-ABS\n`;
        preview += `**[ДАТА ЗАПОЛНЕНИЯ]**: ${currentDate}\n`;
        preview += `**[ВРЕМЯ ПОДАЧИ]**: ${currentTime} МСК\n\n`;
        preview += `———————————————————————\n\n`;
        preview += `### Данные заявителя\n`;
        preview += `**[ПОЗЫВНОЙ]**: ${callsign}\n`;
        preview += `**[ИДЕНТИФИКАТОР]**: ${msfcode}\n`;
        preview += `**[ТЕКУЩИЙ ОСНОВНОЙ ГРЕЙД]**: ${grade}\n`;
        preview += `**[ТЕКУЩИЙ СПЕЦИАЛИЗИРОВАННЫЙ ГРЕЙД]**: ${service}\n`;
        preview += `**[ДОЛЖНОСТЬ]**: ${position}\n\n`;
        preview += `———————————————————————\n\n`;
        preview += `### Период отсутствия\n`;
        preview += `**[НАЧАЛО]**: ${startDate} | ${startTime} МСК\n`;
        preview += `**[ОКОНЧАНИЕ]**: ${endDate}\n`;
        preview += `**[ОРИЕНТИРОВОЧНАЯ ПРОДОЛЖИТЕЛЬНОСТЬ]**: ${duration || '[НЕ УКАЗАНА]'}\n\n`;
        preview += `———————————————————————\n\n`;
        preview += `### Причина отсутствия\n`;
        preview += `**[ОСНОВНАЯ КАТЕГОРИЯ]**:\n[ ] ${reasonText || '[НЕ ВЫБРАНО]'}\n`;
        preview += `**[ДЕТАЛИЗАЦИЯ ПРИЧИНЫ]**:\n${reasonDetail || '[НЕ УКАЗАНА]'}\n\n`;
        preview += `———————————————————————\n\n`;
        preview += `### Статус обязанностей на период отсутствия\n`;
        preview += `**[УРОВЕНЬ ДОСТУПНОСТИ]**:\n[ ] ${availability}\n\n`;
        preview += `———————————————————————\n\n`;
        preview += `### Замещение`;
        preview += substitutionText + '\n\n';
        preview += `———————————————————————\n\n`;
        preview += `### Дополнительная информация\n`;
        preview += `**ПРИМЕЧАНИЯ**:\n${notes}\n\n`;
        preview += `———————————————————————\n\n`;
        preview += `### Подпись заявителя\n`;
        preview += `${callsign} | ${msfcode}\n`;

        document.getElementById('report-preview').innerHTML = preview.replace(/\n/g, '<br>');
    }
}
