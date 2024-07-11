// ---------------------------------------------- EDIT ACCOUNT ----------------------------------------------
// Populate data to make it a prefilled form and ready to be edited
document.addEventListener('DOMContentLoaded', async function () {
    const token = getToken();
    if (token) {
        try {
          const response = await fetch('/account', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
        });            
            if (response.ok) {
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
            } else {
                console.error('Failed to fetch user data');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    } else {
      console.error('No user is logged in');
    }
    
    // Toggle visibility for edit account details
    document.getElementById('edit-icon').addEventListener('click', function () {
      if (!token) {
        alert('Please log in first to edit your account details.');
        return;
      }
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
            const response = await fetch(`/account`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                body: JSON.stringify(updatedUserData)
            });

            if (response.ok) {
                const updatedUser = await response.json();
                alert('User details updated successfully');
  
                // Update displayed user info
                document.querySelector('.profile-info .user-name').textContent = updatedUser.name;
                document.querySelectorAll('.review-info .user-name, .comment-user-info .user-name').forEach(element => {
                    element.textContent = updatedUser.name;
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
    const token = getToken();
    if (token) {
      fetchUserProfile(token);
    }
  });
  
  async function fetchUserProfile(token) {
    try {
      const response = await fetch(`/account/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
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
    const token = getToken();
    if (!token) {
      alert('Please log in first to upload your profile picture.');
      return;
    }
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
    const token = getToken();
    
    if (!token) {
      alert('No token found. Please log in first.');
      return;
    }
  
    try {
      console.log('Uploading image...');
      const response = await fetch(`/account/uploadProfilePic`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ profilePic: base64Image })
      });
  
      if (response.ok) {
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
    const token = getToken();
    
    if (!token) {
      alert('No user is logged in');
      return;
    }
  
    document.getElementById('deleteModal').style.display = 'block';
  }
  
  // Function to close the delete modal
  function closeDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
  }
  
  // Function to delete account with password authorization
  async function deleteAccount() {
    const token = getToken();
    const password = document.getElementById('delete-password').value;

    if (!token) {
        alert('No user is logged in');
        return;
    }

    if (!password) {
        alert('Please enter your password');
        return;
    }

    try {
        const response = await fetch('/account', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ password: password })
        });

        if (response.ok) {
            alert('Account deleted successfully');
            sessionStorage.removeItem('token');
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
    const token = getToken();
    if (!token) {
      alert('No user is logged in.');
      return;
    }
    
    const userConfirmed = confirm('Are you sure you want to log out?');
    if (userConfirmed) {
      // User clicked "OK"
      alert('Logging you out...');
      sessionStorage.removeItem('token'); // Clear the token from session storage
      window.location.href = '/login.html'; // Redirect to the login page
    } else {
      // User clicked "Cancel"
      alert('Logout cancelled.');
    }
  }
  
  function getToken() {
    return sessionStorage.getItem('token');
  }


// ---------------------------------------------- QUIZ RESULTS ----------------------------------------------
async function fetchUserQuizResults() {
  const token = getToken();
  try {
      const response = await fetch('/account/quizResult', {
          headers: {
              'Authorization': `Bearer ${token}`
          }
      });
      if (!response.ok) throw new Error('Failed to fetch quiz results');

      const quizResults = await response.json();
      console.log('Fetched quiz results:', quizResults); // Debugging log

      const quizResultsContainer = document.querySelector('.quiz-results');
      const noQuizResultsMessage = document.querySelector('.no-quiz-results-message');

      quizResultsContainer.innerHTML = '';

      if (quizResults.length === 0) {
          noQuizResultsMessage.style.display = 'block';
      } else {
          noQuizResultsMessage.style.display = 'none';
          quizResults.forEach(result => createQuizResultCard(result, quizResultsContainer));
      }
  } catch (error) {
      console.error('Error fetching quiz results:', error);
  }
}

function createQuizResultCard(result, quizResultsContainer) {
  console.log('Creating quiz result card for:', result); // Debugging log
  const quizResultCard = document.createElement('div');
  quizResultCard.className = 'quiz-result-card';
  quizResultCard.setAttribute('data-quiz-id', result.AttemptID);

  const attemptDate = new Date(result.AttemptDate);
  const formattedDate = `${attemptDate.getDate().toString().padStart(2, '0')}/${(attemptDate.getMonth() + 1).toString().padStart(2, '0')}/${attemptDate.getFullYear()} ${attemptDate.getHours().toString().padStart(2, '0')}:${attemptDate.getMinutes().toString().padStart(2, '0')}`;

  quizResultCard.innerHTML = `
      <div class="quiz-result-header">
          <span class="quiz-title">${result.QuizTitle}</span>
          <span class="quiz-date">${formattedDate}</span>
      </div>
      <div class="quiz-result-details">
          <p><strong>Score:</strong> ${result.Score}%</p> <!-- CHANGED: Added percentage -->
          <p><strong>Total Questions:</strong> ${result.TotalQuestions}</p>
          <p><strong>Total Marks:</strong> ${result.TotalMarks}</p>
          <p><strong>Time Taken:</strong> ${result.TimeTaken ? result.TimeTaken + ' seconds' : 'N/A'}</p> <!-- CHANGED: Display time taken -->
          <p><strong>Passed:</strong> ${result.Passed ? 'Yes' : 'No'}</p>
      </div>
  `;

  quizResultsContainer.appendChild(quizResultCard);
}

function getToken() {
  return sessionStorage.getItem('token');
}

document.addEventListener('DOMContentLoaded', fetchUserQuizResults);
