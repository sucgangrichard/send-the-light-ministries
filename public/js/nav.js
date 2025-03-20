//links container
// let ul = document.querySelector('.links-container');

// auth.onAuthStateChanged((user) => {
//     if(user){
//         //user is login
//         ul.innerHTML += `
//         <li class="link-item"><a href="/admin" class="link">Dashboard</a></li>
//         <li class="link-item"><a href="#" onclick="logoutUser()" class="link">Logout</a></li>`;
//     }else{
//         //no one is logged in
//         ul.innerHTML += `
//         <li class = "link-item"><a href="/admin" class="link">login</a></li>`;
//     }
// })

document.addEventListener('DOMContentLoaded', () => {
    let ul = document.querySelector('.links-container');
    if (!ul) return; // avoid error if element doesn't exist
  
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