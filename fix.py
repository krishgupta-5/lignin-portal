with open('src/pages/Predict.jsx', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace('<div className={\p-stage \\}>', '<div className={p-stage }>')
c = c.replace('<div className={\p-stage \\}>', '<div className={p-stage }>')
c = c.replace('<div className={\p-stage \\}>', '<div className={p-stage }>')
c = c.replace('<div className={\p-stage \\}>', '<div className={p-stage }>')
c = c.replace('<div className={\p-stage \\}>', '<div className={p-stage }>')
c = c.replace('<div className={\p-stage \\}>', '<div className={p-stage }>')

with open('src/pages/Predict.jsx', 'w', encoding='utf-8') as f:
    f.write(c)
