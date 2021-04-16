const fs = require('fs');
var path = require("path");
var Image = require("./Image_util.js");

var image_name = "hex_map_color.png";
const hex_radius = 15;

function main(){
  Image.read_big_image("aseprite/"+image_name)
  .then( image_info => { 
    // console.log(image_info)
    const map_content = set_content(image_info)
    console.log("finished reading image")
    // save_fm_file(image_name, map_content)
    .then(res => console.log(res))
    .catch(err => console.log(err));
  })
  .catch( err => console.warn(err));
}
// "index.js: got an error of MIME for Buffer from Jimp"

function set_content(image_info){
  // Image_info: 74x74
  var map_content = "";
  // var line = "";
  const pixels = image_info.pixels;
  const aux = hex_radius + 7;
  console.log("len: ", pixels.length)
  for (i = 0; i < pixels.length; i += aux) {
    console.log("i: ", i);
    console.log("pixel: ", pixels[i]);
  }
  // pixels.forEach( pixel => {
  //   line += color_is_equal(pixel, map_info);
  //   if (is_full_line(line, image_info.width)){
  //     map_content += '"'+line+'",\n';
  //     line = "";
  //   }
  // })
  return "";
}

// function is_same_color(pixel, color) {
//   return pixel.r === color.r && pixel.g === color.g && pixel.b === color.b;
// }

function color_is_equal(pixel, map_info){
  let code = "";
  for (var i = 0; i < map_info.length; i++) {
    let obj = map_info[i];
    code += is_same_color(pixel.color, obj.color) ? obj.code : ""
  }
  return code === "" ? "b." : code;
}

function is_full_line(line, width){
  return line.length === width*2 ? true : false; // x2 = code os 2 characteres
}

async function save_fm_file(image_name, content){
  var image_name = image_name.slice(0,-4);
  var path = "./fm_images/map_code/"+image_name+".fm";
  var content = content;
  try {
    fs.writeFileSync(path, content);
    return "Saved "+path;
  } catch (e) {
    throw e;
  }
}

main()