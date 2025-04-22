function generateIngredients()
{
    const image = "../Image/Espresso.png";
    const name = "Espresso";
    const weight = "0g";
    const expiry = "2023-12-31";

    const ingredientContainer = document.querySelector(".IngredientContainer");
    const amount = 2;

    ingredientContainer.innerHTML = "";

    for (let i = 0; i < amount; i++)
    {
        let ingredient = document.createElement("a"); // tag
        ingredient.classList.add("IngredientBox"); // class
        ingredient.setAttribute("href", "Ingredient.html"); // href

        ingredient.innerHTML = `
            <!--Image-->
            <li class="IngredientImage">
                <img src="${image}">
            </li>
            <br>
            <!--Name-->
            <label class="IngredientName">${name}</label>
            <!--Weight-->
            <li>
                <label class="IngredientName">Weight: </label>
                <label class="IngredientValue">${weight}</label>
            </li>
            <!--Expiry-->
            <li>
                <label class="IngredientName">Expiry Date: </label>
                <label class="IngredientValue">${expiry}</label>
            </li>
        `;
        ingredientContainer.appendChild(ingredient);
    }
}