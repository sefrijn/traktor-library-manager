module.exports = {
    content: ['./public/**/*.html', './src/**/*.vue'],
    darkMode: 'class',
    theme: {
        fontFamily: {
            sans: ['Mulish', 'ui-sans-serif', 'system-ui'],
        },
        extend: {
            colors: {
                neutral: {
                    50: '#DEDEDE',
                    100: '#C5C5C5',
                    200: '#A0A0A0',
                    300: '#969696',
                    400: '#777777',
                    500: '#343434',
                    600: '#2d2d2d',
                    700: '#1c1c1c',
                    800: '#131313',
                    900: '#080808',
                },

                primary: {
                    50: '#BDF3FF',
                    100: '#A7F3FF',
                    200: '#77E1F8',
                    300: '#51CFEB',
                    400: '#32B9D8',
                    500: '#2E91A7',
                    600: '#007f93',
                    700: '#0E6B80',
                    800: '#255571',
                    900: '#003E4D',
                },
                secondary: {
                    50: '#FFE7C2',
                    100: '#FFDEAD',
                    200: '#FFCC80',
                    300: '#FFBC57',
                    400: '#FFA929',
                    500: '#F3980C',
                    600: '#D68100',
                    700: '#A86500',
                    800: '#804D00',
                    900: '#523100',
                },
            },
            transitionProperty: {
                width: 'width',
                height: 'height',
            },
            boxShadow: {
                black: '0 0 3px 1px rgba(0, 0, 0, 0.25)',
                'black-lg': '0 0 6px 3px rgba(0, 0, 0, 0.25)',
            },
            fontSize: {
                xxs: '.6rem',
            },
            cursor: { 'divider-h': 'col-resize' },
            animation: {
                'pulse-fast': 'pulse 0.55s linear infinite',
            },
        },
    },
    variants: {
        extend: {
            backgroundColor: ['checked'],
            textColor: ['checked'],
        },
    },
    plugins: [require('@tailwindcss/forms')],
};
