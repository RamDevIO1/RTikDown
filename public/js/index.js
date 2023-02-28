const btn_paste = document.querySelector("#paste")
const input = document.querySelector("#inputurl")

btn_paste.addEventListener('click', () => {
  navigator.clipboard.readText().then(v => input.value = v);
});