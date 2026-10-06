// Tamarind Table: scroll choreography (GSAP + ScrollTrigger) and the booking form.
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- booking form (works without motion) ---------- */
const form = document.querySelector('.form');
const guests = form.querySelector('output[name=guests]');
form.querySelectorAll('[data-step]').forEach(b => b.addEventListener('click', () => {
  guests.value = Math.min(20, Math.max(1, +guests.value + +b.dataset.step));
}));
document.querySelectorAll('[data-occasion]').forEach(a => a.addEventListener('click', () => {
  form.occasion.value = a.dataset.occasion;
}));
form.date.min = new Date().toISOString().slice(0, 10);
form.addEventListener('submit', e => {
  e.preventDefault();
  const bad = ['name', 'phone', 'date'].filter(n => !form[n].value.trim() || (n === 'phone' && form.phone.value.replace(/\D/g, '').length < 7));
  ['name', 'phone', 'date'].forEach(n => form[n].setAttribute('aria-invalid', bad.includes(n)));
  form.querySelector('.err').hidden = !bad.length;
  if (bad.length) return form[bad[0]].focus();
  form.querySelector('.done').hidden = false;
});

/* ---------- motion ---------- */
if (!reduce && window.gsap) {
  gsap.registerPlugin(ScrollTrigger);

  // hero headline: words rise in, image settles
  document.querySelectorAll('.split').forEach(h => {
    h.querySelectorAll('em').forEach(em => em.innerHTML = em.textContent.split(' ').map(w => `<span class="w"><span>${w}</span></span>`).join(' '));
    [...h.childNodes].filter(n => n.nodeType === 3 && n.textContent.trim()).forEach(n => {
      const s = document.createElement('span');
      s.innerHTML = n.textContent.trim().split(' ').map(w => `<span class="w"><span>${w}</span></span>`).join(' ') + ' ';
      n.replaceWith(s);
    });
  });
  gsap.timeline({ defaults: { ease: 'power4.out' } })
    .from('.hero .w>span', { yPercent: 110, duration: 1, stagger: .08 })
    .from('.hero .lede, .hero .ctas', { y: 24, opacity: 0, duration: .8, stagger: .1 }, '-=.6')
    .from('.hero-img', { clipPath: 'inset(100% 0 0 0 round 20px)', duration: 1.2 }, 0.1)
    .from('.hero-img img', { scale: 1.25, duration: 1.6 }, 0.1);

  // marquee drifts left; scroll velocity pushes it faster for a moment
  const marquee = gsap.to('.marquee-track', { xPercent: -50, ease: 'none', duration: 24, repeat: -1 });
  ScrollTrigger.create({
    onUpdate: self => {
      gsap.to(marquee, { timeScale: 1 + Math.min(4, Math.abs(self.getVelocity()) / 400), duration: .2, overwrite: true });
      gsap.to(marquee, { timeScale: 1, duration: 1, delay: .25 });
    },
  });

  // zoom reveal: the framed photo opens to full-bleed, then the line lands
  gsap.timeline({ scrollTrigger: { trigger: '.reveal', start: 'top top', end: '+=120%', pin: true, scrub: 1 } })
    .to('.reveal-frame', { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none' })
    .from('.reveal-frame img', { scale: 1.3, ease: 'none' }, 0)
    .to('.reveal-line', { opacity: 1, y: 0, ease: 'power2.out', duration: .35 }, .65)
    .from('.reveal-line', { y: 40, duration: .35 }, .65);

  // horizontal menu: vertical scroll pans the plates sideways
  const track = document.querySelector('.menu-track');
  const dist = () => track.scrollWidth - innerWidth;
  gsap.to(track, {
    x: () => -dist(), ease: 'none',
    scrollTrigger: { trigger: '.menu', start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 1, invalidateOnRefresh: true },
  });

  // sticky story: the photo on the left follows whichever step is in view
  const pics = gsap.utils.toArray('.story-media img');
  gsap.utils.toArray('.step').forEach((step, i) => {
    ScrollTrigger.create({
      trigger: step, start: 'top 55%', end: 'bottom 55%',
      onToggle: s => s.isActive && pics.forEach((p, j) => gsap.to(p, { opacity: j === i ? 1 : 0, scale: j === i ? 1 : 1.06, duration: .7, ease: 'power2.out' })),
    });
    gsap.from(step.children, { y: 40, opacity: 0, stagger: .1, duration: .8, ease: 'power3.out', scrollTrigger: { trigger: step, start: 'top 75%' } });
  });

  // catering + reserve settle in
  gsap.from('.cat-img img', { scale: 1.2, ease: 'none', scrollTrigger: { trigger: '.catering', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.from('.cat-copy > *', { y: 30, opacity: 0, stagger: .1, duration: .8, scrollTrigger: { trigger: '.catering', start: 'top 70%' } });
  gsap.from('.form, .info', { y: 60, opacity: 0, stagger: .15, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.reserve', start: 'top 75%' } });
}
