export function genBtn(txt: string, cb: Function) {
  const btn = document.createElement('button')
  btn.innerText = txt

  btn.onclick = cb as any
  document.body.appendChild(btn)
}