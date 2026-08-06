// Initialize and render the team grid dynamically from JSON data
export async function initTeamGrid(teamGrid) {
    // Exit early if the grid container does not exist
    if (!teamGrid) return;

    try {
        // Fetch team data from the JSON file
        const response = await fetch('assets/data/team.json');
        if (!response.ok) throw new Error('Failed to fetch team data');

        const teamMembers = await response.json();

        // Clear any existing content inside the grid container
        teamGrid.innerHTML = '';

        // Loop through each team member and create a card for them
        teamMembers.forEach(member => {
            const card = document.createElement('div');
            card.classList.add('team-card');

            // Use a fallback image if the member's image is missing or empty
            const img = member.image && member.image.trim() !== '' ? member.image : 'assets/images/default.png';

            // Set the inner HTML of the card with the member's details
            card.innerHTML = `
                <div class="team-img-wrapper">
                    <img src="${img}" alt="${member.name}">
                </div>
                <h3>${member.name}</h3>
                <p>${member.role}</p>
            `;

            // Append the card to the grid container
            teamGrid.appendChild(card);
        });
    } catch (error) {
        // Log the error to the console and display a user-friendly message in the grid container
        console.error("Error initializing team grid:", error);
        teamGrid.innerHTML = '<p>Failed to load team members. Please try again later.</p>';
    }
}
