class Calculator {
  constructor() {
    this.result = 0
    this.result = 0;
<<<<<<< HEAD
=======
        this.result = 0;
>>>>>>> 117f2832 (Softcodes stable v1)
  }

  add(number) {
    this.result += number;
    return this;
  }
// Function to calculate the factorial of a number using recursion
function factorial(n) {
    if (n === 0) {
        return 1;
    } else {
        return n * factorial(n - 1);
    }
}

  subtract(number) {
    this.result -= number;
    return this;
class Calculator {
  constructor() {
    this.result = 0;
  }

  add(number) {
    this.result += number;
  multiply(number) {
    this.result *= number;
<<<<<<< HEAD
=======
  multiply(number) {
    this.result *= number;
  multiply(number) {
    this.result *= number;
  multiply(number) {
    this.result *= number;
  multiply(number) {
    this.result *= number;
    multiply(number) {
        this.result *= number;
  multiply(number) {
    this.result *= number;
>>>>>>> 117f2832 (Softcodes stable v1)
    return this;
  }

  subtract(number) {
    this.result -= number;
    return this;
  }

  multiply(number) {
    this.result *= number;
    return this;
  }

  subtract(number) {
    this.result -= number;
    return this;
  }

  multiply(number) {
    this.result *= number;
    return this;
  }

  divide(number) {
<<<<<<< HEAD
=======
  divide(number) {
  divide(number) {
  divide(number) {
  divide(number) {
  divide(number) {
    divide(number) {
>>>>>>> 117f2832 (Softcodes stable v1)
  divide(number) {
    if (number === 0) {
      throw new Error("Cannot divide by zero");
    }
    this.result /= number;
    return this;
  }

  getResult() {
    return this.result;
  }

  reset() {
    this.result = 0;
    return this;
  }
}
  multiply(number) {
    this.result *= number;
    return this;
  }

    divide(number) {
    if (number === 0) {
      throw new Error("Cannot divide by zero");
    }
    this.result /= number;
    return this;
  }

  getResult() {
    return this.result;
  }

  reset() {
    this.result = 0;
    return this;
  }
}


// Main function to get user input and calculate factorial// Function to calculate factorial of a number

// Function to calculate the factorial of a number
function factorial(n) {
<<<<<<< HEAD
    if (n === 0) {
  if (n < 0) {
=======
    if (n < 0) {
  if (n < 0) {
    if (n < 0) {
>>>>>>> 117f2832 (Softcodes stable v1)
    throw new Error("Factorial is not defined for negative numbers.");
  }
  if (n === 0) {
        return 1;
<<<<<<< HEAD
=======
  } else if (n < 0) {
    throw new Error("Factorial is not defined for negative numbers");
>>>>>>> 117f2832 (Softcodes stable v1)
    } else {
        let fact = 1;
        for (let i = 1; i <= n; i++) {
            fact *= i;
<<<<<<< HEAD
=======

function binary_search(arr, target) {
    let left = 0;
    let right = arr.length - 1;

    while (left <= right) {
        let mid = Math.floor((left + right) / 2);
        if (arr[mid] === target) {
            return mid;
        } else if (arr[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
>>>>>>> 117f2832 (Softcodes stable v1)
        }
        return fact;
  let fact = 1;
  for (let i = 1; i <= n; i++) {
    fact *= i;
    }
  return fact;
<<<<<<< HEAD
=======

    return -1;  // Target not found
>>>>>>> 117f2832 (Softcodes stable v1)
}

// Call the main function to start the program
main();

// Function to get user input and calculate factorial of a number
// Displays the factorial of the entered number or a message for negative numbers
    
    if (num < 0) {
        console.log("Factorial is not defined for negative numbers.");
    } else {
        let result = factorial(num);
        console.log("Factorial of " + num + " is: " + result);
    }
<<<<<<< HEAD
}

// Example usage:
const calc = new Calculator();
calc.add(10).subtract(5).multiply(2).divide(3);
console.log("Calculator Result:", calc.getResult()); // Output: Calculator Result: 10

const num = 5;
console.log(`Factorial of ${num} is: ${factorial(num)}`); // Output: Factorial of 5 is: 120
=======
// Example usage
let sorted_array = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
let target_value = 13;

let result = binary_search(sorted_array, target_value);

if (result !== -1) {
    console.log(`Target ${target_value} found at index ${result}`);
} else {
    console.log(`Target ${target_value} not found in the array`);
}

// Test with a value not in the array


// Main function to get user input and calculate factorial
// Main function to get user input and calculate factorial
function main() {
// Get user input
const number = prompt("Enter a number to calculate the factorial of:");

try {
  const result = factorial(number);
  console.log(`Factorial of ${number} is: ${result}`);
} catch (error) {
  console.error(`Error: ${error.message}`);
}
const number = prompt("Enter a number to calculate the factorial of:")


  // Suggested edit applied here
  const a = 1; // This defines a constant variable 'a' with a value of 1.
  console.log(a); // This outputs the value of 'a' (which is 1) to the console.
}

// Function to calculate the factorial of a number using recursion
function factorial(n) {
  if (n === 0) {
    return 1;
  } else if (n < 0) {
    throw new Error("Factorial is not defined for negative numbers");
  } else {
    let fact = 1;
    for (let i = 1; i <= n; i++) {
      fact *= i;
    }
    return fact;
  }
}

// Call the main function to start the program
main();
function factorial(n) {
  if (n === 0) {
    return 1;
  } else if (n < 0) {
    throw new Error("Factorial is not defined for negative numbers");
  } else {
    let fact = 1;
    for (let i = 1; i <= n; i++) {
      fact *= i;
    }
    return fact;
  }
}

main();
function main() {

    
main();
function factorial(n) {
  if (n === 0) {
    return 1;
  } else if (n < 0) {
    throw new Error("Factorial is not defined for negative numbers");
  } else {
    let fact = 1;
    for (let i = 1; i <= n; i++) {
      fact *= i;
    }
    return fact;
  }
}

>>>>>>> 117f2832 (Softcodes stable v1)
