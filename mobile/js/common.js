$(function () {
    var $appShell = $('.app-shell');
    var $openButtons = $('[data-menu-toggle]');
    var $closeButtons = $('[data-menu-close]');
    var $scrim = $('.menu-scrim');
    var $closeButton = $('.menu-close');

    function toggleMenu(isOpen) {
        if (!$appShell.length) {
            return;
        }
        $appShell.toggleClass('menu-open', !!isOpen);
        if (isOpen && $closeButton.length) {
            $closeButton.focus();
        }
    }

    $openButtons.on('click', function () {
        toggleMenu(true);
    });

    $closeButtons.on('click', function () {
        toggleMenu(false);
    });

    $scrim.on('click', function () {
        toggleMenu(false);
    });

    $(document).on('keyup', function (event) {
        if (event.keyCode === 27) {
            toggleMenu(false);
        }
    });
});