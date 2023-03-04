var socket = io();

const btn_paste = document.querySelector("#paste")
const input = document.querySelector("#inputurl")
const btndown = document.querySelector("#btndown")

btn_paste.addEventListener('click', () => {
  navigator.clipboard.readText().then(v => input.value = v);
});
const isValidUrl = urlString =>{
      var inputElement = document.createElement('input');
      inputElement.type = 'url';
      inputElement.value = urlString;

      if (!inputElement.checkValidity()) {
        return false;
      } else {
        return true;
      }
    }
btndown.addEventListener('click', async () => {
  
 
      
  
})
function test() {
  if (input.value || isValidUrl(input.value)) {
    socket.emit('download', input.value)
   socket.on ('messageSuccess', function (data) {
 window.location.href = '/download';
});
  }
}
AOS.init({
  once: true,
})