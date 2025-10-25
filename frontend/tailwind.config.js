/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
  	extend: {
  		fontFamily: {
  			sans: ['Poppins', 'Lato', 'sans-serif'],
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			primary: {
  				DEFAULT: '#F8BBD0',
  				50: '#FEF5F8',
  				100: '#FDEAF0',
  				200: '#FCD5E1',
  				300: '#FAC0D2',
  				400: '#F9ABC3',
  				500: '#F8BBD0',
  				600: '#F596B4',
  				700: '#F27198',
  				800: '#EF4C7C',
  				900: '#EC2760',
  			},
  			secondary: {
  				DEFAULT: '#E1BEE7',
  				50: '#FAF6FB',
  				100: '#F5EDF7',
  				200: '#EBDBEF',
  				300: '#E1C9E7',
  				400: '#D7B7DF',
  				500: '#E1BEE7',
  				600: '#D19FDD',
  				700: '#C180D3',
  				800: '#B161C9',
  				900: '#A142BF',
  			},
  			accent: {
  				DEFAULT: '#FFCC80',
  				50: '#FFF9F0',
  				100: '#FFF3E0',
  				200: '#FFE7C1',
  				300: '#FFDBA2',
  				400: '#FFCF83',
  				500: '#FFCC80',
  				600: '#FFB84D',
  				700: '#FFA41A',
  				800: '#E68A00',
  				900: '#B36B00',
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [import("tailwindcss-animate")],
}

