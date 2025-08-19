仔细观察 packages/jl-cvs/src/Canvas 的功能，它实现了无限画布 \
我想让 packages/jl-cvs/src/NoteBoard/NoteBoard.ts 也实现无限画布 \
你帮我指定一个计划，说明如何一步步地实现无限画布功能。创建 packages/jl-cvs/src/NoteBoard/plan.md 文件，说明你的计划，先不要改动代码 \
后续实现这个新功能时，你需要创建一个新的 NoteBoard2.ts 来实现，做完一个功能告诉我，我要测试验收 \
目前 packages/jl-cvs/src/NoteBoard/NoteBoard.ts 采用 CSS 的方案实现缩放、拖拽，我希望使用 Canvas Api 的方式来实现，并且缩放中心是跟随鼠标中心的 \
你尤其需要注意性能方面以及模块化划分功能