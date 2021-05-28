let signinBtn = document.getElementById('signin')
let signupBtn = document.getElementById('signup')
let form1st = document.getElementById('form1')
let form2nd = document.getElementById('form2')
let container = document.querySelector('.container')

signinBtn.addEventListener('click', () => {
  container.classList.remove('right-panel-active')
})

signupBtn.addEventListener('click', () => {
  container.classList.add('right-panel-active')
})

form1st.addEventListener('submit', (e) => {
  e.preventDefault()
})

form2nd.addEventListener('submit', (e) => {
  e.preventDefault()
})
