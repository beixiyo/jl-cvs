import { blobToBase64, getImg } from '@jl-org/tool'
import { compressImg } from '@/canvasTool'


const input = document.createElement('input')
input.type = 'file'
document.body.appendChild(input)

/**
 * 压缩图片测试
 */
input.onchange = async () => {
  const file = input.files[0]
  if (!file) return

  const base64 = await blobToBase64(file)
  const img = await getImg(base64) as HTMLImageElement

  const rawBase64 = await blobToBase64(file)
  console.log(rawBase64)

  const compressBase64 = await compressImg(img)
  const newImg = await getImg(compressBase64) as HTMLImageElement
  document.body.appendChild(newImg)

  console.log(compressBase64)
}
