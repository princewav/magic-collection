import path from 'path';
import tailwindcss from '@tailwindcss/postcss';

export default {
  plugins: {
    tailwindcss: tailwindcss({ 
      config: path.resolve('./tailwind.config.js') 
    }),
    autoprefixer: {},
  },
}
