//==========================================Variable==========================================
// Ingredient
const IngredientsContainer = document.getElementById("IngredientsContainer");
const ItemName = document.getElementById("ItemName");
const ItemUnit = document.getElementById("ItemUnit");
const ItemPrice = document.getElementById("ItemPrice");
const ExecuteGuide = document.getElementById("ExecuteGuide");

// Other
ingredientIndex = 1;
itemStacks = []; // List<ItemStack>

//===========================================Class============================================
class ProductCreate_Request
{
    constructor(itemName, unit, price, ingredients, executeGuide) 
    {
        this.itemName = itemName;
        this.unit = unit;
        this.price = price;
        this.ingredients = ingredients;
        this.executeGuide = executeGuide;
    }

    toJson()
    {
        let tempIngredients = [];
        for (let i = 0; i < this.ingredients.length; i++)
        {
            tempIngredients[i] = this.ingredients[i].toJson();
        }
        return {
            name: this.itemName,
            unit: this.unit,
            price: this.price,
            ingredients: tempIngredients,
            // executeGuide: this.executeGuide
        };
    }
}

class Ingredient
{
    constructor(itemStackId, quantity)
    {
        this.itemStackId = itemStackId;
        this.quantity = quantity;
    }
    toJson()
    {
        return {
            itemStackID: this.itemStackId,
            quantity: this.quantity
        };
    }
}

class ItemStackList_Response
{
    constructor(data)
    {
        this.itemStacks = [];
        let tempItemStacks = [];
        tempItemStacks = data['itemStacks'];
        for (let i = 0; i < tempItemStacks.length; i++)
        {
            this.itemStacks[i] = new ItemStack(tempItemStacks[i]['id'], tempItemStacks[i]['name'], tempItemStacks[i]['quantity']);
        }
    }
}

class ItemStack
{
    constructor(id, name, quantity)
    {
        this.id = id;
        this.name = name;
        this.quantity = quantity;
    }
}

//===========================================Method===========================================
window.onload = async () => 
{
    // ===Check Token and Role valid===
    const token = getCookie("token");
    const username = encodeURIComponent(getCookie("username"));
    request = new UserInfo_Request(username);
    res = await fetch("/manager_request/user_info", {
        method: "POST",
        headers:
        {
            "Content-Type": "application/json",
            "Authorization": token,
        },
        body: JSON.stringify(request.toJson())
    });

    if (res.status == 302)
    {
        
    }
    else if (res.status >= 400 && res.status <= 600)
    {
        if (res.status == 401)
        {
            window.location.href = "/manager/login";
            return;
        }

        if (res.status == 500)
        {
            ErrorMessage.classList.add("show");
            ErrorMessage.textContent = "Internal Server Error";
            return;
        }

        data = await res.json();
        console.log(data["error"]);
    }
    else
    {
        data = await res.json();
        console.log("Unexpected Error: " + data["error"]);
    }


    // ===Get all item stacks===
    res = await fetch("/manager_request/item_stack_list", {
        method: "POST",
        headers:
        {
            "Content-Type": "application/json"
        }
    });

    data = await res.json();
    if (res.status == 302 || res.status == 200)
    {
        const result = await new ItemStackList_Response(data);
        itemStacks = result.itemStacks;
        for (let i = 0; i < itemStacks.length; i++)
            console.log(itemStacks[i]);
    }
    else if (res.status >= 400 && res.status <= 600)
    {
        if (res.status == 401)
        {
            window.location.href = "/manager/login";
            return;
        }
        
        data = await res.json();
        console.log(data["error"]);
    }
    else
    {
        console.log("Unexpected Error: " + res["error"]);
    }

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

async function submit()
{
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

    // ===Validate===
    if (ingredients.length == 0)
    {
        document.getElementById("ErrorMessage").classList.add("show");
        document.getElementById("ErrorMessage").textContent  = "You must add at least one ingredient!";
        return;
    }

    if (ItemName.value.trim() == "" || ItemUnit.value.trim() == "" || ItemPrice.value.trim() == "")
    {
        document.getElementById("ErrorMessage").classList.add("show");
        document.getElementById("ErrorMessage").textContent  = "You must fill in all fields!";
        return;
    }

    if (isNaN(ItemPrice.value))
    {
        document.getElementById("ErrorMessage").classList.add("show");
        document.getElementById("ErrorMessage").textContent  = "Price must be a number!";
        return;
    }

    if (ItemPrice.value <= 0)
    {
        document.getElementById("ErrorMessage").classList.add("show");
        document.getElementById("ErrorMessage").textContent  = "Price must be greater than 0!";
        return;
    }

    //===Create Item===
    const token = getCookie("token");
    const request = new ProductCreate_Request(ItemName.value, ItemUnit.value, ItemPrice.value, ingredients, "");
    
    console.log(request.toJson());
    
    const res = await fetch("/manager_request/product_create", {
        method: "POST",
        headers:
        {
            "Content-Type": "application/json",
            "Authorization": token
        },
        body: JSON.stringify(request.toJson())
    });

    const result = await res.json();
    if (res.status == 201 || res.status == 200)
    {
        alert("New item has been saved!");
    }
    else if (res.status >= 400 && res.status <= 600)
    {
        if (result["error"] == "Unauthorized")
        {
            window.location.href = "/manager/login";
            return;
        }
        else if (result["error"] == "Internal Server Error")
        {
            ErrorMessage.classList.add("show");
            ErrorMessage.textContent = "Server Error: " + result["error"];
            return;
        }
    }
    else
    {
        console.log("Unexpected Error: " + result["error"]);
    }
}

function getIngredientNames()
{
    result = "";
    for (i = 0; i < itemStacks.length; i++)
    {
        result += `<option value="${itemStacks[i].id}">${itemStacks[i].name}</option>`;
    }

    return result;
}

document.getElementById("SubmitButton").addEventListener("click", async function () {submit();});