class Calculator {
  constructor() {
    this.result = 0
    this.result = 0;
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
    if (n === 0) {
  if (n < 0) {
    throw new Error("Factorial is not defined for negative numbers.");
  }
  if (n === 0) {
        return 1;
    } else {
        let fact = 1;
        for (let i = 1; i <= n; i++) {
            fact *= i;
        }
        return fact;
  let fact = 1;
  for (let i = 1; i <= n; i++) {
    fact *= i;
    }
  return fact;
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
}

// Example usage:
const calc = new Calculator();
calc.add(10).subtract(5).multiply(2).divide(3);
console.log("Calculator Result:", calc.getResult()); // Output: Calculator Result: 10

const num = 5;
console.log(`Factorial of ${num} is: ${factorial(num)}`); // Output: Factorial of 5 is: 120
