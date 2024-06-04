///////////  CONNEXION       /////////////

/**
 * Ajoute un écouteur d'événements 'submit' au formulaire de connexion avec l'ID 'loginForm'.
 * Lors de la soumission du formulaire, cette fonction envoie une requête POST pour tenter de connecter l'utilisateur.
 * 
 * @param {Event} event - L'événement de soumission du formulaire.
 */
document.getElementById('loginForm').addEventListener('submit', async function(event) {
    // Empêche le comportement par défaut de soumission du formulaire qui entraîne un rechargement de la page
    event.preventDefault();

    // Récupère les valeurs des champs email et mot de passe
    const email = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage'); // Élément pour afficher les messages d'erreur

    try {
        // Envoie une requête POST à l'API de connexion
        const response = await fetch('http://localhost:5678/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', // Type de contenu envoyé
                'Accept': 'application/json' // Type de contenu accepté en réponse
            },
            body: JSON.stringify({ email, password }) // Corps de la requête, converti en JSON
        });

        // Vérifie si la réponse de l'API est correcte
        if (response.ok) {           
            const data = await response.json(); // Parse la réponse JSON
            localStorage.setItem('jwt', data.token); // Stocke le token JWT dans le localStorage
            window.location.href = 'index.html'; // Redirige l'utilisateur vers la page d'accueil
        } else {
            // Affiche un message d'erreur si la connexion a échoué
            errorMessage.style.display = 'block';
            errorMessage.textContent = 'Erreur dans l’identifiant ou le mot de passe';
        }
    } catch (error) {
        // En cas d'erreur réseau, affiche un message d'erreur approprié
        console.error('An error occurred:', error);
        errorMessage.style.display = 'block';
        errorMessage.textContent = 'Une erreur réseau est survenue. Veuillez réessayer.';
    }
});
