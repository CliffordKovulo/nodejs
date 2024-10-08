// Global Variables
let events = [];
let favorites = new Set();
let cart = []; // Array to store cart items
let filteredEvents = [];

// Update the cart count in the DOM
function updateCartCount() {
  const cartCount = document.getElementById('cartCount');
  cartCount.textContent = cart.length;
}

// Save cart to localStorage
function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

// Load cart from localStorage
function loadCart() {
  const savedCart = localStorage.getItem('cart');
  if (savedCart) {
    cart = JSON.parse(savedCart);
  }
  updateCartCount();
}

// Add item to cart
function addToCart(eventId) {
  const event = events.find(e => e.id === eventId);
  if (event && !cart.find(item => item.id === eventId)) {
    cart.push(event);
    saveCart();
    updateCartCount();
    alert(`${event.title} has been added to your cart.`);
  } else {
    alert('This event is already in your cart.');
  }
}

// Remove item from cart (used in cart page)
function removeFromCart(eventId) {
  cart = cart.filter(item => item.id !== eventId);
  saveCart();
  updateCartCount();
}

// Populate Location Filter Options
function populateLocationFilter() {
  const locationSet = new Set(events.map(event => event.location));
  const locationFilter = document.getElementById('locationFilter');

  locationSet.forEach(location => {
    const option = document.createElement('option');
    option.value = location;
    option.textContent = location;
    locationFilter.appendChild(option);
  });
}

// Create Event Card
function createEventCard(event) {
  const card = document.createElement('div');
  card.classList.add('event-card');

  // Image
  const img = document.createElement('img');
  img.dataset.src = event.imageUrl; // For lazy loading
  img.alt = event.title;
  img.classList.add('lazy-load');
  card.appendChild(img);

  // Content
  const content = document.createElement('div');
  content.classList.add('content');

  const title = document.createElement('h3');
  title.textContent = event.title;
  content.appendChild(title);

  const date = document.createElement('p');
  date.textContent = `Date: ${event.date}`;
  content.appendChild(date);

  const location = document.createElement('p');
  location.textContent = `Location: ${event.location}`;
  content.appendChild(location);

  const price = document.createElement('p');
  price.textContent = `Price: $${event.price}`;
  content.appendChild(price);

  // Actions
  const actions = document.createElement('div');
  actions.classList.add('actions');

  // Favorite Button
  const favoriteBtn = document.createElement('button');
  favoriteBtn.classList.add('favorite-btn');
  favoriteBtn.innerHTML = favorites.has(event.id)
    ? '<i class="fa-solid fa-heart"></i>'
    : '<i class="fa-regular fa-heart"></i>';
  favoriteBtn.dataset.eventId = event.id;

  favoriteBtn.addEventListener('click', () => {
    toggleFavorite(event.id);
    favoriteBtn.innerHTML = favorites.has(event.id)
      ? '<i class="fa-solid fa-heart"></i>'
      : '<i class="fa-regular fa-heart"></i>';
  });

  actions.appendChild(favoriteBtn);

  // Add to Cart Button
  const addToCartBtn = document.createElement('button');
  addToCartBtn.classList.add('add-to-cart-btn');
  addToCartBtn.innerHTML = '<i class="fa-solid fa-cart-plus"></i> Add to Cart';
  addToCartBtn.dataset.eventId = event.id;

  addToCartBtn.addEventListener('click', () => {
    addToCart(event.id);
  });

  actions.appendChild(addToCartBtn);

  // View Button
  const viewBtn = document.createElement('button');
  viewBtn.textContent = 'View';
  viewBtn.addEventListener('click', () => viewProduct(event.id));
  actions.appendChild(viewBtn);

  // Edit Button
  const editBtn = document.createElement('button');
  editBtn.textContent = 'Edit';
  editBtn.addEventListener('click', () => editProduct(event.id));
  actions.appendChild(editBtn);

  // Delete Button
  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = 'Delete';
  deleteBtn.addEventListener('click', () => deleteProduct(event.id));
  actions.appendChild(deleteBtn);

  content.appendChild(actions);
  card.appendChild(content);

  return card;
}

// View Product
function viewProduct(eventId) {
  const event = events.find(e => e.id === eventId);
  if (event) {
    alert(`Title: ${event.title}\nPrice: $${event.price}\nDate: ${event.date}\nLocation: ${event.location}\nCompany: ${event.company}`);
  }
}

// Edit Product
function editProduct(eventId) {
  const event = events.find(e => e.id === eventId);
  if (event) {
    const updatedEvent = {
      ...event,
      title: prompt('Edit product title:', event.title),
      price: parseFloat(prompt('Edit product price:', event.price)),
      date: prompt('Edit product date:', event.date),
      location: prompt('Edit product location:', event.location),
      company: prompt('Edit company name:', event.company),
      imageUrl: prompt('Edit product image URL:', event.imageUrl)
    };

    fetch(`http://localhost:3000/events/${eventId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedEvent)
    })
    .then(response => response.json())
    .then(data => {
      alert('Product updated successfully!');
      location.reload();
    })
    .catch(error => console.error('Error updating product:', error));
  }
}

// Delete Product
function deleteProduct(eventId) {
  if (confirm('Are you sure you want to delete this product?')) {
    fetch(`http://localhost:3000/events/${eventId}`, {
      method: 'DELETE'
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to delete event');
      }
      return response.json();
    })
    .then(() => {
      alert('Product deleted successfully!');
      events = events.filter(event => event.id !== eventId); // Remove from events array
      displayEvents(events); // Re-render the events without the deleted item
    })
    .catch(error => console.error('Error deleting product:', error));
  }
}

// Display Events
function displayEvents(eventsToDisplay) {
  const container = document.getElementById('eventContainer');
  container.innerHTML = '';

  const fragment = document.createDocumentFragment();

  eventsToDisplay.forEach(event => {
    const card = createEventCard(event);
    fragment.appendChild(card);
  });

  container.appendChild(fragment);

  // Lazy Load Images
  lazyLoadImages();
}

// Filtering Function
function filterEvents() {
  const location = document.getElementById('locationFilter').value;
  const maxPrice = document.getElementById('maxPriceFilter').value;

  filteredEvents = events.filter(event => {
    let isMatch = true;

    if (location) {
      isMatch = isMatch && event.location === location;
    }

    if (maxPrice) {
      isMatch = isMatch && event.price <= maxPrice;
    }

    return isMatch;
  });

  sortEvents();
}

// Sorting Function
function sortEvents() {
  const sortValue = document.getElementById('sortFilter').value;
  const [criteria, order] = sortValue.split('-');

  if (criteria) {
    filteredEvents.sort((a, b) => {
      if (criteria === 'price') {
        return order === 'asc' ? a.price - b.price : b.price - a.price;
      } else if (criteria === 'date') {
        return order === 'asc'
          ? new Date(a.date) - new Date(b.date)
          : new Date(b.date) - new Date(a.date);
      }
    });
  }

  displayEvents(filteredEvents);
}

// Toggle Favorite Status
function toggleFavorite(eventId) {
  if (favorites.has(eventId)) {
    favorites.delete(eventId);
  } else {
    favorites.add(eventId);
  }

  updateFavoritesView();
  document.querySelectorAll(`.favorite-btn[data-event-id='${eventId}']`).forEach(btn => {
    btn.innerHTML = favorites.has(eventId)
      ? '<i class="fa-solid fa-heart"></i>'
      : '<i class="fa-regular fa-heart"></i>';
  });
}

// Update Favorites Sidebar
function updateFavoritesView() {
  const favoritesList = document.getElementById('favoritesList');
  favoritesList.innerHTML = '';

  favorites.forEach(eventId => {
    const event = events.find(e => e.id === eventId);
    const listItem = document.createElement('li');
    listItem.textContent = event.title;

    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remove';
    removeBtn.addEventListener('click', () => {
      toggleFavorite(eventId);
    });

    listItem.appendChild(removeBtn);
    favoritesList.appendChild(listItem);
  });
}

// Lazy Loading Images
function lazyLoadImages() {
  const lazyImages = document.querySelectorAll('.lazy-load');

  const imageObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          observer.unobserve(img);
        }
      });
    },
    {
      rootMargin: '0px 0px 256px 0px', // Preload images slightly before they come into view
    }
  );

  lazyImages.forEach(img => {
    imageObserver.observe(img);
  });
}

// Initialize Application
function init() {
  populateLocationFilter();
  displayEvents(filteredEvents);
  updateFavoritesView();
  loadCart();

  // Event Listeners for Filters
  document.getElementById('locationFilter').addEventListener('change', filterEvents);
  document.getElementById('maxPriceFilter').addEventListener('input', filterEvents);
  document.getElementById('sortFilter').addEventListener('change', sortEvents);
}

// Fetch Event Data from json-server
async function getEventData() {
  let cachedEvents = localStorage.getItem('events');
  if (cachedEvents) {
    return JSON.parse(cachedEvents);
  } else {
    try {
      const response = await fetch('http://localhost:3000/events');
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      localStorage.setItem('events', JSON.stringify(data));
      return data;
    } catch (error) {
      console.error('Error fetching event data:', error);
      return [];
    }
  }
}

// Load Event Data and Initialize
getEventData().then(data => {
  events = data;
  filteredEvents = [...events];
  init();
});
