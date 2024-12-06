import { imgToTxt } from '@/imgToTxt'


const replaceText = '6';

(function () {
  const cvs = document.createElement('canvas')
  document.body.appendChild(cvs)

  imgToTxt({
    canvas: cvs,
    opts: {
      txt: '哎呀你干嘛',
      txtStyle: {
        family: '楷体',
      }
    },
    replaceText,
  })
})();


(function () {
  const cvs = document.createElement('canvas')
  document.body.appendChild(cvs)

  imgToTxt({
    canvas: cvs,
    gap: 8,
    isGray: false,
    opts: {
      img: new URL('../assets/umr.jpg', import.meta.url).href,
      height: 500,
    },
    replaceText
  })

})();


(function () {
  const cvs = document.createElement('canvas')
  document.body.appendChild(cvs)

  imgToTxt({
    canvas: cvs,
    gap: 10,
    isGray: false,
    opts: {
      video: new URL('../assets/umr.mp4', import.meta.url).href,
      height: 500,
    },
    replaceText
  })

})()