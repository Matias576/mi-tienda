const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQQoCGmsscpn1zTCBiT2AFBr4YWW0VgLBOm5nKuYqoayTTs5gp-zAU7gLPVuP2XYMAMEu9J1v6ol2Yc/pub?output=csv'; 
const MI_WHATSAPP = '5491100000000'; // Reemplaza con tu número real (ej: 5491165432100)

let products = [];
let cart = [];

async function loadProducts() {
    try {
        const response = await fetch(SHEET_URL);
        const data = await response.text();
        
        // Separamos las filas y eliminamos las vacías
        const rows = data.split(/\r?\n/).filter(row => row.trim() !== "");
        
        // Procesamos los productos (empezamos en la fila 1 para saltar el encabezado)
        products = rows.slice(1).map(row => {
            // Dividimos por coma, pero teniendo en cuenta que puede haber comas dentro de comillas
            const columns = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            return {
                id: columns[0]?.trim(),
                title: columns[1]?.trim(),
                price: columns[2]?.trim(),
                category: columns[3]?.trim(),
                image: columns[4]?.trim(),
                stock: columns[5]?.trim().toLowerCase()
            };
        });

        renderProducts(products);
    } catch (error) {
        console.error("Error al cargar productos:", error);
    }
}

function renderProducts(list) {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = '';
    
    list.forEach(product => {
        // Solo mostramos si tiene título y stock es "si"
        if(product.title && product.stock === 'si') {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <img src="${product.image}" alt="${product.title}" onerror="this.src='https://via.placeholder.com/300x300?text=Cargando+Imagen...'">
                <div class="info">
                    <h3>${product.title}</h3>
                    <p class="price">$${product.price}</p>
                    <button class="btn-add" onclick="addToCart('${product.id}')">Agregar</button>
                </div>
            `;
            grid.appendChild(card);
        }
    });
}

function addToCart(id) {
    const product = products.find(p => p.id === id);
    if(product) {
        cart.push(product);
        updateCartUI();
        // Feedback visual simple
        const btn = event.target;
        btn.innerText = "✅ Agregado";
        setTimeout(() => btn.innerText = "Agregar", 1000);
    }
}

function updateCartUI() {
    document.getElementById('cart-count').innerText = cart.length;
    const cartItems = document.getElementById('cart-items');
    let total = 0;
    cartItems.innerHTML = '';
    
    cart.forEach((item, index) => {
        total += parseFloat(item.price);
        const li = document.createElement('li');
        li.style.display = "flex";
        li.style.justifyContent = "space-between";
        li.style.marginBottom = "10px";
        li.innerHTML = `
            <span>${item.title}</span>
            <span>$${item.price}</span>
        `;
        cartItems.appendChild(li);
    });
    
    document.getElementById('cart-total').innerText = total.toLocaleString();
}

function toggleCart() {
    const modal = document.getElementById('cart-modal');
    modal.classList.toggle('hidden');
}

function checkout() {
    if(cart.length === 0) return alert("El carrito está vacío");
    
    let message = "Hola! Te envío mi pedido desde la web:%0A%0A";
    cart.forEach(item => {
        message += `• ${item.title} - $${item.price}%0A`;
    });
    
    const total = document.getElementById('cart-total').innerText;
    message += `%0A*Total: $${total}*%0A%0ACoordinamos el pago?`;
    
    window.open(`https://wa.me/${MI_WHATSAPP}?text=${message}`, '_blank');
}

function filterProducts(category) {
    if (category === 'todo') {
        renderProducts(products);
    } else {
        const filtered = products.filter(p => p.category && p.category.toLowerCase() === category.toLowerCase());
        renderProducts(filtered);
    }
}

// Iniciar carga
loadProducts();