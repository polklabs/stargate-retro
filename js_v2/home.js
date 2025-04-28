let glyphNum = 1;
const glyph = document.querySelector(".glyph");
const body = document.querySelector(".border");

for (let i = 0; i < 7; i++) {
    const newGlyph = glyph.cloneNode(true);
    newGlyph.classList.remove("hidden");
    newGlyph.src = `chevrons/milkyway/00${i+2}.svg`;

    setTimeout(() => {
        newGlyph.classList.add(`g${i+1}`);
        const newGlyph2 = newGlyph.cloneNode(true);
        newGlyph2.classList.add('blur')
        body.appendChild(newGlyph2);
        body.appendChild(newGlyph);

        setTimeout(() => {
            const cl = document.querySelector(`.cl${i+1}`);
            cl.classList.add("locked");

            const chev = document.querySelector(`.chevron-${i+1}`);
            chev.classList.add("locked");

            const b = document.querySelector(`.b${i+1}`);
            newB = b.cloneNode(true);
            newB.classList.add(`clip-${i < 3 ? '2' : '1'}`);
            body.appendChild(newB);
            setTimeout(() => newB.classList.add('locked'), 10);
        }, 2300);

        setTimeout(() => {
          newGlyph.classList.add("locked");
        }, 500)
        setTimeout(() => {
          newGlyph2.classList.add("locked");
        }, 550)
    }, 3000 * i);
}
