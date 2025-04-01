document.addEventListener('DOMContentLoaded', () => {
    let ul = document.querySelector('.links-container');
    if (!ul) return; 
  
    auth.onAuthStateChanged((user) => {
      if (user) {
        ul.innerHTML += `
          <li class="link-item"><a href="/admin" class="link">Dashboard</a></li>
          
          <li class="link-item"><a href="#" onclick="logoutUser()" class="link">Logout</a></li>`;
      } else {
        ul.innerHTML += `
          <li class="link-item"><a href="/admin" class="link">login</a></li>`;
      }
    });
  });