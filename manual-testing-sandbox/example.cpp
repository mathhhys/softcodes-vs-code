#include <iostream>
#include <string>

class Person {
private:
    std::string name;
    int age;

public:
    // Constructor
    Person(const std::string& name, int age) : name(name), age(age) {}

    // Member function to display info
    void displayInfo() const {
        std::cout << "Name: " << name << ", Age: " << age << std::endl;
    }
};

int main() {
    // Create an object of Person
    Person person("Alice", 30);

    // Display the person's info
    person.displayInfo();

    return 0;
}