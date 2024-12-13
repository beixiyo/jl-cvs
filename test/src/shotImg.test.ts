import { ShotImg } from '@/ShotImg'
import { blobToBase64, downloadByData, getImg } from '@jl-org/tool'
import { genBtn } from './tools'


const input = document.createElement('input')
input.type = 'file'
document.body.appendChild(input)
document.body.appendChild(document.createElement('canvas'))

let si: ShotImg

input.onchange = async () => {
  const file = input.files![0]
  if (!file) return

  const base64 = await blobToBase64(file)
  const img = await getImg(base64) as HTMLImageElement

  /**
   * 示例如下，您只需传入 Canvas 和 一张图片 即可使用
   * 或者创建实例后调用 `setImg` 设置图片
   */
  si = new ShotImg(document.querySelector('canvas')!, img)
}

genBtn('下载图片', async () => {

  /** 
   * 获取图片的 blob 或者 base64
   * 如果图片设置过大小，可能会导致截图区域不准确
   */
  const blob = await si.getShotImg('blob')
  downloadByData(blob, 'shot.png')
})

