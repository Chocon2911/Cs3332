//==========================================Variable==========================================
// Ingredient
const IngredientsContainer = document.getElementById("IngredientsContainer");
const ItemName = document.getElementById("ItemName");
const ExecuteGuide = document.getElementById("ExecuteGuide");

// Other
ingredientIndex = 1;
ingredientNames =
[
    "Sugar",
    "Milk",
    "Coffee Bean",
    "Flour",
    "Salt",
    "Water",
];

//===========================================Class============================================
class Recipe
{
    constructor(itemName, ingredients, executeGuide) 
    {
        this.itemName = itemName;
        this.ingredients = ingredients;
        this.executeGuide = executeGuide;
    }
}

class Ingredient
{
    constructor(name, quantity)
    {
        this.name = name;
        this.quantity = quantity;
    }
}

//===========================================Method===========================================
window.onload = () => 
{
    addIngredient();
    addIngredient();
}

function removeIngredient(button)
{
    const ingredient = button.parentElement;
    ingredient.remove();
}

function addIngredient()
{
    const ingredientsContainer = document.getElementById("IngredientsContainer");
    const div = document.createElement("div");
    optionValues = getIngredientNames();
    div.className = "Ingredient";
    div.innerHTML = `
        <select class="IngredientSelect" id="IngredientName${ingredientIndex}" placeholder="-- Select Ingredient --">
            <option value="1">-- Select Ingredient --</option>
            ${optionValues}
        </select>
        <input type="number" min="1" class="QuantityInput InputFocus" placeholder="Amount (e.g., 200 ml)" id="Quantity${ingredientIndex}">
        <button class="RemoveButton" onclick="removeIngredient(this)">−</button>
        `;
    ingredientIndex++;
    ingredientsContainer.appendChild(div);
}

function submit()
{
    console.log("Fuck");
    ingredients = [];
    for (i = 0; i < ingredientIndex; i++)
    {
        id = document.getElementById(`IngredientName${i}`);
        
        if (id == null) continue;
        const name = document.getElementById(`IngredientName${i}`).value.trim();
        const quantity = document.getElementById(`Quantity${i}`).value.trim();
        
        if (!name || !quantity) continue
        ingredients.push(new Ingredient(name, quantity));
    }

    const recipe = new Recipe(ItemName.value.trim(), ingredients, ExecuteGuide.value.trim());
    console.log("Submit Recipe: ", recipe);
}

function getIngredientNames()
{
    result = "";
    for (i = 0; i < ingredientNames.length; i++)
    {
        result += `<option value="${ingredientNames[i]}">${ingredientNames[i]}</option>`;
    }

    return result;
}

document.getElementById("SubmitButton").addEventListener("click", submit);