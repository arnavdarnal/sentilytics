// Import page initializers and feature modules
import {initLayout} from './layout.js';
import {initHeroSlider} from './slider.js';
import {initDashboard} from './dashboard.js';
import {initRegistrationForm, initFeedbackForm} from './forms.js';
import {initTeamGrid} from './team.js';

// Wait for the DOM to fully load before initializing components
document.addEventListener('DOMContentLoaded', () => {
// Initialize global layout, navigation, and theme toggling
    initLayout();

// Initialize the hero slider if it exists on the page
const heroSlider = document.querySelector('.hero-slider');
if (heroSlider) initHeroSlider();

    // Initialize the dashboard if it exists on the page
    const uploadSection = document.querySelector('.upload');
    if (uploadSection) initDashboard(uploadSection);

    // Initialize the user registration form if it exists on the page
    const registrationForm = document.querySelector('.form-box form');
    if (registrationForm) initRegistrationForm(registrationForm);

    // Initialize the feedback form if it exists on the page
    const feedbackForm = document.querySelector('.feedback-card form');
    if (feedbackForm) initFeedbackForm(feedbackForm);

    // Initialize the team grid if it exists on the page
    const teamGrid = document.querySelector('.grid');
    if (teamGrid) initTeamGrid(teamGrid);
});
