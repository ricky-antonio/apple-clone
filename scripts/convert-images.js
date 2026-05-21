import sharp from "sharp";

const files = [
  "public/assets/images/black.jpg",
  "public/assets/images/blue.jpg",
  "public/assets/images/white.jpg",
  "public/assets/images/yellow.jpg",
  "public/assets/images/explore1.jpg",
  "public/assets/images/explore2.jpg",
];

for (const file of files) {
  const out = file.replace(/\.jpe?g$/i, ".webp");
  await sharp(file).webp({ quality: 85 }).toFile(out);
  console.log(`${file} → ${out}`);
}
