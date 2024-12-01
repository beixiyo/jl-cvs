import { imgToFade } from '@/imgToFade'
import { getWinHeight, getWinWidth } from '@jl-org/tool'


const cvs = document.createElement('canvas')
document.body.appendChild(cvs)

imgToFade(cvs, {
  src: 'http://chengguo-public.oss-cn-shanghai.aliyuncs.com/9c4d9680-9419-4dc3-ace1-aa330b1a4328.png?Expires=1733051342&OSSAccessKeyId=LTAI5t8z8UKEHkjikYXYwXZb&Signature=IJifGPD%2Fgrj4sBCwlAP2%2F7tsGNM%3D&x-oss-process=image%2Fresize%2Cp_30',
  width: getWinWidth(),
  height: getWinHeight()
})