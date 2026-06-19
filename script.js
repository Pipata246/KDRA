(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- Intro floating particles --- */
  function initIntroParticles() {
    var canvas = document.getElementById('introParticles');
    if (!canvas || reducedMotion) return;

    var ctx = canvas.getContext('2d');
    var particles = [];
    var count = 22;

    function resize() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }

    resize();
    window.addEventListener('resize', resize);

    for (var i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: 1 + Math.random() * 2.5,
        dx: -0.3 + Math.random() * 0.6,
        dy: -0.2 + Math.random() * 0.4,
        alpha: 0.15 + Math.random() * 0.35
      });
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(function (p) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(107, 122, 90, ' + p.alpha + ')';
        ctx.fill();

        p.x += p.dx;
        p.y += p.dy;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
      });

      requestAnimationFrame(draw);
    }

    draw();
  }

  /* --- Touch sparkles anywhere --- */
  function initTouchSparkles() {
    var layer = document.getElementById('touchLayer');
    if (!layer) return;

    var symbols = ['✦', '♥', '✧', '·'];

    function spawn(x, y) {
      for (var i = 0; i < 6; i++) {
        var el = document.createElement('span');
        el.className = 'touch-spark';
        el.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        el.style.left = x + 'px';
        el.style.top = y + 'px';
        el.style.setProperty('--tx', (-30 + Math.random() * 60) + 'px');
        el.style.setProperty('--ty', (-50 + Math.random() * -30) + 'px');
        layer.appendChild(el);
        setTimeout(function () { el.remove(); }, 1000);
      }
    }

    document.addEventListener('touchstart', function (e) {
      var touch = e.touches[0];
      var rect = layer.getBoundingClientRect();
      spawn(touch.clientX - rect.left, touch.clientY - rect.top);
    }, { passive: true });

    document.addEventListener('click', function (e) {
      var rect = layer.getBoundingClientRect();
      spawn(e.clientX - rect.left, e.clientY - rect.top);
    });
  }

  /* --- Poetry auto-cycle (no scroll) --- */
  function initPoetry() {
    var stage = document.getElementById('poetryStage');
    var dotsWrap = document.getElementById('poetryDots');
    if (!stage) return;

    var lines = stage.querySelectorAll('.poetry-line');
    var current = 0;
    var interval = reducedMotion ? 6000 : 3800;

    lines.forEach(function (_, i) {
      var dot = document.createElement('span');
      dot.className = 'poetry-dot' + (i === 0 ? ' active' : '');
      dotsWrap.appendChild(dot);
    });

    var dots = dotsWrap.querySelectorAll('.poetry-dot');

    function nextLine() {
      var prev = lines[current];
      prev.classList.remove('active');
      prev.classList.add('leaving');

      dots[current].classList.remove('active');
      current = (current + 1) % lines.length;

      setTimeout(function () {
        prev.classList.remove('leaving');
        lines[current].classList.add('active');
        dots[current].classList.add('active');
      }, reducedMotion ? 0 : 650);
    }

    setInterval(nextLine, interval);
  }

  /* --- Polaroid tap pop --- */
  document.querySelectorAll('.polaroid').forEach(function (card) {
    card.addEventListener('click', function () {
      card.classList.add('tapped');
      setTimeout(function () { card.classList.remove('tapped'); }, 600);
    });
  });

  /* --- Hearts with burst --- */
  var heartBtns = document.querySelectorAll('.heart-btn');
  var heartReveal = document.getElementById('heartReveal');
  var heartsCounter = document.getElementById('heartsCounter');
  var openedCount = 0;

  function heartBurst(x, y) {
    var layer = document.getElementById('touchLayer');
    if (!layer) return;
    var rect = layer.getBoundingClientRect();

    for (var i = 0; i < 10; i++) {
      var el = document.createElement('span');
      el.className = 'touch-spark';
      el.textContent = '♥';
      el.style.color = '#6b7a5a';
      el.style.fontSize = (8 + Math.random() * 10) + 'px';
      el.style.left = (x - rect.left) + 'px';
      el.style.top = (y - rect.top) + 'px';
      el.style.setProperty('--tx', (-40 + Math.random() * 80) + 'px');
      el.style.setProperty('--ty', (-60 + Math.random() * -40) + 'px');
      layer.appendChild(el);
      setTimeout(function () { el.remove(); }, 1000);
    }
  }

  heartBtns.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      if (btn.classList.contains('opened')) return;

      btn.classList.add('opened');
      openedCount++;
      heartBurst(e.clientX, e.clientY);

      if (heartReveal) {
        heartReveal.textContent = btn.getAttribute('data-msg');
        heartReveal.classList.remove('show');
        void heartReveal.offsetWidth;
        heartReveal.classList.add('show');
      }

      if (heartsCounter) {
        heartsCounter.textContent = 'найдено: ' + openedCount + ' из ' + heartBtns.length;
      }

      if (openedCount === heartBtns.length && heartReveal) {
        setTimeout(function () {
          heartReveal.textContent = 'ты собрала все. как и я — тебя.';
        }, 900);
      }
    });
  });

  /* --- Envelope --- */
  var envelope = document.getElementById('envelope');
  var envelopeHint = document.getElementById('envelopeHint');
  var envelopeSection = document.getElementById('envelopeSection');

  if (envelope) {
    envelope.addEventListener('click', function (e) {
      if (envelope.classList.contains('open')) return;
      envelope.classList.add('open');
      if (envelopeSection) envelopeSection.classList.add('is-open');
      if (envelopeHint) envelopeHint.classList.add('hidden');
      heartBurst(e.clientX, e.clientY);
    });
  }

  /* --- Scatter drop-in on first view --- */
  var scatters = document.querySelectorAll('.scatter');
  if (scatters.length && 'IntersectionObserver' in window) {
    var scatterObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('play');
          scatterObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    scatters.forEach(function (s) { scatterObs.observe(s); });
  } else {
    scatters.forEach(function (s) { s.classList.add('play'); });
  }

  document.querySelectorAll('.scatter').forEach(function (s) {
    s.addEventListener('click', function () {
      document.querySelectorAll('.scatter').forEach(function (o) {
        o.classList.remove('tapped');
      });
      s.classList.add('tapped');
    });
  });

  /* --- Finale: typewriter + petals (starts when section visible once) --- */
  var finale = document.getElementById('finale');
  var finaleText = document.getElementById('finaleText');
  var petalsCanvas = document.getElementById('petals');
  var finaleStarted = false;
  var finaleMessage = 'я не знал, как сказать.\nпоэтому сделал это.';
  var petalsRunning = false;

  function typeWriter(text, el, speed) {
    var i = 0;
    el.textContent = '';
    el.classList.add('typing');

    function tick() {
      if (i < text.length) {
        el.textContent += text.charAt(i) === '\n' ? '\n' : text.charAt(i);
        i++;
        setTimeout(tick, speed);
      } else {
        el.classList.remove('typing');
      }
    }

    tick();
  }

  function startPetals() {
    if (!petalsCanvas || petalsRunning || reducedMotion) return;
    petalsRunning = true;

    var ctx = petalsCanvas.getContext('2d');
    var w = petalsCanvas.width = finale.offsetWidth;
    var h = petalsCanvas.height = finale.offsetHeight;
    var items = [];
    var colors = ['rgba(255,255,255,0.55)', 'rgba(255,255,255,0.35)', 'rgba(168,184,154,0.65)', 'rgba(255,220,220,0.4)'];

    for (var i = 0; i < 35; i++) {
      items.push({
        x: Math.random() * w,
        y: Math.random() * h - h,
        size: 3 + Math.random() * 6,
        speed: 0.5 + Math.random() * 1.4,
        drift: -0.6 + Math.random() * 1.2,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: -0.02 + Math.random() * 0.04,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);

      items.forEach(function (p) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.beginPath();
        ctx.fillStyle = p.color;
        ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        p.y += p.speed;
        p.x += p.drift;
        p.rot += p.rotSpeed;

        if (p.y > h + 12) {
          p.y = -12;
          p.x = Math.random() * w;
        }
      });

      requestAnimationFrame(draw);
    }

    draw();
  }

  function startFinale() {
    if (finaleStarted) return;
    finaleStarted = true;
    finale.classList.add('active');
    typeWriter(finaleMessage, finaleText, reducedMotion ? 0 : 55);
    startPetals();
  }

  if (finale && 'IntersectionObserver' in window) {
    var finaleObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          startFinale();
          finaleObs.disconnect();
        }
      });
    }, { threshold: 0.35 });
    finaleObs.observe(finale);
  }

  /* --- Init --- */
  initIntroParticles();
  initTouchSparkles();
  initPoetry();
})();
