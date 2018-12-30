$(document).ready(function() {
    $('.alert').alert();

    const showProcess = (arrow, process) => {
        setTimeout(() => {
            $(arrow).css({'opacity': '1'});
        }, 250);

        setTimeout(() => {
            $(process).css({'opacity': '1'});
        }, 500);
    }

    const loopDots = () => {
        setTimeout(() => {
            $('.dot1').css({'opacity': 1});
        }, 250);

        setTimeout(() => {
            $('.dot2').css({'opacity': 1});
        }, 500);

        setTimeout(() => {
            $('.dot3').css({'opacity': 1});
        }, 750);

        setTimeout(() => {
            $('.dot1').css({'opacity': 0});
        }, 1050);

        setTimeout(() => {
            $('.dot2').css({'opacity': 0});
        }, 1300);

        setTimeout(() => {
            $('.dot3').css({'opacity': 0});
        }, 1550);
    }

    const resetProcess = () => {
        $('#user-review').hide();
        $('#get-hired-button').show();
        $('#hire-button').show();
        $('#reset-button').hide();

        $('.process').css({'display': 'none'});

        $('.process-div').css({'opacity': 0});

        $('.process .fa-arrow-right').css({'opacity': 0});

        $('.dots').css({'visibility': 'visible'});
        $('#approved-text').css({'display': 'none'});
    }

    setTimeout(() => {
        loopDots();

        setInterval(function() {
            loopDots();    
        }, 1550);
    }, 500);

    $('#get-hired-button').on('click', function() {
        $(this).hide();
        $('#hire-button').hide();
        $('#reset-button').show().on('click', function() {
            resetProcess();
        });

        $('#get-hired').css({'display': 'flex'});

        setTimeout(() => {
            $('#list-profile').css({'opacity': '1'});
        }, 250);

        $('#list-button').on('click', function() {
            showProcess('.arrow1', '#accept-offer');
        });

        $('#accept-offer-button').on('click', function() {
            showProcess('.arrow2', '#user-job-complete');
        });

        $('#user-job-complete-button').on('click', function() {
            setTimeout(() => {
                showProcess('.arrow3', '#awaiting-approval');
            }, 250);

            setTimeout(() => {
                $('#approved-text').css({'display': 'flex'});
                $('.dots').css({'visibility': 'hidden'});
            }, 3000);

            setTimeout(() => {
                $('.arrow4').css({'opacity': 1});
            }, 3250);

            setTimeout(() => {
                $('#user-submit-review').css({'opacity': 1});
            }, 3500);
        });

        $('#user-submit-review-button').on('click', function() {
            $('.process').hide();

            $('#user-review').css({'display': 'block'})
        });
    });

    $('#hire-button').on('click', function() {
        $(this).hide();
        $('#get-hired-button').hide();
        $('#reset-button').show().on('click', function() {
            resetProcess();
        });

        $('#hire').css({'display': 'flex'});

        setTimeout(() => {
            $('#search-profile').css({'opacity': '1'});
        }, 250);

        $('#search-button').on('click', function() {
            showProcess('.arrow1', '#make-offer');
        });

        $('#make-offer-button').on('click', function() {
            setTimeout(() => {
                showProcess('.arrow2', '#awaiting-acceptance');
            }, 250);

            setTimeout(() => {
                $('#accepted-text').css({'display': 'flex'});
                $('.dots').css({'visibility': 'hidden'});
            }, 3000);

            setTimeout(() => {
                $('.arrow3').css({'opacity': 1});
            }, 3250);

            setTimeout(() => {
                $('#client-job-complete').css({'opacity': 1});
            }, 3500);
        });

        $('#client-job-complete-button').on('click', function() {
            showProcess('.arrow4', '#client-submit-review');
        });

        $('#client-submit-review-button').on('click', function() {
            $('.process').hide();

            $('#user-review').css({'display': 'block'})
        });
    });

    $('#how-hire-button').on('click', function() {
        $(this).addClass('active');
        $('#how-get-hired-button').removeClass('active');
        $('#how-hire').show();
        $('#how-get-hired').hide();
    });

    $('#how-get-hired-button').on('click', function() {
        $(this).addClass('active');
        $('#how-hire-button').removeClass('active');
        $('#how-hire').hide();
        $('#how-get-hired').show();
    });

    $('#pricing-register-button').on('click', function() {
        location.href = '/register';
    });
});