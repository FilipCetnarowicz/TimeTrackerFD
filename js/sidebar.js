export function initSidebar() {
    const asideToggle = document.getElementById('asideToggle');
    const mq = window.matchMedia('(max-width: 800px)');

    if (!asideToggle) return;

    function updateToggleIcon() {
        const collapsed = document.body.classList.contains('aside-collapsed');
        asideToggle.textContent = collapsed ? '>' : '<';
    }

    function syncSidebar(e) {
        const shouldCollapse = e.matches;
        document.body.classList.toggle('aside-collapsed', shouldCollapse);
        updateToggleIcon();
    }

    // stan początkowy (mobile vs desktop)
    syncSidebar(mq);

    // reakcja na resize
    mq.addEventListener('change', syncSidebar);

    // ręczne przełączanie
    asideToggle.addEventListener('click', () => {
        document.body.classList.toggle('aside-collapsed');
        updateToggleIcon();
    });
}
