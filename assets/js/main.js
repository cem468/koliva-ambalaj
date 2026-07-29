document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. KARANLIK / AYDINLIK TEMA YÖNETİMİ
    // ==========================================
    const themeToggleBtn = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme');
    
    // Sistem tercihini kontrol etme
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Temayı uygulayan yardımcı fonksiyon
    const setTheme = (theme) => {
        if (theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
        }
    };

    // İlk yüklemede temayı seçme
    if (currentTheme === 'dark') {
        setTheme('dark');
    } else if (currentTheme === 'light') {
        setTheme('light');
    } else if (prefersDarkScheme.matches) {
        setTheme('dark');
    }

    // Butona tıklama olayı
    themeToggleBtn.addEventListener('click', () => {
        const activeTheme = document.documentElement.getAttribute('data-theme');
        if (activeTheme === 'dark') {
            setTheme('light');
        } else {
            setTheme('dark');
        }
    });

    // ==========================================
    // 2. HAMBURGER DROPDOWN MENÜ
    // ==========================================
    const menuToggle = document.getElementById('menu-toggle');
    const navDropdown = document.getElementById('nav-dropdown');
    const dropdownLinks = document.querySelectorAll('.nav-dropdown-link');

    const closeMenu = () => {
        menuToggle.classList.remove('is-open');
        navDropdown.classList.remove('is-open');
        menuToggle.setAttribute('aria-expanded', 'false');
    };

    const openMenu = () => {
        menuToggle.classList.add('is-open');
        navDropdown.classList.add('is-open');
        menuToggle.setAttribute('aria-expanded', 'true');
    };

    if (menuToggle && navDropdown) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = navDropdown.classList.contains('is-open');
            if (isOpen) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        // Dropdown linklerine tıklanınca menüyü kapat
        dropdownLinks.forEach(link => {
            link.addEventListener('click', () => {
                closeMenu();
            });
        });

        // Dışarıya tıklayınca kapat
        document.addEventListener('click', (e) => {
            if (!menuToggle.contains(e.target) && !navDropdown.contains(e.target)) {
                closeMenu();
            }
        });

        // Escape tuşuyla kapat
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeMenu();
        });
    }


    // ==========================================
    // 3. ÜRÜN FİLTRELEME SİSTEMİ
    // ==========================================
    const filterButtons = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-card');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Aktif buton stilini değiştir
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const filterValue = button.getAttribute('data-filter');

            productCards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');
                
                // Yumuşak geçiş efektleri ile gizle/göster
                if (filterValue === 'all' || cardCategory === filterValue) {
                    card.style.display = 'block';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 50);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(15px)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300); // style.css geçiş süresiyle senkron
                }
            });
        });
    });

    // ==========================================
    // 4. KUTU TEKLİF HESAPLAMA MOTORU (ROBOTU)
    // ==========================================
    const boxTypeInput = document.getElementById('box-type');
    const boxLengthInput = document.getElementById('box-length');
    const boxWidthInput = document.getElementById('box-width');
    const boxHeightInput = document.getElementById('box-height');
    const boxStrengthInput = document.getElementById('box-strength');
    const boxQtyInput = document.getElementById('box-qty');
    
    const resultPriceEl = document.getElementById('result-price');
    const resultSummaryEl = document.getElementById('result-summary');

    const calculateQuote = () => {
        // Girdileri al
        const type = boxTypeInput.value;
        const length = parseFloat(boxLengthInput.value) || 0;
        const width = parseFloat(boxWidthInput.value) || 0;
        const height = parseFloat(boxHeightInput.value) || 0;
        const strength = boxStrengthInput.value;
        const qty = parseInt(boxQtyInput.value) || 100;

        // Değer kontrolü (sıfır ve negatif değerleri engelle)
        if (length <= 0 || width <= 0 || height <= 0 || qty <= 0) {
            resultPriceEl.innerText = "₺0.00";
            resultSummaryEl.innerText = "Lütfen geçerli ebat ve miktar giriniz.";
            return;
        }

        // 1. Yüzey Alanı Hesabı (m² cinsinden)
        // Karton plakası açınımı formülü (Kapaklar ve paylar dahil yaklaşık)
        // A = 2 * (L + W + 50) * (W + H + 30) mm²
        const areaSqMm = 2 * (length + width + 50) * (width + height + 30);
        const areaSqM = areaSqMm / 1000000; // m²'ye çevrim

        // 2. Karton Hammadde Birim m² Fiyatı (Hammadde kalitesine göre)
        let baseMaterialPrice = 12.00; // Tek oluklu varsayılan
        if (strength === 'double') baseMaterialPrice = 22.00;
        if (strength === 'heavy') baseMaterialPrice = 36.00;

        // 3. Kutu Türü Zorluk/İşçilik Çarpanı
        let typeMultiplier = 1.0;
        if (type === 'kargo') typeMultiplier = 1.25;
        if (type === 'gida') typeMultiplier = 1.15;
        if (type === 'seperator') typeMultiplier = 1.40;

        // 4. Sabit Kalıp / Makine Ayar Maliyeti
        // Sipariş miktarı arttıkça birim fiyata yansıyan kurulum maliyeti azalır.
        const setupCost = 1500; // TL
        const setupCostPerUnit = setupCost / qty;

        // 5. Birim Hammadde Maliyeti
        const materialCostPerUnit = areaSqM * baseMaterialPrice * typeMultiplier;

        // 6. Toplam Birim Fiyat (Malzeme + Kurulum + Fabrika Karı/İşçilik)
        let unitPrice = (materialCostPerUnit + setupCostPerUnit) * 1.30; // %30 Fabrika marjı
        
        // Miktar İndirimi (Toplu siparişlerde hammadde iskontosu)
        if (qty >= 5000) {
            unitPrice *= 0.90; // %10 İndirim
        } else if (qty >= 10000) {
            unitPrice *= 0.85; // %15 İndirim
        }

        // Minimum Birim Fiyat Sınırı
        if (unitPrice < 2.50) unitPrice = 2.50;

        // Toplam Fiyat
        const totalPrice = unitPrice * qty;

        // Sonuçları Ekrana Yazdır
        resultPriceEl.innerText = `₺${unitPrice.toFixed(2)}`;
        
        // Kutu Türü Etiketi
        const typeText = boxTypeInput.options[boxTypeInput.selectedIndex].text;
        const strengthText = boxStrengthInput.options[boxStrengthInput.selectedIndex].text.split('(')[0].trim();

        resultSummaryEl.innerText = `${length}x${width}x${height} mm - ${qty} Adet ${strengthText} ${typeText} için tahmini toplam: ₺${totalPrice.toLocaleString('tr-TR', {maximumFractionDigits: 0})}`;
    };

    // Dinamik hesaplama tetikleyicileri
    const calcInputs = [boxTypeInput, boxLengthInput, boxWidthInput, boxHeightInput, boxStrengthInput, boxQtyInput];
    calcInputs.forEach(input => {
        if (input) {
            input.addEventListener('input', calculateQuote);
            input.addEventListener('change', calculateQuote);
        }
    });

    // İlk hesaplamayı çalıştır
    calculateQuote();

    // ==========================================
    // 5. TEKLİF DETAYLARINI İLETİŞİM FORMUNA AKTARMA
    // ==========================================
    const sendQuoteDetailsBtn = document.getElementById('btn-send-quote-details');
    const contactMessageTextarea = document.getElementById('contact-message');
    const contactNameInput = document.getElementById('contact-name');

    if (sendQuoteDetailsBtn && contactMessageTextarea) {
        sendQuoteDetailsBtn.addEventListener('click', () => {
            const typeText = boxTypeInput.options[boxTypeInput.selectedIndex].text;
            const length = boxLengthInput.value;
            const width = boxWidthInput.value;
            const height = boxHeightInput.value;
            const strengthText = boxStrengthInput.options[boxStrengthInput.selectedIndex].text;
            const qty = boxQtyInput.value;
            const price = resultPriceEl.innerText;
            const summaryText = resultSummaryEl.innerText;

            // Hazır şablon mesajı oluşturma
            const formattedMessage = `Merhaba, Koliva Ambalaj web sitenizdeki Teklif Robotu üzerinden bir hesaplama yaptım. Aşağıda detayları bulunan kutu için resmi ve detaylı bir fiyat teklifi rica ediyorum:

- Ürün Tipi: ${typeText}
- Ebatlar: ${length} x ${width} x ${height} mm
- Karton Kalitesi: ${strengthText}
- Talep Edilen Miktar: ${qty} Adet
- Hesaplanan Birim Fiyat: ${price}
- Referans Özet: ${summaryText}

Lütfen en kısa sürede dönüş yapınız. İyi çalışmalar.`;

            contactMessageTextarea.value = formattedMessage;

            // İletişim bölümüne pürüzsüz kaydırma yap
            const contactSection = document.getElementById('contact');
            if (contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth' });
                
                // İsim alanına odaklan
                setTimeout(() => {
                    if (contactNameInput) contactNameInput.focus();
                }, 800);
            }
        });
    }

    // ==========================================
    // 6. İLETİŞİM FORMU GÖNDERİM SİMÜLASYONU
    // ==========================================
    const contactForm = document.getElementById('contact-form');
    const formFeedback = document.getElementById('form-feedback');

    if (contactForm && formFeedback) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Sayfa yenilenmesini engelle

            // Buton durumunu değiştir
            const submitBtn = document.getElementById('btn-submit-contact');
            const originalBtnText = submitBtn.innerText;
            submitBtn.disabled = true;
            submitBtn.innerText = "Gönderiliyor...";

            // Simüle edilmiş sunucu yanıtı (1.5 saniye sonra)
            setTimeout(() => {
                // Form girdilerini temizle
                contactForm.reset();

                // Geri bildirim mesajı göster (Başarı)
                formFeedback.style.display = 'block';
                formFeedback.style.backgroundColor = 'var(--color-primary-light)';
                formFeedback.style.color = 'var(--color-primary)';
                formFeedback.innerText = "Talebiniz başarıyla alınmıştır! Teklif departmanımız en kısa sürede sizinle iletişime geçecektir.";

                // Butonu eski haline getir
                submitBtn.disabled = false;
                submitBtn.innerText = originalBtnText;

                // 5 saniye sonra geri bildirimi gizle
                setTimeout(() => {
                    formFeedback.style.opacity = '0';
                    setTimeout(() => {
                        formFeedback.style.display = 'none';
                        formFeedback.style.opacity = '1';
                    }, 500);
                }, 5000);

            }, 1500);
        });
    }


    // ==========================================
    // 7. SCROLL REVEAL ANIMATION
    // ==========================================
    const revealTargets = document.querySelectorAll(
        '.feature-card, .product-card, .machine-card, .stat-box, ' +
        '.calculator, .contact-item, .contact-form-container, ' +
        '.badge, h2'
    );

    // Add base class
    revealTargets.forEach((el, i) => {
        el.classList.add('reveal');
        // Staggered delay for grid children
        const parent = el.parentElement;
        const siblings = [...parent.children].filter(c => c.classList.contains(el.classList[0]));
        const index = siblings.indexOf(el);
        if (index > -1) {
            el.style.transitionDelay = `${index * 80}ms`;
        }
    });

    const revealObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealTargets.forEach(el => revealObserver.observe(el));

    // ==========================================
    // 9. SSS (FAQ) ACCORDION SİSTEMİ
    // ==========================================
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.closest('.faq-item');
            const isOpen = item.classList.contains('is-open');

            // Diğer açık soruları kapat (Accordion mantığı)
            document.querySelectorAll('.faq-item.is-open').forEach(openItem => {
                if (openItem !== item) {
                    openItem.classList.remove('is-open');
                    openItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
                }
            });

            if (isOpen) {
                item.classList.remove('is-open');
                btn.setAttribute('aria-expanded', 'false');
            } else {
                item.classList.add('is-open');
                btn.setAttribute('aria-expanded', 'true');
            }
        });
    });
});

