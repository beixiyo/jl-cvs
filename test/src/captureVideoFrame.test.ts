import { captureVideoFrame } from '@/canvasTool';


const input = document.createElement('input')
input.type = 'file'
input.accept = 'video/*'

document.body.appendChild(input)

input.onchange = async (e) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return

  const workerPath = '/captureVideoFrame.js'
  const srcs = await captureVideoFrame(file, [1, 2, 10000], 'base64', {
    workerPath,
    quality: 0.8,
  })

  srcs.forEach((item) => {
    console.log(item)
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