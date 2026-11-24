// Plain JavaScript for the preserved Session 2 quiz, checklist, and copy controls.
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
    const correctAnswers = ['0', '1', '1', '1', '1'];
    // Feedback copied from the supplied interactive quiz, without rewriting.
    const explanations = [
  "defineBddConfig() defines the feature and step file locations and returns the generated test directory.",
  "createBdd() provides the step registration functions.",
  "bddgen generates Playwright-compatible test files from Gherkin scenarios.",
  "Playwright-style steps receive a fixtures object such as { page }.",
  "The Playwright Test runner executes the generated test files."
];
    const check = Array.from(root.querySelectorAll('button')).find(button => button.textContent?.trim() === 'Check answers');
    const reset = Array.from(root.querySelectorAll('button')).find(button => button.textContent?.trim() === 'Reset');
    const counter = Array.from(root.querySelectorAll('p')).find(p => p.textContent === '0/5 answered');
    if (check)
        check.dataset.sessionCheck = '';
    const clearFeedback = () => root.querySelectorAll('[data-quiz-feedback]').forEach(el => el.remove());
    groups.forEach((group, index) => {
        group.querySelectorAll('input[type="radio"]').forEach(input => {
            input.name = `session-2-question-${index}`;
            input.removeAttribute('tabindex');
            input.addEventListener('change', () => {
                clearFeedback();
                const answered = groups.filter(g => g.querySelector('input:checked')).length;
                if (counter)
                    counter.textContent = `${answered}/5 answered`;
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
        result.textContent = `${score}/5 — Correct answers`;
        check.parentElement?.before(result);
    });
    reset?.addEventListener('click', () => {
        root.querySelectorAll('input[type="radio"]').forEach(input => { input.checked = false; });
        clearFeedback();
        if (counter)
            counter.textContent = '0/5 answered';
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
            if (control.textContent?.includes('Continue to Session 3'))
                location.href = window.documentationUrl('/bdd-framework/session-3-advanced-playwright-bdd/');
        });
    });
}

// Preserve the original final-checklist progress counter.
if (root) {
  const boxes = [...root.querySelectorAll('input[type="checkbox"]')];
  const progress = [...root.querySelectorAll('p')].find(p => p.textContent === '0/9');
  boxes.forEach(box => box.addEventListener('change', () => {
    if (progress) progress.textContent = boxes.filter(b => b.checked).length + '/' + boxes.length;
  }));
}
