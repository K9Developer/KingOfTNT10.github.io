import { create_equation, solve } from './algorithm.js';
import { draw_eq } from './utils.js';

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

const update_solutions = async (equation_data) => {
    document.getElementById("solutions").innerHTML = ""
    let counter = 0
    for (let solution of equation_data.solutions) {
        counter++
        document.getElementById("solutions").innerHTML += `<div class='solution-item'><div class='solution-container'><span class='solution-text'><i>Solution ${counter}:</i><b style="margin-left: 10px">${solution.new_equation} - ${solution.explanation}</b></span> <div className="img-container"><image id='sol-i-${counter}' class="sol-img"></image></div></div></div>`
        await draw_eq(solution.new_equation, document.getElementById(`c-img`), `Solution ${counter}`, solution.explanation)
        document.getElementById(`sol-i-${counter}`).src = document.getElementById(`c-img`).toDataURL();
    }

    if (!equation_data.solutions.length) {
        console.log(equation_data)
        document.getElementById("solutions").innerHTML += `<div class='solution-item'><div class='solution-container'><span>No solutions found, tried ${equation_data.mutations.length} combinations</span></div></div>`
    }
}

const generate_eq = async () => {
    let equation_data = await create_equation()
    document.getElementById("equation").innerText = `Equation: ${equation_data.equation}`


    await update_solutions(equation_data)
    document.getElementById("eq-input").value = equation_data.equation
    urlParams.set("eq", equation_data.equation)
    window.history.replaceState({}, "", decodeURIComponent(`${window.location.pathname}?${urlParams}`));
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
        text: `Can you solve this?\n equation - ${window.location.href}`,
        files: [file],
    })
}

const solve_eq = async (eq = null) => {
    let equation = eq
    if (!equation) {
        equation = document.getElementById("eq-input").value
    }

    let valid = true

    for (let char of equation.split("")) {
        if (!"1234567890=-+*/ ".includes(char)) {
            valid = false
            document.getElementById("equation").innerHTML = `<b><span style="color: darkred;">${equation} is not a valid equation (char: ${char})!</span></b>`
            break
        }
    }

    if (valid) {
        document.getElementById("eq-input").value = equation
        document.getElementById("show-sol").classList.remove("invisible");
        document.getElementById("share").classList.remove("invisible");
        equation = equation.replaceAll(" ", "")
        document.getElementById("equation").innerText = `Equation: ${equation}`

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


if (urlParams.get("eq")) {
    solve_eq(urlParams.get("eq"))
} else {
    generate_eq()
}
