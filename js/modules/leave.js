// js/modules/leave.js - Модуль рапорта об отпуске (05-REP-LVE)
class LeaveReportModule {
    constructor() {
        // Не вызываем setupListeners автоматически — ждём загрузки HTML
    }

    setupListeners() {
        const leaveFields = document.querySelectorAll('#leave-form input, #leave-form select, #leave-form textarea');
        leaveFields.forEach(field => {
            field.removeEventListener('input', this._boundUpdatePreview);
            field.removeEventListener('change', this._boundUpdatePreview);
            this._boundUpdatePreview = () => this.updatePreview();
            field.addEventListener('input', this._boundUpdatePreview);
            field.addEventListener('change', this._boundUpdatePreview);
        });

        const reasonCat = document.getElementById('leave-reason-cat');
        if (reasonCat) {
            reasonCat.removeEventListener('change', this._boundReasonHandler);
            this._boundReasonHandler = (e) => {
                const otherBlock = document.getElementById('leave-reason-other-block');
                if (otherBlock) {
                    otherBlock.classList.toggle('hidden', e.target.value !== 'Иное');
                }
                this.updatePreview();
            };
            reasonCat.addEventListener('change', this._boundReasonHandler);
        }

        const substitutionNeed = document.getElementById('leave-substitution-need');
        if (substitutionNeed) {
            substitutionNeed.removeEventListener('change', this._boundSubHandler);
            this._boundSubHandler = (e) => {
                const subBlock = document.getElementById('leave-substitution-block');
                if (subBlock) {
                    subBlock.classList.toggle('hidden', e.target.value !== 'Требуется замещение');
                }
                this.updatePreview();
            };
            substitutionNeed.addEventListener('change', this._boundSubHandler);
        }

        const subBlock = document.getElementById('leave-substitution-block');
        const subNeed = document.getElementById('leave-substitution-need')?.value;
        if (subBlock && subNeed) {
            subBlock.classList.toggle('hidden', subNeed !== 'Требуется замещение');
        }

        const otherBlock = document.getElementById('leave-reason-other-block');
        const reasonVal = document.getElementById('leave-reason-cat')?.value;
        if (otherBlock && reasonVal) {
            otherBlock.classList.toggle('hidden', reasonVal !== 'Иное');
        }

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

        const callsign = document.getElementById('leave-callsign')?.value || '[НЕ ЗАПОЛНЕНО]';
        const msfcode = document.getElementById('leave-msfcode')?.value || '[НЕ ЗАПОЛНЕНО]';
        const grade = document.getElementById('leave-grade')?.value || '[НЕ ВЫБРАН]';
        const service = document.getElementById('leave-service')?.value || 'Отсутствует';
        const position = document.getElementById('leave-position')?.value || '';

        const startDate = this.getFormattedDate(document.getElementById('leave-start-date')?.value);
        const startTime = document.getElementById('leave-start-time')?.value || 'ЧЧ:ММ';
        const endDate = this.getFormattedDate(document.getElementById('leave-end-date')?.value);
        const endTime = document.getElementById('leave-end-time')?.value || 'ЧЧ:ММ';
        const duration = document.getElementById('leave-duration')?.value || '';

        const reasonCat = document.getElementById('leave-reason-cat')?.value || '';
        let reasonText = reasonCat;
        if (reasonCat === 'Иное') {
            const otherReason = document.getElementById('leave-reason-other')?.value || '';
            reasonText = `Иное: ${otherReason}`;
        }
        const reasonDetail = document.getElementById('leave-reason-detail')?.value || '';

        const availability = document.getElementById('leave-availability')?.value || '[НЕ ВЫБРАНО]';

        const substitutionNeed = document.getElementById('leave-substitution-need')?.value || 'Замещение не требуется';
        let substitutionText = '';

        if (substitutionNeed === 'Требуется замещение') {
            const subCallsign = document.getElementById('leave-sub-callsign')?.value || '';
            const subMsfcode = document.getElementById('leave-sub-msfcode')?.value || '';
            const subGrade = document.getElementById('leave-sub-grade')?.value || '';
            let subTasks = document.getElementById('leave-sub-tasks')?.value || '';

            if (subTasks) {
                subTasks = subTasks.split('\n').map(line => `> ${line}`).join('\n');
            } else {
                subTasks = '> -';
            }

            substitutionText = `\n**[ДАННЫЕ ЗАМЕЩАЮЩЕГО]**:\n**[ПОЗЫВНОЙ]**: ${subCallsign || '[НЕ УКАЗАН]'}\n**[ИДЕНТИФИКАТОР]**: ${subMsfcode || '[НЕ УКАЗАН]'}\n**[ГРЕЙД]**: ${subGrade || '[НЕ УКАЗАН]'}\n\n**[ПЕРЕДАННЫЕ ЗАДАЧИ / ОБЯЗАННОСТИ]**:\n${subTasks}`;
        } else {
            substitutionText = `\n**[ЗАМЕЩЕНИЕ]**: ${substitutionNeed}`;
        }

        const notes = document.getElementById('leave-notes')?.value || '-';

        let preview = `# Форма 05-REP-LVE\n`;
        preview += `**[ДАТА ЗАПОЛНЕНИЯ]**: ${currentDate}\n`;
        preview += `**[ВРЕМЯ ПОДАЧИ]**: ${currentTime} МСК\n\n`;
        preview += `———————————————————————\n\n`;
        preview += `### Данные заявителя\n`;
        preview += `**[ПОЗЫВНОЙ]**: ${callsign}\n`;
        preview += `**[ИДЕНТИФИКАТОР]**: ${msfcode}\n`;
        preview += `**[ТЕКУЩИЙ ОСНОВНОЙ ГРЕЙД]**: ${grade}\n`;
        preview += `**[ТЕКУЩИЙ КОРПУС]**: ${service}\n`;
        if (position) preview += `**[ДОЛЖНОСТЬ]**: ${position}\n`;
        preview += `\n———————————————————————\n\n`;
        preview += `### Период запрашиваемого отпуска\n`;

        const hasStartDate = document.getElementById('leave-start-date')?.value;
        const hasEndDate = document.getElementById('leave-end-date')?.value;

        if (hasStartDate && hasEndDate) {
            preview += `**[НАЧАЛО]**: ${startDate} | ${startTime} МСК\n`;
            preview += `**[ОКОНЧАНИЕ]**: ${endDate} | ${endTime} МСК\n`;
        } else if (duration) {
            preview += `**[ОРИЕНТИРОВОЧНАЯ ПРОДОЛЖИТЕЛЬНОСТЬ]**: ${duration}\n`;
        } else {
            preview += `**[ПЕРИОД НЕ УКАЗАН]**\n`;
        }

        preview += `\n———————————————————————\n\n`;
        preview += `### Причина отпуска\n`;
        preview += `**[ОСНОВНАЯ КАТЕГОРИЯ]**:\n[ ] ${reasonText || '[НЕ ВЫБРАНО]'}\n\n`;
        preview += `**[ДЕТАЛИЗАЦИЯ ПРИЧИНЫ]**:\n${reasonDetail || '[НЕ УКАЗАНА]'}\n\n`;
        preview += `———————————————————————\n\n`;
        preview += `### Статус обязанностей на период отпуска\n`;
        preview += `**[УРОВЕНЬ ДОСТУПНОСТИ]**:\n[ ] ${availability}\n\n`;
        preview += `———————————————————————\n\n`;
        preview += `### Замещение\n`;
        preview += `**[НЕОБХОДИМОСТЬ ЗАМЕЩЕНИЯ]**:\n[ ] ${substitutionNeed}\n`;
        preview += substitutionText + '\n\n';
        preview += `———————————————————————\n\n`;
        preview += `### Дополнительная информация\n`;
        preview += `**ПРИМЕЧАНИЯ**:\n${notes}\n\n`;
        preview += `———————————————————————\n\n`;
        preview += `### Подпись заявителя\n`;
        preview += `${callsign} | ${msfcode}\n`;

        const previewDiv = document.getElementById('report-preview');
        if (previewDiv) previewDiv.innerHTML = preview.replace(/\n/g, '<br>');
    }
}