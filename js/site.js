(() => {
  document.documentElement.classList.add('js');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const connection = navigator.connection;
  let paused = false;
  const loops = [...document.querySelectorAll('video[data-src]')];
  const visible = new Set();
  const mayAnimate = () => !paused && !reduced.matches && !connection?.saveData && !document.hidden;
  const updateVideo = video => {
    if (!visible.has(video) || video.closest('[hidden]') || !mayAnimate()) {
      video.pause();
      return;
    }
    if (!video.getAttribute('src')) {
      video.src = video.dataset.src;
      video.load();
    }
    video.play().catch(() => {});
  };
  const updateMotion = () => loops.forEach(updateVideo);
  const motionButton = document.querySelector('[data-motion-toggle]');
  if (motionButton && loops.length && !connection?.saveData) {
    const updateButton = () => {
      motionButton.hidden = reduced.matches;
      motionButton.textContent = paused ? motionButton.dataset.resume : motionButton.dataset.pause;
      motionButton.setAttribute('aria-pressed', String(paused));
    };
    updateButton();
    motionButton.addEventListener('click', () => { paused = !paused; updateMotion(); updateButton(); });
    reduced.addEventListener('change', () => { updateMotion(); updateButton(); });
  }
  if ('IntersectionObserver' in window) {
    const videoObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) visible.add(entry.target);
        else visible.delete(entry.target);
        updateVideo(entry.target);
      });
    }, {threshold: .15});
    loops.forEach(video => videoObserver.observe(video));
    if (!reduced.matches && !connection?.saveData) {
      const reveals = document.querySelectorAll('.reveal');
      const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      }), {threshold:.08});
      reveals.forEach(element => { element.classList.add('reveal-pending'); revealObserver.observe(element); });
    }
  }
  document.addEventListener('visibilitychange', updateMotion);
  connection?.addEventListener?.('change', updateMotion);
  const menu = document.querySelector('.menu-toggle');
  const navigation = document.getElementById('navigation');
  const closeMenu = () => { navigation.classList.remove('is-open'); menu.setAttribute('aria-expanded','false'); };
  menu?.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded',String(open));
    navigation.classList.toggle('is-open',open);
  });
  navigation?.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu?.getAttribute('aria-expanded') === 'true') { closeMenu(); menu.focus(); }
  });
  document.addEventListener('click', event => {
    if (menu?.getAttribute('aria-expanded') === 'true' && !event.target.closest('.site-header')) closeMenu();
  });
  document.querySelectorAll('[data-tabs]').forEach(group => {
    const bar = group.querySelector('.tab-buttons');
    const tabs = [...bar.querySelectorAll('a')];
    const panels = tabs.map(tab => document.getElementById(tab.hash.slice(1)));
    bar.setAttribute('role','tablist');
    group.classList.add('tabs-ready');
    const select = (index, focus = false) => {
      tabs.forEach((tab,i) => {
        tab.setAttribute('role','tab');
        tab.setAttribute('aria-selected',String(i===index));
        tab.setAttribute('aria-controls',panels[i].id);
        tab.tabIndex = i===index ? 0 : -1;
        panels[i].setAttribute('role','tabpanel');
        panels[i].tabIndex = 0;
        panels[i].hidden = i!==index;
      });
      if (focus) tabs[index].focus();
      updateMotion();
    };
    select(Math.max(0,tabs.findIndex(tab=>tab.hash===location.hash)));
    tabs.forEach((tab,index) => {
      tab.addEventListener('click', event => { event.preventDefault(); select(index); });
      tab.addEventListener('keydown', event => {
        let next;
        if (event.key === 'ArrowRight') next=(index+1)%tabs.length;
        if (event.key === 'ArrowLeft') next=(index+tabs.length-1)%tabs.length;
        if (event.key === 'Home') next=0;
        if (event.key === 'End') next=tabs.length-1;
        if (next !== undefined) { event.preventDefault(); select(next,true); }
      });
    });
    window.addEventListener('hashchange',()=>{ const index=tabs.findIndex(tab=>tab.hash===location.hash); if(index>=0) select(index); });
  });
  document.querySelectorAll('[data-worlds]').forEach(group => {
    const links = [...group.querySelectorAll('[data-world]')];
    const scenes = links.map(link=>document.getElementById(link.hash.slice(1)));
    const select = index => {
      links.forEach((link,i)=>{ if(i===index) link.setAttribute('aria-current','true'); else link.removeAttribute('aria-current'); scenes[i].hidden=i!==index; });
    };
    select(Math.max(0,links.findIndex(link=>link.hash===location.hash)));
    links.forEach((link,index)=>link.addEventListener('click',event=>{event.preventDefault();select(index);}));
    window.addEventListener('hashchange',()=>{const index=links.findIndex(link=>link.hash===location.hash);if(index>=0)select(index);});
  });
  document.querySelector('[data-trailer]')?.addEventListener('click', event => {
    const button = event.currentTarget;
    const player = button.parentElement.querySelector('video');
    const source = player.querySelector('source');
    source.src = source.dataset.src;
    player.load();
    button.hidden = true;
    player.focus();
    player.play().catch(() => {});
  });
  const dialog = document.querySelector('.lightbox');
  const shots = [...document.querySelectorAll('[data-gallery]')];
  if (dialog && typeof dialog.showModal === 'function') {
    let current = 0;
    let opener;
    const show = index => {
      current = (index + shots.length) % shots.length;
      const shot = shots[current];
      const source = shot.querySelector('img');
      dialog.querySelector('figure img').src=shot.href;
      dialog.querySelector('figure img').alt=source.alt;
      dialog.querySelector('figcaption').textContent=`${current+1} / ${shots.length} — ${source.alt}`;
    };
    shots.forEach((shot,index)=>shot.addEventListener('click',event=>{
      event.preventDefault();opener=shot;show(index);dialog.showModal();updateMotion();
    }));
    dialog.querySelector('.lightbox-close').addEventListener('click',()=>dialog.close());
    dialog.querySelector('.lightbox-prev').addEventListener('click',()=>show(current-1));
    dialog.querySelector('.lightbox-next').addEventListener('click',()=>show(current+1));
    dialog.addEventListener('keydown',event=>{
      if(event.key==='ArrowRight'){event.preventDefault();show(current+1);}
      if(event.key==='ArrowLeft'){event.preventDefault();show(current-1);}
    });
    dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
    dialog.addEventListener('close',()=>opener?.focus());
  }
})();
