const fs = require('fs');
var path = require("path");

// Font content
// ------------
async function set_font_content(fm_char_imgs){
  var map = set_font_map(fm_char_imgs);
  var content = map;
  // Save it
  return save_font_file(content);
}

// Creates a Formality Map with [{key: Char, value: VoxBox}]
function set_font_map(fm_char_imgs){
  var qtd_files = fm_char_imgs.length - 2; // remove Mons.font.fm and .DS_Store
  var content =
`// Creates a Map of (key: String, value: VoxBox)
// Qtd characters: ${qtd_files}
PixelFont.black: PixelFont
  let map = Map.new<VoxBox>
`
  fm_char_imgs.map(name => {
    if(name !== "font.kind" && name !== ".DS_Store"){
      var char_code = get_char_code(name);
      var name_form = "PixelFont.black."+char_code;
      var char_name = String.fromCharCode(char_code);
      content += "  let map = PixelFont.set_img("+char_code+"#16, "+name_form+", map) // add "+char_name+"\n";
    }
  })
  content += "  map";
  return content;
}

function get_char_code(fm_char_img){
  return fm_char_img.split(".")[0]; // name like "PixelFont.black.106.kind"
}

// IMPORTANT: this file must be updated manually due to the extra 
// symbols like ① ②. Their code is the HTML code related to the unicode symbol
async function save_font_file(content){
  var path = "./fm_font/black/font.kind";
  try {
    fs.writeFileSync(path, content);
    return "Saved "+path;
  } catch (e) {
    throw e;
  }
}


function image_to_hex(image_name, image_info) {
  var pixels = image_info.pixels;
  var width  = image_info.width;
  var height = image_info.height;
  // For each pixel, use 6 bytes to write the info
  var b = new Buffer.alloc(pixels.length * 6);
  var c = 0;
  var s = z_scale(image_name);
  for(var i = 0; i < pixels.length; i++){
    var pixel = pixels[i];
    if(pixel.color.a !== 0){
      // b[c*6]   = pixel.x + (128 - (width / 2));
      // b[c*6+1] = pixel.y + (128 - (height / 2));
      b[c*6]   = pixel.x;
      b[c*6+1] = pixel.y;
      b[c*6+2] = z_index(image_name) + (s ? (height - pixel.y - 1) : 0); // z
      b[c*6+3] = pixel.color.r;
      b[c*6+4] = pixel.color.g;
      b[c*6+5] = pixel.color.b;
      // console.log("i: ", i, pixel.y, height, z_index(image_name), b[c*6+2]);
      c++;
    }
  }
  return b.slice(0, c * 6).toString("hex");
}

// Return the value of the z_index
// Font: default 30
// Others: default 2
const z_index = (image_name) => {
  var z_index = has_z_index(image_name);
  return z_index ? Number(z_index.split("z")[1].replace("p", "")) : 30;
}

// Return true if z_index will scale based on the "y"
const z_scale = (image_name) => {
  var z_index = has_z_index(image_name);
  return z_index ? z_index.includes("p") : false;
}

// Return the match of z_index given a Regex if name have it
const has_z_index = (image_name) => {
  var match = new RegExp("z[0-9]+p?");
  var match_name = match.exec(image_name);
  return match_name ? match_name[0] : null;
}

// Get a formatted term_name for the file (without z_index)
const term_name = (image_name) => {
  var z_index = has_z_index(image_name);
  var name = image_name.split("_"+z_index)[0];
  return name ? name : image_name;
}

// Content to be on .fm file
const file_content = (image_name, image_info) => {
  var hex_content = image_to_hex(image_name, image_info);
  var z_index_comment = "// z_index: "+z_index(image_name);
  var char = "// char: "+String.fromCharCode(image_name)+"\n";
  var scale = has_z_index(image_name) ? ", will scale on y\n" : "\n";
  return z_index_comment+scale+char+"PixelFont.black."+term_name(image_name)+": VoxBox\n" + 
    '  VoxBox.parse("'+hex_content+'")';
}

async function save_fm_file(image_name, content){
  var path = "./fm_font/black/"+term_name(image_name)+".kind";
  try {
    fs.writeFileSync(path, content);
    return "Saved "+path;
  } catch (e) {
    throw e;
  }
}

function make_fm_file(image_info, image_name){
  var only_name = image_name.slice(0,-4);
  var content = file_content(only_name, image_info);
  // console.log(image_info);
  return save_fm_file(only_name, content);
}

module.exports = { make_fm_file, set_font_content };