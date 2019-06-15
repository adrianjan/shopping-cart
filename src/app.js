import "@babel/polyfill";

// variables from DOM
let wrapper = document.querySelector('.wrapper');
let productsDOM = document.querySelector('.content');
let priceDOM = document.querySelector('.inner h3');
let cartDOM = document.querySelector('.inner .products');

//variables
let cart = [];
let sum = 0;
let price = 0;

// products
const getProducts = async () => {
  try {
    let result = await fetch("http://products.json");
    let data = await result.json();

    let products = data.items;
    console.log(products);

    return products;
  } catch (error) {
    console.log(error);
  }
};


const displayProducts = (products) => {
  let html = '';
  products.forEach(product => {
    html += `
    <div class="item" data-id="${product.id}">
      <div class="item-img">
        <img src="${product.image}" alt="${product.title}">
        <div class="det">
          <i class="fab fa-youtube"></i>
          <i class="fas fa-gift"></i>
          <p class="price">${product.price}</p>
        </div>
        <div class="cart" data-id="${product.id}">
          <i class="fas fa-cart-plus"></i><span>Add to cart</span>
        </div>
      </div>
      <div class="des">
        <h3>${product.title}</h3>
        <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sed modi ex, dolore tempora!</p>
      </div>
    </div>
    `;
  });
  productsDOM.innerHTML += html;
};

class Storage {
  static saveProducts(products) {
    localStorage.setItem('products', JSON.stringify(products));
  }
  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem('products'));
    return products.find(product => product.id === id);
  }
  static setCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
  }
  static getCart() {
    let cart = JSON.parse(localStorage.getItem('cart'));
    return cart;
  }
}

const findByID = (cart, id) => {
  let item = cart.find(item => item.id === id);
  let cartItem = cart[cart.indexOf(item)];
  return cartItem;
}

const addCartItem = (cart) => {
  sum = 0;
  cart.forEach(item => {
    price = (item.price * item.amount);
    sum += (item.price * item.amount);
    cartDOM.querySelector(`div[data-id="${item.id}"] .price`).textContent = `€${price}`;
  });
  priceDOM.textContent = `€${sum}`;
};

const updateAmount = (amount, id) => {
  let item = cartDOM.querySelector(`[data-id="${id}"]`);
  item.querySelector('.amount span').textContent = amount;
}

const minusAmount = (cart, id) => {
  let cartItem = findByID(cart, id);
  cartItem.amount -= 1;
  if (cartItem.amount < 1) {
    cartItem.amount = 1;
  }
  addCartItem(cart);
  updateAmount(cartItem.amount, id);
  Storage.setCart(cart);
};

const plusAmount = (cart, id) => {
  let cartItem = findByID(cart, id);
  cartItem.amount += 1;
  addCartItem(cart);
  updateAmount(cartItem.amount, id);
  Storage.setCart(cart);
};

const delCartItem = (id, cart) => {
  let item = cart.find(item => item.id === id);
  let cartItem = cart[cart.indexOf(item)];
  sum -= (cartItem.price * cartItem.amount);
  priceDOM.textContent = `€${sum}`;
};

//add to cart
const addtoCart = (cartItem) => {
  let inCart = cart.find(item => item.id === cartItem.id);
  if (inCart) {
    console.log('Already in cart');
    let item = cart.indexOf(inCart);
    cart[item].amount++;
  } else {
    cart = [...cart, cartItem];
  }
  console.log('Cart..=> ', cart);
  Storage.setCart(cart);
  return cart;
};

// remove from cart
const remFromCart = (cart, id) => {
  let itemId = cart.find(item => item.id === id);
  let index = cart.indexOf(itemId);
  let product = cartDOM.querySelector(`[data-id="${id}"]`);
  cartDOM.removeChild(product);
  delCartItem(id, cart);
  cart.splice(index, 1);
  console.log("Removed from cart ", cart);
  Storage.setCart(cart);
};

const showCart = (cart) => {
  let html = '';
  cart.forEach(item => {
    html += `
    <div class="product" data-id="${item.id}">
      <img src="${item.image}" alt="${item.title}">
      <div class="text">
        <p>${item.title}</p>
        <p class="price">€${item.price}</p>
        <p class="amount">
          <i class="fas fa-minus" data-id="${item.id}"></i></i><span>${item.amount}</span><i class="fas fa-plus" data-id="${item.id}"></i></i>
        </p>
        <i class="fas fa-trash-alt" data-id="${item.id}"></i>
      </div>
    </div>
    `;
  });
  cartDOM.innerHTML = html;
};

const getIcons = (cart) => {
  let trashes = [...document.querySelectorAll('.fa-trash-alt')];
  let minuses = [...document.querySelectorAll('.fa-minus')];
  let pluses = [...document.querySelectorAll('.fa-plus')];

  trashes.forEach(trash => {
    trash.addEventListener('click', () => {
      //remove item from cart
      let id = trash.dataset.id;
      remFromCart(cart, id);
    });
  });

  minuses.forEach(minus => {
    minus.addEventListener('click', () => {
      let id = minus.dataset.id;
      minusAmount(cart, id);
    });
  });

  pluses.forEach(plus => {
    plus.addEventListener('click', () => {
      let id = plus.dataset.id;
      plusAmount(cart, id);
    });
  });
};

const getButtons = () => {

  let btns = [...document.querySelectorAll('.cart')];

  btns.forEach(btn => {
    let id = btn.dataset.id;
    btn.addEventListener('click', () => {
      // add to cart
      let cartItem = {
        ...Storage.getProduct(id),
        amount: 1
      };
      let cart = addtoCart(cartItem);
      showCart(cart);
      // sum item price and show it on page
      addCartItem(cart);
      //add listener icons inside cart
      getIcons(cart);
    })
  });
};

getProducts().then(products => {
  displayProducts(products);
  Storage.saveProducts(products);
}).then(() => {
  getButtons();
});
