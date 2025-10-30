import imagemin from 'imagemin';
import imageminWebp from 'imagemin-webp';

const files = await imagemin(['IMG/*.{jpg,png}'], {
    destination: 'IMG-WEBP',
    plugins: [
        imageminWebp({ quality: 80 })
    ]
});

console.log('Imagens convertidas para WebP:');
files.forEach(file => console.log(file.destinationPath));
