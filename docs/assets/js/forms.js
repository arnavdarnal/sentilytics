// Initialize and handle validation for the user registration form
export function initRegistrationForm(form) {
    $('#dob').datepicker();
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const usernameInput = form.querySelector('#username').value.trim();
        const passwordInput = form.querySelector('#password').value.trim();
        const emailInput = form.querySelector('#email').value.trim();
        const dateInput = form.querySelector('#dob').value.trim();

        // Validate username length
        if (usernameInput.length < 3) {
            alert('Username must be at least 3 characters long.');
            return;
        }

        // Validate password length
        if (passwordInput.length < 6) {
            alert('Password must be at least 6 characters long.');
            return;
        }

        // Validate email format
        if (!emailInput.includes('@')) {
            alert('Please enter a valid email address.');
            return;
        }
        
        // Ensure date of birth is provided
        if (!dateInput) {
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
        const name = form.querySelector('#name').value.trim();
        const email = form.querySelector('#email').value.trim();

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
