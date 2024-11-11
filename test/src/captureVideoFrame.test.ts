import { blobToBase64, captureVideoFrame } from '@/canvasTool'


const input = document.createElement('input')
input.type = 'file'
input.accept = 'video/*'

document.body.appendChild(input)

input.onchange = async (e) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return

  // const base64 = await blobToBase64(file)

  const srcs = await captureVideoFrame(file, [2, 700], 'blob')
  srcs.forEach((item) => {
    addImg(item)
  })
}

function addImg(src: string | Blob) {
  const img = document.createElement('img')

  if (typeof src === 'string') {
    img.src = src
  }
  else {
    img.src = URL.createObjectURL(src)
  }

  img.style.width = '300px'
  img.style.display = 'block'
  document.body.appendChild(img)
}