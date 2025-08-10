document.addEventListener('DOMContentLoaded', () => {
    const goToLevelBtn = document.getElementById('go-to-level-btn');
    const levelCodeInput = document.getElementById('level-code-input');

    const goToLevel = () => {
        const levelCode = levelCodeInput.value.trim();
        if (levelCode) {
            window.location.href = `heros-gambit.html?level=${levelCode}`;
        }
    };

    goToLevelBtn.addEventListener('click', goToLevel);

    levelCodeInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            goToLevel();
        }
    });
});
