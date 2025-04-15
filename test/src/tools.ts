export function genBtn(txt: string, cb: Function) {
  const btn = document.createElement('button')
  btn.innerText = txt

  btn.onclick = cb as any
  document.body.appendChild(btn)
}

export function addBlock() {
  const div = document.createElement('div')
  Object.assign(div.style, {
    padding: '5px 0',
  })
  document.body.appendChild(div)
}