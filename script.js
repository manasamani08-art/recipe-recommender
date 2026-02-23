async function searchRecipes() {
    const ingredient = document.getElementById("ingredientInput").value.trim();
    const recipesDiv = document.getElementById("recipes");
    const detailsDiv = document.getElementById("recipeDetails");

    if (!ingredient) {
        recipesDiv.innerHTML = "Enter an ingredient 🙂";
        return;
    }

    recipesDiv.innerHTML = "Loading recipes...";
    detailsDiv.innerHTML = "";

    try {
        const response = await fetch(
            "https://www.themealdb.com/api/json/v1/1/filter.php?i=" + ingredient
        );
        const data = await response.json();

        if (!data.meals) {
            recipesDiv.innerHTML = "No recipes found 😢";
            return;
        }

        recipesDiv.innerHTML = "";

        data.meals.forEach(meal => {
            const card = document.createElement("div");
            card.className = "recipe-card";

            card.innerHTML = `
                <img src="${meal.strMealThumb}">
                <h3>${meal.strMeal}</h3>
                <button onclick="getRecipeDetails('${meal.idMeal}')">
                    View Recipe
                </button>
            `;

            recipesDiv.appendChild(card);
        });

    } catch (error) {
        recipesDiv.innerHTML = "Error loading recipes ⚠️";
        console.error(error);
    }
}

async function getRecipeDetails(id) {
    const detailsDiv = document.getElementById("recipeDetails");
    detailsDiv.innerHTML = "Loading recipe...";

    try {
        const response = await fetch(
            "https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + id
        );
        const data = await response.json();

        const meal = data.meals[0];

        detailsDiv.innerHTML = `
            <h2>${meal.strMeal}</h2>
            <img src="${meal.strMealThumb}" style="width:100%; border-radius:10px; margin:10px 0;">
            <h3>Instructions</h3>
            <p>${meal.strInstructions}</p>
        `;
    } catch (error) {
        detailsDiv.innerHTML = "Error loading recipe ⚠️";
        console.error(error);
    }
}