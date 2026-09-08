(function(){
  var spreads = Array.prototype.slice.call(document.querySelectorAll('.spread'));
  var dotsWrap = document.getElementById('dots');
  var prevBtn = document.getElementById('prevBtn');
  var nextBtn = document.getElementById('nextBtn');
  var counter = document.getElementById('counter');
  var current = 0;
  var animating = false;
  var DURATION = 800;

  // build dots dynamically (works for any number of spreads)
  spreads.forEach(function(sp, i){
    var d = document.createElement('button');
    d.type = 'button';
    d.className = 'dot' + (i === 0 ? ' active' : '');
    d.setAttribute('role', 'tab');
    d.setAttribute('data-index', i);
    d.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    d.setAttribute('aria-label', sp.getAttribute('data-label') || ('Page ' + (i + 1)));
    var theme = (sp.className.match(/theme-[\w-]+/) || [])[0];
    if (theme) d.classList.add(theme);
    dotsWrap.appendChild(d);
  });
  var dots = Array.prototype.slice.call(dotsWrap.querySelectorAll('.dot'));

  function updateChrome(){
    dots.forEach(function(d, i){
      var isActive = i === current;
      d.classList.toggle('active', isActive);
      d.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === spreads.length - 1;
    var label = spreads[current].getAttribute('data-label');
    counter.textContent = label + ' · ' + (current + 1) + ' / ' + spreads.length;
    var active = dots[current];
    if (active && active.scrollIntoView) active.scrollIntoView({block:'nearest', inline:'nearest'});
  }

  function goTo(target){
    if (animating || target === current || target < 0 || target >= spreads.length) return;
    animating = true;

    var dir = target > current ? 'next' : 'prev';
    var oldSpread = spreads[current];
    var newSpread = spreads[target];

    newSpread.classList.add(dir === 'next' ? 'enter-next' : 'enter-prev');
    void newSpread.offsetWidth;

    requestAnimationFrame(function(){
      oldSpread.classList.add(dir === 'next' ? 'leave-next' : 'leave-prev');
      oldSpread.classList.remove('active');
      newSpread.classList.remove('enter-next', 'enter-prev');
      newSpread.classList.add('active');
    });

    setTimeout(function(){
      oldSpread.classList.remove('leave-next', 'leave-prev');
      current = target;
      animating = false;
      updateChrome();
    }, DURATION);
  }

  prevBtn.addEventListener('click', function(){ goTo(current - 1); });
  nextBtn.addEventListener('click', function(){ goTo(current + 1); });
  dotsWrap.addEventListener('click', function(e){
    var d = e.target.closest ? e.target.closest('.dot') : null;
    if (d) goTo(parseInt(d.getAttribute('data-index'), 10));
  });

  document.addEventListener('keydown', function(e){
    if (e.key === 'ArrowRight') goTo(current + 1);
    if (e.key === 'ArrowLeft') goTo(current - 1);
  });

  var touchStartX = null;
  var bookStage = document.querySelector('.book-stage');
  bookStage.addEventListener('touchstart', function(e){
    touchStartX = e.changedTouches[0].clientX;
  }, {passive:true});
  bookStage.addEventListener('touchend', function(e){
    if (touchStartX === null) return;
    var dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) goTo(current + (dx < 0 ? 1 : -1));
    touchStartX = null;
  }, {passive:true});

  updateChrome();
})();