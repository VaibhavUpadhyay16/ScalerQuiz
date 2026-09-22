/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Poppins', 'sans-serif'],
        body: ['Inter', 'sans-serif']
      },
      colors: {
        primary: {
          DEFAULT: '#2980B9',
          dark: '#1B4F72',
          light: '#3498DB'
        },
        success: '#2ECC71',
        danger: '#E74C3C',
        warning: '#F1C40F',
        surface: '#ECF0F1',
        ink: '#2C3E50',
        muted: '#7F8C8D'
      },
      backgroundImage: {
        'app-gradient': 'linear-gradient(180deg, #2980B9 0%, #6DD5FA 100%)',
        'header-gradient': 'linear-gradient(90deg, #2980B9 0%, #3498DB 100%)'
      }
    }
  },
  plugins: []
};
