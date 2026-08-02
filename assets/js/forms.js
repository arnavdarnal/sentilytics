// Initialize and handle validation for the user registration form
export function initRegistrationForm(form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Extract input fields in order: username, password, email, and date of birth
        const [usernameInput, passwordInput, emailInput, dateInput] = form.querySelectorAll('input');

        // Validate username length
        if (usernameInput.value.trim().length < 3) {
            alert('Username must be at least 3 characters long.');
            return;
        }

        // Validate password length
        if (passwordInput.value.trim().length < 6) {
            alert('Password must be at least 6 characters long.');
            return;
        }

        // Validate email format
        if (!emailInput.value.includes('@')) {
            alert('Please enter a valid email address.');
            return;
        }
        
        // Ensure date of birth is provided
        if (!dateInput.value) {
            alert('Please enter your date of birth.');
            return;
        }

        // Complete registration and reset the form
        alert('Registration successful! Welcome to Sentilytics.');
        form.reset();
    });
}

// Initialize and handle validation for the feedback form
export function initFeedbackForm(form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Collect inputs and extract name and email values
        const inputs = form.querySelectorAll('input, textarea');
        const name = inputs[0].value.trim();
        const email = inputs[1].value.trim();

        // Ensure name is provided
        if (!name) {
            alert('Please enter your name.');
            return;
        }

        // Ensure email is provided and valid
        if (!email || !email.includes('@')) {
            alert('Please enter a valid email address.');
            return;
        }

        // Thank the user for their feedback and reset the form
        alert('Thank you for your feedback, ' + name + '!');
        form.reset();
    });
}
