/////////// DECLARATION VARIABLES ///////////

/////////// DECLARATION FONCTIONS ///////////

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
 * Filtre les travaux par ID de catégorie.
 * @param {Array} works - Le tableau de tous les travaux à filtrer.
 * @param {number} categoryId - L'ID de la catégorie utilisée pour filtrer les travaux.
 * @returns {Array} Tableau des travaux filtrés par catégorie.
 */
function filterWorksByCategory(works, categoryId) {
    const filteredWorks = works.filter(function(work) {
        return work.categoryId === categoryId;
    });

    return filteredWorks;
}

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

/**
 * Affiche la galerie, filtrée ou non selon l'ID de la catégorie spécifiée.
 * @param {number|null} categoryId - ID de la catégorie pour filtrer les travaux, ou null pour afficher tous les travaux.
 */
async function displayGallery(categoryId = null) {
    try {
        const works = await fetchData('works');
        if (works) {
            let worksToDisplay;

            if (categoryId) {
                worksToDisplay = filterWorksByCategory(works, categoryId);
            } else {
                worksToDisplay = works;
            }

            createFigures(worksToDisplay);
        } else {
            console.log("No works data available.");
        }
    } catch (error) {
        console.error("Error during data fetching and display:", error);
    }
}

///////////      MAIN       ///////////

displayGallery();  // Exécute la fonction pour afficher la galerie



//////// BOUTONS FILTRATION /////////

document.getElementById('filter-Tous').addEventListener('click', function() {
    displayGallery(); // Fonction pour afficher tous les travaux
});

document.getElementById('filter-Objets').addEventListener('click', function() {
    displayGallery(1); // Fonction pour afficher les travaux de la catégorie "Objets"
});

document.getElementById('filter-Appartements').addEventListener('click', function() {
    displayGallery(2); // Fonction pour afficher les travaux de la catégorie "Appartements"
});

document.getElementById('filter-Hotels_restaurants').addEventListener('click', function() {
    displayGallery(3); // Fonction pour afficher les travaux de la catégorie "Hôtels & Restaurants"
});
