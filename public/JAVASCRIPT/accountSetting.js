// ---------------------------------------------- EDIT ACCOUNT ----------------------------------------------
// Populate data to make it a prefilled form and ready to be edited
document.addEventListener('DOMContentLoaded', async function () {
        try {
          const response = await fetchWithAuth('/account');  // ------------------------------------------------- headers in jwtutility.js
            if (response.ok) { // response && response.ok
                const user = await response.json();
                // Populate profile info
                document.querySelector('.user-name').textContent = user.name;
                document.querySelector('.h3 .user-name').textContent = user.name;
                
                // Prefill edit form fields
                document.getElementById('edit-name').value = user.name; 
                document.getElementById('edit-birth-date').value = user.dob.split('T')[0];
                document.getElementById('edit-email').value = user.email;

                // Store original user data
                originalUserData = {
                  name: user.name,
                  dob: user.dob.split('T')[0],
                  email: user.email
                };
                
                // Update other elements with the user's name
                document.querySelectorAll('.review-info .user-name, .comment-user-info .user-name').forEach(element => {
                    element.textContent = user.name;
                });

                // Fetch and update total quizzes taken
                await fetchTotalQuizzesTaken();

            } else {
                console.error('Failed to fetch user data');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    
    // Toggle visibility for edit account details
    document.getElementById('edit-icon').addEventListener('click', function () {
      const editAccountDetails = document.getElementById('edit-account-details');
      if (editAccountDetails.style.display === 'block') {
        editAccountDetails.style.display = 'none';
      } else {
        editAccountDetails.style.display = 'block';
        
        // Clear password fields 
        document.getElementById('current-password').value = ''; 
        document.getElementById('edit-password').value = '';
        document.getElementById('edit-confirm-password').value = '';
    }  
  });
    
    // Handle form submission
    document.getElementById('save-changes').addEventListener('click', async function (event) {
        event.preventDefault();
        
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('edit-password').value;
        const confirmNewPassword = document.getElementById('edit-confirm-password').value;
  
        const updatedUserData = {
            name: document.getElementById('edit-name').value,
            dob: document.getElementById('edit-birth-date').value,
            email: document.getElementById('edit-email').value,
        };
        
        if (currentPassword && (!newPassword || !confirmNewPassword)) {
            alert('To update password, you must enter the new password and confirm new password');
            return;
        }
        
        if (newPassword || confirmNewPassword) {
            if (newPassword !== confirmNewPassword) {
                alert('New passwords do not match');
                return;
            }

            if (newPassword === currentPassword) {
              alert('New Password cannot be the same as the current password');
              return;
            }
            updatedUserData.currentPassword = currentPassword;
            updatedUserData.newPassword = newPassword;
            updatedUserData.confirmNewPassword = confirmNewPassword;
        }

        // Check if no changes were made
        if (updatedUserData.name === originalUserData.name && updatedUserData.dob === originalUserData.dob && updatedUserData.email === originalUserData.email && !newPassword && !confirmNewPassword) {
          alert('No changes were detected. Click on the edit icon to close.');
          return;
        }
        
        try {
            const response = await fetchWithAuth(`/account`, { // ------------------------------------------------- headers in jwtutility.js
                method: 'PUT',
                body: JSON.stringify(updatedUserData)
            });

            if (response.ok) { // response && response.ok
                const updatedUser = await response.json();
                alert('User details updated successfully');
  
                const profileInfoUserName = document.querySelector('.profile-info .user-name');
                if (profileInfoUserName) {
                    profileInfoUserName.textContent = updatedUser.name;
                } else {
                    console.error('Profile info user name element not found');
                }

                document.querySelectorAll('.review-info .user-name, .comment-user-info .user-name').forEach(element => {
                    if (element) {
                        element.textContent = updatedUser.name;
                    } else {
                        console.error('Element for updating user name not found');
                    }
                });
                window.location.reload();
                
                // Close the edit fields
                document.getElementById('edit-account-details').style.display = 'none';
            
              } else {
                const errorData = await response.json();
                if (errorData.message === 'Current password is incorrect') {
                  alert(`${errorData.message}`);
                } else if (errorData.message === 'Email is already in use') {
                  alert(`${errorData.message}`);
                } else if (errorData.message.length > 0) {
                  alert(`${errorData.errors.join('\n')}`);
                } else {
                  alert(`${errorData.message}`);
                }
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });
  });
  
    
  // ---------------------------------------------- UPLOAD PROFILE PICTURE ----------------------------------------------
  document.addEventListener('DOMContentLoaded', () => {
      fetchUserProfile();
  });
  
  async function fetchUserProfile() {
    try {
      const response = await fetchWithAuth(`/account/profile`); // ------------------------------------------------- headers in jwtutility.js
      if (response.ok) { // response && response.ok
        const data = await response.json();
        if (data.profilePic) {
          document.getElementById('profile-pic').src = data.profilePic;
        }
      } else {
        console.error('Failed to fetch user profile');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  }
  
  function triggerFileInput() {
    // const token = getToken();
    // if (!token) {
    //   alert('Please log in first to upload your profile picture.');
    //   window.location.href = 'Login.html';
    //   return;
    // }
    document.getElementById('file-input').click();
  }
  
  function previewImage(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        const base64Image = e.target.result;
        document.getElementById('profile-pic').src = base64Image;
        uploadImageToServer(base64Image);
      }
      reader.readAsDataURL(file);
    }
  }
  
  async function uploadImageToServer(base64Image) {
    try {
      console.log('Uploading image...');
      const response = await fetchWithAuth(`/account/uploadProfilePic`, { // ------------------------------------------------- headers in jwtutility.js
        method: 'POST',
        body: JSON.stringify({ profilePic: base64Image })
      });
  
      if (response.ok) { // response && response.ok
        alert('Profile picture updated successfully');
      } else {
        const errorData = await response.json();
        console.error('Upload failed:', errorData);
        alert(`Failed to update profile picture: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image');
    }
  }
  
      
  // ---------------------------------------------- DELETE ACCOUNT ----------------------------------------------
  // Function to confirm account deletion
  function confirmDeleteAccount() {
    // const token = getToken();
    
    // if (!token) {
    //   alert('No user is logged in');
    //   return;
    // }
  
    document.getElementById('deleteModal').style.display = 'block';
  }
  
  // Function to close the delete modal
  function closeDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
  }
  
  // Function to delete account with password authorization
  async function deleteAccount() {
    // const token = getToken();
    const password = document.getElementById('delete-password').value;
    // if (!password) {
    //     alert('Please enter your password');
    //     return;
    // }

    try {
        const response = await fetchWithAuth('/account', { // ------------------------------------------------- headers in jwtutility.js
            method: 'DELETE',
            body: JSON.stringify({ password: password })
        });

        if (response.ok) { // response && response.ok
            alert('Account deleted successfully');
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('userId');
            sessionStorage.removeItem('role');
            window.location.href = 'Index.html';
        } else {
            const errorData = await response.json();
            alert(errorData.message);
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        closeDeleteModal();
    }
}

  
  // ---------------------------------------------- LOG OUT --------------------------------------------------------------
  function confirmLogout() {
    // const token = getToken();
    // if (!token) {
    //   alert('No user is logged in.');
    //   return;
    // }
    
    const userConfirmed = confirm('Are you sure you want to log out?');
    if (userConfirmed) {
      // User clicked "OK"
      alert('Logging you out...');
      sessionStorage.removeItem('token'); // Clear the token from session storage
      sessionStorage.removeItem('userId');
      sessionStorage.removeItem('role');
      window.location.href = '/login.html'; // Redirect to the login page
    } else {
      // User clicked "Cancel"
      alert('Logout cancelled.');
    }
  }

  // ---------------------------------------------- QUIZ RESULTS ----------------------------------------------


  async function fetchUserQuizResults() {
    try {
      const response = await fetchWithAuth('/account/quizResult'); // ------------------------------------------------- headers in jwtutility.js
      if (!response) return; // *************** changes for jwt
      // if (!response.ok) throw new Error('Failed to fetch quiz results');

      const quizResults = await response.json();
      // console.log('Fetched quiz results:', quizResults); // Debugging log

      // group by title since title is unique too
      quizResults.forEach(result => {
          result.QuizID = result.QuizTitle; // Assuming QuizTitle as QuizID for grouping
      });

      // Fetching the attempt count
      const attemptCountResponse = await fetchWithAuth('/account/getAttemptCountByQuizId'); // ------------------------------------------------- headers in jwtutility.js
      if (!attemptCountResponse) return; // *************** changes for jwt
 
      // sorting quiz results by AttemptDate in descending order
      quizResults.sort((a, b) => new Date(b.AttemptDate) - new Date(a.AttemptDate));

      // Group quiz results by QuizID
      const groupedQuizResults = quizResults.reduce((acc, result) => {
          // console.log('Processing result:', result); // Debugging log
          const quizId = result.QuizID || result.quiz_id;
          if (!acc[quizId]) {
              acc[quizId] = [];
          }
          acc[quizId].push(result);
          return acc;
      }, {});

      // console.log('Grouped quiz results:', groupedQuizResults); // Debugging log

      const quizResultsContainer = document.querySelector('.quiz-results');
      const noQuizResultsMessage = document.querySelector('.no-quiz-results-message');

      quizResultsContainer.innerHTML = '';

      if (quizResults.length === 0) {
          noQuizResultsMessage.style.display = 'block';
      } else {
          noQuizResultsMessage.style.display = 'none';
          Object.keys(groupedQuizResults).forEach(quizId => {
              const results = groupedQuizResults[quizId];
              results.forEach((result, index) => {
                  const attemptNumber = index + 1; // Correct attempt number for each quiz ID
                  createQuizResultCard(result, quizResultsContainer, attemptNumber);
              });
            });
          }
        } catch (error) {
      console.error('Error fetching quiz results:', error);
    }
  }
  
  function createQuizResultCard(result, quizResultsContainer, attemptNumber) {
  // console.log('Creating quiz result card for:', result); // Debugging log
  // console.log('Attempt Number:', attemptNumber); // Debugging log

  const quizResultCard = document.createElement('div');
  quizResultCard.className = 'quiz-result-card';
  quizResultCard.setAttribute('data-quiz-id', result.AttemptID);

  const attemptDateStr = result.AttemptDate;

  // Split the date string into date and time parts
  const [datePart, timePart] = attemptDateStr.split('T');
  const [year, month, day] = datePart.split('-');
  const [hour, minute, second] = timePart.split(':');

  // Reformat the date and time parts
  const formattedDate = `${day}/${month}/${year} ${hour}:${minute}:${second.slice(0, 2)}`;

  quizResultCard.innerHTML = `
      <div class="quiz-result-header">
          <span class="quiz-title">${result.QuizTitle}</span>
          <span class="quiz-date">${formattedDate}</span>
      </div>
      <div class="quiz-result-details">
          <p><strong>Attempt number:</strong> ${attemptNumber}</p>
          <p><strong>Score:</strong> ${result.Score}/${result.TotalMarks}</p>
          <p><strong>Total Questions:</strong> ${result.TotalQuestions}</p>
          <p><strong>Time Taken:</strong> ${result.TimeTaken ? result.TimeTaken + ' seconds' : 'N/A'}</p>
          <p><strong>Passed:</strong> ${result.Passed ? 'Yes' : 'No'}</p>
      </div>
  `;
  
  quizResultsContainer.appendChild(quizResultCard);
}

// ---------------------- fetch total quizzes taken ----------------------

async function fetchTotalQuizzesTaken() {
  try {
      const response = await fetchWithAuth('/account/getAllAttemptCount'); // ------------------------------------------------- headers in jwtutility.js
      if (!response) return; // *************** changes for jwt
      // if (!response.ok) throw new Error('Failed to fetch total quizzes taken');

      const dataWrapper = await response.json();
      console.log('Fetched total quizzes data wrapper:', dataWrapper); // Debugging log

      const totalQuizzes = dataWrapper?.AttemptCount; // extract the AttemptCount directly
      // console.log('Total quizzes data:', totalQuizzes); // Debugging log

      if (typeof totalQuizzes !== 'number') {
          throw new Error('Total quizzes data is not a number');
      }

      document.getElementById('total-quizzes').textContent = totalQuizzes;
  } catch (error) {
      console.error('Error fetching total quizzes taken:', error);
  }
}

document.addEventListener('DOMContentLoaded', fetchUserQuizResults);
