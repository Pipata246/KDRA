(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- Global copy protection --- */
  function initCopyProtection() {
    function blockDefault(e) {
      e.preventDefault();
    }

    ['copy', 'cut', 'selectstart', 'contextmenu', 'dragstart'].forEach(function (eventName) {
      document.addEventListener(eventName, blockDefault);
    });

    document.addEventListener('keydown', function (e) {
      var key = (e.key || '').toLowerCase();
      if ((e.ctrlKey || e.metaKey) && (key === 'c' || key === 'x' || key === 'a')) {
        e.preventDefault();
      }
    });
  }

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
          heartReveal.textContent = 'пусть этот день рождения будет самым теплым и счастливым.';
        }, 900);
      }
    });
  });

  /* --- Envelope: выкатывание + открытие --- */
  var envelope = document.getElementById('envelope');
  var envelopeHint = document.getElementById('envelopeHint');
  var envelopeSection = document.getElementById('envelopeSection');

  if (envelopeSection && envelope) {
    var rollStarted = false;

    function enableEnvelope() {
      envelopeSection.classList.add('is-ready');
      envelope.classList.add('is-ready');
      envelope.disabled = false;
    }

    if ('IntersectionObserver' in window) {
      var rollObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !rollStarted) {
            rollStarted = true;
            envelopeSection.classList.add('is-visible');
            setTimeout(enableEnvelope, 1350);
            rollObs.disconnect();
          }
        });
      }, { threshold: 0.35 });
      rollObs.observe(envelopeSection);
    } else {
      envelopeSection.classList.add('is-visible');
      enableEnvelope();
    }

    envelope.addEventListener('click', function (e) {
      if (!envelope.classList.contains('is-ready') || envelope.classList.contains('open')) return;
      envelope.classList.add('open');
      if (envelopeHint) envelopeHint.classList.add('hidden');
      heartBurst(e.clientX, e.clientY);
      setTimeout(function () {
        envelope.classList.add('flap-done');
      }, 1150);
      setTimeout(function () {
        envelope.classList.add('letter-out');
      }, 1450);
    });
  }

  /* --- Scatter is static (no interactions) --- */
  document.querySelectorAll('.scatter').forEach(function (s) {
    s.classList.add('play');
  });

  /* --- Constellation --- */
  var constellationSection = document.getElementById('constellationSection');
  var constellationText = document.getElementById('constellationText');
  var constellationCounter = document.getElementById('constellationCounter');
  var constellationBoard = document.querySelector('.constellation-board');
  var starBtns = document.querySelectorAll('.star-btn');

  if (constellationSection && constellationBoard && starBtns.length) {
    var litStars = 0;
    var litStarIds = {};
    var constellationLines = constellationBoard.querySelectorAll('.constellation-line');

    function updateConstellationLines() {
      constellationLines.forEach(function (line) {
        var from = line.getAttribute('data-from');
        var to = line.getAttribute('data-to');
        var shouldShow = !!(litStarIds[from] && litStarIds[to]);
        line.classList.toggle('active', shouldShow);
      });
    }

    starBtns.forEach(function (star) {
      star.addEventListener('click', function () {
        if (star.classList.contains('lit')) return;

        var starId = star.getAttribute('data-star');
        star.classList.add('lit');
        if (starId) litStarIds[starId] = true;
        litStars++;
        updateConstellationLines();

        if (constellationText) {
          constellationText.textContent = star.getAttribute('data-msg');
          constellationText.classList.remove('show');
          void constellationText.offsetWidth;
          constellationText.classList.add('show');
        }

        if (constellationCounter) {
          constellationCounter.textContent = 'зажжено: ' + litStars + ' из ' + starBtns.length;
        }

        var rect = star.getBoundingClientRect();
        heartBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);

        if (litStars === starBtns.length) {
          constellationSection.classList.add('complete');
          setTimeout(function () {
            if (constellationText) {
              constellationText.textContent = 'все пожелания сегодня только для тебя';
              constellationText.classList.add('show');
            }
          }, reducedMotion ? 0 : 500);
        }
      });
    });
  }

  /* --- Vow seal (press and hold) --- */
  var vowSection = document.getElementById('vowSection');
  var vowSeal = document.getElementById('vowSeal');
  var vowFill = document.getElementById('vowFill');
  var vowText = document.getElementById('vowText');

  if (vowSection && vowSeal && vowFill) {
    var holdDuration = reducedMotion ? 350 : 1800;
    var holdStart = 0;
    var holdRaf = null;
    var vowDone = false;

    function setVowProgress(value) {
      var clamped = Math.max(0, Math.min(100, value));
      vowFill.style.transform = 'scaleX(' + (clamped / 100) + ')';
    }

    function finishVow() {
      vowDone = true;
      if (holdRaf) {
        cancelAnimationFrame(holdRaf);
        holdRaf = null;
      }

      setVowProgress(100);
      vowSeal.classList.remove('is-holding');
      vowSeal.classList.add('done');
      vowSeal.textContent = 'навсегда';
      vowSection.classList.add('done');

      if (vowText) {
        vowText.innerHTML = 'с днем рождения, моя любимая.<br>обещаю беречь тебя и радовать каждый день.';
        vowText.classList.add('show');
      }

      var sealRect = vowSeal.getBoundingClientRect();
      heartBurst(sealRect.left + sealRect.width / 2, sealRect.top + sealRect.height / 2);
    }

    function resetVowHold() {
      if (vowDone) return;

      if (holdRaf) {
        cancelAnimationFrame(holdRaf);
        holdRaf = null;
      }

      holdStart = 0;
      vowSeal.classList.remove('is-holding');
      setVowProgress(0);
    }

    function holdStep(ts) {
      if (!holdStart) holdStart = ts;
      var elapsed = ts - holdStart;
      var progress = (elapsed / holdDuration) * 100;
      setVowProgress(progress);

      if (progress >= 100) {
        finishVow();
        return;
      }

      holdRaf = requestAnimationFrame(holdStep);
    }

    function startVowHold(e) {
      if (vowDone || holdRaf) return;
      if (e.cancelable) e.preventDefault();

      vowSeal.classList.add('is-holding');
      holdStart = 0;
      holdRaf = requestAnimationFrame(holdStep);
    }

    vowSeal.addEventListener('pointerdown', startVowHold);
    window.addEventListener('pointerup', resetVowHold);
    window.addEventListener('pointercancel', resetVowHold);

    vowSeal.addEventListener('keydown', function (e) {
      if (vowDone) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        finishVow();
      }
    });
  }

  /* --- Finale: typewriter + petals (starts when section visible once) --- */
  var finale = document.getElementById('finale');
  var finaleText = document.getElementById('finaleText');
  var petalsCanvas = document.getElementById('petals');
  var finaleStarted = false;
  var finaleMessage = 'с днем рождения, моя хорошая.\n25.06 — твой день, и я счастлив любить тебя даже на расстоянии.';
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
  initCopyProtection();
  initIntroParticles();
  initTouchSparkles();
  initPoetry();
})();
