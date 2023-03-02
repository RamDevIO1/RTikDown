var socket = io();

const btn_paste = document.querySelector("#paste")
const input = document.querySelector("#inputurl")
const btndown = document.querySelector("#btndown")

btn_paste.addEventListener('click', () => {
  navigator.clipboard.readText().then(v => input.value = v);
});

btndown.addEventListener('click', () => {
  socket.emit('down', input.value)
})

AOS.init()