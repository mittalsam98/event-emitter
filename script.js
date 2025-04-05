// EventEmitter implementation
class EventEmitter {
  constructor() {
    this.events = new Map();
  }
  
  subscribe(eventName, callback) {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, new Map());
    }
    const id = Symbol();
    this.events.get(eventName).set(id, callback);
    return id; // For unsubscribing
  }

  emit(eventName, data) {
    if (!this.events.has(eventName)) {
      return; // No listeners for this event
    }
    
    this.events.get(eventName).forEach(callback => callback(data));
  }
  
  // Optional: Add method to unsubscribe
  unsubscribe(eventName, id) {
    if (this.events.has(eventName)) {
      return this.events.get(eventName).delete(id);
    }
    return false;
  }
}

// Create our shop event system
const shopEvents = new EventEmitter();

// Helper to log events to UI
function logEvent(message) {
  const logEl = document.getElementById('event-log');
  const logItem = document.createElement('div');
  logItem.textContent = `${new Date().toLocaleTimeString()}: ${message}`;
  logEl.appendChild(logItem);
  logEl.scrollTop = logEl.scrollHeight;
  console.log(message);
}

// ====== CART COMPONENT ======
function CartComponent() {
  let items = [];
  let totalPrice = 0;
  
  // Listen for add to cart events
  shopEvents.subscribe('ADD_TO_CART', (product) => {
    items.push(product);
    totalPrice += product.price;
    updateCartUI();
    logEvent(`Cart updated: ${items.length} items, $${totalPrice.toFixed(2)}`);
  });
  
  // Listen for discount events
  shopEvents.subscribe('APPLY_DISCOUNT', (discountInfo) => {
    const originalPrice = totalPrice;
    totalPrice = totalPrice * (1 - discountInfo.percent/100);
    updateCartUI();
    logEvent(`Discount applied: ${discountInfo.percent}%, saved $${(originalPrice - totalPrice).toFixed(2)}`);
  });
  
  function updateCartUI() {
    document.getElementById('cart-count').textContent = items.length;
    document.getElementById('cart-total').textContent = `$${totalPrice.toFixed(2)}`;
  }
}

// ====== RECOMMENDATIONS COMPONENT ======
function RecommendationEngine() {
  shopEvents.subscribe('ADD_TO_CART', (product) => {
    const recommendations = findSimilarProducts(product);
    updateRecommendationsUI(recommendations);
    logEvent(`Generated ${recommendations.length} recommendations based on ${product.name}`);
  });
  
  function findSimilarProducts(product) {
    // In a real app, this would be more sophisticated
    return [
      { name: "Wireless Earbuds", price: 89.99 },
      { name: "Headphone Stand", price: 24.99 },
      { name: "Premium Audio Cable", price: 19.99 }
    ];
  }
  
  function updateRecommendationsUI(recommendations) {
    const container = document.getElementById('recommendation-items');
    container.innerHTML = '';
    
    recommendations.forEach(product => {
      const el = document.createElement('div');
      el.className = 'recommendation-item';
      el.innerHTML = `
        <div>${product.name}</div>
        <div>$${product.price}</div>
      `;
      container.appendChild(el);
    });
  }
}

// ====== ANALYTICS COMPONENT ======
function AnalyticsTracker() {
  shopEvents.subscribe('ADD_TO_CART', (product) => {
    // In a real app, this would send data to an analytics service
    logEvent(`Analytics: Product ${product.id} added to cart`);
  });
  
  shopEvents.subscribe('APPLY_DISCOUNT', (discountInfo) => {
    logEvent(`Analytics: Discount code ${discountInfo.code} applied`);
  });
}

// Initialize components - notice they don't know about each other
CartComponent();
RecommendationEngine();
AnalyticsTracker();

// Set up UI handlers
document.getElementById('add-to-cart').addEventListener('click', () => {
  const product = {
    id: 'headphones-1',
    name: 'Premium Noise-Canceling Headphones',
    price: 199.99
  };
  
  // This single event affects multiple components
  shopEvents.emit('ADD_TO_CART', product);
});

document.getElementById('apply-discount').addEventListener('click', () => {
  const codeInput = document.getElementById('discount-code');
  const code = codeInput.value.trim();
  
  if (code) {
    // In a real app, you would validate this code with a server
    shopEvents.emit('APPLY_DISCOUNT', { 
      code: code, 
      percent: 15 
    });
    codeInput.value = '';
  }
});

// Log when the system is ready
logEvent("Event system initialized and ready!");
