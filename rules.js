const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');
const xlsx = require('xlsx');

// Replace these paths with your actual folder paths
const folder1 = "Bottoms/";
const folder2 = "T-Shirts";

// Load the Excel file and read the data
const workbook = xlsx.readFile('fashion_dataset_properties.xlsx');
const sheet_name = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheet_name];
const imageProperties = xlsx.utils.sheet_to_json(sheet);

// Define rules for color matching
const rulesWarm = {
  "Red": "White",
  "Green": "Black",
  "Light green": "Beige",
  "Orange": "White",
  "White": "Blue",
  "Purple": "Teal"
};
const rulesCold = {};
const rulesNeutral = {};

// Helper function to get random file from a folder
function getRandomFile(folder) {
  const files = fs.readdirSync(folder).filter(file => fs.statSync(path.join(folder, file)).isFile());
  return files[Math.floor(Math.random() * files.length)];
}

// Create canvas for 2 rows and 3 columns
const canvas = createCanvas(900, 1350); // Adjust size as needed
const ctx = canvas.getContext('2d');

// Load and draw images on the canvas
(async () => {
  for (let i = 0; i < 3; i++) {
    const file1 = getRandomFile(folder1);
    const file2 = getRandomFile(folder2);

    const prop1 = imageProperties.find(prop => prop['image name'] === file1);
    const prop2 = imageProperties.find(prop => prop['image name'] === file2);

    console.log(file1, file2);
    if (prop1 && prop2) {
      const col1 = prop1['colour'];
      const col2 = prop2['colour'];

      console.log(i, '\n', 'property of', file2, col2);
      console.log('\n property of', file1, col1);
    } else {
      console.log("\n no data");
    }

    const img1 = await loadImage(path.join(folder1, file1));
    const img2 = await loadImage(path.join(folder2, file2));

    // Draw the images on the canvas
    ctx.drawImage(img1, i * 300, 675, 300, 675); // Bottoms
    ctx.drawImage(img2, i * 300, 0, 300, 675);  // T-Shirts
  }

  // Save the result to a file
  const out = fs.createWriteStream('output.png');
  const stream = canvas.createPNGStream();
  stream.pipe(out);
  out.on('finish', () => console.log('The PNG file was created.'));
})();
