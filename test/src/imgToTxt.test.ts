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
      img: './assets/1.png',
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
      video: './assets/1.mp4',
      height: 500,
    },
    replaceText
  })

})()