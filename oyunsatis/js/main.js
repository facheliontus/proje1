// Sepetteki oyunları saklamak için
let cart = [];
try {
    const cartData = localStorage.getItem('cart');
    if (cartData) {
        cart = JSON.parse(cartData);
    }
} catch (error) {
    console.error('Sepet verisi okunamadı:', error);
    cart = [];
}

let currentUser = null;
try {
    const currentUserData = localStorage.getItem('currentUser');
    if (currentUserData) {
        currentUser = JSON.parse(currentUserData);
    }
} catch (error) {
    console.error('Kullanıcı verisi okunamadı:', error);
    currentUser = null;
}

// Sayfa tam yüklendiğinde çalışan fonksiyonlar
document.addEventListener('DOMContentLoaded', function() {
    try {
        // Hangi sayfada olduğumuza göre uygun fonksiyonu çalıştır
        const currentPage = window.location.pathname.split('/').pop();
        
        if (currentPage === 'oyun.html' || currentPage === 'index.html') {
            setupGamePage();
        } else if (currentPage === 'sepet.html') {
            setupCartPage();
        } else if (currentPage === 'giris.html') {
            setupLoginPage();
        } else if (currentPage === 'kayit.html') {
            setupRegisterPage();
        } else if (currentPage === 'siparisler.html') {
            setupOrdersPage();
        }
        
        updateCartCount();
        updateLoginDisplay(); // Giriş durumunu güncelle
    } catch (error) {
        console.error('JavaScript hatası:', error);
    }
});



// Oyun türlerine göre filtreleme yapan fonksiyon
function filterGamesByType(type) {
    // oyun.html sayfasına yönlendir ve URL parametresi olarak türü ekle
    window.location.href = `oyun.html#type=${type}`;
}

// Sayfa açıldığında URL'deki filtreleme parametrelerini kontrol et
function checkUrlParameters() {
    const urlParams = new URLSearchParams(window.location.hash.substring(1));
    const type = urlParams.get('type');
    
    if (type) {
        filterGamesByTypeFunction(type);
    }
}

// Gerçek oyun filtreleme işlemi
function filterGamesByTypeFunction(type) {
    const gameItems = document.querySelectorAll('.oyun-oge');
    
    gameItems.forEach(item => {
        if (type === 'all' || item.dataset.type === type) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
    
    // Filtreleme butonlarını güncelle
    updateFilterButtons(type);
}

// Filtreleme butonlarını güncelle
function updateFilterButtons(activeType) {
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(button => {
        if (button.dataset.type === activeType) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
}

// Filtreleme butonlarına tıklama işlevi ekle
function setupFilterButtons() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const type = this.dataset.type;
            filterGamesByTypeFunction(type);
        });
    });
}

// Oyun sayfası için ayarlar
function setupGamePage() {
    // Slider butonlarına tıklama olaylarını ekle
    const newGamesSlide = document.querySelector('.carousel-item.active img');
    if (newGamesSlide) {
        newGamesSlide.addEventListener('click', function() {
            console.log('Yeni oyunlar görseline tıklandı');
            filterGamesByType('new');
        });
    }
    
    const discountGamesSlide = document.querySelector('.carousel-item:nth-child(2) img');
    if (discountGamesSlide) {
        discountGamesSlide.addEventListener('click', function() {
            console.log('İndirimli oyunlar görseline tıklandı');
            filterGamesByType('discount');
        });
    }
    
    const popularGamesSlide = document.querySelector('.carousel-item:nth-child(3) img');
    if (popularGamesSlide) {
        popularGamesSlide.addEventListener('click', function() {
            console.log('Popüler oyunlar görseline tıklandı');
            filterGamesByType('popular');
        });
    }
    
    setupAddToCartButtons();
    setupFilterEvents();
    
    // Eğer oyun.html sayfasındaysak filtreleme butonlarını da kur
    if (window.location.pathname.includes('oyun.html')) {
        setupFilterButtons();
        checkUrlParameters();
    }
}

// Sepete ekle butonlarına tıklama işlevi ekle
function setupAddToCartButtons() {
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const gameId = this.getAttribute('data-game-id');
            const gameName = this.getAttribute('data-game-isim');
            const gamePrice = parseFloat(this.getAttribute('data-game-fiyat'));
            const gameImage = this.closest('.card').querySelector('img').src;
            
            addToCart(gameId, gameName, gamePrice, gameImage);
        });
    });
}

// Oyun filtreleme işlevleri
function setupFilterEvents() {
    document.getElementById('genreFilter')?.addEventListener('change', filterGames);
    document.getElementById('priceFilter')?.addEventListener('change', filterGames);
    document.getElementById('searchInput')?.addEventListener('input', filterGames);
}

// Sepet sayfası özel ayarları
function setupCartPage() {
    displayCartItems();
    updateCartSummary();
    
    // Checkout butonu için event listener
    document.getElementById('checkout-btn')?.addEventListener('click', function() {
        if (currentUser) {
            placeOrder();
        } else {
            alert('Sipariş vermek için önce giriş yapmalısınız.');
            window.location.href = 'giris.html';
        }
    });
}

// Giriş sayfası özel ayarları
function setupLoginPage() {
    document.getElementById('loginForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        console.log('Giriş formu gönderildi');
        
        console.log('Giriş bilgileri:', {email, password});
        
        try {
            let users = [];
            try {
                const usersData = localStorage.getItem('users');
                if (usersData) {
                    users = JSON.parse(usersData);
                }
            } catch (error) {
                console.error('Kullanıcı verileri okunamadı:', error);
                users = [];
            }
            console.log('Mevcut kullanıcılar:', users);
            const user = users.find(u => u.email === email && u.password === password);
            
            if (user) {
                currentUser = user;
                localStorage.setItem('currentUser', JSON.stringify(user));
                console.log('Giriş başarılı, kullanıcı:', user);
                alert('Giriş başarılı!');
                window.location.href = 'index.html';
            } else {
                console.error('Kullanıcı bulunamadı:', email);
                alert('E-posta veya şifre hatalı!');
            }
        } catch (error) {
            console.error('Giriş yapma hatası:', error);
            alert('Giriş yapılırken bir hata oluştu.');
        }
    });
}

// Kayıt sayfası özel ayarları
function setupRegisterPage() {
    document.getElementById('registerForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        
        console.log('Form gönderildi');
        
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        console.log('Girilen bilgiler:', {firstName, lastName, email});
        
        if (password !== confirmPassword) {
            alert('Şifreler eşleşmiyor!');
            console.error('Şifreler eşleşmiyor:', password, confirmPassword);
            return;
        }
        
        try {
            // Kullanıcıları localStorage'da sakla
            let users = [];
            try {
                const usersData = localStorage.getItem('users');
                if (usersData) {
                    users = JSON.parse(usersData);
                }
            } catch (error) {
                console.error('Kullanıcı verileri okunamadı:', error);
                users = [];
            }
            console.log('Mevcut kullanıcılar:', users);
            
            // E-posta kontrolü
            if (users.some(u => u.email === email)) {
                alert('Bu e-posta adresi zaten kullanımda!');
                console.error('E-posta zaten kullanımda:', email);
                return;
            }
            
            const newUser = {
                id: Date.now(),
                firstName,
                lastName,
                email,
                password
            };
            
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            
            console.log('Yeni kullanıcı oluşturuldu:', newUser);
            alert('Kayıt başarılı! Artık giriş yapabilirsiniz.');
            window.location.href = 'giris.html';
        } catch (error) {
            console.error('Kayıt hatası:', error);
            alert('Kayıt yapılırken bir hata oluştu.');
        }
    });
}

// Sipariş sayfası için ayarlar
function setupOrdersPage() {
    displayOrders();
}

// Oyunu sepete ekleme fonksiyonume
function addToCart(gameId, gameName, gamePrice, gameImage) {
    // Sepette aynı oyun var mı kontrol et
    const existingItem = cart.find(item => item.id === gameId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: gameId,
            name: gameName,
            price: gamePrice,
            image: gameImage,
            quantity: 1
        });
    }
    
    // Sepeti localStorage'a kaydet
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Sepet sayısını güncelle
    updateCartCount();
    
    // Kullanıcıya bildirim göster
    alert(`${gameName} sepete eklendi!`);
}

// Sepet sayısını güncelleme
function updateCartCount() {
    const cartCount = document.querySelector('.navbar-nav')?.closest('.container')?.querySelector('#cart-count');
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    
    if (cartCount) {
        cartCount.textContent = totalItems;
    }
}

// Sepetteki ürünleri gösterme
function displayCartItems() {
    const cartItemsList = document.getElementById('cart-items-list');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    
    if (cart.length === 0) {
        emptyCartMessage.style.display = 'block';
        cartItemsList.innerHTML = '';
        return;
    }
    
    emptyCartMessage.style.display = 'none';
    let cartHTML = '';
    
    cart.forEach(item => {
        cartHTML += `
            <div class="cart-item d-flex align-items-center">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image me-3">
                <div class="flex-grow-1">
                    <h5>${item.name}</h5>
                    <p class="mb-0">Fiyat: ₺${item.price.toFixed(2)}</p>
                </div>
                <div class="d-flex align-items-center">
                    <div class="btn-group me-3" role="group">
                        <button class="btn btn-outline-secondary btn-sm decrease-qty" data-id="${item.id}">-</button>
                        <span class="px-3 py-1">${item.quantity}</span>
                        <button class="btn btn-outline-secondary btn-sm increase-qty" data-id="${item.id}">+</button>
                    </div>
                    <strong class="me-3">₺${(item.price * item.quantity).toFixed(2)}</strong>
                    <button class="btn btn-danger btn-sm remove-item" data-id="${item.id}">Sil</button>
                </div>
            </div>
        `;
    });
    
    cartItemsList.innerHTML = cartHTML;
    
    // Artırma butonları için event listener
    document.querySelectorAll('.increase-qty').forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            increaseQuantity(id);
        });
    });
    
    // Azaltma butonları için event listener
    document.querySelectorAll('.decrease-qty').forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            decreaseQuantity(id);
        });
    });
    
    // Sil butonları için event listener
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            removeFromCart(id);
        });
    });
}

// Ürün miktarını artırma
function increaseQuantity(id) {
    const item = cart.find(item => item.id === id);
    if (item) {
        item.quantity += 1;
        localStorage.setItem('cart', JSON.stringify(cart));
        displayCartItems();
        updateCartSummary();
    }
}

// Ürün miktarını azaltma
function decreaseQuantity(id) {
    const item = cart.find(item => item.id === id);
    if (item) {
        if (item.quantity > 1) {
            item.quantity -= 1;
        } else {
            if (confirm('Bu ürünü sepetten kaldırmak istiyor musunuz?')) {
                cart = cart.filter(item => item.id !== id);
            }
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        displayCartItems();
        updateCartSummary();
    }
}

// Sepetten ürün kaldırma
function removeFromCart(id) {
    if (confirm('Bu ürünü sepetten kaldırmak istediğinize emin misiniz?')) {
        cart = cart.filter(item => item.id !== id);
        localStorage.setItem('cart', JSON.stringify(cart));
        displayCartItems();
        updateCartSummary();
    }
}

// Sepet özeti güncelleme
function updateCartSummary() {
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const tax = subtotal * 0.18; // %18 KDV
    const total = subtotal + tax;
    
    document.getElementById('subtotal').textContent = subtotal.toFixed(2) + ' ₺';
    document.getElementById('tax').textContent = tax.toFixed(2) + ' ₺';
    document.getElementById('total').textContent = total.toFixed(2) + ' ₺';
    
    // Checkout butonunu etkinleştir/devre dışı bırak
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.disabled = cart.length === 0;
    }
}

// Oyunları filtreleme
function filterGames() {
    const genreFilter = document.getElementById('genreFilter').value;
    const priceFilter = document.getElementById('priceFilter').value;
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    
    const gameItems = document.querySelectorAll('.oyun-oge');
    
    gameItems.forEach(item => {
        const genre = item.getAttribute('data-genre');
        const price = parseFloat(item.getAttribute('data-price'));
        const name = item.querySelector('.card-title').textContent.toLowerCase();
        const description = item.querySelector('.card-text').textContent.toLowerCase();
        
        let showItem = true;
        
        // Tür filtresi
        if (genreFilter !== 'all' && genre !== genreFilter) {
            showItem = false;
        }
        
        // Fiyat filtresi
        if (showItem && priceFilter !== 'all') {
            if (priceFilter === '0-50' && (price < 0 || price > 50)) {
                showItem = false;
            } else if (priceFilter === '50-100' && (price < 50 || price > 100)) {
                showItem = false;
            } else if (priceFilter === '100-150' && (price < 100 || price > 150)) {
                showItem = false;
            } else if (priceFilter === '150+' && price < 150) {
                showItem = false;
            }
        }
        
        // Arama filtresi
        if (showItem && searchInput && !name.includes(searchInput) && !description.includes(searchInput)) {
            showItem = false;
        }
        
        item.style.display = showItem ? 'block' : 'none';
    });
}

// Sipariş verme
function placeOrder() {
    if (cart.length === 0) {
        alert('Sepetiniz boş. Sipariş vermek için önce sepete oyun eklemelisiniz.');
        return;
    }
    
    // Sipariş veri yapısı
    const order = {
        id: Date.now(),
        userId: currentUser.id,
        date: new Date().toISOString().split('T')[0],
        items: [...cart],
        total: cart.reduce((total, item) => total + (item.price * item.quantity), 0),
        status: 'Hazırlanıyor'
    };
    
    // Siparişleri localStorage'da sakla
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // Sepeti temizle
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Kullanıcıya bildirim göster
    alert('Siparişiniz alınmıştır. Teşekkür ederiz!');
    
    // Sayfayı yenile
    window.location.reload();
}

// Siparişleri gösterme
function displayOrders() {
    const ordersList = document.getElementById('orders-list');
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    
    // Sadece mevcut kullanıcıya ait siparişleri göster
    const userOrders = currentUser ? orders.filter(order => order.userId === currentUser.id) : [];
    
    if (userOrders.length === 0) {
        ordersList.innerHTML = '<tr><td colspan="5" class="text-center">Henüz siparişiniz bulunmamaktadır.</td></tr>';
        return;
    }
    
    let ordersHTML = '';
    
    userOrders.forEach(order => {
        ordersHTML += `
            <tr>
                <td>#${order.id}</td>
                <td>${order.date}</td>
                <td>${order.status}</td>
                <td>₺${order.total.toFixed(2)}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary view-order" data-id="${order.id}">Detaylar</button>
                </td>
            </tr>
        `;
    });
    
    ordersList.innerHTML = ordersHTML;
    
    // Sipariş detayları butonları için event listener
    document.querySelectorAll('.view-order').forEach(button => {
        button.addEventListener('click', function() {
            const orderId = this.getAttribute('data-id');
            viewOrderDetails(orderId);
        });
    });
}

// Sipariş detaylarını gösterme
function viewOrderDetails(orderId) {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const order = orders.find(order => order.id === parseInt(orderId));
    
    if (order) {
        let itemsHTML = '';
        order.items.forEach(item => {
            itemsHTML += `
                <li>${item.name} - Adet: ${item.quantity} - Fiyat: ₺${(item.price * item.quantity).toFixed(2)}</li>
            `;
        });
        
        alert(`Sipariş Detayı:

Tarih: ${order.date}
Durum: ${order.status}

Oyunlar:
${itemsHTML}

Toplam: ₺${order.total.toFixed(2)}`);
    }
}

// Kullanıcı giriş durumunu güncelle
function updateLoginDisplay() {
    const loginBtn = document.querySelector('a[href="giris.html"]');
    const registerBtn = document.querySelector('a[href="kayit.html"]');
    const loginContainer = loginBtn?.closest('.col-md-3');
    
    if (currentUser) {
        // Kullanıcı giriş yapmışsa, adını göster
        if (loginBtn && registerBtn) {
            loginBtn.textContent = `Sayın ${currentUser.firstName}`;
            loginBtn.className = 'btn btn-outline-light me-2';
            loginBtn.onclick = function() { logout(); return false; };
            registerBtn.textContent = 'Çıkış Yap';
            registerBtn.className = 'btn btn-warning';
            registerBtn.onclick = function() { logout(); return false; };
        }
    } else {
        // Kullanıcı giriş yapmamışsa, normal butonları göster
        if (loginBtn && registerBtn) {
            loginBtn.textContent = 'Giriş Yap';
            loginBtn.className = 'btn btn-outline-light me-2';
            loginBtn.onclick = null;
            loginBtn.href = 'giris.html';
            registerBtn.textContent = 'Kayıt Ol';
            registerBtn.className = 'btn btn-warning';
            registerBtn.onclick = null;
            registerBtn.href = 'kayit.html';
        }
    }
}

// Çıkış yap
function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateLoginDisplay();
    window.location.href = 'index.html';
}
