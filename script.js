// ==========================
// SEARCH RECIPES
// ==========================
async function searchRecipes() {
    const input = document.getElementById("ingredientInput").value;
    const recipesDiv = document.getElementById("recipes");
    const detailsDiv = document.getElementById("recipeDetails");

    const isSmart = document.getElementById("modeToggle").checked;
    const vegFilter = document.getElementById("vegFilter").value;

    if (!input) {
        recipesDiv.innerHTML = "Enter ingredients 🙂";
        return;
    }

    recipesDiv.innerHTML = "Loading recipes...";
    detailsDiv.innerHTML = "";

    const ingredients = input.split(",").map(i => i.trim().toLowerCase());

    try {
        let mealLists = [];

        // Fetch recipes for each ingredient
        for (let ing of ingredients) {
            const response = await fetch(
                "https://www.themealdb.com/api/json/v1/1/filter.php?i=" + ing
            );
            const data = await response.json();

            mealLists.push(data.meals ? data.meals : []);
        }

        let finalMeals = [];

        // ==========================
        // STRICT MODE (AND)
        // ==========================
        if (!isSmart) {
            let commonMeals = mealLists[0];

            for (let i = 1; i < mealLists.length; i++) {
                commonMeals = commonMeals.filter(meal =>
                    mealLists[i].some(m => m.idMeal === meal.idMeal)
                );
            }

            finalMeals = commonMeals;
        }

        // ==========================
        // SMART MODE (Ranking)
        // ==========================
        else {
            let mealCount = {};

            mealLists.forEach(list => {
                list.forEach(meal => {
                    mealCount[meal.idMeal] = (mealCount[meal.idMeal] || 0) + 1;
                });
            });

            finalMeals = Object.keys(mealCount).map(id => ({
                ...mealLists.flat().find(m => m.idMeal === id),
                matchCount: mealCount[id]
            }));

            finalMeals.sort((a, b) => b.matchCount - a.matchCount);
        }

        if (!finalMeals || finalMeals.length === 0) {
            recipesDiv.innerHTML = "No recipes found 😢";
            return;
        }

        // Apply veg/non-veg filter
        filterVeg(finalMeals, vegFilter);

    } catch (error) {
        recipesDiv.innerHTML = "Error loading recipes ⚠️";
        console.error(error);
    }
}


// ==========================
// VEG / NON-VEG FILTER
// ==========================
async function filterVeg(meals, vegFilter) {
    const recipesDiv = document.getElementById("recipes");

    if (vegFilter === "all") {
        displayMeals(meals);
        return;
    }

    recipesDiv.innerHTML = "Filtering recipes...";

    let filtered = [];

    for (let meal of meals) {
        const res = await fetch(
            "https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + meal.idMeal
        );
        const data = await res.json();
        const fullMeal = data.meals[0];

        if (vegFilter === "veg" && fullMeal.strCategory === "Vegetarian") {
            filtered.push(meal);
        } 
        else if (vegFilter === "nonveg" && fullMeal.strCategory !== "Vegetarian") {
            filtered.push(meal);
        }
    }

    if (filtered.length === 0) {
        recipesDiv.innerHTML = "No recipes found for selected type 😢";
        return;
    }

    displayMeals(filtered);
}


// ==========================
// DISPLAY RECIPES
// ==========================
function displayMeals(meals) {
    const recipesDiv = document.getElementById("recipes");
    recipesDiv.innerHTML = "";

    meals.forEach(meal => {
        const card = document.createElement("div");
        card.className = "recipe-card";

        card.innerHTML = `
            <img src="${meal.strMealThumb}">
            <h3>${meal.strMeal}</h3>
            ${meal.matchCount ? `<p>Matches: ${meal.matchCount}</p>` : ""}
            <button onclick="getRecipeDetails('${meal.idMeal}')">
                View Recipe
            </button>
        `;

        recipesDiv.appendChild(card);
    });
}


// ==========================
// RECIPE DETAILS
// ==========================
async function getRecipeDetails(id) {
    const detailsDiv = document.getElementById("recipeDetails");
    detailsDiv.innerHTML = "Loading recipe...";

    try {
        const response = await fetch(
            "https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + id
        );
        const data = await response.json();

        if (!data.meals) {
            detailsDiv.innerHTML = "Recipe not found 😢";
            return;
        }

        const meal = data.meals[0];

        // Instructions → steps
        const steps = meal.strInstructions
            .split(/\r?\n/)
            .filter(step => step.trim() !== "");

        let formattedSteps = steps
            .map(step => `<li>${step}</li>`)
            .join("");

        // Ingredients list
        let ingredientsHTML = "<h3>Ingredients</h3><ul>";

        for (let i = 1; i <= 20; i++) {
            let ing = meal["strIngredient" + i];
            let measure = meal["strMeasure" + i];

            if (ing && ing.trim() !== "") {
                ingredientsHTML += `<li>${ing} - ${measure}</li>`;
            }
        }

        ingredientsHTML += "</ul>";

        // Display
        detailsDiv.innerHTML = `
            <h2>${meal.strMeal}</h2>
            <img src="${meal.strMealThumb}">
            ${ingredientsHTML}
            <h3>Instructions</h3>
            <ol>${formattedSteps}</ol>
        `;

        detailsDiv.scrollIntoView({ behavior: "smooth" });

    } catch (error) {
        detailsDiv.innerHTML = "Error loading recipe ⚠️";
        console.error(error);
    }
}


// ==========================
// DARK MODE
// ==========================
const toggle = document.getElementById("darkModeToggle");

if (localStorage.getItem("darkMode") === "enabled") {
    document.body.classList.add("dark");
    if (toggle) toggle.checked = true;
}

if (toggle) {
    toggle.addEventListener("change", () => {
        if (toggle.checked) {
            document.body.classList.add("dark");
            localStorage.setItem("darkMode", "enabled");
        } else {
            document.body.classList.remove("dark");
            localStorage.setItem("darkMode", "disabled");
        }
    });
}
