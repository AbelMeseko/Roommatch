        // Intersection Observer for scroll-triggered animations from left
        const animatedElements = document.querySelectorAll('.cx-hr-fit, .hero-down-arrow-wrap, .content-container, .portal-card');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
        
        animatedElements.forEach(el => observer.observe(el));
        
        // Force initial check for elements already visible
        setTimeout(() => {
            animatedElements.forEach(el => {
                const rect = el.getBoundingClientRect();
                if (rect.top < window.innerHeight - 80) {
                    el.classList.add('visible');
                    observer.unobserve(el);
                }
            });
        }, 100);
        
        // Handle card clicks - redirect to relevant PHP pages
        document.querySelectorAll('.portal-card').forEach(card => {
            card.addEventListener('click', () => {
                const url = card.getAttribute('data-url');
                if (url) {
                    window.location.href = url;
                } else {
                    alert('Page coming soon!');
                }
            });
        });
        
        // Sign out popup
        const signoutBtn = document.getElementById('topRightSignoutBtn');
        const signoutPopup = document.getElementById('signoutPopup');
        const cancelSignout = document.getElementById('cancelSignout');
        if (signoutBtn) signoutBtn.addEventListener('click', () => signoutPopup.style.display = 'flex');
        if (cancelSignout) cancelSignout.onclick = () => signoutPopup.style.display = 'none';
        
        // Hero down arrow
        const heroArrow = document.getElementById('heroDownArrow');
        if (heroArrow) heroArrow.addEventListener('click', () => document.querySelector('.content-container')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
        
        // Intro modal
        const introClick = document.getElementById('introClickable');
        const introProj = document.getElementById('introProjected');
        const introClose = document.getElementById('introClose');
        const visitDeveloperBtn = document.getElementById('visitDeveloperBtn');
        
        if (introClick && introProj) {
            introClick.onclick = (e) => { e.stopPropagation(); introProj.classList.add('show'); };
            if (introClose) introClose.onclick = () => introProj.classList.remove('show');
            introProj.onclick = (e) => { if (e.target === introProj) introProj.classList.remove('show'); };
        }
        if (visitDeveloperBtn) {
            visitDeveloperBtn.onclick = (e) => { e.stopPropagation(); window.open('https://hr-fit.co.za/', '_blank'); };
        }
        
        // Logo redirect
        document.querySelectorAll('#centerLogoRedirect').forEach(logo => {
            logo.style.cursor = 'pointer';
            logo.addEventListener('click', () => window.location.href = 'index.php');
        });