$(document).ready(function() {
    $('.alert').alert();

    const showProcess = (arrow, process) => {
        if (window.matchMedia('(max-width: 768px)').matches) {
            $(arrow).removeClass('fa-arrow-right').addClass('fa-arrow-down').css({'margin-bottom': '30px'});
        }

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
        $('#user-review, #reset-button').hide();
        $('#get-hired-button, #hire-button, #intention, .how-it-works-container').show();

        $('.process, #approved-text').css({'display': 'none'});

        $('.process .fa-arrow-right, .fa-arrow-down, .process-div').css({'opacity': 0});

        $('.dots').css({'visibility': 'visible'});
        $('#intention').text('What do you want to do?');
    }

    setTimeout(() => {
        loopDots();

        setInterval(function() {
            loopDots();    
        }, 1550);
    }, 500);

    $('#list-title, #user-verified-review, #search-listing, #offer-input, #client-verified-review').on('focus', function() {
        $(this).tooltip('hide');
    });

    $('#get-hired-button').on('click', function() {
        $(this).hide();
        $('#hire-button').hide();
        $('#reset-button').show().on('click', function() {
            resetProcess();
        });

        $('#intention').text('I want to work');

        $('#get-hired').css({'display': 'flex'});

        setTimeout(() => {
            $('#list-profile').css({'opacity': '1'});
        }, 250);

        $('#list-button').on('click', function() {
            if ($('#list-title').val() !== '') {
                showProcess('.arrow1', '#accept-offer');
            } else {
                $('#list-title').tooltip({
                    trigger: 'manual',
                    title: 'Required',
                    placement: 'top'
                }).tooltip('show');
            }
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
                if (window.matchMedia('(max-width: 768px)').matches) {
                    $('.arrow4').removeClass('fa-arrow-right').addClass('fa-arrow-down').css({'margin-bottom': '30px'});
                }

                $('.arrow4').css({'opacity': 1});
            }, 3250);

            setTimeout(() => {
                $('#user-submit-review').css({'opacity': 1});
            }, 3500);
        });

        $('#user-submit-review-button').on('click', function() {
            if ($('#user-verified-review').val() !== '') {
                $('.process').hide();

                $('#user-review').css({'display': 'block'});
                $('.how-it-works-container, #intention').hide();
            } else {
                $('#user-verified-review').tooltip({
                    trigger: 'manual',
                    title: 'required',
                    placement: 'top'
                }).tooltip('show');
            }
        });
    });

    $('#hire-button').on('click', function() {
        $(this).hide();
        $('#get-hired-button').hide();
        $('#reset-button').show().on('click', function() {
            resetProcess();
        });

        $('#intention').text('I want to hire');

        $('#hire').css({'display': 'flex'});

        setTimeout(() => {
            $('#search-profile').css({'opacity': '1'});
        }, 250);

        $('#search-button').on('click', function() {
            if ($('#search-listing').val() !== '') {
                showProcess('.arrow1', '#make-offer');
            } else {
                $('#search-listing').tooltip({
                    trigger: 'manual',
                    title: 'Required',
                    placement: 'top'
                }).tooltip('show');
            }
        });

        $('#make-offer-button').on('click', function() {
            if ($('#offer-input').val() !== '') {
                setTimeout(() => {
                    showProcess('.arrow2', '#awaiting-acceptance');
                }, 250);

                setTimeout(() => {
                    $('#accepted-text').css({'display': 'flex'});
                    $('.dots').css({'visibility': 'hidden'});
                }, 3000);

                setTimeout(() => {
                    if (window.matchMedia('(max-width: 768px)').matches) {
                        $('.arrow3').removeClass('fa-arrow-right').addClass('fa-arrow-down').css({'margin-bottom': '30px'});
                    }

                    $('.arrow3').css({'opacity': 1});
                }, 3250);

                setTimeout(() => {
                    $('#client-job-complete').css({'opacity': 1});
                }, 3500);
            } else {
                $('#offer-input').tooltip({
                    trigger: 'manual',
                    title: 'Required',
                    placement: 'top'
                }).tooltip('show');
            }
        });

        $('#client-job-complete-button').on('click', function() {
            showProcess('.arrow4', '#client-submit-review');
        });

        $('#client-submit-review-button').on('click', function() {
            if ($('#client-verified-review').val() !== '') {
                $('.process').hide();

                $('.how-it-works-container, #intention').hide();

                $('#user-review').css({'display': 'block'});
            } else {
                $('#client-verified-review').tooltip({
                    trigger: 'manual',
                    title: 'Required',
                    placement: 'top'
                }).tooltip('show');
            }
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

    $('#mobile-nav-button').on('click', function() {
        if ($('#mobile-nav').hasClass('hide')) {
            $('#mobile-nav-button i').removeClass('fa-bars').addClass('fa-times');
            $('#mobile-nav').removeClass('hide').addClass('show');
        } else {
            $('#mobile-nav-button i').addClass('fa-bars').removeClass('fa-times');
            $('#mobile-nav').removeClass('show').addClass('hide');
        }
    });

    $('#mobile-home-link').on('click', function() {
        location.href = '/';
    });
    
    $('#mobile-pricing-link').on('click', function() {
        location.href = '/pricing';
    });
    
    $('#mobile-how-link').on('click', function() {
        location.href = '/how-it-works';
    });

    $('#mobile-faq-link').on('click', function() {
        location.href = '/faq';
    });
    
    $('#mobile-login-link').on('click', function() {
        location.href = '/app/login';
    });
    
    $('#mobile-register-link').on('click', function() {
        location.href = '/register';
    });
});