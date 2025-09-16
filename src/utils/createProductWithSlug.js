import fs from 'fs/promises';
import path from 'path';

function removeVietnameseTones(str) {
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g,"a"); 
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g,"e"); 
  str = str.replace(/ì|í|ị|ỉ|ĩ/g,"i"); 
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g,"o"); 
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g,"u"); 
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g,"y"); 
  str = str.replace(/đ/g,"d");
  return str;
}

function createSlug(name) {
  return removeVietnameseTones(name)
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '') // remove invalid chars
    .replace(/\s+/g, '-') // collapse whitespace and replace by -
    .replace(/-+/g, '-'); // collapse dashes
}

async function main() {
  try {
    // Đọc file products.json
    const productsPath = path.join(process.cwd(), 'src', 'Database', 'products.json');
    const productsData = await fs.readFile(productsPath, 'utf8');
    const products = JSON.parse(productsData);

    // Thêm slug cho mỗi sản phẩm
    const productsWithSlug = products.map(product => ({
      ...product,
      slug: createSlug(product.name)
    }));

    // Ghi ra file mới productWithSlug.json
    const outputPath = path.join(process.cwd(), 'src', 'Database', 'productWithSlug.json');
    await fs.writeFile(
      outputPath, 
      JSON.stringify(productsWithSlug, null, 2),
      'utf8'
    );

    console.log('Created productWithSlug.json successfully!');
  } catch (error) {
    console.error('Error:', error);
  }
}

main();