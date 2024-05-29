/////////// DECLARATION VARIABLES ///////////

let allWorks = []; 
let allCategories = [];
let standByImg;

/////////// DECLARATION FONCTIONS ///////////

// Fetching DB
/**
 * Récupère et retourne des objets "works" ou "categories" en fonction du type spécifié.
 * @param {string} type - Type de données à récupérer ('works' ou 'categories').
 * @returns {Promise<Array|Null>} Un tableau d'objets ou null en cas d'erreur.
 */
async function fetchData(type) {
    let url;
    switch (type) {
        case 'works':
            url = 'http://localhost:5678/api/works';
            break;
        case 'categories':
            url = 'http://localhost:5678/api/categories';
            break;
        default:
            console.error('Invalid type specified');
            return null;
    }

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error fetching ${type}:`, error);
        return null;
    }
}

/**
 * Fonction pour uploader un travail (work) vers le serveur.
 * @param {File} image - Le fichier image à uploader.
 * @param {string} title - Le titre du travail.
 * @param {number} category - L'ID de la catégorie du travail.
 */
async function uploadWork(image, title, category) {
    // Récupérer le token JWT depuis le localStorage
    const token = localStorage.getItem('jwt'); 

    // Créer un objet FormData pour préparer les données du formulaire à envoyer
    const formData = new FormData(); 

    // Ajouter l'image à l'objet FormData
    formData.append('image', image); 

    // Ajouter le titre à l'objet FormData
    formData.append('title', title); 

    // Ajouter l'ID de la catégorie à l'objet FormData
    formData.append('category', category); 

    try {
        // Faire une requête POST vers l'API pour uploader le travail
        const response = await fetch('http://localhost:5678/api/works', {
            method: 'POST', // Méthode HTTP à utiliser pour la requête
            headers: {
                // Ajouter le token JWT à l'en-tête de la requête pour l'authentification
                'Authorization': `Bearer ${token}`
            },
            // Utiliser l'objet FormData comme corps de la requête
            body: formData 
        });

        // Vérifier si la requête a réussi
        if (response.ok) {
            // Extraire les données de la réponse JSON
            const responseData = await response.json();
            // Actions supplémentaires après l'upload, comme mettre à jour la galerie
            console.log('Upload réussi:', responseData); // Log de succès pour vérification
        } else {
            // Extraire les données d'erreur de la réponse JSON
            const errorData = await response.json();
            // Lancer une erreur avec le statut de la réponse et les détails de l'erreur
            throw new Error(`Erreur lors de l'upload: ${response.statusText}, ${JSON.stringify(errorData)}`);
        }
    } catch (error) {
        // Log de l'erreur en cas d'échec de la requête
        console.error('Failed to upload work:', error);
    }
}

/**
 * Fonction pour supprimer une image via l'API.
 * @param {number} imageId - L'ID de l'image à supprimer.
 */
async function deleteImage(imageId) {
    // Récupérer le token JWT depuis le localStorage pour l'authentification
    const token = localStorage.getItem('jwt'); 

    try {
        // Faire une requête DELETE vers l'API pour supprimer l'image
        const response = await fetch(`http://localhost:5678/api/works/${imageId}`, {
            method: 'DELETE', // Méthode HTTP à utiliser pour la requête
            headers: {
                'accept': '*/*', // Accepter toutes les réponses de type MIME
                'Authorization': `Bearer ${token}` // Ajouter le token JWT à l'en-tête de la requête pour l'authentification
            }
        });

        // Vérifier si la requête a réussi
        if (response.ok) {
            // Supprime l'élément du DOM si la requête est réussie
            displayGallery(); // Met à jour la galerie pour refléter les changements
            createModal(); // Recrée la modale pour mettre à jour son contenu

        } else {
            // Lancer une erreur avec le statut de la réponse et les détails de l'erreur
            throw new Error(`Erreur lors de la suppression de l'image: ${response.statusText}`);
        }
    } catch (error) {
        // Log de l'erreur en cas d'échec de la requête
        console.error('Failed to delete image:', error);
    }
}


////////////// CREATION DE LA GALLERIE  //////////////////////
// Création d'un carte
/**
 * Crée et ajoute des éléments <figure> pour chaque work dans l'élément de la galerie.
 * @param {Array} items - Tableau d'items à afficher dans la galerie.
 */
function createFigures(items) {
    const gallery = document.querySelector('.gallery');
    if (!gallery) {
        console.error("Element 'gallery' not found in the document.");
        return;
    }

    gallery.innerHTML = '';

    for (let i = 0; i < items.length; i++) {
        const item = items[i];

        const figure = document.createElement('figure');
        const img = document.createElement('img');
        img.src = item.imageUrl; 
        img.alt = item.title;    

        const figcaption = document.createElement('figcaption');
        figcaption.textContent = item.title;  

        figure.appendChild(img);
        figure.appendChild(figcaption);
        gallery.appendChild(figure);
    }
}

// Création de la gallerie au chargement de la page 
async function displayGallery() {
    try {
        allWorks = await fetchData('works');
        if (allWorks) {
            createFigures(allWorks);
        } else {
            console.log("No works data available.");
        }
    } catch (error) {
        console.error("Error during data fetching and display:", error);
    }
}

//////// BOUTONS FILTRATION /////////
// Filtration des traveaux
/**
 * Filtre les travaux par ID de catégorie.
 * @param {Array} works - Le tableau de tous les travaux à filtrer.
 * @param {number} categoryId - L'ID de la catégorie utilisée pour filtrer les travaux.
 * @returns {Array} Tableau des travaux filtrés par catégorie.
 */
function filterWorksByCategory(works, categoryId) {
    // Si l'ID de la catégorie est 0, retourne tous les travaux
    if (categoryId === 0) return works; // Retourne tous les travaux si categoryId est 0 (Tous)
    
    // Filtre les travaux pour ne garder que ceux dont l'ID de catégorie correspond à categoryId
    return works.filter(work => work.categoryId === categoryId);
}

async function displayFiltersButtons() {
    try {
        // Charger les catégories
        allCategories = await fetchData("categories");

        // Trouver la div .filters
        const filtersDiv = document.querySelector('.filters');
        
        // Vide la div filters avant d'ajouter de nouveaux boutons
        filtersDiv.innerHTML = '';

        // Crée le bouton "Tous"
        const allButton = document.createElement('button');
        allButton.id = 'filter-Tous';
        allButton.classList.add('selected');
        allButton.dataset.category = '0';
        allButton.textContent = 'Tous';
        filtersDiv.appendChild(allButton);

        // Créer les boutons pour chaque catégorie
        allCategories.forEach(category => {
            const button = document.createElement('button');
            button.id = `filter-${category.name.replace(/\s+/g, '_')}`; // Remplace les espaces par des underscores pour l'ID
            button.dataset.category = category.id;
            button.textContent = category.name;
            filtersDiv.appendChild(button);
        });

        filtration();

    } catch (error) {
        console.error('Failed to load categories and create buttons:', error);
    }
}

// Lance la filtration et change le syle 
function filtration(){
    // Sélectionne tous les boutons dans la div .filters
    const buttons = document.querySelectorAll('.filters button');

    // Ajoute un écouteur d'événements 'click' à chaque bouton
    buttons.forEach(button => {
        button.addEventListener('click', function() {

            // FILTRATION DE LA GALLERIE
            // Récupère l'ID de la catégorie à partir de l'attribut dataset du bouton
            const categoryId = parseInt(button.dataset.category);
            // Filtre les travaux en fonction de l'ID de la catégorie sélectionnée
            const worksFiltered = filterWorksByCategory(allWorks, categoryId);
            // Appelle la fonction createFigures avec les travaux filtrés pour les afficher
            createFigures(worksFiltered);

            // CHANGEMENT DE STYLE DES BOUTONS QUAND SELECTED
            // Retire la classe 'selected' de tous les boutons
            buttons.forEach(btn => btn.classList.remove('selected'));
            // Ajoute la classe 'selected' au bouton qui a été cliqué
            button.classList.add('selected');
        });
    });
}

//////// CREATION FORMULAIRE DE CONTACT ////////
function addContactForm() {
    // Trouve l'élément de la section #contact
    const contactSection = document.getElementById('contact');

    // Création des éléments HTML
    const h2 = document.createElement('h2');
    h2.textContent = 'Contact';

    const p = document.createElement('p');
    p.textContent = 'Vous avez un projet ? Discutons-en !';

    const form = document.createElement('form');
    form.action = '#';
    form.method = 'post';

    const labelName = document.createElement('label');
    labelName.htmlFor = 'name';
    labelName.textContent = 'Nom';

    const inputName = document.createElement('input');
    inputName.type = 'text';
    inputName.name = 'name';
    inputName.id = 'name';

    const labelEmail = document.createElement('label');
    labelEmail.htmlFor = 'email';
    labelEmail.textContent = 'Email';

    const inputEmail = document.createElement('input');
    inputEmail.type = 'email';
    inputEmail.name = 'email';
    inputEmail.id = 'email';

    const labelMessage = document.createElement('label');
    labelMessage.htmlFor = 'message';
    labelMessage.textContent = 'Message';

    const textareaMessage = document.createElement('textarea');
    textareaMessage.name = 'message';
    textareaMessage.id = 'message';
    textareaMessage.cols = 30;
    textareaMessage.rows = 10;

    const submitButton = document.createElement('input');
    submitButton.type = 'submit';
    submitButton.value = 'Envoyer';

    // Ajoute les éléments au formulaire
    form.appendChild(labelName);
    form.appendChild(inputName);
    form.appendChild(labelEmail);
    form.appendChild(inputEmail);
    form.appendChild(labelMessage);
    form.appendChild(textareaMessage);
    form.appendChild(submitButton);

    // Ajoute les éléments à la section contact
    contactSection.appendChild(h2);
    contactSection.appendChild(p);
    contactSection.appendChild(form);
}

////////////// LOG IN & OUT ///////////
// LogIn check
document.addEventListener('DOMContentLoaded', function() {
    // Fonction pour vérifier si l'utilisateur est connecté
    function checkIfLoggedIn() {
        const token = localStorage.getItem('jwt'); // Récupère le token du localStorage
        if (token) {
            console.log('Utilisateur connecté'); // Log pour vérification          
                // Sélectionne et modifie les éléments selon que l'utilisateur est connecté
                document.querySelectorAll('.edit-banner, .logout-button, .edit-button').forEach(element => {
                    element.classList.remove('hide'); // Retire la classe 'hide' pour rendre visible
                });
                document.querySelectorAll('.filters, .login-button').forEach(element => {
                    element.classList.add('hide'); // Ajoute la classe 'hide' pour cacher
                });
        } else {
            console.log('Utilisateur non connecté');
            // Sélectionne et modifie les éléments selon que l'utilisateur est non connecté
            document.querySelectorAll('.filters, .login-button').forEach(element => {
                element.classList.remove('hide'); // Retire la classe 'hide' pour rendre visible
            });
            document.querySelectorAll('.edit-banner, .logout-button, .edit-button').forEach(element => {
                element.classList.add('hide'); // Ajoute la classe 'hide' pour cacher
            });
        }
    }

    checkIfLoggedIn(); // Appelle la fonction au chargement de la page
});

// LogOut
// Sélectionne tous les éléments avec la classe 'logout'
const logoutElement = document.querySelector('.logout-button');
// Ajoute un gestionnaire de clic l'élément
logoutElement.addEventListener('click', function() {
    // Supprime le JWT de localStorage
    localStorage.removeItem('jwt');  

    window.location.href = 'index.html';
});

//////////        MODALE  1     ////////////
// Affiche la modale quand le bouton "modifier" est cliqué
document.querySelector('.edit-button').addEventListener('click', function() {    
    createModal();
});

// Fonction pour créer la modale
function createModal() {
    // Supprime l'ancienne modal si elle existe
    const existingModal = document.querySelector('.modal-2');
    if (existingModal) {
        existingModal.remove();
    }

    // Créer l'élément <dialog> et ajouter la classe 'modal'
    const modal = document.createElement('dialog');
    modal.classList.add('modal');

    // Créer le bouton de fermeture
    const closeButton = document.createElement('p');
    closeButton.classList.add('close-button');

    // Ajouter l'icône de fermeture
    const closeIcon = document.createElement('i');
    closeIcon.classList.add('fa-solid', 'fa-xmark');

    // Ajouter l'icône au paragraphe
    closeButton.appendChild(closeIcon);

    // Créer le titre de la modale
    const titreModal = document.createElement('h3');
    titreModal.classList.add('titre-modal');
    titreModal.textContent = 'Galerie photo';

    // Créer le conteneur d'images
    const imgContainer = document.createElement('div');
    imgContainer.classList.add('img-contener');

    // Créer le bouton pour ajouter une image
    const addButton = document.createElement('button');
    addButton.classList.add('add-image');
    addButton.textContent = 'Ajouter une photo';

    // Ajouter les éléments au dialog
    modal.appendChild(closeButton);
    modal.appendChild(titreModal);
    modal.appendChild(imgContainer);
    modal.appendChild(addButton);

    // Ajouter le dialog au corps du document
    document.body.appendChild(modal);

        document.querySelector('.overlay').classList.remove('hide');
    document.querySelector('body').classList.add('no-scroll');

    // Ajout de divers events de transition
    addButton.addEventListener('click', createModal2);
    document.querySelector('.close-button').addEventListener('click', closeModal);
    document.querySelector('.overlay').addEventListener('click', closeModal);


    addImagesToModal();
}

async function addImagesToModal() {
    const container = document.querySelector('.img-contener');
    container.innerHTML = '';  // Vide le conteneur pour être sûr qu'il n'y a pas d'images précédentes

    try {
        // S'assurer que les données sont chargées
        if (!allWorks || allWorks.length === 0) {
            allWorks = await fetchData("works");
        }

        allWorks.forEach(image => {
            const div = document.createElement('div');
            div.classList.add('img-modal');  // Ajoute la classe pour le style

            // Définit l'image en arrière-plan
            div.style.backgroundImage = `url(${image.imageUrl})`;

            // Ajoute le dataset id à la div
            div.dataset.id = image.id;

            // Crée l'élément icône
            const icon = document.createElement('i');
            icon.classList.add('fa-solid', 'fa-trash-can');

            icon.addEventListener('click', function() {
                const imageId = icon.parentElement.dataset.id;

                const confirmed = window.confirm("Voulez-vous vraiment supprimer ce projet ?");
                if (confirmed) {
                    deleteImage(imageId);
                    createModal();
                }
            });

            // Ajoute l'icône à la div
            div.appendChild(icon);

            // Ajoute la div au conteneur
            container.appendChild(div);
        });

    } catch (error) {
        console.error('Failed to add images to modal:', error);
    }
}

function createModal2() {
    // Supprime l'ancienne modal si elle existe
    const existingModal = document.querySelector('.modal');
    if (existingModal) {
        existingModal.remove();
    }

    // Crée l'élément dialog
    const dialog = document.createElement('dialog');
    dialog.classList.add('modal-2');

    // Crée la div pour le top menu
    const topMenu = document.createElement('div');
    topMenu.classList.add('modal-top-menu');

    // Crée le bouton de retour
    const backButton = document.createElement('p');
    backButton.classList.add('back-button');
    const backIcon = document.createElement('i');
    backIcon.classList.add('fa-solid', 'fa-arrow-left');
    backButton.appendChild(backIcon);
    topMenu.appendChild(backButton);

    // Crée le bouton de fermeture
    const closeButton = document.createElement('p');
    closeButton.classList.add('close-button');
    const closeIcon = document.createElement('i');
    closeIcon.classList.add('fa-solid', 'fa-xmark');
    closeButton.appendChild(closeIcon);
    topMenu.appendChild(closeButton);

    // Ajoute le top menu à la modal
    dialog.appendChild(topMenu);

    // Crée le titre de la modal
    const title = document.createElement('h3');
    title.textContent = 'Ajouter photo';
    dialog.appendChild(title);

    // Crée le formulaire
    const form = document.createElement('form');
    form.id = 'imageUploadForm';

    // Crée la zone pour l'image
    const imageArea = document.createElement('div');
    imageArea.classList.add('image-aera');

    const label = document.createElement('label');
    label.setAttribute('for', 'image');
    const imageIcon = document.createElement('i');
    imageIcon.classList.add('fa-regular', 'fa-image');
    label.appendChild(imageIcon);
    imageArea.appendChild(label);

    const inputFile = document.createElement('input');
    inputFile.classList.add('hide');
    inputFile.classList.add('validation-required');
    inputFile.type = 'file';
    inputFile.id = 'image';
    inputFile.name = 'image';
    inputFile.accept = 'image/jpeg, image/png'; // Accepte uniquement les formats jpg et png
    inputFile.multiple = false; // Assure que seule une image peut être sélectionnée
    inputFile.required = true;
    imageArea.appendChild(inputFile);
    
    // Ajout d'un gestionnaire d'événement pour vérifier la taille du fichier
    inputFile.addEventListener('change', function(event) {
        const file = event.target.files[0];
        const maxSize = 4 * 1024 * 1024; // Taille maximale de 4 Mo
    
        if (file && file.size > maxSize) {
            alert('La taille du fichier dépasse la limite de 4 Mo. Veuillez choisir un fichier plus petit.');
            inputFile.value = ''; // Réinitialise l'input
        }
    }); 

    // Affichage de l'image chargée 
    // Quand une image est chargée
    inputFile.addEventListener('change', function(event) {
        // Masquer tous les enfants de .image-aera
        const children = imageArea.children;
        for (let i = 0; i < children.length; i++) {
            children[i].classList.add('hide');
        }

        // Afficher l'image chargée
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            // Callback après lecture
            reader.onload = function(e) {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.classList.add('selected-img');
                imageArea.appendChild(img);

                // Stocker l'image dans la variable globale
                standByImg = img;
            };
            // lecture avent callback
            reader.readAsDataURL(file);
        }
    });

    const addButton = document.createElement('button');
    addButton.type = 'button'; // Définir le type sur "button"
    addButton.textContent = '+ Ajouter photo';
    imageArea.appendChild(addButton);

    // Ajout du gestionnaire d'événement pour ouvrir le volet de chargement de l'image
    addButton.addEventListener('click', function() {
        inputFile.click();
    });

    const fileFormat = document.createElement('p');
    fileFormat.textContent = 'jpg, png : 4mo max';
    imageArea.appendChild(fileFormat);

    form.appendChild(imageArea);

    // Crée l'input pour la description
    const labelDescription = document.createElement('label');
    labelDescription.classList.add('modal-2-label');    
    labelDescription.setAttribute('for', 'titre');
    labelDescription.textContent = 'Description :';
    form.appendChild(labelDescription);

    const inputDescription = document.createElement('input');
    inputDescription.classList.add('validation-required');
    inputDescription.type = 'text';
    inputDescription.id = 'titre';
    inputDescription.name = 'description';
    inputDescription.required = true;
    form.appendChild(inputDescription);

    // Crée le select pour la catégorie
    const labelCategory = document.createElement('label');
    labelCategory.classList.add('modal-2-label');
    labelCategory.setAttribute('for', 'category');
    labelCategory.textContent = 'Catégorie :';
    form.appendChild(labelCategory);

    const selectCategory = document.createElement('select');
    selectCategory.classList.add('validation-required');
    selectCategory.id = 'category';
    selectCategory.name = 'category';
    selectCategory.required = true;

    const emptyOption = document.createElement('option');
    emptyOption.value = '';
    selectCategory.appendChild(emptyOption);

    form.appendChild(selectCategory);

    // Crée la ligne horizontale
    const hr = document.createElement('hr');
    form.appendChild(hr);

    // Crée le bouton de validation
    const submitButton = document.createElement('button');
    submitButton.classList.add('add-img-botton');
    submitButton.type = 'submit';
    submitButton.textContent = 'Valider';
    form.appendChild(submitButton);

    // Ajoute le formulaire à la modal
    dialog.appendChild(form);

    // Ajoute la nouvelle modal au body
    document.body.appendChild(dialog);

    // Ajoute les écouteurs d'événements aux boutons
    document.querySelector('.close-button').addEventListener('click', closeModal);
    document.querySelector('.overlay').addEventListener('click', closeModal);
    backButton.addEventListener('click', createModal);

    addCategoryOptions()

    // Ajouter la modification de la couleur du bouton submit
    // Récupère tous les champs requis
    const validationFields = document.querySelectorAll('.validation-required');
    validationFields.forEach(field => {
        // Vérifie pour chaque changement 
        field.addEventListener('change', function() {
            let allValid = true;

            validationFields.forEach(validationField => {
                // Vérifie si une valeur est absente 
                if (!validationField.value) {
                    allValid = false;
                }
            });

            if (allValid) {
                submitButton.classList.add('clickable');
            } else {
                submitButton.classList.remove('clickable');
            }
        });
    });

    // Ajout de l'Event Listener au bouton de soumission de upload
    submitButton.addEventListener('click', function(event) {
        event.preventDefault(); // Empêcher le comportement par défaut du bouton
        if (this.classList.contains('clickable')) {
            const image = inputFile.files[0]; // Récupérer le fichier image
            const title = inputDescription.value; // Récupérer le titre
            const category = selectCategory.value; // Récupérer la catégorie
            uploadWork(image, title, category); // Appeler la fonction d'upload
        } else {
            console.error('Le bouton de soumission n\'est pas clickable.');
        }
    });

}

// Fonction pour ajouter les options de catégories au select
async function addCategoryOptions() {
    // Assurez-vous que les catégories sont chargées
    if (!allCategories || allCategories.length === 0) {
        allCategories = await fetchData('categories');
    }

    const selectCategory = document.getElementById('category');
    if (selectCategory) {
        selectCategory.innerHTML = ''; // Vide les options existantes

        // Ajoutez une option vide par défaut
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '';
        selectCategory.appendChild(defaultOption);

        // Ajoutez les options des catégories
        allCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            selectCategory.appendChild(option);
        });
    } else {
        console.error('Element selectCategory not found');
    }
}

// Fonction pour fermer les modals
function closeModal() {
    const modal1 = document.querySelector('.modal');
    const modal2 = document.querySelector('.modal-2');
    const overlay = document.querySelector('.overlay');

    // Ferme la modale si elle existe
    if (modal1) {
        modal1.remove();
    }
    if (modal2) {
        modal2.remove();
    }

    // Ferme l'overlay
    overlay.classList.add('hide'); // Ajoute la classe 'hide' à l'overlay
    document.body.classList.remove('no-scroll'); // Retire la classe 'no-scroll' du body
}

///////////      RUNNING       ///////////

displayGallery();  // Exécute la fonction pour afficher la galerie
displayFiltersButtons(); // Ajout des boutons de filtration depuis les catégories
addContactForm(); // Ajout du formulaire de contact 