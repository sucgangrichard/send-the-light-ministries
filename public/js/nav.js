document.addEventListener('DOMContentLoaded', () => {
  let ul = document.querySelector('.links-container');
  if (!ul) return;

  // Add default navigation items
  const defaultNavItems = `
   
  `;
  ul.innerHTML = defaultNavItems;

  // Try to initialize Firebase auth state
  try {
    if (typeof auth !== 'undefined') {
      auth.onAuthStateChanged((user) => {
        if (user) {
          ul.innerHTML = defaultNavItems + `
            <li class="link-item"><a href="/admin" class="link">Dashboard</a></li>
            <li class="link-item"><a href="/write-blog" class="link">Write Blog</a></li>
            <li class="link-item"><a href="#" onclick="logoutUser()" class="link">Logout</a></li>
          `;
        } else {
          ul.innerHTML = defaultNavItems + `
            
            <li class="link-item"><a href="/" class="link">Home</a></li>
    <li class="link-item"><a href="/featured-articles" class="link">Articles</a></li>
    <li class="link-item"><a href="/featured-videos" class="link">Watch</a></li>
    <li class="link-item"><a href="/admin" class="link">Login</a></li>
          `;
        }
      }, (error) => {
        console.error('Auth state change error:', error);
        // On error, ensure at least the login link is visible
        ul.innerHTML = defaultNavItems + `
          <li class="link-item"><a href="/admin" class="link">Login</a></li>
        `;
      });
    }
  } catch (error) {
    console.error('Firebase initialization error:', error);
    // If Firebase fails, ensure at least the login link is visible
    ul.innerHTML = defaultNavItems + `
      <li class="link-item"><a href="/admin" class="link">Login</a></li>
    `;
  }
});