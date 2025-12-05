/* ----------------------------
    성능 최적화 전역 변수
----------------------------- */
let resizeScheduled = false;

/* ----------------------------
    최종 높이 계산
----------------------------- */
function calculateHeight() {
    requestAnimationFrame(() => {
        // scrollHeight 대신 실제 렌더링 높이를 사용 (증가/감소 모두 반영)
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
    초기 실행
----------------------------- */
window.addEventListener("load", scheduleHeightUpdate);
document.addEventListener("DOMContentLoaded", scheduleHeightUpdate);

/* ----------------------------
    DOM 변동 감지
----------------------------- */
document.addEventListener("DOMContentLoaded", () => {
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
    부모에서 "requestHeight" 요청 받기
----------------------------- */
window.addEventListener("message", (e) => {
    if (e.data && e.data.type === "requestHeight") {
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