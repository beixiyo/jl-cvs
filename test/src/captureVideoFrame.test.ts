import { captureVideoFrame } from '@/canvasTool'
import { genArr } from '@jl-org/tool'


const input = document.createElement('input')
input.type = 'file'
input.accept = 'video/*'
Object.assign(input.style, {
  marginTop: '100px',
})

document.body.appendChild(input)
addAnimateBall()

input.onchange = async (e) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return

  console.time('captureVideoFrame')
  const srcs = await captureVideoFrame(file, genArr(20, i => i + 1), 'base64', {
    workerPath: '/captureVideoFrame.js',
    quality: 1,
  })
  console.timeEnd('captureVideoFrame')

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

/**
 * 往页面添加移动小球，用 left 和 top 控制位置，测试线程阻塞
 */
function addAnimateBall() {
  const ball = document.createElement('div')
  ball.style.width = '50px'
  ball.style.height = '50px'
  ball.style.backgroundColor = 'red'
  ball.style.position = 'absolute'
  ball.style.left = '0'
  ball.style.top = '0'
  document.body.appendChild(ball)

  let left = 50

  const animate = () => {
    ball.style.left = `${left}px`

    if (left > 1000) {
      left--
    }
    else {
      left++
    }
    requestAnimationFrame(animate)
  }
  animate()
}