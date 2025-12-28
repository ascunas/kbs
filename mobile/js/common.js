(function () {
  "use strict";

  if (!window.parent || !window.parent.postMessage) return;

  var wrap;

  function sendHeight() {
    if (!wrap) return;

    var height = wrap.offsetHeight;

    window.parent.postMessage(
      {
        type: "IFRAME_HEIGHT",
        height: height
      },
      "*"
    );
  }

  function init() {
    wrap = document.getElementById("iframe-wrap");
    if (!wrap) return;

    // 최초 로드
    sendHeight();

    // 브라우저 리사이즈 시 재계산
    window.addEventListener("resize", function () {
      setTimeout(sendHeight, 50);
    });
  }

  if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(init, 0);
  } else {
    document.addEventListener("DOMContentLoaded", init);
  }

})();


/* ----------------------------
    탭
----------------------------- */
jQuery(function ($) {
    $(".tab-btn").on("click", function () {

        $(".tab-btn").removeClass("active");
        $(this).addClass("active");

        var target = $(this).data("target");

        $(".tab-content").hide();
        $(target).fadeIn(150);
    });
});