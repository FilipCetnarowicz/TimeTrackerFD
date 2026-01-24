let sections;

export function initRouter() {
    sections = document.querySelectorAll('section[data-switch]');

    document.addEventListener('click', (e) => {
        const trigger = e.target.closest('[data-switch]');
        if (!trigger) return;

        show(trigger.dataset.switch);
    });
}

function show(view) {
    sections.forEach((section) => {
        section.hidden = section.dataset.switch !== view;
    });
}
