const numberToSvg = {
    "1": "./assets/down-left.svg",
    "2": "./assets/down.svg",
    "3": "./assets/down-right.svg",
    "4": "./assets/left.svg",
    "6": "./assets/right.svg",
    "7": "./assets/up-left.svg",
    "8": "./assets/up.svg",
    "9": "./assets/up-right.svg"
}

class Move {
    di = [];
    buttons = [];
    hold = false;
    air = false;
}

document.getElementById('screenshotButton').addEventListener('click', async (event) => {
    const element = document.querySelector('span.main-out');
    if (!element) {
        console.error('Element with class "main-out" not found.');
        return;
    }

    try {
        const canvas = await html2canvas(element);
        canvas.toBlob(async (blob) => {
            if (!blob) {
                console.error('Failed to convert canvas to Blob.');
                return;
            }

            try {
                await navigator.clipboard.write([
                    new ClipboardItem({ 'image/png': blob })
                ]);
            } catch (err) {
                console.error('Failed to copy screenshot to clipboard: ', err);
            }
        });
    } catch (err) {
        console.error('Failed to capture screenshot: ', err);
    }
    event.target.classList.toggle('clicked');
});

document.getElementById("numberInput").addEventListener("input", update);
    
function update() {
    let input = document.getElementById("numberInput").value;
    const url = new URL(window.location)
    if (input != "") url.searchParams.set("combo", input);
    history.pushState(null, '', url);
    if (input == "") {
        document.getElementById("output").innerHTML = "";
        return;
    }
    let moves = parse(input);

    document.getElementById("output").replaceChildren(emit(moves));
};

document.getElementById("numberInput").value = new URL(window.location).searchParams.get("combo");
update();

function emit(moves) {
    const span = document.createElement("span");

    span.classList.add("main-out");

    for (let i = 0; i < moves.length; i++) {
        let move = moves[i];
        span.appendChild(emitMove(move));
        if (i < moves.length - 1) {
            const el = document.createElement("img");
            el.src = "./assets/right-chevron.svg"
            el.style.width = "12px";
            el.style.height = "12px";
            el.classList.add("chevron");
            span.append(el)
        }
    }

    return span;
}

function emitMove(move) {
    const span = document.createElement("span");

    span.classList.add("move");

    for (let x of move.di) span.appendChild(diElement(x));
    if (move.di.length > 0 && move.buttons.length > 0) span.appendChild(plusElement())
    if (move.hold) span.appendChild(holdElement());
    for (let i = 0; i < move.buttons.length; i++) {
        span.appendChild(buttonElement(move.buttons[i], move.air));
        if (i < move.buttons.length - 1) span.appendChild(plusElement());
    }

    return span;
}

function plusElement() {
    const plus = document.createElement("img");
    plus.classList.add("plus");
    plus.src = "./assets/plus.svg"
    plus.style.width = "12px";
    plus.style.height = "12px";
    return plus;
}

function buttonElement(x, air) {
    const span = document.createElement("span");
    if (air) span.style.borderBottom = "3px solid #cccccc";
    span.style.borderRadius = "2px";
    span.style.padding = "2px 0px";
    const el = document.createElement("div");
    el.classList.add("circle");
    el.classList.add("button");
    el.classList.add("button-" + x);
    if (x == "s1" || x == "s2") el.classList.add("button-super");
    el.innerText = x.toUpperCase();
    span.appendChild(el);
    return span;
}

function diElement(number) {
    const arrow = document.createElement("img");
    arrow.src = numberToSvg[number];
    if (parseInt(number) % 2 == 0) {
        arrow.style.width = "28px";
        arrow.style.height = "28px";
    } else {
        arrow.style.width = "20px";
        arrow.style.height = "20px";
    }
    return arrow;
}

function holdElement() {
    const hold = document.createElement("div");
    hold.classList.add("circle");
    hold.classList.add("hold");
    hold.innerText = "H";
    return hold;
}

function airElement() {
    const air = document.createElement("span");
    air.innerText = "j.";
    return air;
}

function parse(text) {
    const moves = [];
    let chunks = text.toLowerCase().replace(/[^12346789tdmhls\[c\ j]/gi, "").split(" ");
    for (let chunk of chunks) {
        let chars = chunk.split("");
        moves.push(parseMove(chars));
    }
    return moves;
}

function parseMove(chars) {
    const move = new Move();
    for (let i = 0; i < chars.length; i++) {
        let char = chars[i];
        if (char.match(/[12346789]/)) {
            move.di.push(char);
        } else if (char.match(/[tdmhl]/)) {
            move.buttons.push(char);
        } else if (char.match(/[s]/)) {
            if (i < chars.length - 1 && chars[i + 1].match(/[12]/)) {
                i++;
                move.buttons.push("s" + chars[i]);
            }
        } else if (char.match(/[j]/)) {
            move.air = true;
        } else if (char.match(/[\[c]/)) {
            move.hold = true;
        }
    }
    return move;
}