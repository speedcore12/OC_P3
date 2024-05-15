
///////////  CONNEXION       /////////////

// LogIn 
document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const email = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');

    try {
        const response = await fetch('http://localhost:5678/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('jwt', data.token);
            window.location.href = 'index.html';
        } else {
            errorMessage.style.display = 'block';
            errorMessage.textContent = 'Erreur dans l’identifiant ou le mot de passe';
        }
    } catch (error) {
        console.error('An error occurred:', error);
        errorMessage.style.display = 'block';
        errorMessage.textContent = 'Une erreur réseau est survenue. Veuillez réessayer.';
    }
});





