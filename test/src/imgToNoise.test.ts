import { blobToBase64, getImg, imgToNoise } from '@/canvasTool'


const input = document.createElement('input')
input.type = 'file'
document.body.appendChild(input)

input.onchange = async () => {
    const file = input.files[0]
    if (!file) return

    const base64 = await blobToBase64(file)
    const img = await getImg(base64) as HTMLImageElement
    const cvs = imgToNoise(img)
    document.body.appendChild(cvs)
}