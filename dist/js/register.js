$(document).ready(function() {
    $('#register-form').on('submit', function(e) {
        e.preventDefault();

        $('#register-button').attr('disabled', true).html(`<i class='fas fa-circle-notch fa-spin fa-lg text-white'> </i>`);

        $.post({
            url: '/api/auth/register',
            data: $(this).serialize(),
            success: resp => {
                if (resp.status === 'success') {
                    location.href = '/register/success';
                } else if (resp.status === 'error') {
                    let error = $('<div>').attr('id', 'alert').addClass('alert-error').css({'position': 'absolute', 'bottom': '10px', 'left': '10px'}).text(resp.statusMessage);

                    $('#main-panel').append(error);
                    $('#register-button').attr('disabled', false).html('Submit');

                    setTimeout(function() {
                        error.remove();
                    }, 2000);
                }
            }
        });
    });

    const region = {
        'Canada': ['British Columbia', 'Alberta', 'Saskatchewan', 'Manitoba', 'Ontario', 'Newfoundland', 'New Brunswick', 'Prince Edward Island', 'Yukon Territory', 'Northwest Territory', 'Quebec', 'Nova Scotia'],
        'United States': [
            'Alabama', 'Alaska', 'American Samoa', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'District of Columbia', 'Florida', 'Georgia', 'Guam', 'Hawaii', 'Idaho', 'Illinois',
            'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Marshall Islands', 'Massachusetts', 'Michigan', 'Micronesia', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska',
            'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Northern Mariana Islands', 'Ohio', 'Oklahoma', 'Oregon', 'Palau', 'Pennsylvania', 'Puerto Rico', 'Rhode Island', 'South Carolina',
            'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virgin Islands', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming', 'Armed Forces Americas', 'Armed Forces Europe, Canada, Africa, and Middle East', 'Armed Forces Pacific'
        ],
        'Mexico': [
            'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas', 'Chihuahua', 'Ciudad de México', 'Coahuila de Zaragoza', 'Colima', 'Durango', 'Estado de México', 'Guanajuato',
            'Guerrero', 'Hidalgo', 'Jalisco', 'Michoacán de Ocampo', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca', 'Puebla', 'Querétaro de Arteaga', 'Quintana Roo', 'San Luis Potosí',
            'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz de Ignacio de la', 'Yucatán', 'Zacatecas'
        ]
    }

    $('#reg-country').on('change', function() {
        $('#reg-region').empty();
        $('#reg-region').append('<option>');

        for (let val of region[$(this).val()]) {
            $('#reg-region').append(
                $('<option>').attr('value', val).text(val)
            )
        }
    });
});