// js/modules/operation.js - Модуль рапорта о результате операции (05-REP-OPR)
class OperationReportModule {
    constructor() {
        // Не вызываем setupListeners автоматически — ждём загрузки HTML
    }

    setupListeners() {
        const opFields = document.querySelectorAll('#operation-form input, #operation-form select, #operation-form textarea');
        opFields.forEach(field => {
            field.removeEventListener('input', this._boundUpdatePreview);
            field.removeEventListener('change', this._boundUpdatePreview);
            this._boundUpdatePreview = () => this.updatePreview();
            field.addEventListener('input', this._boundUpdatePreview);
            field.addEventListener('change', this._boundUpdatePreview);
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

        const callsign = document.getElementById('op-callsign')?.value || '[НЕ ЗАПОЛНЕНО]';
        const msfcode = document.getElementById('op-msfcode')?.value || '[НЕ ЗАПОЛНЕНО]';
        const position = document.getElementById('op-position')?.value || '[НЕ ВЫБРАНА]';

        const opName = document.getElementById('op-name')?.value || '[НЕ УКАЗАНО]';
        const opCode = document.getElementById('op-code')?.value || '[НЕ УКАЗАН]';
        const opDate = this.getFormattedDate(document.getElementById('op-date')?.value);
        const opTime = document.getElementById('op-time')?.value || 'ЧЧ:ММ';
        const opLocation = document.getElementById('op-location')?.value || '[НЕ УКАЗАНА]';

        const participants = document.getElementById('op-participants')?.value || '[НЕ УКАЗАНЫ]';
        const totalCount = document.getElementById('op-total-count')?.value || '?';

        const status = document.getElementById('op-status')?.value || '[НЕ ВЫБРАН]';
        const tasks = document.getElementById('op-tasks')?.value || '[НЕ УКАЗАНЫ]';
        const results = document.getElementById('op-results')?.value || '[НЕ УКАЗАНЫ]';

        const losses = document.getElementById('op-losses')?.value || 'Отсутствуют';
        const enemyLosses = document.getElementById('op-enemy-losses')?.value || 'Нет данных';
        const trophies = document.getElementById('op-trophies')?.value || 'Отсутствуют';

        const problems = document.getElementById('op-problems')?.value || '[НЕ УКАЗАНЫ]';
        const successes = document.getElementById('op-successes')?.value || '[НЕ УКАЗАНЫ]';
        const recommendations = document.getElementById('op-recommendations')?.value || '[НЕ УКАЗАНЫ]';

        const apps = [];
        if (document.getElementById('op-app-screenshots')?.checked) apps.push('Скриншоты/видео');
        if (document.getElementById('op-app-logs')?.checked) apps.push('Лог боя');
        if (document.getElementById('op-app-replay')?.checked) apps.push('Запись реплея');
        if (document.getElementById('op-app-mission')?.checked) apps.push('Журнал миссии');
        const appLinks = document.getElementById('op-app-links')?.value || '';

        let preview = `# Форма 05-REP-OPR\n`;
        preview += `**[ДАТА ЗАПОЛНЕНИЯ]**: ${currentDate}\n`;
        preview += `**[ВРЕМЯ ПОДАЧИ]**: ${currentTime} МСК\n\n`;
        preview += `———————————————————————\n\n`;
        preview += `### Данные заявителя\n`;
        preview += `**[ПОЗЫВНОЙ]**: ${callsign}\n`;
        preview += `**[ИДЕНТИФИКАТОР]**: ${msfcode}\n`;
        preview += `**[ДОЛЖНОСТЬ]**: ${position}\n\n`;
        preview += `———————————————————————\n\n`;
        preview += `### Данные операции\n`;
        preview += `**[НАИМЕНОВАНИЕ ОПЕРАЦИИ]**: "${opName}"\n`;
        preview += `**[КОД ОПЕРАЦИИ]**: ${opCode}\n`;
        preview += `**[ДАТА И ВРЕМЯ]**: ${opDate} | ${opTime} МСК\n`;
        preview += `**[ЛОКАЦИЯ / КАРТА]**: ${opLocation}\n\n`;
        preview += `———————————————————————\n\n`;
        preview += `### Состав группы\n`;
        const formattedParticipants = participants.replace(/\n/g, '\n> ');
        preview += `**[УЧАСТНИКИ]**:\n> ${formattedParticipants}\n`;
        preview += `**[ОБЩАЯ ЧИСЛЕННОСТЬ]**: ${totalCount} чел.\n\n`;
        preview += `———————————————————————\n\n`;
        preview += `### Результаты операции\n`;
        preview += `**[СТАТУС ВЫПОЛНЕНИЯ]**: ${status}\n`;
        preview += `**[ЗАДАЧИ ОПЕРАЦИИ]**:\n${tasks}\n`;
        preview += `**[ДОСТИГНУТЫЕ РЕЗУЛЬТАТЫ]**:\n${results}\n\n`;
        preview += `———————————————————————\n\n`;
        preview += `### Потери и трофеи\n`;
        preview += `**[ПОТЕРИ СО СТОРОНЫ ЧВК]**:\n${losses}\n`;
        preview += `**[ПОТЕРИ ПРОТИВНИКА]**: ${enemyLosses}\n`;
        preview += `**[ЗАХВАЧЕННЫЕ ТРОФЕИ]**:\n${trophies}\n\n`;
        preview += `———————————————————————\n\n`;
        preview += `### Анализ и рекомендации\n`;
        preview += `**[ПРОБЛЕМЫ И НЕДОСТАТКИ]**:\n${problems}\n\n`;
        preview += `**[УСПЕШНЫЕ ДЕЙСТВИЯ]**:\n${successes}\n\n`;
        preview += `**[РЕКОМЕНДАЦИИ НА БУДУЩЕЕ]**:\n${recommendations}\n\n`;
        preview += `———————————————————————\n\n`;
        preview += `### Приложения\n`;
        if (apps.length) {
            preview += `[X] ${apps.join(', ')}\n`;
        } else {
            preview += `[ ] Нет\n`;
        }
        if (appLinks) {
            preview += `**[ССЫЛКИ НА МАТЕРИАЛЫ]**:\n${appLinks}\n`;
        }
        preview += `\n———————————————————————\n\n`;
        preview += `### Подпись заявителя\n`;
        preview += `${position} | ${callsign} | ${msfcode}\n`;

        const previewDiv = document.getElementById('report-preview');
        if (previewDiv) previewDiv.innerHTML = preview.replace(/\n/g, '<br>');
    }
}