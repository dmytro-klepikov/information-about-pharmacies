'use strict';
// Global cart variable
window.cart = JSON.parse(localStorage.getItem("cart")) || [];

// Age verification functions
function acceptAge() {
  localStorage.setItem('ageVerified', 'true');
  document.getElementById('ageModal').style.display = 'none';
}

function denyAccess() {
  alert('Доступ запрещен!');
  window.location.href = 'https://www.google.com';
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
  // Burger menu initialization
  initBurgerMenu();
  
  // Phone input handling
  initPhoneInput();
  
  // Cart initialization
  initCart();
  
  // Инициализация кнопок добавления в корзину
  initAddToCartButtons();
  
  // Обновление отображения корзины
  updateCartDisplay();
  
  // Инициализация страницы корзины, если мы на ней
  initCartPage();
});

// Инициализация бургер-меню
  function initBurgerMenu() {
    const burgerMenu = document.querySelector('.menu__burger');
    const menuBody = document.querySelector('.menu'); 
    const menuLinks = document.querySelectorAll('.menu a[href^="#"]');

    if (burgerMenu && menuBody) { 
      burgerMenu.addEventListener("click", function(e) {
        document.body.classList.toggle('_lock');
        burgerMenu.classList.toggle('_active');
        menuBody.classList.toggle('_active');
      });

      // Close menu on click outside
      menuLinks.forEach(link => {
        link.addEventListener("click", function(e) {
          if (menuBody.classList.contains('_active')) {
            document.body.classList.remove('_lock');
            burgerMenu.classList.remove('_active');
            menuBody.classList.remove('_active');
          }
        });
      });

    } else {
        console.error("Елементи бургер-меню або контейнера меню не знайдені. Перевірте селектори '.menu__burger' и '.menu'.");
    }
  }

// Инициализация поля ввода телефона
function initPhoneInput() {
  const phoneInput = document.getElementById("phone");
  if (phoneInput) {
    phoneInput.addEventListener("focus", function() {
      if (!this.value.startsWith("+380")) {
        this.value = "+380";
      }
    });

    phoneInput.addEventListener("input", function() {
      this.value = this.value.replace(/[^\d+]/g, ""); // Удаляет все символы, кроме цифр и "+"
      
      if (!this.value.startsWith("+380")) {
        this.value = "+380";
      }
      
      if (this.value.length > 13) {
        this.value = this.value.slice(0, 13);
      }
    });

    phoneInput.addEventListener("blur", function() {
      if (this.value === "+380") {
        this.value = "";
      }
    });
  }
}

// Инициализация корзины
function initCart() {
  // Create overlay element
  const overlay = document.createElement('div');
  overlay.className = 'cart-overlay';
  document.body.appendChild(overlay);

  // Update cart header structure
  const cartHeaderBody = document.querySelector('.cart-header__body');
  if (cartHeaderBody) {
    // Add title and close button
    const titleDiv = document.createElement('div');
    titleDiv.className = 'cart-header__title';
    titleDiv.innerHTML = '<span class="cart__title-action">Кошик</span><span class="cart-close">&times;</span>';
    cartHeaderBody.prepend(titleDiv);

    // Add checkout button
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'cart-actions';
    // Ця кнопка все ще веде на cart.html
    actionsDiv.innerHTML = '<a href="../cart.html" class="button button--primary">Оформити замовлення</a>';
    cartHeaderBody.appendChild(actionsDiv);
  }

  // Toggle cart visibility
  const cartIcon = document.querySelector('.cart-header__icon');
  const cartClose = document.querySelector('.cart-close');

  // Відновлюємо обробник кліку для cartIcon, який відкриває міні-кошик
  if (cartIcon) {
    cartIcon.addEventListener('click', function(e) {
      e.preventDefault(); // Запобігаємо стандартній дії посилання (переходу)
      toggleCart(true); // Відкриваємо міні-кошик
    });
  }

  if (cartClose) {
    cartClose.addEventListener('click', function() {
      toggleCart(false);
    });
  }

  overlay.addEventListener('click', function() {
    toggleCart(false);
  });

  // Проверка кнопки оформления заказа (внутри мини-корзины)
  const checkoutButton = document.querySelector('.cart-header__body .button--primary');
  if (checkoutButton) {
    checkoutButton.addEventListener('click', function(e) {
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      if (cart.length === 0) {
        e.preventDefault(); // Запобігаємо переходу, якщо кошик порожній
        alert("Ваш кошик порожній");
      }
      // Якщо кошик не порожній, стандартна дія посилання (перехід на cart.html) відбудеться
    });
  }
}


// Инициализация кнопок добавления в корзину
function initAddToCartButtons() {
  // Кнопки на странице каталога
  const catalogButtons = document.querySelectorAll('.card__action--button, .cart__action--button');
  if (catalogButtons.length > 0) {
    catalogButtons.forEach(button => {
      button.addEventListener('click', function() {
        addToCartCatalog(this);
      });
    });
  }
  
  // Кнопки на странице товара
  const contentContainer = document.querySelector('.content__container');
  if (contentContainer) {
    const addToCartButton = document.querySelector('.add-to-cart');
    if (addToCartButton) {
      // Получаем ID товара из атрибута data-id контейнера
      const productId = contentContainer.dataset.id;
      
      // Заменяем обработчик onclick на addEventListener
      addToCartButton.removeAttribute('onclick');
      addToCartButton.addEventListener('click', function() {
        addToCart(parseInt(productId));
      });
    }
  }
  
  // Кнопки на странице с выбором объема
  const cardButtons = document.querySelectorAll('.card__body .add-to-cart');
  cardButtons.forEach(button => {
    if (button.hasAttribute('onclick')) {
      const onclickAttr = button.getAttribute('onclick');
      const idMatch = onclickAttr.match(/addToCart\((\d+)\)/);
      if (idMatch && idMatch[1]) {
        const id = parseInt(idMatch[1]);
        button.removeAttribute('onclick');
        button.addEventListener('click', function() {
          addToCart(id);
        });
      }
    }
  });
}

// Обновление цены карток 
function updatePrice(id) {
  let selectedOption = document.getElementById('option' + id);
  let price = selectedOption.value;
  document.getElementById('price' + id).innerText = price + ' грн.';
}

// Toggle cart visibility
function toggleCart(show) {
  const cartBody = document.querySelector('.cart-header__body');
  const overlay = document.querySelector('.cart-overlay');
  
  if (show) {
    cartBody.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scrolling
  } else {
    cartBody.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = ''; // Allow scrolling
  }
}

// Универсальная функция добавления товара в корзину
function addItemToCart(id, name, price, imgSrc, volume = "3 л") {
  // Нормализуем имя товара для сравнения
  const normalizedName = name.trim().toLowerCase();
  
  // Проверяем, есть ли уже такой товар в корзине по имени и объему
  const existingItemIndex = window.cart.findIndex(item => 
    (item.id === id || item.name.trim().toLowerCase() === normalizedName) && item.volume === volume
  );
  
  if (existingItemIndex !== -1) {
    // Если товар уже есть, увеличиваем его количество
    window.cart[existingItemIndex].quantity = (window.cart[existingItemIndex].quantity || 1) + 1;
  } else {
    // Если товара нет, добавляем новый
    window.cart.push({ 
      id,
      name, 
      volume,
      price,
      imgSrc,
      quantity: 1
    });
  }
  
  // Сохраняем в localStorage
  localStorage.setItem("cart", JSON.stringify(window.cart));
  
  // Обновляем отображение корзины
  updateCartDisplay();
}

// Функция для добавления товара в корзину с выбором объема
function addToCart(id) {
  const card = document.querySelector(`.card__body[data-id="${id}"]`) || 
               document.querySelector(`.content__container[data-id="${id}"]`);
  
  if (!card) {
    console.error(`Товар с ID ${id} не найден`);
    return;
  }
  
  let name, price, imgSrc, volume;
  
  // Определяем тип страницы (карточка товара или страница товара)
  if (card.classList.contains('card__body')) {
    // Страница с карточками товаров
    const select = card.querySelector(".card__select");
    
    name = card.querySelector(".card__subtitle").textContent.trim();
    imgSrc = card.querySelector(".card__img").src;
    
    // Проверяем, есть ли выбор объема
    if (select) {
      // Проверяем, выбран ли объем
      if (!select.value) {
        alert("Будь ласка, оберіть об'єм товару");
        return;
      }
      
      try {
        // Безопасное получение текста опции
        const selectedOption = select.options[select.selectedIndex];
        const optionText = selectedOption ? selectedOption.text : '';
        
        // Разбиваем текст опции, если возможно
        const volumeParts = optionText.includes(' - ') ? optionText.split(' - ') : [optionText];
        volume = volumeParts[0] + " л";
        price = select.value;
      } catch (error) {
        console.error('Ошибка при получении объема:', error);
        // Запасной вариант, если что-то пошло не так
        volume = "3 л";
        price = select.value;
      }
    } else {
      // Если нет выбора объема, берем цену из элемента
      const priceElement = card.querySelector(".card__price--item") || card.querySelector(".card__price");
      if (priceElement) {
        const priceText = priceElement.textContent.trim();
        price = parseInt(priceText.replace(/[^\d]/g, ''));
      } else {
        console.error('Элемент цены не найден');
        return;
      }
      volume = "3 л";
    }
    
    // Визуальный отклик
    const button = card.querySelector(".add-to-cart");
    if (button) {
      button.textContent = "Додано!";
      setTimeout(() => {
        button.textContent = "Додати в кошик";
      }, 1000);
    }
  } else {
    // Страница отдельного товара
    name = card.querySelector('.content__subtitle').textContent.trim();
    const priceElement = card.querySelector('.content__price--price');
    if (priceElement) {
      const priceText = priceElement.textContent.trim();
      price = parseInt(priceText.replace(/[^\d]/g, ''));
    } else {
      console.error('Элемент цены не найден');
      return;
    }
    
    imgSrc = card.querySelector('.content__image').src;
    volume = "3 л";
    
    // Визуальный отклик
    const button = card.querySelector('.add-to-cart');
    if (button) {
      button.textContent = "Додано!";
      button.classList.add('content__button--active');
      
      setTimeout(() => {
        button.textContent = "Додати в кошик";
        button.classList.remove('content__button--active');
      }, 1000);
    }
  }
  
  // Проверяем корректность данных
  if (!name || isNaN(price) || !imgSrc) {
    console.error('Не удалось получить данные о товаре');
    return;
  }
  
  // Добавляем товар в корзину
  addItemToCart(id, name, price, imgSrc, volume);
  
  // Показываем анимацию
  const productImage = card.querySelector(".card__img") || card.querySelector(".content__image");
  const cartIcon = document.querySelector('.cart-header__icon');
  
  if (productImage && cartIcon) {
    animateAddToCart(productImage, cartIcon);
  }
}

// Функция для добавления товара в корзину из каталога
function addToCartCatalog(button) {
  const card = button.closest('.card__body');
  if (!card) {
    console.error('Card body not found');
    return;
  }
  
  // Получаем ID товара из атрибута data-id или data-pid
  const id = parseInt(card.dataset.pid || card.dataset.id);
  const name = card.querySelector(".card__subtitle").textContent.trim();
  
  // Извлечение цены
  const priceElement = card.querySelector(".card__price--item") || card.querySelector(".card__price");
  const priceText = priceElement.textContent.trim();
  const price = parseInt(priceText.replace(/[^\d]/g, ''));
  
  // Проверка на корректность цены
  if (isNaN(price)) {
    console.error('Invalid price value');
    return;
  }

  const imgSrc = card.querySelector(".card__img").src;
  
  // Добавляем товар в корзину
  addItemToCart(id, name, price, imgSrc);
  
  // Визуальный отклик
  button.classList.add('card__active--button');
  
  setTimeout(() => {
    button.classList.remove('card__active--button');
  }, 1000);

  // Показываем анимацию
  animateAddToCart(card.querySelector(".card__img"), document.querySelector('.cart-header__icon'));
}

// Animate adding to cart
function animateAddToCart(productImg, cartIcon) {
  // Create flying image
  const flyingImg = productImg.cloneNode();
  flyingImg.classList.add('flying-image');
  
  // Set styles for the flying image
  const styles = {
    'position': 'fixed',
    'z-index': '9999',
    'width': productImg.getBoundingClientRect().width + 'px',
    'height': productImg.getBoundingClientRect().height + 'px',
    'left': productImg.getBoundingClientRect().left + 'px',
    'top': productImg.getBoundingClientRect().top + 'px',
    'transition': 'all 1s ease-in-out'
  };
  
  Object.assign(flyingImg.style, styles);
  document.body.appendChild(flyingImg);
  
  // Start animation after a small delay
  setTimeout(() => {
    // Calculate destination (cart icon)
    const cartRect = cartIcon.getBoundingClientRect();
    
    // Animate to cart
    flyingImg.style.width = '30px';
    flyingImg.style.height = '30px';
    flyingImg.style.left = (cartRect.left + cartRect.width/2 - 15) + 'px';
    flyingImg.style.top = (cartRect.top + cartRect.height/2 - 15) + 'px';
    flyingImg.style.opacity = '0.5';
    
    // Remove the element after animation completes
    setTimeout(() => {
      flyingImg.remove();
    }, 1000);
  }, 10);
}

// Изменение количества товара в корзине
function changeItemQuantity(index, change) {
  // Получаем текущее количество
  const currentQuantity = window.cart[index].quantity || 1;
  
  // Если уменьшаем и текущее количество = 1, удаляем товар
  if (change === -1 && currentQuantity === 1) {
    window.cart.splice(index, 1);
  } else {
    // Иначе изменяем количество
    window.cart[index].quantity = currentQuantity + change;
  }
  
  // Сохраняем в localStorage
  localStorage.setItem("cart", JSON.stringify(window.cart));
  
  // Обновляем отображение
  updateCartDisplay();
  
  // Если мы на странице корзины, обновляем и её
  const cartContainer = document.getElementById("cart-items-container");
  if (cartContainer) {
    displayCartItems(window.cart);
  }
}

// Update cart display with images and quantity
function updateCartDisplay() {
  const cartCount = document.getElementById("cart-count");
  const cartList = document.querySelector(".cart-list");
  
  if (!cartList || !cartCount) return;
  
  cartList.innerHTML = "";
  
  if (window.cart.length === 0) {
    cartList.innerHTML = '<div class="cart-empty">Кошик порожній</div>';
    cartCount.textContent = "";
    return;
  }

  // Подсчитываем общее количество товаров
  const totalItems = window.cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  
  window.cart.forEach((item, index) => {
    const li = document.createElement("li");
    li.classList.add("cart-item");
    
    // Add image to the cart item with quantity and controls
    li.innerHTML = `
      <div class="cart-item__content">
        <img src="${item.imgSrc}" alt="${item.name}" class="cart-item__image">
        <div class="cart-item__details">
          <span class="cart-item__name">${item.name}</span>
          <span class="cart-item__volume">${item.volume}</span>
          <span class="cart-item__price">${item.price} грн</span>
          <div class="cart-item__quantity">
            <span>Кількість:</span>
            <div class="quantity-controls">
              <button class="quantity-decrease" data-index="${index}">-</button>
              <span class="quantity-value">${item.quantity || 1}</span>
              <button class="quantity-increase" data-index="${index}">+</button>
            </div>
          </div>
        </div>
      </div>
      <button class="cart-item__remove" data-index="${index}">×</button>
    `;
    
    cartList.appendChild(li);
  });

  // Add total
  const total = window.cart.reduce((sum, item) => sum + parseFloat(item.price) * (item.quantity || 1), 0);
  const totalElement = document.createElement("div");
  totalElement.classList.add("cart-total");
  totalElement.textContent = `Загальна сума: ${total} грн`;
  cartList.appendChild(totalElement);
  
  // Кнопка очистки корзины
  const clearCartButton = document.createElement("button");
  clearCartButton.classList.add("cart-clear-button");
  clearCartButton.textContent = "Очистити кошик";
  cartList.appendChild(clearCartButton);
  
  // Добавляем обработчик для кнопки очистки корзины
  clearCartButton.addEventListener("click", clearCartWithConfirmation);
  

  // Update count with total items
  cartCount.textContent = totalItems;
  
  // Add event listeners to remove buttons
  document.querySelectorAll(".cart-item__remove").forEach(btn => {
    btn.addEventListener("click", function() {
      const index = parseInt(this.getAttribute("data-index"));
      const item = this.closest('.cart-item');
      
      // Добавляем анимацию
      item.style.transition = 'all 0.3s ease';
      item.style.opacity = '0';
      item.style.transform = 'translateX(20px)';
      
      // Удаление товар после анимации
      setTimeout(() => {
        window.cart.splice(index, 1);
        localStorage.setItem("cart", JSON.stringify(window.cart));
        updateCartDisplay();
      }, 300);
    });
  });
  
  //обработчики для кнопок изменения количества
  document.querySelectorAll(".quantity-decrease").forEach(btn => {
    btn.addEventListener("click", function(e) {
      e.stopPropagation(); // Предотвращаем всплытие события
      const index = parseInt(this.getAttribute("data-index"));
      changeItemQuantity(index, -1);
    });
  });
  
  document.querySelectorAll(".quantity-increase").forEach(btn => {
    btn.addEventListener("click", function(e) {
      e.stopPropagation(); // Предотвращаем всплытие события
      const index = parseInt(this.getAttribute("data-index"));
      changeItemQuantity(index, 1);
    });
  });
}

// Инициализация страницы корзины
function initCartPage() {
  // Проверяем, находимся ли мы на странице корзины
  const cartContainer = document.getElementById("cart-items-container");
  if (cartContainer) {
    // Get cart data from localStorage
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    
    // Display cart items
    displayCartItems(cart);
    
    // Initialize checkout form
    initCheckoutForm();
  }
}

// Страница Cart
function displayCartItems(cart) {
  const cartContainer = document.getElementById("cart-items-container");
  const totalElement = document.getElementById("cart-total-amount");
  
  if (!cartContainer) return;
  
  // Clear container
  cartContainer.innerHTML = "";
  
  if (cart.length === 0) {
    cartContainer.innerHTML = `
      <div class="cart-empty-message">
        <p>Ваш кошик порожній</p>
        <a href="index.html" class="button button--primary">Повернутися до покупок</a>
      </div>
    `;
    if (totalElement) totalElement.textContent = "0 грн";
    updateCartDisplay();
    return;
  }
  
  // Create cart items list
  const cartList = document.createElement("ul");
  cartList.className = "cart-page-list";
  
  cart.forEach((item, index) => {
    const li = document.createElement("li");
    li.className = "cart-page-item";
    
    li.innerHTML = `
      <div class="cart-page-item__image">
        <img src="${item.imgSrc}" alt="${item.name}">
      </div>
      <div class="cart-page-item__details">
        <h3 class="cart-page-item__name">${item.name}</h3>
        <p class="cart-page-item__volume">${item.volume}</p>
        <p class="cart-page-item__price">${item.price} грн</p>
        <div class="cart-page-item__quantity">
          <span>Кількість:</span>
          <div class="quantity-controls">
            <button class="quantity-decrease" data-index="${index}">-</button>
            <span class="quantity-value">${item.quantity || 1}</span>
            <button class="quantity-increase" data-index="${index}">+</button>
          </div>
        </div>
      </div>
      <div class="cart-page-item__actions">
        <button class="cart-item__remove" data-index="${index}">×</button>
      </div>
    `;
    
    cartList.appendChild(li);
  });
  
  cartContainer.appendChild(cartList);

  // Добавляем кнопку очистки корзины
  const clearCartButton = document.createElement("button");
  clearCartButton.className = "cart-clear-button";
  clearCartButton.textContent = "Очистити кошик";
  cartContainer.appendChild(clearCartButton);
  
  // Добавляем обработчик для кнопки очистки корзины
  clearCartButton.addEventListener("click", clearCartWithConfirmation);
  
  
  // Calculate and display total
  const total = cart.reduce((sum, item) => sum + parseFloat(item.price) * (item.quantity || 1), 0);
  if (totalElement) totalElement.textContent = `${total} грн`;
  
  // Add event listeners to remove buttons
  document.querySelectorAll(".cart-item__remove").forEach(btn => {
    btn.addEventListener("click", function() {
      const index = parseInt(this.getAttribute("data-index"));
      const item = this.closest('.cart-page-item');
      
      // Добавляем анимацию
      item.style.transition = 'all 0.3s ease';
      item.style.opacity = '0';
      item.style.transform = 'translateX(20px)';
      
      // Удаляем товар после анимации
      setTimeout(() => {
        window.cart.splice(index, 1);
        localStorage.setItem("cart", JSON.stringify(window.cart));
        displayCartItems(window.cart);
        updateCartDisplay();
      }, 300);
    });
  });
  
  // Добавляем обработчики для кнопок изменения количества
  document.querySelectorAll(".quantity-decrease").forEach(btn => {
    btn.addEventListener("click", function() {
      const index = parseInt(this.getAttribute("data-index"));
      changeItemQuantity(index, -1);
    });
  });
  
  document.querySelectorAll(".quantity-increase").forEach(btn => {
    btn.addEventListener("click", function() {
      const index = parseInt(this.getAttribute("data-index"));
      changeItemQuantity(index, 1);
    });
  });
}

// Форма оформления заказа

// Инициализация формы оформления заказа
function initCheckoutForm() {
  const checkoutForm = document.getElementById('checkout-form');
  if (!checkoutForm) return;

  checkoutForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Проверяем, есть ли товары в корзине
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    if (cart.length === 0) {
      alert("Ваш кошик порожній. Додайте товари перед оформленням замовлення.");
      return;
    }
    
    // Получаем данные формы
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;
    
    // Проверяем заполнение обязательных полей
    if (!name || !phone || !address) {
      alert("Будь ласка, заповніть всі поля форми.");
      return;
    }
    
    // Проверяем корректность номера телефона
    if (!phone.startsWith('+380') || phone.length !== 13) {
      alert("Будь ласка, введіть коректний номер телефону у форматі +380XXXXXXXXX");
      return;
    }
    
    // Формируем сообщение для отправки в Telegram
    const message = formatOrderMessage(name, phone, address, cart);
    
    // Отправляем данные в Telegram
    sendToTelegram(message)
      .then(response => {
        if (response.ok) {
          // Очищаем корзину после успешного оформления заказа
          clearCart();
          
          // Показываем сообщение об успешном оформлении
          showOrderSuccess();
        } else {
          throw new Error('Помилка при відправці замовлення');
        }
      })
      .catch(error => {
        console.error('Помилка:', error);
        alert('Виникла помилка при оформленні замовлення. Будь ласка, спробуйте пізніше або зв\'яжіться з нами за телефоном.');
      });
  });
}

// Форматирование сообщения для Telegram
function formatOrderMessage(name, phone, address, cart) {
  // Заголовок сообщения
  let message = `🛒 *НОВЕ ЗАМОВЛЕННЯ*\n\n`;
  
  // Информация о клиенте
  message += `👤 *Інформація про клієнта:*\n`;
  message += `Ім'я: ${name}\n`;
  message += `Телефон: ${phone}\n`;
  message += `Адреса: ${address}\n\n`;
  
  // Информация о заказе
  message += `📋 *Замовлені товари:*\n`;
  
  // Добавляем каждый товар
  cart.forEach((item, index) => {
    message += `${index + 1}. ${item.name} (${item.volume})\n`;
    message += `   Кількість: ${item.quantity || 1}\n`;
    message += `   Ціна: ${item.price} грн\n`;
    message += `   Сума: ${item.price * (item.quantity || 1)} грн\n\n`;
  });
  
  // Общая сумма
  const total = cart.reduce((sum, item) => sum + parseFloat(item.price) * (item.quantity || 1), 0);
  message += `💰 *Загальна сума: ${total} грн*\n\n`;
  
  // Дата и время заказа
  const now = new Date();
  const dateTime = now.toLocaleString('uk-UA');
  message += `📅 Дата замовлення: ${dateTime}`;
  
  return message;
}

// Отправка сообщения в Telegram

function sendToTelegram(message) {
  const botToken = '8013750183:AAG1aFM9XFECidgPGVnw7Ex4F7APMuh-2jk';
  
  const chatId = '802003436'; //chat_id
  
  // Правильный URL для API Telegram (токен в виде строки)
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  
  // Параметры запроса
  const params = {
    chat_id: chatId,
    text: message,
    parse_mode: 'Markdown'
  };
  
  // Отправляем POST-запрос
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(params)
  });
}


// Очистка корзины после оформления заказа
function clearCart() {
  window.cart = [];
  localStorage.setItem("cart", JSON.stringify(window.cart));
  updateCartDisplay();
}

// Показ сообщения об успешном оформлении заказа
function showOrderSuccess() {
  // Скрываем форму и содержимое корзины
  const cartContainer = document.querySelector('.cart-page');
  if (cartContainer) {
    cartContainer.innerHTML = `
      <div class="order order-success">
        <h2 class="order__title">Дякуємо за ваше замовлення!</h2>
        <p class="order__text">Ваше замовлення успішно оформлено. Наш менеджер зв'яжеться з вами найближчим часом для підтвердження замовлення.</p>
        <a href="index.html" class="button button--primary">Повернутися до покупок</a>
      </div>
    `;
  }
}

// Функция для отправки быстрого заказа в телеграмм

document.addEventListener('DOMContentLoaded', function() {
  initHeaderCallbackForm();
});

// Инициализация формы обратного звонка в хедере
function initHeaderCallbackForm() {
  const headerForm = document.querySelector('.header__form');
  if (!headerForm) return;

  // Инициализация поля ввода телефона в хедере
  const headerPhoneInput = headerForm.querySelector('input[type="tel"]');
  if (headerPhoneInput) {
    headerPhoneInput.addEventListener("focus", function() {
      if (!this.value.startsWith("+380")) {
        this.value = "+380";
      }
    });

    headerPhoneInput.addEventListener("input", function() {
      this.value = this.value.replace(/[^\d+]/g, ""); 
      
      if (!this.value.startsWith("+380")) {
        this.value = "+380";
      }
      
      if (this.value.length > 13) {
        this.value = this.value.slice(0, 13);
      }
    });

    headerPhoneInput.addEventListener("blur", function() {
      if (this.value === "+380") {
        this.value = "";
      }
    });
  }

  // Обработчик отправки формы
  headerForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const phone = headerPhoneInput ? headerPhoneInput.value : '';
    
    // Проверяем корректность номера телефона
    if (!phone || !phone.startsWith('+380') || phone.length !== 13) {
      alert("Будь ласка, введіть коректний номер телефону у форматі +380XXXXXXXXX");
      return;
    }
    
    // Формируем сообщение для отправки в Telegram
    const message = formatCallbackMessage(phone);
    
    // Отправляем данные в Telegram
    sendToTelegram(message)
      .then(response => {
        if (response.ok) {
          // Очищаем форму после успешной отправки
          headerPhoneInput.value = '';
          
          // Показываем сообщение об успешной отправке
          showCallbackSuccess(headerForm);
        } else {
          throw new Error('Помилка при відправці запиту на зворотній дзвінок');
        }
      })
      .catch(error => {
        console.error('Помилка:', error);
        alert('Виникла помилка при відправці запиту. Будь ласка, спробуйте пізніше або зв\'яжіться з нами за телефоном.');
      });
  });
}

// Форматирование сообщения для запроса обратного звонка
function formatCallbackMessage(phone) {
  // Заголовок сообщения
  let message = `📞 *ЗАПИТ НА ЗВОРОТНІЙ ДЗВІНОК*\n\n`;
  
  // Информация о клиенте
  message += `Телефон: ${phone}\n\n`;
  
  // Дата и время запроса
  const now = new Date();
  const dateTime = now.toLocaleString('uk-UA');
  message += `📅 Дата запиту: ${dateTime}`;
  
  return message;
}

// Показ сообщения об успешной отправке запроса на обратный звонок
function showCallbackSuccess(form) {
  // Создаем элемент для сообщения об успехе
  const successMessage = document.createElement('div');
  successMessage.className = 'form__callback-success';
  successMessage.textContent = 'Дякуємо! Ми зв\'яжемося з вами найближчим часом.';
  // Вставляем сообщение после формы
  form.appendChild(successMessage);
  
  // Удаляем сообщение через 5 секунд
  setTimeout(() => {
    successMessage.remove();
  }, 5000);
}

// Очистка корзины

// Функция для очистки корзины с подтверждением
function clearCartWithConfirmation() {
  // Запрашиваем подтверждение у пользователя
  if (confirm("Ви впевнені, що хочете очистити кошик?")) {
    // Очищаем корзину
    window.cart = [];
    localStorage.setItem("cart", JSON.stringify(window.cart));
    
    // Обновляем отображение корзины
    updateCartDisplay();
    
    // Если мы на странице корзины, обновляем и её
    const cartContainer = document.getElementById("cart-items-container");
    if (cartContainer) {
      displayCartItems(window.cart);
    }
    
    // Закрываем мини-корзину, если она открыта
    toggleCart(false);
  }
}
