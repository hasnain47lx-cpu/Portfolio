document.addEventListener('DOMContentLoaded', function(){
	// year
	const yearEl = document.getElementById('year');
	if(yearEl) yearEl.textContent = new Date().getFullYear();

	// mobile nav toggle
	const navToggle = document.querySelector('.nav-toggle');
	const primaryNav = document.getElementById('primary-nav');
	if(navToggle && primaryNav){
		navToggle.addEventListener('click', function(){
			const open = primaryNav.classList.toggle('open');
			const expanded = open ? 'true' : 'false';
			navToggle.setAttribute('aria-expanded', expanded);
		});
	}

	// smooth scroll for in-page links
	document.querySelectorAll('a[href^="#"]').forEach(a=>{
		a.addEventListener('click', function(e){
			const href = a.getAttribute('href');
			if(href && href.startsWith('#')){
				const target = document.querySelector(href);
				if(target){
					e.preventDefault();
					target.scrollIntoView({behavior:'smooth',block:'start'});
					// close mobile nav after clicking
					if(primaryNav && primaryNav.classList.contains('open')){
						primaryNav.classList.remove('open');
						if(navToggle) navToggle.setAttribute('aria-expanded','false');
					}
				}
			}
		})
	})

	// contact form (mock)
	const form = document.getElementById('contact-form');
	const msg = document.getElementById('form-msg');
	if(form && msg){
		form.addEventListener('submit', function(e){
			e.preventDefault();
			const submitBtn = form.querySelector('button[type="submit"]');
			if(submitBtn) submitBtn.disabled = true;
			msg.textContent = 'Sending…';
			// simulate send
		      setTimeout(()=>{
				msg.textContent = 'Thanks — I will reply shortly.';
				form.reset();
				if(submitBtn) submitBtn.disabled = false;
				}, 1400);
		})
	}

});

// Scroll reveal using IntersectionObserver
(function(){
	const elems = document.querySelectorAll('.reveal-on-scroll');
	if(!elems.length) return;
	const obs = new IntersectionObserver((entries, observer)=>{
		entries.forEach((entry)=>{
			if(entry.isIntersecting){
				entry.target.classList.add('in-view');
				observer.unobserve(entry.target);
			}
		})
	},{threshold:0.15});

	elems.forEach((el,i)=>{
		// stagger a tiny bit for grid children
		if(el.classList.contains('project-card')){
			el.style.transitionDelay = (120 + (i*80)) + 'ms';
		}
		obs.observe(el);
	});
})();

// Header behavior: set header fixed when scrolling down, release when scrolling up
(function(){
	const header = document.querySelector('.site-header');
	if(!header) return;
	let lastY = window.scrollY || 0;
	let ticking = false;
	const delta = 8;

	function onScroll(){
		const currentY = window.scrollY || 0;
		if(!ticking){
			window.requestAnimationFrame(()=>{
				if(currentY > lastY + delta){
					// scrolling down -> hide header
					header.classList.add('is-hidden');
					header.classList.remove('is-fixed');
				} else if(currentY < lastY - delta){
					// scrolling up -> show and fix header
					header.classList.remove('is-hidden');
					header.classList.add('is-fixed');
				}

				// if at the very top, clear fixed/hidden states
				if(currentY <= 10){
					header.classList.remove('is-fixed','is-hidden');
				}

				lastY = currentY;
				ticking = false;
			});
			ticking = true;
		}
	}

	window.addEventListener('scroll', onScroll, {passive:true});

	// close mobile nav if clicking outside
	document.addEventListener('click', (e)=>{
		const nav = document.getElementById('primary-nav');
		const toggle = document.querySelector('.nav-toggle');
		if(!nav || !toggle) return;
		if(nav.classList.contains('open')){
			const withinNav = nav.contains(e.target);
			const isToggle = toggle.contains(e.target);
			if(!withinNav && !isToggle){
				nav.classList.remove('open');
				toggle.setAttribute('aria-expanded','false');
			}
		}
	});
})();

// Parallax background & hero tilt
(function(){
	const bg = document.querySelector('.bg-visuals');
	const blobs = document.querySelectorAll('.bg-visuals .blob');
	const heroCard = document.querySelector('.hero-card');
	if(!bg || !blobs.length) return;

	let mouseX = 0, mouseY = 0, rAF = null;
	let px = 0, py = 0;

	function onPointer(e){
		const rect = document.documentElement.getBoundingClientRect();
		const cx = (e.clientX || (e.touches && e.touches[0].clientX) || rect.width/2);
		const cy = (e.clientY || (e.touches && e.touches[0].clientY) || rect.height/2);
		mouseX = (cx - rect.width/2) / rect.width;
		mouseY = (cy - rect.height/2) / rect.height;
		if(!rAF){ rAF = requestAnimationFrame(updateParallax); }    
	}

	function updateParallax(){
			// lerp (slower for smoother motion)
			px += (mouseX - px) * 0.04;
			py += (mouseY - py) * 0.04;

			blobs.forEach((b)=>{
				const depth = parseFloat(b.dataset.depth) || 0.03;
				// gentler translation multipliers
				const tx = -px * depth * 80;
				const ty = -py * depth * 60;
				b.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
			});

			// hero tilt subtle and slower
			if(heroCard){
				const rx = py * 3; // rotateX smaller
				const ry = px * -5; // rotateY smaller
				heroCard.style.transform = `translateY(-4px) rotateX(${rx}deg) rotateY(${ry}deg)`;
			}

		rAF = null;
	}

	window.addEventListener('pointermove', onPointer, {passive:true});
	window.addEventListener('touchmove', onPointer, {passive:true});
	window.addEventListener('mousemove', onPointer, {passive:true});

	// reduce intensity on small screens
	function adjustForSize(){
		const small = window.matchMedia('(max-width:700px)').matches;
		blobs.forEach(b=> b.style.opacity = small ? '0.7' : '0.9');
	}
	window.addEventListener('resize', adjustForSize);
	adjustForSize();
})();
