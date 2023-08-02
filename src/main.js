const productsPerPage = 24;
const totalProducts = 461;
const totalPages = Math.ceil(totalProducts / productsPerPage);
let totalBasketPrice = 0;
const cartItems = [];
const productQuantities = {};

// Отримуємо номер поточної сторінки з параметрів URL
const urlParams = new URLSearchParams(window.location.search);
const currentPage = parseInt(urlParams.get('page')) || 1;

// Викликаємо функцію для рендеру кнопок пагінації з номером поточної сторінки
renderPaginationButtons(currentPage);

// Викликаємо функцію для відображення продуктів на поточній сторінці
getAndRenderProducts(currentPage);

function renderPaginationButtons(currentPage) {
    const paginationContainer = document.getElementById('pagination');
    let paginationHTML = '';

    if (totalPages <= 5) {
        for (let i = 1; i <= totalPages; i++) {
            paginationHTML += `
                <button class="pagination-button ${i === currentPage ? 'active' : ''}" onclick="handlePageClick(${i})">${i}</button>
            `;
        }
    } else {
        paginationHTML += `
            <button class="pagination-button ${currentPage === 1 ? 'active' : ''}" onclick="handlePageClick(1)">1</button>
        `;

        if (currentPage <= 4) {
            for (let i = 2; i <= 5; i++) {
                paginationHTML += `
                    <button class="pagination-button ${i === currentPage ? 'active' : ''}" onclick="handlePageClick(${i})">${i}</button>
                `;
            }
            paginationHTML += `<span class="ellipsis">...</span>`;
            paginationHTML += `
                <button class="pagination-button" onclick="handlePageClick(${totalPages})">${totalPages}</button>
            `;
        } else if (currentPage > 4 && currentPage <= totalPages - 4) {
            paginationHTML += `<span class="ellipsis">...</span>`;
            for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                paginationHTML += `
                    <button class="pagination-button ${i === currentPage ? 'active' : ''}" onclick="handlePageClick(${i})">${i}</button>
                `;
            }
            paginationHTML += `<span class="ellipsis">...</span>`;
            paginationHTML += `
                <button class="pagination-button" onclick="handlePageClick(${totalPages})">${totalPages}</button>
            `;
        } else {
            paginationHTML += `<span class="ellipsis">...</span>`;
            for (let i = totalPages - 4; i <= totalPages; i++) {
                paginationHTML += `
                    <button class="pagination-button ${i === currentPage ? 'active' : ''}" onclick="handlePageClick(${i})">${i}</button>
                `;
            }
        }
    }
    paginationContainer.innerHTML = paginationHTML;
}

function handlePageClick(page) {
    const newUrl = updateQueryStringParameter(window.location.href, 'page', page);
    window.history.pushState({ path: newUrl }, '', newUrl);
    getAndRenderProducts(page);
    renderPaginationButtons(page);
}

function updateQueryStringParameter(uri, key, value) {
    const re = new RegExp(`([?&])${key}=.*?(&|$)`, 'i');
    const separator = uri.indexOf('?') !== -1 ? '&' : '?';
    if (uri.match(re)) {
        return uri.replace(re, `$1${key}=${value}$2`);
    } else {
        return `${uri}${separator}${key}=${value}`;
    }
}

async function getAndRenderProducts(page) {
    try {
        const url = `https://voodoo-sandbox.myshopify.com/products.json?limit=${productsPerPage}&page=${page}`;
        const response = await fetch(url);
        const data = await response.json();
        renderProducts(data.products);
    } catch (error) {
        console.error('Помилка отримання продуктів:', error);
    }
}

function renderProducts(products) {
    const productListContainer = document.getElementById('product-list');
    let productListHTML = '';

    products.forEach(product => {
        const title = product.title;
        const price = product.variants[0].price;

        productListHTML += `
          <div class="w-[300px] h-[400px] flex flex-col mb-6">
             <div class="w-[300px] h-[300px] border-[1px] border-black rounded relative mb-4">
                <p class="card_p absolute top-5 left-5 bg-black text-white flex justify-center items-center w-12 border-0 rounded">USED</p>
             </div>
             <div class="flex justify-between">
                <div class="card_title">
                    <p>${title}</p>
                    <p>${price} KR.</p>
                </div>
                <div class="flex flex-col items-end w-[120px]">
                     <p class="card_condition">Condition</p>
                     <p class="card_prop">Slightly used</p>
                </div>
             </div>
             <button class="button border-[1px] border-black rounded bg-black text-white h-11 mt-4" onclick="addToCart('${title}', '${price}')">ADD TO CART</button>
          </div>
        `;
    });

    productListContainer.innerHTML = productListHTML;
}


const openBasketButton = document.getElementById('open_basket');
const closeBasketButton = document.getElementById('close_basket');
const basketBlock = document.getElementById('basket');

// Додаємо обробник події для відкриття блоку кошика
openBasketButton.addEventListener('click', () => {
    basketBlock.classList.remove('invisible');
    basketBlock.classList.add('visible');
});

// Додаємо обробник події для закриття блоку кошика
closeBasketButton.addEventListener('click', () => {
    basketBlock.classList.remove('visible');
    basketBlock.classList.add('invisible');
});

function addToCart(title, price) {
    const basketMain = document.getElementById('basket_main');

    const numericPrice = parseFloat(price);
    if (!isNaN(numericPrice)) {
        if (productQuantities[title]) {
            productQuantities[title] += 1;
        } else {
            productQuantities[title] = 1;
            // Створюємо новий елемент кошика
            const basketItem = document.createElement('div');
            basketItem.classList.add('w-[362px]', 'flex', 'h-[74px]', 'justify-between', 'items-start', 'mt-[25px]', 'basket-item');
            basketItem.dataset.title = title;

            basketItem.innerHTML = `
                <div class="flex justify-between">
                    <div class="w-[74px] h-[74px] border-[1px] border-[#FFFFFF80] mr-[15px]"></div>
                    <div class="basket_main flex flex-col justify-between">
                         <p class="w-[243px]">${title}</p>
                         <p>${price} KR.</p>
                         <div class="flex justify-between items-center w-[60px] h-[20px]">
                            <button class="h-[20px] decrease-quantity" onclick="decreaseQuantity('${title}', ${numericPrice})">-</button>
                            <p class="h-[20px] product-quantity">${productQuantities[title]}</p>
                            <button class="h-[20px] increase-quantity" onclick="increaseQuantity('${title}', ${numericPrice})">+</button>
                         </div>
                    </div>
                </div>
                <img src="src/img/Group.svg" onclick="removeFromCart('${title}')" alt="remove">
            `;

            basketMain.appendChild(basketItem);
            totalBasketPrice += numericPrice; // Додали ціну до загальної ціни
            updateTotalPrice(); // Оновлюємо загальну ціну

            // Додаємо товар до cartItems масиву
            cartItems.push({
                title: title,
                price: numericPrice,
                quantity: 1
            });
        }
    }
}

function removeFromCart(title) {
    console.log('Removing', title);
    // Знаходимо об'єкт у кошику за назвою
    const index = cartItems.findIndex(cartItem => cartItem.title === title);
    if (index !== -1) {
        const removedItem = cartItems.splice(index, 1)[0];
        totalBasketPrice -= removedItem.price * productQuantities[title]; // Видаляємо вартість за кількість
        updateTotalPrice();

        // Видаляємо HTML елемент товару з кошика
        const basketMain = document.getElementById('basket_main');
        const basketItems = basketMain.querySelectorAll('.basket-item');
        basketItems.forEach(item => {
            if (item.dataset.title === title) {
                basketMain.removeChild(item);
            }
        });

        // Очищаємо кількість товару
        productQuantities[title] = 0;
    }
}

function updateTotalPrice() {
    const basketTotalElement = document.getElementById('basket_total');
    basketTotalElement.textContent = `${totalBasketPrice.toFixed(2)} KR.`;
}

function increaseQuantity(title, price) {
    if (productQuantities[title]) {
        productQuantities[title] += 1;
        totalBasketPrice += price;
        updateBasketItemQuantity(title);
        updateTotalPrice();
    }
}

function decreaseQuantity(title, price) {
    if (productQuantities[title] && productQuantities[title] > 1) {
        productQuantities[title] -= 1;
        totalBasketPrice -= price;
        updateBasketItemQuantity(title);
        updateTotalPrice();
    }
}

function updateBasketItemQuantity(title) {
    const productQuantityElement = document.querySelector(`[data-title="${title}"] .product-quantity`);
    productQuantityElement.textContent = productQuantities[title] || 0;
}


const openCloseButton = document.getElementById('open_close');
const hiddenText = document.getElementById('hidden_text');

let isExpanded = false;

openCloseButton.addEventListener('click', () => {
  if (isExpanded) {
    hiddenText.classList.remove('hidden');
    hiddenText.classList.add('flex');
  } else {
    hiddenText.classList.remove('flex');
    hiddenText.classList.add('hidden');
  }

  isExpanded = !isExpanded;
});

const dynamicText = document.getElementById('dynamic-text');

// Функція, яка оновлює вміст елемента <p>
function updateTextContent() {
  if (window.innerWidth < 400) {
    dynamicText.textContent = 'Important info';
  } else {
    dynamicText.textContent = 'Important information about our service';
  }
}

// Викликаємо функцію при завантаженні сторінки та при зміні розміру вікна
window.addEventListener('load', updateTextContent);
window.addEventListener('resize', updateTextContent);
