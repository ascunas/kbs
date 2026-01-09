/*!
 * common.js - jQuery 1.8 + cap.js(document.write) 호환
 *
 * =========================
 * 사용 규칙
 * =========================
 * 1) 높이 자동 스크롤 영역:
 *    - <main class="fn-height"> ... </main>
 *
 * 2) 헤더 스크롤 상태:
 *    - window 또는 .fn-height 스크롤이 10px 넘으면 .app-header에 "is-scrolled" 자동 토글
 *
 * 3) 메뉴:
 *    - 열기 버튼: [data-menu-toggle]
 *    - 닫기 버튼: [data-menu-close] 또는 .menu-close
 *    - 메뉴 패널: .menu-panel (aria-hidden은 공통에서 관리)
 *
 * 4) 모달(접근성 포함, 중첩 가능):
 *    - 열기:  .fn-modal-open[data-target="모달ID"]
 *    - 닫기:  .fn-modal-close
 *    - 모달:  <div id="xxx" class="modal" aria-hidden="true">...</div>
 *    - 모달 안 첫 포커스: [autofocus] (없으면 첫 번째 focusable로 자동 이동)
 *
 * 5) 탭:
 *    - 탭 버튼: .fn-tabs .tab-button[data-tab="A"]
 *    - 콘텐츠: 같은 section 안 [data-tab-content="A"]
 *
 * 6) 아코디언:
 *    - .fn-accordion .accordion-item
 *    - .accordion-header + .accordion-content
 *
 * 7) 툴팁:
 *    - .tooltip-target[data-tooltip="내용"]
 *
 * 8) 드롭다운:
 *    - .fn-dropdown .dropdown-toggle + .dropdown-menu
 *
 * 9) 동적 DOM(ajax/탭전환/append 등) 후
 *    - UI.refresh();   // 레이아웃/스크롤바인딩/플러그인 재초기화
 *
 * =========================
 * 공통 API 
 * =========================
 * - UI.refresh()                : 레이아웃/스크롤상태/플러그인 재초기화
 * - UI.modal.open('modalId', $triggerOptional)
 * - UI.modal.close()
 * - UI.menu.open() / UI.menu.close()
 */

(function ($, window, document) {
  'use strict';

  /* ---------- 유틸 ---------- */
  function raf(fn) {
    if (window.requestAnimationFrame) return window.requestAnimationFrame(fn);
    return window.setTimeout(fn, 16);
  }

  function throttle(fn, wait) {
    var last = 0, timer = null;
    return function () {
      var now = +new Date();
      var remain = wait - (now - last);
      var ctx = this, args = arguments;

      if (remain <= 0) {
        if (timer) { clearTimeout(timer); timer = null; }
        last = now;
        fn.apply(ctx, args);
      } else if (!timer) {
        timer = setTimeout(function () {
          last = +new Date();
          timer = null;
          fn.apply(ctx, args);
        }, remain);
      }
    };
  }

  function animateScrollLeft(container, targetLeft) {
    var start = container.scrollLeft;
    var change = targetLeft - start;
    if (!change) return;
    var duration = 250;
    var startTime = +new Date();

    function easeInOutQuad(t) {
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    function step() {
      var now = +new Date();
      var elapsed = now - startTime;
      var progress = Math.min(elapsed / duration, 1);
      container.scrollLeft = start + (change * easeInOutQuad(progress));
      if (progress < 1) raf(step);
    }

    raf(step);
  }

  // active tab 가운데로 보내기
  function centerTabInView($container, $btn) {
    var container = $container[0];
    var button = $btn[0];
    if (!container || !button) return;
    var containerWidth = container.clientWidth;
    var scrollWidth = container.scrollWidth;
    if (scrollWidth <= containerWidth) return;

    var targetLeft = button.offsetLeft + (button.offsetWidth / 2) - (containerWidth / 2);
    var maxScroll = scrollWidth - containerWidth;
    if (targetLeft < 0) targetLeft = 0;
    if (targetLeft > maxScroll) targetLeft = maxScroll;

    animateScrollLeft(container, targetLeft);
  }

  // tab Overflow 감지
  function updateTabOverflow($container) {
    var container = $container[0];
    if (!container) return false;
    var hasOverflow = container.scrollWidth > container.clientWidth + 1;
    $container.toggleClass('has-overflow', hasOverflow);
    if (!hasOverflow) {
      container.scrollLeft = 0;
    }
    return hasOverflow;
  }

  function hasNativeInert() {
    return 'inert' in document.createElement('div');
  }

  function getFocusable($root) {
    return $root
      .find('a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex], [contenteditable]')
      .filter(':visible')
      .filter(function () { return $(this).attr('tabindex') !== '-1'; });
  }

  /* ---------- DOM 캐시(cap.js document.write 대응) ---------- */
  var $window = $(window);
  var $document = $(document);

  var $appShell = $();
  var $header = $();
  var $footer = $();

  function refreshCache() {
    $appShell = $('.app-shell');
    $header = $('.app-header');
    $footer = $('.footer-action');
  }

  /* ---------- UI 플러그인 ---------- */
  (function definePlugins() {
    // 탭
    $.fn.tabPlugin = function () {
      return this.each(function () {
        var $container = $(this);
        if ($container.data('tabInit')) return;
        $container.data('tabInit', true);

        var $buttons = $container.find('.tab-button');
        var $section = $container.closest('section');
        var $contents = $section.find('[data-tab-content]');

        $container.on('click', '.tab-button', function (e) {
          e.preventDefault();
          var $btn = $(this);
          var id = $btn.data('tab');
          var $target = $contents.filter('[data-tab-content="' + id + '"]');
          if (!$target.length || $btn.hasClass('active')) return;

          $buttons.removeClass('active').attr('aria-selected', 'false');
          $contents.removeClass('active').attr('aria-hidden', 'true').hide();

          $btn.addClass('active').attr('aria-selected', 'true');
          raf(function () {
            if (updateTabOverflow($container)) {
              centerTabInView($container, $btn);
            }
          });

          $target.stop(true, true).fadeIn(150, function () {
            $target.addClass('active').attr('aria-hidden', 'false');
            $document.trigger('dom:contentChanged.ui');
          });
        });

        // 초기 탭 보정
        if (!$buttons.filter('.active').length && $buttons.length) {
          $buttons.first().addClass('active').attr('aria-selected', 'true');
        }

        var $active = $buttons.filter('.active').first();
        var activeId = $active.data('tab');

        $contents.hide().attr('aria-hidden', 'true').removeClass('active');
        if (activeId !== undefined) {
          $contents.filter('[data-tab-content="' + activeId + '"]')
            .show().attr('aria-hidden', 'false').addClass('active');
        }

        raf(function () {
          if (updateTabOverflow($container)) {
            centerTabInView($container, $active);
          }
        });

        $window.on('resize.tabOverflow', throttle(function () {
          updateTabOverflow($container);
        }, 150));

        $document.on('dom:contentChanged.ui', function () {
          updateTabOverflow($container);
        });
      });
    };

    // 아코디언
    $.fn.accordionPlugin = function (options) {
      var settings = $.extend({ oneOpen: true, speed: 300 }, options);

      return this.each(function () {
        var $acc = $(this);
        if ($acc.data('accInit')) return;
        $acc.data('accInit', true);

        $acc.on('click', '.accordion-header', function (e) {
          e.preventDefault();

          var $h = $(this);
          var $item = $h.closest('.accordion-item');
          var $content = $h.next('.accordion-content');
          if (!$content.length) return;

          if (settings.oneOpen) {
            $acc.find('.accordion-item').not($item).removeClass('active')
              .find('.accordion-content').stop(true, true).slideUp(settings.speed);
          }

          if ($item.hasClass('active')) {
            $item.removeClass('active');
            $content.stop(true, true).slideUp(settings.speed);
          } else {
            $item.addClass('active');
            $content.stop(true, true).slideDown(settings.speed);
          }

          $document.trigger('dom:contentChanged.ui');
        });

        // 초기 상태(active만 열기)
        $acc.find('.accordion-item').each(function () {
          var $it = $(this);
          var $ct = $it.find('.accordion-content').first();
          if (!$ct.length) return;
          if ($it.hasClass('active')) $ct.show();
          else $ct.hide();
        });
      });
    };

    // 툴팁
    $.fn.tooltipPlugin = function () {
      var $tooltip = $('#__ui_tooltip__');
      if (!$tooltip.length) $tooltip = $('<div id="__ui_tooltip__" class="tooltip-box"></div>').appendTo('body');

      return this.each(function () {
        var $t = $(this);
        if ($t.data('tipInit')) return;
        $t.data('tipInit', true);

        $t.on('mouseenter.tooltip mousemove.tooltip', function (e) {
          var text = $t.data('tooltip') || '';
          if (!text) return;
          $tooltip.text(text).show().css({ top: e.pageY + 10, left: e.pageX + 10 });
        }).on('mouseleave.tooltip', function () {
          $tooltip.hide();
        });
      });
    };

    // 드롭다운
    $.fn.dropdownPlugin = function () {
      return this.each(function () {
        var $dd = $(this);
        if ($dd.data('ddInit')) return;
        $dd.data('ddInit', true);

        var $menu = $dd.find('.dropdown-menu').first();

        $dd.on('click', '.dropdown-toggle', function (e) {
          e.preventDefault();
          e.stopPropagation();
          $('.dropdown-menu').not($menu).slideUp(150);
          $menu.stop(true, true).slideToggle(150);
        });

        $(document).on('click.dropdownClose', function () {
          $menu.stop(true, true).slideUp(150);
        });
      });
    };
  })();

  function initUiPlugins() {
    $('.fn-tabs').tabPlugin();
    $('.fn-accordion').accordionPlugin();
    $('.tooltip-target').tooltipPlugin();
    $('.fn-dropdown').dropdownPlugin();
  }

  /* ---------- 레이아웃/헤더 스크롤 ---------- */
  var SELECTOR_SCROLLABLE = '.fn-height';
  var HEADER_SCROLLED_CLASS = 'is-scrolled';

  function updateLayout() {
    var $targets = $(SELECTOR_SCROLLABLE);
    if (!$targets.length) return;

    raf(function () {
      refreshCache();

      var viewport = $window.height();
      var capHeight = $('#cap').outerHeight(true) || 0;
      var headerHeight = $header.length ? ($header.outerHeight(true) || 0) : 0;
      var footerHeight = $footer.length ? ($footer.outerHeight(true) || 0) : 0;

      var available = viewport - capHeight - headerHeight - footerHeight;
      if (available < 0) available = 0;

      $targets.css({
        height: available + 'px',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch'
      });

      checkHeaderStatus();
      bindScrollableScroll();
    });
  }

  function checkHeaderStatus() {
    refreshCache();
    if (!$header.length) return;

    var threshold = 10;
    var isScrolled = false;

    if ($window.scrollTop() > threshold) {
      isScrolled = true;
    } else {
      var $visible = $(SELECTOR_SCROLLABLE + ':visible');
      for (var i = 0; i < $visible.length; i++) {
        if ($visible.eq(i).scrollTop() > threshold) { isScrolled = true; break; }
      }
    }

    $header.toggleClass(HEADER_SCROLLED_CLASS, isScrolled);
  }

  /* ---------- 메뉴 ---------- */
  var MENU_ANIM = 300;

  function ensureMenuScrim() {
    var $scrim = $('.menu-scrim');
    if ($scrim.length) return $scrim;

    refreshCache();
    var $container = ($appShell && $appShell.length) ? $appShell : $('body');

    $scrim = $('<div class="menu-scrim" aria-hidden="true"></div>').appendTo($container);
    if ($scrim.length && $scrim[0]) $scrim[0].offsetWidth; // 트랜지션용 리플로우
    return $scrim;
  }

  function isMenuOpen() {
    refreshCache();
    return $appShell.length && $appShell.hasClass('menu-open');
  }

  function openMenu() {
    refreshCache();
    var $menuPanel = $('.menu-panel');
    var $menuBtn = $('[data-menu-toggle]');

    ensureMenuScrim().addClass('show');

    $appShell.addClass('menu-open');
    $menuBtn.attr('aria-expanded', 'true');
    $menuPanel.attr('aria-hidden', 'false');

    $('body').css('overflow', 'hidden');

    setTimeout(function () {
      $menuPanel.find('[data-menu-close], .menu-close').filter(':visible').first().focus();
    }, MENU_ANIM);
  }

  function closeMenu() {
    refreshCache();
    var $menuPanel = $('.menu-panel');
    var $menuBtn = $('[data-menu-toggle]');
    var $scrim = $('.menu-scrim');

    // aria-hidden 적용 전, 포커스를 먼저 밖으로
    var activeEl = document.activeElement;
    if (activeEl && $(activeEl).closest('.menu-panel').length) {
      $menuBtn.first().focus();
    }

    $appShell.removeClass('menu-open');
    $menuBtn.attr('aria-expanded', 'false');
    $menuPanel.attr('aria-hidden', 'true');

    $scrim.removeClass('show');

    setTimeout(function () {
      $scrim.remove();
      if (!Modal.isAnyOpen()) $('body').css('overflow', '');
      $menuBtn.first().focus();
    }, MENU_ANIM);
  }

  /* ---------- 모달(중첩 + a11y 경고 해결) ---------- */
  var Modal = (function () {
    var SUPPORT_INERT = hasNativeInert();
    var z = 1000;
    var stack = [];

    function isAnyOpen() { return stack.length > 0; }
    function get$TopModal() { return stack.length ? $(stack[stack.length - 1]) : $(); }

    function setInert($el, on) {
      if (!SUPPORT_INERT || !$el || !$el.length) return;
      if (on) $el.attr('inert', '');
      else $el.removeAttr('inert');
    }

    function safeFocusFallback() {
      var $t = $('.app-header .title:visible').first();
      if ($t.length) {
        if (!$t.attr('tabindex')) $t.attr('tabindex', '-1');
        $t.focus();
      } else {
        document.body.focus();
      }
    }

    function focusFirst($modal) {
      var $f = getFocusable($modal);
      if ($f.length) $f.first().focus();
      else {
        if (!$modal.attr('tabindex')) $modal.attr('tabindex', '-1');
        $modal.focus();
      }
    }

    // 배경(.app-shell 자식들) a11y 처리: 모달 있을 때만 숨김
    function updateBackgroundA11y() {
      refreshCache();
      if (!$appShell.length) return;

      var hasModal = stack.length > 0;
      var $openModals = $();
      for (var i = 0; i < stack.length; i++) $openModals = $openModals.add($(stack[i]));

      $appShell.children().each(function () {
        var $child = $(this);

        // 열린 모달은 제외
        if ($openModals.filter($child).length) {
          setInert($child, false);
          $child.attr('aria-hidden', 'false');
          return;
        }

        setInert($child, hasModal);

        if (hasModal) $child.attr('aria-hidden', 'true');
        else {
          if (!$child.is('.menu-panel')) $child.attr('aria-hidden', 'false');
        }
      });
    }

    function openById(id, $trigger) {
      var $modal = $('#' + id);
      if (!$modal.length) {
        alert('연결된 모달(ID: #' + id + ')을 찾을 수 없습니다.');
        return;
      }

      if ($trigger && $trigger.length) $modal.data('return-focus', $trigger);

      z += 1;
      $modal.css({ display: 'flex', 'z-index': z }).addClass('show');
      $modal.attr('aria-hidden', 'false');
      setInert($modal, false);

      $('body').css('overflow', 'hidden');

      stack.push($modal[0]);

      // 모달에 포커스 먼저 → 배경 aria-hidden
      setTimeout(function () {
        var $auto = $modal.find('[autofocus]').filter(':visible').first();
        if ($auto.length) $auto.focus();
        else focusFirst($modal);

        updateBackgroundA11y();
      }, 0);
    }

    // 닫기 순서
    function closeTop() {
      var $modal = get$TopModal();
      if (!$modal.length) return;

      var $trigger = $modal.data('return-focus');

      // 1) 스택에서 먼저 제거
      stack.pop();

      // 2) 배경 a11y를 먼저 복구(포커스 복귀 성공 보장)
      updateBackgroundA11y();

      // 3) 포커스 복귀
      if ($trigger && $trigger.length) $trigger.focus();
      else safeFocusFallback();

      // 시각적 닫힘
      $modal.removeClass('show');

      setTimeout(function () {
        // 4) 마지막에 모달을 숨김 처리(포커스는 이미 밖)
        var activeEl = document.activeElement;
        if (activeEl && $modal.has(activeEl).length) {
          try { activeEl.blur(); } catch (err) {}
        }

        $modal.css({ display: '', 'z-index': '' });
        $modal.attr('aria-hidden', 'true');
        setInert($modal, true);

        $modal.removeData('return-focus');

        // 중첩 모달이면 다음 top에 포커스 유지
        var $newTop = get$TopModal();
        if ($newTop.length) {
          focusFirst($newTop);
          $('body').css('overflow', 'hidden');
        } else {
          if (!isMenuOpen()) $('body').css('overflow', '');
        }
      }, 300);
    }

    function bind() {
      // 열기
      $document.off('click.uiModalOpen').on('click.uiModalOpen', '.fn-modal-open', function (e) {
        e.preventDefault();
        openById($(this).data('target'), $(this));
      });

      // 닫기 버튼: 클릭 시 포커스가 버튼에 붙는 것을 사전에 방지(마우스만)
      $document.off('mousedown.uiModalPreClose').on('mousedown.uiModalPreClose', '.fn-modal-close', function (e) {
        e.preventDefault();
      });

      // 닫기
      $document.off('click.uiModalClose').on('click.uiModalClose', '.fn-modal-close', function (e) {
        e.preventDefault();
        closeTop();
      });

      // 배경 클릭 닫기(최상단만)
      $document.off('click.uiModalOutside').on('click.uiModalOutside', '.modal', function (e) {
        if (!isAnyOpen()) return;
        if (e.target !== this) return;
        var $top = get$TopModal();
        if ($top.length && $top[0] === this) closeTop();
      });

      // ESC: 모달 > 메뉴 순
      $document.off('keydown.uiModalEsc').on('keydown.uiModalEsc', function (e) {
        if (e.keyCode !== 27) return;
        if (isAnyOpen()) closeTop();
        else if (isMenuOpen()) closeMenu();
      });

      // 포커스 트랩(Tab)
      $document.off('keydown.uiModalTrap').on('keydown.uiModalTrap', function (e) {
        if (e.keyCode !== 9) return;
        if (!isAnyOpen()) return;

        var $modal = get$TopModal();
        var $focusables = getFocusable($modal);

        if (!$focusables.length) {
          e.preventDefault();
          focusFirst($modal);
          return;
        }

        var first = $focusables.first()[0];
        var last = $focusables.last()[0];

        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); last.focus(); }
        } else {
          if (document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      });

      // 포커스가 모달 밖으로 나가면 다시 모달로
      $document.off('focusin.uiModalGuard').on('focusin.uiModalGuard', function (e) {
        if (!isAnyOpen()) return;
        var $modal = get$TopModal();
        if ($modal.has(e.target).length === 0) focusFirst($modal);
      });
    }

    return {
      init: bind,
      isAnyOpen: isAnyOpen,
      openById: openById,
      closeTop: closeTop
    };
  })();

  /* ---------- is-scrolled용 스크롤 바인딩(직접 바인딩) ---------- */
  var _tHeader = null;

  function bindScrollableScroll() {
    if (!_tHeader) return;
    $(SELECTOR_SCROLLABLE).each(function () {
      $(this).off('scroll.ui').on('scroll.ui', _tHeader);
    });
  }

  /* ---------- Loader ---------- */
  window.Loader = window.Loader || {
    id: '#loading-modal',
    statusId: '#loading-status',
    minTime: 500,
    startT: 0,
    start: function () {
      this.startT = +new Date();
      var $m = $(this.id);

      if (!$m.length) {
        $('body').append('<div id="loading-modal" class="modal" role="progressbar" aria-modal="true" aria-label="로딩 중"></div>');
        $m = $(this.id);
      }
      if (!$(this.statusId).length) {
        $('body').append('<div id="loading-status" class="blind" aria-live="polite"></div>');
      }
      if (!$m.find('.loader').length) {
        $m.html("<span class='loader' aria-hidden='true'></span>");
      }

      $(this.statusId).text('데이터를 불러오는 중입니다. 잠시만 기다려 주세요.');
      $('.app-shell').attr('aria-busy', 'true');

      $m.stop(true, true).fadeIn(200).addClass('show');
      $('body').css('overflow', 'hidden');
    },
    complete: function () {
      var diff = (+new Date()) - this.startT;
      var delay = Math.max(0, this.minTime - diff);
      var self = this;
      var $m = $(this.id);

      setTimeout(function () {
        $m.stop(true, true).fadeOut(300, function () {
          $m.removeClass('show');
          $('.app-shell').attr('aria-busy', 'false');
          $(self.statusId).text('로딩이 완료되었습니다.');
          setTimeout(function () { $(self.statusId).text(''); }, 1000);

          if (!Modal.isAnyOpen() && !isMenuOpen()) $('body').css('overflow', '');
        });
      }, delay);
    }
  };

  /* ---------- 전역 바인딩 + 개발자 API ---------- */
  function bindGlobal() {
    _tHeader = throttle(checkHeaderStatus, 50);
    var tResize = throttle(updateLayout, 100);

    $window.off('scroll.ui').on('scroll.ui', _tHeader);
    $window.off('resize.ui').on('resize.ui', tResize);

    // 메뉴
    $document
      .off('click.menu')
      .on('click.menu', '[data-menu-toggle]', function (e) {
        e.preventDefault();
        var expanded = $(this).attr('aria-expanded') === 'true';
        if (expanded) closeMenu(); else openMenu();
      })
      .on('click.menu', '[data-menu-close], .menu-close, .menu-scrim', function (e) {
        e.preventDefault();
        closeMenu();
      })
      .on('click.menu', '.menu-panel', function (e) {
        if (e.target === this) closeMenu();
      });

    // DOM 변경 후(탭 전환/동적 렌더 등) 재정리
    $document.off('dom:contentChanged.ui').on('dom:contentChanged.ui', function () {
      updateLayout();
      bindScrollableScroll();
      checkHeaderStatus();
      initUiPlugins();
    });
  }

  // 개발자용 API
  window.UI = window.UI || {};
  window.UI.refresh = function () { $document.trigger('dom:contentChanged.ui'); };
  window.UI.modal = {
    open: function (id, $trigger) { Modal.openById(id, $trigger); },
    close: function () { Modal.closeTop(); }
  };
  window.UI.menu = { open: openMenu, close: closeMenu };

  /* ---------- 초기화 ---------- */
  $(function () {
    refreshCache();

    bindGlobal();
    Modal.init();

    updateLayout();
    checkHeaderStatus();
    bindScrollableScroll();

    // datepicker가 있을 때만 초기화
    if ($.fn.datepicker) {
      $('.datepicker').datepicker({
        format: 'yyyy.mm.dd',
        language: 'ko',
        autoclose: true,
        todayHighlight: true,
        orientation: 'bottom'
      });
    }

    initUiPlugins();
  });

})(jQuery, window, document);
