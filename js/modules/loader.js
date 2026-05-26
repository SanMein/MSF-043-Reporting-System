// js/modules/loader.js - Загрузчик HTML-шаблонов
class TemplateLoader {
    constructor() {
        this.cache = {};
    }

    async load(templateName) {
        if (this.cache[templateName]) {
            return this.cache[templateName];
        }

        try {
            const response = await fetch(`js/modules/templates/${templateName}.html`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const html = await response.text();
            this.cache[templateName] = html;
            return html;
        } catch (error) {
            console.error(`Ошибка загрузки шаблона ${templateName}:`, error);
            return `<div class="form-group">
                        <label>ОШИБКА ЗАГРУЗКИ</label>
                        <p class="panel-description">Не удалось загрузить форму. Проверьте подключение.</p>
                    </div>`;
        }
    }

    async loadForm(reportType, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const templateName = this.getTemplateName(reportType);
        const html = await this.load(templateName);

        // Удаляем класс hidden у загруженной формы, если он есть
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        const formElement = tempDiv.querySelector('.report-form');
        if (formElement) {
            formElement.classList.remove('hidden');
        }

        container.innerHTML = tempDiv.innerHTML;
        this.reinitializeModule(reportType);

        return html;
    }

    getTemplateName(reportType) {
        const mapping = {
            'promotion': 'prom',
            'discipline': 'disc',
            'absence': 'abs',
            'leave': 'leave',
            'operation': 'operation'
        };
        return mapping[reportType] || reportType;
    }

    reinitializeModule(reportType) {
        setTimeout(() => {
            switch(reportType) {
                case 'promotion':
                    if (window.promModule && typeof window.promModule.setupListeners === 'function') {
                        window.promModule.setupListeners();
                    }
                    break;
                case 'discipline':
                    if (window.discModule && typeof window.discModule.setupListeners === 'function') {
                        window.discModule.setupListeners();
                    }
                    break;
                case 'absence':
                    if (window.absModule && typeof window.absModule.setupListeners === 'function') {
                        window.absModule.setupListeners();
                    }
                    break;
                case 'leave':
                    if (window.leaveModule && typeof window.leaveModule.setupListeners === 'function') {
                        window.leaveModule.setupListeners();
                    }
                    break;
                case 'operation':
                    if (window.operationModule && typeof window.operationModule.setupListeners === 'function') {
                        window.operationModule.setupListeners();
                    }
                    break;
            }
        }, 50);
    }
}

window.templateLoader = new TemplateLoader();