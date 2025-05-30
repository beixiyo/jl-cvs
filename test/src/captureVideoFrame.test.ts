import { captureVideoFrame } from '@/canvasTool'
import { genArr } from '@jl-org/tool'


const input = document.createElement('input')
input.type = 'file'
input.accept = 'video/*'

document.body.appendChild(input)

input.onchange = async (e) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return

  const srcs = await captureVideoFrame(file, genArr(5, i => i + 1), 'base64', {
    workerPath: '/captureVideoFrame.js',
    quality: 0.5,
  })

  srcs.forEach((item) => {
    addImg(item)
  })
  console.log(srcs)
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