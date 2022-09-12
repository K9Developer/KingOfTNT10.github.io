import { create_equation, solve } from './algorithm.js';
import { draw_eq } from './utils.js';


const update_solutions = async (equation_data) => {
    let counter = 0
    for (let solution of equation_data.solutions) {
        counter++
        document.getElementById("solutions").innerHTML += `<li class='solution-item'><div class='solution-container'><span class='solution-text'><i>Solution ${counter}:</i><b style="margin-left: 10px">${solution.new_equation} - ${solution.explanation}</b></span> <div className="img-container"><image id='sol-i-${counter}' class="sol-img"></image></div></div></li>`
        await draw_eq(solution.new_equation, document.getElementById(`c-img`), `Solution ${counter}`, solution.explanation)
        document.getElementById(`sol-i-${counter}`).src = document.getElementById(`c-img`).toDataURL();
    }
}

const generate_eq = async () => {
    let equation_data = await create_equation()
    document.getElementById("equation").innerText = `Equation: ${equation_data.equation}`
    document.getElementById("solutions").innerHTML = ""

    await update_solutions(equation_data)
    document.getElementById("eq-input").value = equation_data.equation

    await draw_eq(equation_data.equation, document.getElementById(`c-img`))
    document.getElementById(`eq-img`).src = document.getElementById(`c-img`).toDataURL();
    document.getElementById("show-sol").classList.remove("invisible");
    document.getElementById("share").classList.remove("invisible");
}

const toggle_solutions = () => {
    if (document.getElementById("solutions").classList.contains("invisible")) {
        document.getElementById("solutions").classList.remove("invisible");
        document.getElementById("show-sol").innerText = "Hide Solutions"
    } else {
        document.getElementById("solutions").classList.add("invisible");
        document.getElementById("show-sol").innerText = "Show Solutions"
    }
}

const share = async () => {
    const base64url = document.getElementById("eq-img").src
    const blob = await (await fetch(base64url)).blob();
    const file = new File([blob], 'eq.png', { type: blob.type });
    navigator.share({
        title: 'Equation',
        text: 'Can you solve this? website - KingOfTNT10.github.io',
        files: [file],
    })
}

const solve_eq = async () => {
    let equation = document.getElementById("eq-input").value
    let valid = true

    for (let char of equation.split("")) {
        if (!"1234567890=-+*/ ".includes(char)) {
            valid = false
            document.getElementById("equation").innerHTML = `<b><span style="color: darkred;">${equation} is not a valid equation (char: ${char})!</span></b>`
            break
        }
    }

    if (valid) {
        document.getElementById("show-sol").classList.remove("invisible");
        document.getElementById("share").classList.remove("invisible");
        equation = equation.replaceAll(" ", "")
        document.getElementById("equation").innerText = `Equation: ${equation}`
        console.log(equation)
        let equation_data = await solve(equation)
        await update_solutions(equation_data)
        await draw_eq(equation, document.getElementById(`c-img`))
        document.getElementById(`eq-img`).src = document.getElementById(`c-img`).toDataURL();
    }
}

document.getElementById("show-sol").addEventListener("click", async () => {
    toggle_solutions()
});

document.getElementById("gen-eq").addEventListener("click", async () => {
    generate_eq()
});

document.getElementById("share").addEventListener("click", async () => {
    share()
});

document.getElementById("solve-eq").addEventListener("click", async () => {
    solve_eq()
});

generate_eq()
