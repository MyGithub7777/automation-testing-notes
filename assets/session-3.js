// Plain JavaScript for the preserved Session 3 quiz, checklist, and copy controls.
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
    const correctAnswers = ['1', '0', '1', '2', '1'];
    // Feedback copied from the supplied interactive quiz, without rewriting.
    const explanations = [
  "Hooks run setup or cleanup logic around scenarios and steps.",
  "Fixtures provide reusable objects and help manage isolated test state.",
  "Page Object classes encapsulate locators and page-related actions.",
  "Each Examples row produces a separate scenario execution.",
  "The Playwright workers setting controls parallel worker processes."
];
    const check = Array.from(root.querySelectorAll('button')).find(button => button.textContent?.trim() === 'Check answers');
    const reset = Array.from(root.querySelectorAll('button')).find(button => button.textContent?.trim() === 'Reset');
    const counter = Array.from(root.querySelectorAll('p')).find(p => p.textContent === '0/5 answered');
    if (check)
        check.dataset.sessionCheck = '';
    const clearFeedback = () => root.querySelectorAll('[data-quiz-feedback]').forEach(el => el.remove());
    groups.forEach((group, index) => {
        group.querySelectorAll('input[type="radio"]').forEach(input => {
            input.name = `session-3-question-${index}`;
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
            if (control.textContent?.includes('Build the complete framework'))
                alert('The complete framework project has not been supplied yet.');
        });
    });
}

// Preserve the original final-checklist progress counter.
if (root) {
  const boxes = [...root.querySelectorAll('input[type="checkbox"]')];
  const progress = [...root.querySelectorAll('p')].find(p => p.textContent === '0/10');
  boxes.forEach(box => box.addEventListener('change', () => {
    if (progress) progress.textContent = boxes.filter(b => b.checked).length + '/' + boxes.length;
  }));
}
