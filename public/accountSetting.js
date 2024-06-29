// ---------------------------------------------- EDIT ACCOUNT ----------------------------------------------

// Populate data to make it a prefilled form and ready to be edited but does not update in db yet
document.addEventListener('DOMContentLoaded', async function () {
    const userId = sessionStorage.getItem('userId');
    if (userId) {
        try {
            const response = await fetch(`/account/${userId}`);
            
            if (response.ok) {
                const user = await response.json();
                // Populate profile info
                document.querySelector('.profile-info .user-name').textContent = user.name;
                
                // Prefill edit form fields
                document.getElementById('edit-name').value = user.name; 
                document.getElementById('edit-birth-date').value = user.dob.split('T')[0];
                document.getElementById('edit-email').value = user.email;
<<<<<<< HEAD
=======

                // Store original user data
                originalUserData = {
                  name: user.name,
                  dob: user.dob.split('T')[0],
                  email: user.email
                };
>>>>>>> a2b2bf08983f234cf3d5980c969c88725018f0d1
                
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
      if (!userId) {
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
            updatedUserData.currentPassword = currentPassword;
            updatedUserData.newPassword = newPassword;
            updatedUserData.confirmNewPassword = confirmNewPassword;
        }
<<<<<<< HEAD
=======

        // Check if no changes were made
        if (updatedUserData.name === originalUserData.name && updatedUserData.dob === originalUserData.dob && updatedUserData.email === originalUserData.email && !newPassword && !confirmNewPassword) {
          alert('No changes were detected. Click on the edit icon to close.');
          return;
        }
>>>>>>> a2b2bf08983f234cf3d5980c969c88725018f0d1
        
        
        try {
            const response = await fetch(`/account/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
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
                
                // Close the edit fields
                document.getElementById('edit-account-details').style.display = 'none';
            
<<<<<<< HEAD
            } else {
                const errorData = await response.json();
                if (errorData.message.length > 0) {
=======
              } else {
                const errorData = await response.json();
                if (errorData.message === 'Current password is incorrect') {
                    alert('Current password is incorrect');
                } else if (errorData.message.length > 0) {
>>>>>>> a2b2bf08983f234cf3d5980c969c88725018f0d1
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
    const userId = sessionStorage.getItem('userId');
      fetchUserProfile(userId);
      //alert('Please log in first to upload your profile picture.');
  });
  
  async function fetchUserProfile(userId) {
    try {
      const response = await fetch(`/account/profile/${userId}`);
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
    const userId = sessionStorage.getItem('userId');
    if (!userId) {
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
    const userId = sessionStorage.getItem('userId');
    try {
      const response = await fetch(`/account/uploadProfilePic/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ profilePic: base64Image })
      });
  
      if (response.ok) {
        alert('Profile picture updated successfully');
      } else {
        alert('Failed to update profile picture');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image');
    }
  }
      
  // ---------------------------------------------- DELETE ACCOUNT ----------------------------------------------
  // Function to confirm account deletion
  function confirmDeleteAccount() {
    const userId = sessionStorage.getItem('userId');
    
    if (!userId) {
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
    const userId = sessionStorage.getItem('userId');
    const password = document.getElementById('delete-password').value;
  
    if (!userId) {
      alert('No user is logged in');
      return;
    }
  
    if (!password) {
      alert('Please enter your password');
      return;
    }
  
    try {
      const response = await fetch(`/account/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password: password })
      });
  
      if (response.ok) {
        alert('Account deleted successfully');
        sessionStorage.removeItem('userId');
        window.location.href = 'Index.html';
      } else {
        const errorData = await response.json();
        alert(`${errorData.message}`);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      closeDeleteModal();
    }
  }
  