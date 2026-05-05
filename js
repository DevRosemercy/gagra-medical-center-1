// Gagra Medical Centre - Main JavaScript

// Initialize AOS (Animate on Scroll)
AOS.init({
  duration: 800,
  once: true,
  offset: 100,
  easing: 'ease-out-cubic'
});

// ============================================
// HERO SLIDESHOW
// ============================================
const slides = document.querySelectorAll('.hero-slide');
const dots = document.querySelectorAll('.hero-dot');
const prevBtn = document.querySelector('.hero-prev');
const nextBtn = document.querySelector('.hero-next');
let currentSlide = 0;
let slideInterval;

function showSlide(index) {
  slides.forEach((slide, i) => {
    slide.classList.remove('active');
    if (dots[i]) dots[i].classList.remove('active');
  });
  currentSlide = (index + slides.length) % slides.length;
  slides[currentSlide].classList.add('active');
  if (dots[currentSlide]) dots[currentSlide].classList.add('active');
}

function nextSlide() {
  showSlide(currentSlide + 1);
  resetInterval();
}

function prevSlide() {
  showSlide(currentSlide - 1);
  resetInterval();
}

function resetInterval() {
  clearInterval(slideInterval);
  slideInterval = setInterval(nextSlide, 6000);
}

if (prevBtn) prevBtn.addEventListener('click', prevSlide);
if (nextBtn) nextBtn.addEventListener('click', nextSlide);
dots.forEach((dot, i) => {
  dot.addEventListener('click', () => {
    showSlide(i);
    resetInterval();
  });
});

// Start slideshow
slideInterval = setInterval(nextSlide, 6000);

// ============================================
// DARK MODE TOGGLE
// ============================================
const darkToggle = document.getElementById('darkModeToggle');
const darkIcon = document.getElementById('darkModeIcon');

// Check for saved preference
if (localStorage.getItem('darkMode') === 'enabled') {
  document.body.classList.add('dark');
  if (darkIcon) darkIcon.classList.replace('fa-moon', 'fa-sun');
}

darkToggle?.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled');
  if (darkIcon) {
    darkIcon.classList.replace(isDark ? 'fa-moon' : 'fa-sun', isDark ? 'fa-sun' : 'fa-moon');
  }
});

// ============================================
// MOBILE MENU
// ============================================
const mobileToggle = document.getElementById('mobileMenuToggle');

function createMobileMenu() {
  const existingMenu = document.getElementById('mobileMenu');
  if (existingMenu) {
    existingMenu.remove();
    return;
  }
  
  const menu = document.createElement('div');
  menu.id = 'mobileMenu';
  menu.className = 'fixed inset-0 bg-black/95 z-50 p-6 flex flex-col';
  menu.innerHTML = `
    <div class="flex justify-end mb-8">
      <button onclick="this.closest('#mobileMenu').remove()" class="text-white text-3xl">&times;</button>
    </div>
    <div class="flex flex-col gap-4 text-white text-xl">
      <a href="#home" class="py-3 border-b border-white/20 hover:text-[#38bdf8] transition" onclick="document.getElementById('mobileMenu')?.remove()">🏠 Home</a>
      <a href="#about" class="py-3 border-b border-white/20 hover:text-[#38bdf8] transition" onclick="document.getElementById('mobileMenu')?.remove()">ℹ️ About</a>
      <a href="#team" class="py-3 border-b border-white/20 hover:text-[#38bdf8] transition" onclick="document.getElementById('mobileMenu')?.remove()">👨‍⚕️ Our Team</a>
      <a href="#services" class="py-3 border-b border-white/20 hover:text-[#38bdf8] transition" onclick="document.getElementById('mobileMenu')?.remove()">🏥 Services</a>
      <a href="#blog" class="py-3 border-b border-white/20 hover:text-[#38bdf8] transition" onclick="document.getElementById('mobileMenu')?.remove()">📝 Blog</a>
      <a href="#ambulance" class="py-3 border-b border-white/20 hover:text-[#38bdf8] transition" onclick="document.getElementById('mobileMenu')?.remove()">🚑 Emergency</a>
      <a href="#contact" class="py-3 border-b border-white/20 hover:text-[#38bdf8] transition" onclick="document.getElementById('mobileMenu')?.remove()">📍 Contact</a>
      <a href="#appointment" class="btn-primary text-center py-3 rounded-full mt-4" onclick="document.getElementById('mobileMenu')?.remove()">📅 Book Appointment</a>
    </div>
  `;
  document.body.appendChild(menu);
}

mobileToggle?.addEventListener('click', createMobileMenu);

// ============================================
// EMERGENCY LOCATION SHARE
// ============================================
window.shareLocationForEmergency = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const message = `🚨 EMERGENCY! Send ambulance to: https://maps.google.com/?q=${lat},${lng} - Patient needs immediate medical attention.`;
        window.open(`https://wa.me/254708865910?text=${encodeURIComponent(message)}`, '_blank');
        showToast("📍 Location shared! Opening WhatsApp...");
      },
      () => {
        showToast("❌ Could not get location. Please call 0708 865 910 directly.");
      }
    );
  } else {
    showToast("❌ Geolocation not supported. Please call 0708 865 910.");
  }
};

// ============================================
// TOAST NOTIFICATION
// ============================================
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.innerHTML = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ============================================
// OFFLINE DETECTION & BOOKING BACKUP
// ============================================
window.addEventListener('offline', () => {
  showToast("⚠️ You are offline. Booking will be saved locally and submitted when connection returns.");
});

window.addEventListener('online', () => {
  showToast("✅ Connection restored. Submitting pending bookings...");
  submitPendingBookings();
});

function saveBookingToLocalStorage(bookingData) {
  const bookings = JSON.parse(localStorage.getItem('gagra_bookings') || '[]');
  bookings.push({
    ...bookingData,
    timestamp: new Date().toISOString(),
    status: 'pending'
  });
  localStorage.setItem('gagra_bookings', JSON.stringify(bookings));
}

async function submitPendingBookings() {
  const bookings = JSON.parse(localStorage.getItem('gagra_bookings') || '[]');
  const pending = bookings.filter(b => b.status === 'pending');
  
  for (const booking of pending) {
    try {
      // Here you would send to your backend
      booking.status = 'submitted';
    } catch (e) {
      console.error('Failed to submit booking:', e);
    }
  }
  localStorage.setItem('gagra_bookings', JSON.stringify(bookings));
}

// ============================================
// WHATSAPP BOOKING FORM
// ============================================
const bookingForm = document.getElementById('bookingForm');

bookingForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const name = document.getElementById('bookingName').value.trim();
  const phone = document.getElementById('bookingPhone').value.trim();
  const service = document.getElementById('bookingService').value;
  const notes = document.getElementById('bookingNotes').value.trim();
  
  if (!name || !phone) {
    showToast("❌ Please enter your name and phone number");
    return;
  }
  
  // Save to localStorage as backup
  saveBookingToLocalStorage({ name, phone, service, notes });
  
  const message = `🏥 *Gagra Medical Appointment* 🏥%0A%0A*Name:* ${name}%0A*Phone:* ${phone}%0A*Service:* ${service}%0A*Notes:* ${notes || 'None'}%0A%0A📍 Location: Gagra Madiany Junction, Uyoma, Rarieda%0A⏰ Please confirm availability and send appointment time.`;
  
  window.open(`https://wa.me/254708865910?text=${message}`, '_blank');
  showToast("📱 Opening WhatsApp... Send the message to confirm your booking!");
  bookingForm.reset();
});

// ============================================
// CHATBOT FUNCTIONALITY
// ============================================
const chatbotWin = document.getElementById('chatbotWindow');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendChatBtn = document.getElementById('sendChat');

window.openChatbot = () => {
  if (chatbotWin) {
    chatbotWin.classList.remove('hidden');
    chatInput?.focus();
  }
};

document.getElementById('chatbotToggle')?.addEventListener('click', () => {
  if (chatbotWin) {
    chatbotWin.classList.toggle('hidden');
    if (!chatbotWin.classList.contains('hidden')) {
      chatInput?.focus();
    }
  }
});

document.getElementById('closeChatbot')?.addEventListener('click', () => {
  if (chatbotWin) chatbotWin.classList.add('hidden');
});

// Enhanced Chatbot Response System
function getBotResponse(message) {
  const m = message.toLowerCase();
  
  // Emergency triage
  if (m.includes('chest pain') || m.includes('difficulty breathing') || m.includes('unconscious')) {
    return "⚠️ URGENT: This could be serious. Call our emergency line IMMEDIATELY: 0708 865 910. An ambulance will be dispatched right away.";
  }
  
  if (m.includes('accident') || m.includes('injury') || m.includes('bleeding')) {
    return "🚨 Medical emergency detected! Call 0708 865 910 immediately. Do not move the patient unless necessary. Help is on the way.";
  }
  
  // Symptoms
  if (m.includes('fever') || m.includes('headache') || m.includes('malaria')) {
    return "🌡️ You may need a malaria test (KSh 200). Visit Gagra Medical Centre for a consultation or request a home visit. Call 0713 096598 for assistance.";
  }
  
  if (m.includes('diabetes') || m.includes('blood sugar') || m.includes('sugar')) {
    return "🩸 We offer diabetes screening and management. Blood sugar test: KSh 150. Visit us for a full check-up with Dr. Eston.";
  }
  
  if (m.includes('pregnancy') || m.includes('pregnant') || m.includes('antenatal')) {
    return "🤰 Congratulations! We offer comprehensive MCH services including antenatal care, immunizations, and family planning. SHA covers these services. Book an appointment today!";
  }
  
  // Pricing
  if (m.includes('price') || m.includes('cost') || m.includes('how much') || m.includes('fee')) {
    return "💰 Our affordable rates: Consultation (KSh 500), Home-Based Care (KSh 1,000), Malaria Test (KSh 200), Blood Sugar (KSh 150), Pregnancy Test (KSh 250). M-Pesa Till: 3046560. SHA accepted!";
  }
  
  // Payments
  if (m.includes('mpesa') || m.includes('pay') || m.includes('till')) {
    return "💵 M-Pesa Till Number: 3046560%0A%0ASteps:%0A1. Go to M-Pesa menu%0A2. Select 'Lipa Na M-Pesa'%0A3. Choose 'Buy Goods' (Till Number)%0A4. Enter Till Number: 3046560%0A5. Enter amount%0A6. Enter M-Pesa PIN%0A7. Show confirmation at reception";
  }
  
  if (m.includes('sha') || m.includes('nhif') || m.includes('insurance')) {
    return "✅ We accept SHA (Social Health Authority) which has replaced NHIF. Bring your SHA card for consultations, MCH, and lab tests. SHA covers: General Consultation, Maternal Health, Child Health, and Laboratory Services.";
  }
  
  // Location
  if (m.includes('location') || m.includes('where') || m.includes('address') || m.includes('direction')) {
    return "📍 Gagra Medical Centre is located at Gagra Madiany Junction, Gagra Centre, Uyoma, Rarieda, Siaya County, Kenya.%0A%0AOpen 24/7. <a href='#contact' class='underline'>Click here to view map</a>";
  }
  
  // Hours
  if (m.includes('hours') || m.includes('open') || m.includes('24/7') || m.includes('sunday') || m.includes('night')) {
    return "🕐 Gagra Medical Centre is open 24 hours a day, 7 days a week, 365 days a year.%0A%0A• Emergency: 24/7%0A• Pharmacy: 24/7%0A• Consultations: 8am - 8pm%0A• Home-Based Care: 8am - 6pm (by appointment)";
  }
  
  // Booking
  if (m.includes('book') || m.includes('appointment') || m.includes('visit')) {
    return "📅 To book an appointment, please fill out the booking form above or contact us directly on WhatsApp. Alternatively, call 0713 096598. Walk-ins are also welcome!";
  }
  
  // Services
  if (m.includes('service') || m.includes('offer') || m.includes('provide')) {
    return "🏥 Gagra Medical Centre offers:%0A• General Consultations (KSh 500)%0A• Home-Based Care (KSh 1,000)%0A• 24/7 Emergency Response%0A• Pharmacy Services%0A• MCH/FP Services (SHA covered)%0A• Laboratory & Diagnostics%0A• Specialized Follow-ups for chronic diseases";
  }
  
  // Team
  if (m.includes('doctor') || m.includes('dr') || m.includes('eston') || m.includes('medical director')) {
    return "👨‍⚕️ Dr. Eston Charles Ogeta is our Medical Director. He is a General Practitioner with over 10 years of experience in Emergency Care and Chronic Disease Management.";
  }
  
  // Greetings
  if (m.includes('hello') || m.includes('hi') || m.includes('habari') || m.includes('jambo') || m.includes('karibu')) {
    return "👋 Karibu! Welcome to Gagra Medical Centre - 'Come Discover Solutions in Healthcare'. How may I assist you today? You can ask me about services, pricing, location, or book an appointment.";
  }
  
  // Thanks
  if (m.includes('thank') || m.includes('thanks') || m.includes('asante')) {
    return "😊 You're welcome! Stay healthy. For immediate help, call 0708 865 910. Is there anything else I can help you with?";
  }
  
  // Default response
  return "👋 Thank you for contacting Gagra Medical Centre. For immediate assistance, please call 0713 096598 or 0708 865 910. You can also visit us at Gagra Madiany Junction, Uyoma, Rarieda.%0A%0AWould you like to:%0A• Book an appointment 🏥%0A• Get service pricing 💰%0A• Request ambulance 🚑%0A• View our location 📍";
}

function addChatMessage(text, isUser) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `flex ${isUser ? 'justify-end' : 'justify-start'} fade-in-up`;
  messageDiv.innerHTML = `<div class="${isUser ? 'chat-message-user' : 'chat-message-bot'} rounded-2xl ${isUser ? 'rounded-tr-none' : 'rounded-tl-none'} px-4 py-3 max-w-[85%] text-sm leading-relaxed">${text.replace(/\n/g, '<br>')}</div>`;
  chatMessages?.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

sendChatBtn?.addEventListener('click', () => {
  const message = chatInput.value.trim();
  if (!message) return;
  
  addChatMessage(message, true);
  chatInput.value = '';
  
  setTimeout(() => {
    const response = getBotResponse(message);
    addChatMessage(response, false);
  }, 500);
});

chatInput?.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    sendChatBtn?.click();
  }
});

// ============================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (href === '#' || href === '#home') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    const targetElement = document.querySelector(href);
    if (targetElement) {
      e.preventDefault();
      const headerOffset = 80;
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  });
});

// ============================================
// SERVICE WORKER FOR PWA (Optional)
// ============================================
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(err => {
    console.log('Service worker registration failed:', err);
  });
}

// ============================================
// CONSOLE LOG FOR DEVELOPMENT
// ============================================
console.log('🏥 Gagra Medical Centre Website Loaded');
console.log('📍 Location: Gagra Madiany Junction, Uyoma, Rarieda, Siaya County');
console.log('📞 Emergency: 0708 865 910 | 0713 096598 | 0797 860977');
console.log('💰 M-Pesa Till: 3046560');
console.log('✅ SHA Accredited');
