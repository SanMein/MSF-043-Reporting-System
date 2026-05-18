// js/disc.js
class DiscReportModule {
    constructor() {
        this.setupListeners();
    }

    setupListeners() {
        const discFields = document.querySelectorAll('#discipline-form input, #discipline-form select, #discipline-form textarea');
        discFields.forEach(field => {
            field.addEventListener('input', () => this.updatePreview());
            field.addEventListener('change', () => this.updatePreview());
        });

        document.getElementById('disc-violation-type')?.addEventListener('change', (e) => {
            this.toggleViolationBlocks(e.target.value);
        });

        document.getElementById('disc-penalty-type')?.addEventListener('change', (e) => {
            this.togglePenaltyBlocks(e.target.value);
        });
    }

    toggleViolationBlocks(value) {
        const blocks = {
            reglament: 'disc-reglament-block',
            regulation: 'disc-regulation-block',
            order: 'disc-order-block',
            desertion: 'disc-desertion-block',
            reputation: 'disc-reputation-block',
            other: 'disc-other-block'
        };

        Object.values(blocks).forEach(blockId => {
            const block = document.getElementById(blockId);
            if (block) block.classList.add('hidden');
        });

        if (blocks[value]) {
            const block = document.getElementById(blocks[value]);
            if (block) block.classList.remove('hidden');
        }
        this.updatePreview();
    }

    togglePenaltyBlocks(value) {
        const blocks = {
            suspension: 'disc-suspension-block',
            'downgrade-combat': 'disc-downgrade-combat-block',
            'downgrade-specialized': 'disc-downgrade-specialized-block'
        };

        Object.values(blocks).forEach(blockId => {
            const block = document.getElementById(blockId);
            if (block) block.classList.add('hidden');
        });

        if (blocks[value]) {
            const block = document.getElementById(blocks[value]);
            if (block) block.classList.remove('hidden');
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

        const callsign1 = document.getElementById('disc-callsign1')?.value || '[НЕ ЗАПОЛНЕНО]';
        const msfcode1 = document.getElementById('disc-msfcode1')?.value || '[НЕ ЗАПОЛНЕНО]';
        const grade1 = document.getElementById('disc-grade1')?.value || '[НЕ ЗАПОЛНЕНО]';
        const service1 = document.getElementById('disc-service1')?.value || '[НЕ ЗАПОЛНЕНО]';
        const position = document.getElementById('disc-position')?.value || '[НЕ ЗАПОЛНЕНО]';

        const callsign2 = document.getElementById('disc-callsign2')?.value || '[НЕ ЗАПОЛНЕНО]';
        const msfcode2 = document.getElementById('disc-msfcode2')?.value || '[НЕ ЗАПОЛНЕНО]';
        const grade2 = document.getElementById('disc-grade2')?.value || '[НЕ ЗАПОЛНЕНО]';
        const service2 = document.getElementById('disc-service2')?.value || '[НЕ ЗАПОЛНЕНО]';

        const incidentDate = this.getFormattedDate(document.getElementById('disc-date')?.value);
        const location = document.getElementById('disc-location')?.value || '[НЕ ВЫБРАНО]';

        const violationType = document.getElementById('disc-violation-type')?.value;
        let violationText = '';

        if (violationType === 'reglament') {
            const point = document.getElementById('disc-reglament-point')?.value || '';
            violationText = `Нарушение пункта Регламента: ${point}`;
        } else if (violationType === 'regulation') {
            const doc = document.getElementById('disc-regulation-doc')?.value || '';
            const desc = document.getElementById('disc-regulation-desc')?.value || '';
            violationText = `Нарушение Положения о "${doc}": ${desc}`;
        } else if (violationType === 'order') {
            const desc = document.getElementById('disc-order-desc')?.value || '';
            violationText = `Неисполнение прямого приказа командира: ${desc}`;
        } else if (violationType === 'desertion') {
            const desc = document.getElementById('disc-desertion-desc')?.value || '';
            violationText = `Дезертирство / самовольное оставление операции: ${desc}`;
        } else if (violationType === 'reputation') {
            const desc = document.getElementById('disc-reputation-desc')?.value || '';
            violationText = `Действия, нанёсшие ущерб репутации ЧВК: ${desc}`;
        } else if (violationType === 'other') {
            const desc = document.getElementById('disc-other-desc')?.value || '';
            violationText = `Иное: ${desc}`;
        } else {
            violationText = '[НЕ ВЫБРАНО]';
        }

        const essence = document.getElementById('disc-essence')?.value || '';
        const witnesses = document.getElementById('disc-witnesses')?.value || '';
        const prevViolations = document.getElementById('disc-prev-violations')?.value || '-';
        const explanation = document.getElementById('disc-explanation')?.value || '-';

        const penaltyType = document.getElementById('disc-penalty-type')?.value;
        let penaltyText = '';
        let currentGrade = grade2;

        if (penaltyType === 'suspension') {
            const term = document.getElementById('disc-suspension-term')?.value || '';
            penaltyText = `Временное отстранение от участия в операциях сроком на: ${term}`;
        } else if (penaltyType === 'downgrade-combat') {
            const newGrade = document.getElementById('disc-new-grade')?.value || '';
            penaltyText = `Понижение основного боевого грейда: ${currentGrade} → ${newGrade}`;
        } else if (penaltyType === 'downgrade-specialized') {
            const newSpec = document.getElementById('disc-new-specialized')?.value || '';
            penaltyText = `Понижение специализированного грейда: ${service2} → ${newSpec}`;
        } else if (penaltyType === 'revoke-specialized') {
            penaltyText = `Лишение специализированного грейда: ${service2} → ОТСУТСТВУЕТ`;
        } else if (penaltyType === 'ku-status') {
            penaltyText = `Перевод в статус Ку с повторным прохождением аттестации`;
        } else if (penaltyType === 'expulsion') {
            penaltyText = `Исключение из состава ЧВК и Перманентный бан`;
        } else {
            penaltyText = '[НЕ ВЫБРАНО]';
        }

        const justification = document.getElementById('disc-justification')?.value || '';

        const apps = [];
        if (document.getElementById('disc-app-screenshots')?.checked) apps.push('Скриншоты');
        if (document.getElementById('disc-app-logs')?.checked) apps.push('Записи');
        if (document.getElementById('disc-app-witness')?.checked) apps.push('Свидетельские показания');
        if (document.getElementById('disc-app-mission')?.checked) apps.push('Выписка из Журнала боевых миссий');
        const appOther = document.getElementById('disc-app-other')?.value || '';
        if (appOther) apps.push(`Иное: ${appOther}`);
        const appsText = apps.length ? apps.join(', ') : '[НЕ ВЫБРАНО]';

        let preview = `# Форма 05-REP-DISC\n`;
        preview += `**[ДАТА ЗАПОЛНЕНИЯ]**: ${currentDate}\n`;
        preview += `**[ВРЕМЯ ПОДАЧИ]**: ${currentTime} МСК\n\n`;
        preview += `———————————————————————\n\n`;
        preview += `### Данные заявителя\n`;
        preview += `**[ПОЗЫВНОЙ]**: ${callsign1}\n`;
        preview += `**[ИДЕНТИФИКАТОР]**: ${msfcode1}\n`;
        preview += `**[ТЕКУЩИЙ ОСНОВНОЙ ГРЕЙД]**: ${grade1}\n`;
        preview += `**[ТЕКУЩИЙ СПЕЦИАЛИЗИРОВАННЫЙ ГРЕЙД]**: ${service1}\n`;
        preview += `**[ДОЛЖНОСТЬ]**: ${position}\n\n`;
        preview += `———————————————————————\n\n`;
        preview += `### Данные оперативника, в отношении которого подаётся рапорт\n`;
        preview += `**[ПОЗЫВНОЙ]**: ${callsign2}\n`;
        preview += `**[ИДЕНТИФИКАТОР]**: ${msfcode2}\n`;
        preview += `**[ТЕКУЩИЙ ОСНОВНОЙ ГРЕЙД]**: ${grade2}\n`;
        preview += `**[ТЕКУЩИЙ СПЕЦИАЛИЗИРОВАННЫЙ ГРЕЙД]**: ${service2}\n\n`;
        preview += `———————————————————————\n\n`;
        preview += `### Обстоятельства нарушения\n`;
        preview += `**[ДАТА ИНЦИДЕНТА]**: ${incidentDate}\n`;
        preview += `**[МЕСТО ИНЦИДЕНТА]**: "${location}"\n\n`;
        preview += `**[ТИП НАРУШЕНИЯ]**:\n${violationText}\n\n`;
        preview += `———————————————————————\n\n`;
        preview += `### Описание инцидента\n`;
        preview += `**СУТЬ НАРУШЕНИЯ**:\n${essence || '[НЕ ЗАПОЛНЕНО]'}\n\n`;
        preview += `**[СВИДЕТЕЛИ (ПРИ НАЛИЧИИ)]**:\n> ${witnesses || '-'}\n\n`;
        preview += `**ПРЕДШЕСТВУЮЩИЕ НАРУШЕНИЯ**:\n${prevViolations}\n\n`;
        preview += `**ОБЪЯСНЕНИЯ ОПЕРАТИВНИКА**:\n${explanation}\n\n`;
        preview += `———————————————————————\n\n`;
        preview += `### Рекомендация\n`;
        preview += `На основании вышеизложенного, учитывая характер нарушения и предыдущую дисциплинарную историю оперативника, ХОДАТАЙСТВУЮ О ПРИМЕНЕНИИ СЛЕДУЮЩИХ МЕР:\n\n`;
        preview += `**[ВИД ВЗЫСКАНИЯ]**:\n${penaltyText}\n\n`;
        preview += `#### Обоснование рекомендуемой меры:\n${justification || '[НЕ ЗАПОЛНЕНО]'}\n\n`;
        preview += `———————————————————————\n\n`;
        preview += `### Приложения\n`;
        preview += `[ ] ${appsText}\n\n`;
        preview += `———————————————————————\n\n`;
        preview += `### Подпись заявителя\n`;
        preview += `${position} | ${callsign1} | ${msfcode1}\n`;

        document.getElementById('report-preview').innerHTML = preview.replace(/\n/g, '<br>');
    }
}