수정 내역

<b>25.12.05</b>
- style_new.css
- /images, iframe/images 이미지들
- main_guntae_new.html <!-- 25.12.05 pointer-events: none; 처리 --> 주석 참조
- bokji_point_benepia.html <!-- 25.12.05 바로가기 버튼 추가 --> 주석 참조
- main_ot_new.html <!-- 25.12.05 추가 50시간 넘으면 class red 추가 --><!-- 25.12.05 시간외 수당 없을때 처리 --> 주석참조
- main_jikup_new.html <!-- 25.12.05 추가 말줄임 처리 class="ellipsis" --> 주석 참조
- main_daechul_new.html <!-- 25.12.05 복지안내 바로가기 버튼 추가 --> 주석 참조

<b>25.12.08</b>
- style_new.css 수정
- /images/icon_ess01.svg, /images/icon_ess02.svg, /images/icon_mss02.svg 추가
- /iframe/images/icon_global.svg 추가, iframe/images/icon_member.svg 추가
- ess 내부 iframe 파일들 공통적으로 body에 class 추가
- mss 관련 html 파일 추가
- common.js iframe 높이계산 관련 수정
- 로그인 추가
- 근무자 현황 mss-link-hyunwon 클릭 이벤트 스타일 추가 style_new.css 수정

<b>25.12.09</b>

근무자현황과 해외근무자현황을 가로로 배치하는 별도 레이아웃
- /iframe/mss_main_new2.html

datepicker 적용
- iframe/mss_overseas_new.html (해외근무자현황)
- iframe/js/bootstrap-datepicker.min.js 추가
- iframe/js/bootstrap-datepicker.ko.min.js 추가
- iframe/css/bootstrap-datepicker.css 추가
- iframe/css/bootstrap-datepicker.css.map 추가
- iframe/css/style_new.css 수정
- iframe/images/icon_calendar.svg 추가

<b>25.12.10</b>

iframe 외부 클릭시 datepicker 닫히는 기능 추가
- mss 부모창과 모든 iframe 페이지 내 관련 script 추가
- iframe/css/style_new.css 수정
- 출장자 특파원 hover 스타일 추가 (mss-link-hyunwon 추가)


<b>25.12.20</b>

로그인 ie모드 대응
- 이미지 추가<br>
login/images/icon_notice.jpg<br>
login/images/login_bg.png<br>
login/images/login_bg.jpg<br>
login/images/login_id.jpg<br>
login/images/login_pw.jpg<br>
login/images/login_logo.png
- css 수정
login/css/login.css

ess_main_new.html / mss_main_new.html ie모드 대응
- head tag 내부 소스 변경
- js/jquery-3.6.0.js 추가
- iframe에 scrolling="no" 추가
images/icon_ess02.jpg 추가

iframe내 모든 페이지 ie모드 대응
- head tag 내부 소스 변경 (모든 페이지 통일)
- body 안에 소스 전부 [div id="iframe-wrap"></div] 감싸줌 (모든 페이지 통일)
- iframe/css/style.css 수정
- iframe/js/common.js 수정

복지지원금 화면 수정
- bokji_point_benepia.html
- bokji_point_benepia_onerror.html

<b>25.12.30</b>

로그인 에러 페이지 추가 
- login_error.html 추가
- login.css 수정

<b>26.01.04</b>

index.html
- header 수정
- menu aside 태그에  aria-hidden="true" 속성 추가
- 결재상태 class="chip" -> class="status" 수정

근태내역, 신청, 상세 추가 / 출장내역, 신청 추가 / FAQ 추가

<b>26.01.05</b>

ess 좌측 트리메뉴 하단 짤림 방지
- iframe/css/style_new.css 수정
