/* ----------------------------
    성능 최적화 전역 변수
----------------------------- */
let resizeScheduled = false;

/* ----------------------------
    최종 높이 계산
----------------------------- */
function calculateHeight() {
    requestAnimationFrame(() => {
        const height = document.documentElement.getBoundingClientRect().height;

        parent.postMessage({
            type: "iframeHeight",
            height: height
        }, "*");

        resizeScheduled = false;
    });
}

/* ----------------------------
    idle 시간에 실행 예약
----------------------------- */
function scheduleHeightUpdate() {
    if (resizeScheduled) return;
    resizeScheduled = true;

    if (window.requestIdleCallback) {
        requestIdleCallback(calculateHeight, { timeout: 150 });
    } else {
        setTimeout(calculateHeight, 50);
    }
}

/* ----------------------------
    jQuery DOM 준비 완료
----------------------------- */
$(function () {
    // 초기 업데이트
    scheduleHeightUpdate();

    // DOM 변경 감지
    const target = document.body;
    if (target) {
        const mo = new MutationObserver(() => {
            scheduleHeightUpdate();
        });

        mo.observe(target, {
            childList: true,
            subtree: true,
            attributes: true
        });
    }
});

/* ----------------------------
    window load 이벤트
----------------------------- */
$(window).on("load", function () {
    scheduleHeightUpdate();
});

/* ----------------------------
    부모 메시지 수신
----------------------------- */
$(window).on("message", function (e) {
    const data = e.originalEvent.data;
    if (data && data.type === "requestHeight") {
        scheduleHeightUpdate();
    }
});



/* ----------------------------
    탭
----------------------------- */
$(function () {
    $(".tab-btn").on("click", function () {

        $(".tab-btn").removeClass("active");
        $(this).addClass("active");

        const target = $(this).data("target");

        $(".tab-content").hide();
        $(target).fadeIn(150);
    });
});