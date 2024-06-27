function enableEditing(id) {
    console.log('Editing element with ID:', id); // Add this line
    const element = document.getElementById(id);
    if (element) {
        element.setAttribute('contenteditable', 'true');
        element.focus();
        element.addEventListener('blur', () => {
            element.setAttribute('contenteditable', 'false');
        });
    } else {
        console.error('Element not found with ID:', id);
    }
}
function triggerFileUpload() {
    document.getElementById('fileInput').click();
  }
  
  function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
      const fileList = document.getElementById('file-list');
      const fileItem = document.createElement('div');
      fileItem.className = 'file-item';
      fileItem.innerHTML = `
        <p>
          ⇒ 
          <i class="fa-solid fa-file" style="color: #000000;"></i>
          ${file.name}
          <span class="delete-icon" onclick="removeFile(this)">
            <i class="fa-solid fa-x" style="color: #ff3838;"></i>
          </span>
        </p>
      `;
      fileList.appendChild(fileItem);
    }
  }
  
  function removeFile(element) {
    element.parentElement.parentElement.remove();
  }
  
