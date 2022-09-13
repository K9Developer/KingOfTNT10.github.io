import {
    explanation_generator, create_eq, decode_num, encode_num, get_match_sticks_count, evaluate_eq
} from "./utils.js"


const _solution_exists = (result_map, equation) => {
    /*
    Function checks if the solution already exists in the result dictionary
    
    Args:
        result_map (dict): Stores all solutions and mutations
        equation (string): The new equation to check for
    
    Returns:
        bool: Whether the equation exists in the result_map
    */
    for (let solution of result_map.solutions) {
        if (solution.new_equation == equation) {
            return true
        }
    }
}


const _get_equation_matchstick_count = async (equation) => {
    /*
    Gets the total matchstick count to check if stick was removed
    without being placed or placed without being removed
    
    Args:
        equation (string): The equation to check the matchstick count
    
    Returns:
        int: The amount of ones/sticks in the equation
    */

    let equation_matchstick_count = 0

    // Loops over all chars in the equation and check the
    // amount of matchsticks that every char is built with
    for (let char of equation) {
        try {
            equation_matchstick_count += get_match_sticks_count(
                await encode_num(char))
        } catch (error) {

        }

    }

    return equation_matchstick_count
}


const solve = async (equation) => {
    /*
    Solves the matchstick equation
    
    Args:
        equation (str): The equation to solve
    
    Returns:
        dict[list, list]: The results
    */

    // ---------- SETUP ----------//
    let equation_matchstick_count = await _get_equation_matchstick_count(equation)

    if (evaluate_eq(equation)) {
        return { "solutions": [{ "new_equation": equation, "original_equation": equation, "explanation": ["Expression was already true"] }], "mutations": [] }
    }

    let result_map = { "solutions": [], "mutations": [] }
    let transform_data = null

    let mutations = []

    transform_data = { "0": { "to": [], "from": ["8"], "morph": ["6", "9"] }, "1": { "to": [], "from": ["7"], "morph": [] }, "2": { "to": [], "from": [], "morph": ["3", "5"] }, "3": { "to": [], "from": ["9"], "morph": ["2", "5"] }, "4": { "to": [], "from": [], "morph": [] }, "5": { "to": [], "from": ["9", "6"], "morph": ["2", "3"] }, "6": { "to": ["5"], "from": ["8"], "morph": ["9", "0"] }, "7": { "to": ["1"], "from": [], "morph": [] }, "8": { "to": ["6", "9", "0"], "from": [], "morph": [] }, "9": { "to": ["3", "5"], "from": ["8"], "morph": ["6", "0"] }, "+": { "to": ["-"], "from": [], "morph": [] }, "-": { "to": [], "from": ["+"], "morph": [] } }

    // Opens the matchstick_transform_data file that contains
    // the numbers each number can become by removing/getting/moving one stick

    for (const [index, num] of equation.split("").entries()) {

        // If the number exists then continue,
        // it will filter '=' or any other invalid char
        if (transform_data[num]) {

            // Loops over all the options for the numbers:
            //    - "to" (numbers you get when removing a stick from the number)
            //    - "from" (numbers you get when getting a stick from a number)
            //    - "morph" (numbers you get when moving a stick within the number)

            for (let opt in transform_data[num]) {

                for (let num_opt of transform_data[num][opt]) {

                    // If the option is "to" which means the number after a stick was removed
                    // then it will check what number can get a stick and create a valid equation
                    if (opt == "to") {

                        // Now look through all numbers in equation to check if can add stick to them
                        for (const [index2, num2] in equation.split("").entries()) {

                            // Again, check if the number is valid
                            if (transform_data[num2]) {

                                // Loop through the current number's options after getting another stick
                                for (let from_num of transform_data[num2].from) {

                                    // Test the equation's validity with the new numbers
                                    // (the one that a stick was removed from and the one a stick was added to)
                                    let new_eq = equation.split("")
                                    new_eq[index2] = from_num
                                    new_eq[index] = num_opt
                                    new_eq = new_eq.join("")

                                    let solve_data = create_eq(new_eq)

                                    // There are multiple checks that need to be verified:
                                    //    1. Check if the equation is true - it means that 1+1=4 wont go through
                                    //    2. Check if the solution wasn't added already - because numbers lead to each other, so there can be duplicates
                                    //    4. Check if there weren't extra/less sticks than the original one - So it wont remove a stick without placing it back somewhere

                                    if (solve_data[0] && !_solution_exists(result_map, solve_data[1]) && await _get_equation_matchstick_count(new_eq) == equation_matchstick_count) {

                                        result_map["solutions"].push({
                                            "new_equation": solve_data[1],
                                            "original_equation": equation,
                                            "explanation": await explanation_generator(await encode_num(num), await encode_num(num_opt), await encode_num(num2), await encode_num(from_num))
                                        })
                                    } else {
                                        mutations.push({
                                            "new_equation": solve_data[1],
                                            "original_equation": equation,
                                        })
                                    }
                                }
                            }
                        }
                    } // If the option is "from" which means the number after a stick was added
                    // then it will check what number can remove a stick and create a valid equation
                    else if (opt == "from") {

                        // Now look through all numbers in equation to check if can add stick to them
                        for (const [index2, num2] of equation.split("").entries()) {

                            // Again, check if the number is valid
                            if (transform_data[num2]) {

                                // Loop through the current number's options after getting another stick
                                for (let from_num of transform_data[num2].to) {

                                    // Test the equation's validity with the new numbers
                                    // (the one that a stick was removed from and the one a stick was added to)
                                    let new_eq = equation.split("")
                                    new_eq[index2] = from_num
                                    new_eq[index] = num_opt
                                    new_eq = new_eq.join("")

                                    let solve_data = create_eq(new_eq)

                                    // There are multiple checks that need to be verified:
                                    //    1. Check if the equation is true - it means that 1+1=4 wont go through
                                    //    2. Check if the solution wasn't added already - because numbers lead to each other, so there can be duplicates
                                    //    4. Check if there weren't extra/less sticks than the original one - So it wont remove a stick without placing it back somewhere

                                    if (solve_data[0] && !_solution_exists(result_map, solve_data[1]) && await _get_equation_matchstick_count(new_eq) == equation_matchstick_count) {

                                        result_map["solutions"].push({
                                            "new_equation": solve_data[1],
                                            "original_equation": equation,
                                            "explanation": await explanation_generator(await encode_num(num), await encode_num(num_opt), await encode_num(num2), await encode_num(from_num))
                                        })
                                    }

                                    else {
                                        mutations.push({
                                            "new_equation": solve_data[1],
                                            "original_equation": equation,
                                        })
                                    }

                                }
                            }
                        }
                        // If the option is "morph" which means the number after moving a stick within it self,
                        // For example 6 to 0
                    } else {
                        // Test the equation's validity with the new number
                        let new_eq = equation.split("")
                        new_eq[index] = num_opt
                        new_eq = new_eq.join("")
                        let solve_data = create_eq(new_eq)

                        // There are multiple checks that need to be verified:
                        //    1. Check if the equation is true - it means that 1+1=4 wont go through
                        //    2. Check if the solution wasn't added already - because numbers lead to each other, so there can be duplicates
                        //    4. Check if there weren't extra/less sticks than the original one - So it wont remove a stick without placing it back somewhere
                        if (solve_data[0] && !_solution_exists(result_map, solve_data[1]) && await _get_equation_matchstick_count(new_eq) == equation_matchstick_count) {

                            result_map["solutions"].push({
                                "new_equation": solve_data[1],
                                "original_equation": equation,
                                "explanation": await explanation_generator(await encode_num(equation[index]), null, await encode_num(num_opt), null, true)
                            })
                        }

                        else {
                            mutations.push({
                                "new_equation": solve_data[1],
                                "original_equation": equation
                            })
                        }
                    }
                }
            }
            result_map["mutations"] = mutations
            return result_map
        }
    }
}


const create_equation = async (answer = null, min_num = 1, max_num = 10, divide = false, multiply = false) => {
    /*
    Creates a random valid equation by choosing random numbers and with them
    creating the equation
    
    Args:
        answer (int, optional): Set's the answer so the original's result would be the answer, example: (answer=4) 6+4=4. Defaults to None.
        min_num (int, optional): The minimum number that can show up in the equation. Defaults to 1.
        max_num (int, optional): The maximum number that can show up in the equation. Defaults to 10.
        divide (int, optional): Wether the function should generate an equation with the / sign. Defaults to False.
        multiply (int, optional): Wether the function should generate an equation with the * sign. Defaults to False.
    
    Returns:
        dict[str, list]: The random equation with it's answers
    */

    // Create a new equation until results in a valid one according to the equation's parameters

    while (1) {

        // Create the random equation
        let random_num1 = Math.floor(Math.random() * (max_num - 1 + min_num) + min_num);
        let random_num2 = Math.floor(Math.random() * (max_num - 1 + min_num) + min_num);
        let random_num3 = Math.floor(Math.random() * (max_num - 1 + min_num) + min_num);
        let operations = "+-+-+-" + (divide ? "/" : "") + (multiply ? "*" : "")
        let operation = operations.split("")[Math.floor(Math.random() * operations.split("").length)]
        let eq = `${random_num1}${operation}${random_num2}=${answer ? plus : random_num3}`
        let result = await solve(eq)
        if (result["solutions"].length && !evaluate_eq(eq)) {
            return { "equation": eq, "solutions": result["solutions"] }
        }


    }
}

export {
    create_equation, solve
}
