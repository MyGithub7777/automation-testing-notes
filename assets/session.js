// Plain JavaScript for the preserved Session 1 quiz, checklist, and copy controls.
const root = document.querySelector('.shared-snapshot');
if (root) {
    root.querySelectorAll('[data-session-copy]').forEach((button) => {
        button.addEventListener('click', async () => {
            const code = document.getElementById(button.dataset.sessionCopy);
            if (!code)
                return;
            try {
                await navigator.clipboard.writeText(code.textContent || '');
                button.setAttribute('aria-label', 'Copied');
                button.title = 'Copied';
                setTimeout(() => { button.setAttribute('aria-label', 'Copy code'); button.title = 'Copy code'; }, 1500);
            }
            catch {
                button.title = 'Copy failed. Select and copy the code manually.';
            }
        });
    });
    const groups = Array.from(root.querySelectorAll('[role="radiogroup"]'));
    const correctAnswers = ['1', '2', '1', '2', '1'];
    // Feedback copied from the supplied interactive quiz, without rewriting.
    const explanations = [
        'BDD focuses on application behavior and collaboration between business, development and testing teams.',
        'Then describes the expected outcome after an action.',
        'Background steps run before each scenario in their scope.',
        'Every Examples row creates a separate test execution.',
        'Tags organize scenarios and can be used to select tests for execution.',
    ];
    const check = Array.from(root.querySelectorAll('button')).find(button => button.textContent?.trim() === 'Check answers');
    const reset = Array.from(root.querySelectorAll('button')).find(button => button.textContent?.trim() === 'Reset');
    const counter = Array.from(root.querySelectorAll('p')).find(p => p.textContent === '0 of 5 answered');
    if (check)
        check.dataset.sessionCheck = '';
    const clearFeedback = () => root.querySelectorAll('[data-quiz-feedback]').forEach(el => el.remove());
    groups.forEach((group, index) => {
        group.querySelectorAll('input[type="radio"]').forEach(input => {
            input.name = `session-1-question-${index}`;
            input.removeAttribute('tabindex');
            input.addEventListener('change', () => {
                clearFeedback();
                const answered = groups.filter(g => g.querySelector('input:checked')).length;
                if (counter)
                    counter.textContent = `${answered} of 5 answered`;
                if (check) {
                    check.disabled = answered !== groups.length;
                    check.setAttribute('aria-disabled', String(check.disabled));
                    check.tabIndex = check.disabled ? -1 : 0;
                }
            });
        });
    });
    check?.addEventListener('click', () => {
        clearFeedback();
        let score = 0;
        groups.forEach((group, index) => {
            const selected = group.querySelector('input:checked');
            const correct = selected?.value === correctAnswers[index];
            if (correct)
                score++;
            const feedback = document.createElement('p');
            feedback.dataset.quizFeedback = correct ? 'correct' : 'incorrect';
            feedback.textContent = explanations[index];
            group.after(feedback);
        });
        const result = document.createElement('div');
        result.dataset.quizFeedback = 'score';
        result.setAttribute('role', 'status');
        result.textContent = `${score} / 5 — Your quiz score`;
        check.parentElement?.before(result);
    });
    reset?.addEventListener('click', () => {
        root.querySelectorAll('input[type="radio"]').forEach(input => { input.checked = false; });
        clearFeedback();
        if (counter)
            counter.textContent = '0 of 5 answered';
        if (check) {
            check.disabled = true;
            check.setAttribute('aria-disabled', 'true');
            check.tabIndex = -1;
        }
    });
    // These controls originally invoked ChatGPT. Keep their labels and appearance,
    // without sending messages or inventing a Session 2 destination.
    root.querySelectorAll('[data-d-component="pressable"], button[data-d-component="button"]').forEach(control => {
        if (control === check || control === reset)
            return;
        control.addEventListener('click', () => {
            if (control.textContent?.includes('Continue to Session 2'))
                location.href = '/bdd-framework/session-2-playwright-bdd-setup/';
        });
    });
}
