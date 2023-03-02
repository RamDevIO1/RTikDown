const a = document.querySelector(".card-title")
const shareBtn = document.getElementById('share')

let trimString = function(string, length) {
  return string.length > length ? string.substring(0, length) + '...' : string;
};
a.innerHTML = trimString(a.innerHTML, 95)

shareBtn.addEventListener('click', event => {

  // Check for Web Share api support
  if (navigator.share) {
    // Browser supports native share api
    navigator.share({
        text: 'Want to download TikTok videos and songs? Try RTikDown now!',
        url: 'https://rtik.ramsnode.me/'
      }).then(() => {
        toast("thanks for sharing!")
      })
      .catch((err) => console.error(err));
  } else {
    // Fallback
    alert("The current browser does not support the share function. :(")
  }
});
 
function toast(text) {
  // Get the snackbar DIV
  var x = document.getElementById("snackbar");

  // Add the "show" class to DIV
  x.innerHTML = text
  x.className = "show";

  // After 3 seconds, remove the show class from DIV
  setTimeout(function() { 
    x.className = x.className.replace("show", "");
  }, 3500);
}

AOS.init()