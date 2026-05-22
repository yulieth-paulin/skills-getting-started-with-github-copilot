document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message and reset activity select options
      activitiesList.innerHTML = "";
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        
const participantsHtml = details.participants && details.participants.length
  ? `<div class="participants">
      <strong>Participants</strong>
      <ul class="participants">
        ${details.participants
          .map((email) => `
            <li class="participant-item">
              ${email}
              <button 
                class="remove-participant"
                data-activity="${encodeURIComponent(name)}"
                data-email="${encodeURIComponent(email)}"
                aria-label="Remove participant"
              >
                ❌
              </button>
            </li>
          `)
          .join("")}
      </ul>
    </div>`
  : `<div class="participants no-participants">
      <em>No participants yet</em>
    </div>`;

activityCard.innerHTML = `
  <h4>${name}</h4>
  <p>${details.description}</p>
  <p><strong>Schedule:</strong> ${details.schedule}</p>
  <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
  ${participantsHtml}
`;


        activitiesList.appendChild(activityCard);

        // Attach handlers for remove buttons
        const removeBtns = activityCard.querySelectorAll('.remove-participant');
        removeBtns.forEach((btn) => {
          btn.addEventListener('click', async () => {
            const activityName = decodeURIComponent(btn.dataset.activity);
            const participantEmail = decodeURIComponent(btn.dataset.email);

            try {
              const resp = await fetch(`/activities/${encodeURIComponent(activityName)}/participants?email=${encodeURIComponent(participantEmail)}`, { method: 'DELETE' });
              const result = await resp.json();

              if (resp.ok) {
                messageDiv.textContent = result.message;
                messageDiv.className = 'success';
                messageDiv.classList.remove('hidden');
                // Refresh activities to reflect removal
                fetchActivities();
              } else {
                messageDiv.textContent = result.detail || 'Failed to remove participant';
                messageDiv.className = 'error';
                messageDiv.classList.remove('hidden');
              }

              setTimeout(() => {
                messageDiv.classList.add('hidden');
              }, 4000);
            } catch (error) {
              messageDiv.textContent = 'Failed to remove participant. Please try again.';
              messageDiv.className = 'error';
              messageDiv.classList.remove('hidden');
              console.error('Error removing participant:', error);
            }
          });
        });

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        // Refresh activities so the new participant appears immediately
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
