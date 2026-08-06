-- ================================================================
-- SNAKE MCQ CHALLENGE - Official Questions (User Provided)
-- 20 Python + 20 C Programming Questions
-- Multi-line code blocks formatted directly as multiline strings
-- ================================================================

TRUNCATE TABLE questions RESTART IDENTITY CASCADE;

-- Python Questions (20)
INSERT INTO questions (language, question_text, option_a, option_b, option_c, option_d, correct_option, difficulty_level, is_active) VALUES
('python', 'Which statement about Python lists is correct?', 'Lists are ordered and mutable', 'Lists cannot contain duplicate values', 'Lists are immutable', 'Lists can contain only one data type', 'A', 'medium', true),
('python', 'What does *args allow a Python function to receive?', 'Only keyword arguments', 'A variable number of positional arguments', 'Exactly two arguments', 'Only integer arguments', 'B', 'medium', true),
('python', 'Which data structure stores values as key-value pairs?', 'List', 'Tuple', 'Dictionary', 'Set', 'C', 'easy', true),
('python', 'What is the output?

x = [10, 20, 30, 40]
print(x[-2])', '20', '40', 'Error', '30', 'D', 'medium', true),
('python', 'What is the output?

text = "Python"
print(text[1:5])', 'ytho', 'Pyth', 'ython', 'tho', 'A', 'medium', true),
('python', 'What is the output?

class Parent:
    def show(self):
        return "Parent"

class Child(Parent):
    def show(self):
        return "Child"

obj = Child()
print(obj.show())', 'Parent', 'Child', 'Parent Child', 'Error', 'B', 'medium', true),
('python', 'What is the output?

x = {1, 2, 3}
y = {2, 3, 4}
print(x & y)', '{1, 4}', '{1, 2, 3, 4}', '{2, 3}', '{1, 2}', 'C', 'medium', true),
('python', 'What does **kwargs allow in a function?', 'Variable number of positional arguments', 'Only dictionary arguments', 'Only two arguments', 'Variable number of keyword arguments', 'D', 'medium', true),
('python', 'Which method removes and returns the last element of a list by default?', 'pop()', 'remove()', 'delete()', 'clear()', 'A', 'easy', true),
('python', 'What does the pass statement do?', 'Terminates the program', 'Acts as a placeholder and performs no action', 'Skips the entire loop', 'Returns None from a function immediately', 'B', 'easy', true),
('python', 'What is the output?

numbers = [10, 20, 30, 40, 50]
print(numbers[::2])', '[10, 20]', '[20, 40]', '[10, 30, 50]', '[10, 20, 30]', 'C', 'medium', true),
('python', 'Which built-in function returns the number of items in a list, tuple, string, or dictionary?', 'count()', 'size()', 'length()', 'len()', 'D', 'easy', true),
('python', 'What does the enumerate() function provide when iterating over a sequence?', 'Index-value pairs', 'Only the values', 'Only the indexes', 'Sorted values', 'A', 'medium', true),
('python', 'Which statement about strings in Python is correct?', 'Strings are mutable', 'Strings are immutable', 'Strings cannot contain numbers', 'Strings cannot be indexed', 'B', 'easy', true),
('python', 'Which keyword is used to manually trigger an exception?', 'throw', 'except', 'raise', 'error', 'C', 'medium', true),
('python', 'What is serialization?', 'Arranging numbers in ascending order', 'Converting strings into integers', 'Executing statements sequentially', 'Converting data into a format suitable for storage or transmission', 'D', 'medium', true),
('python', 'What does eval() do?', 'Evaluates a Python expression from a string or compiled code object', 'Checks a program for syntax errors only', 'Executes only functions', 'Converts expressions into comments', 'A', 'hard', true),
('python', 'What is the output of bool([])?', 'True', 'False', 'None', 'Error', 'B', 'medium', true),
('python', 'What statement is used to handle exceptions in Python?', 'try...catch', 'do...except', 'try...except', 'try...finally only', 'C', 'easy', true),
('python', 'What does the __init__ method do in a Python class?', 'Destroys an object instance', 'Converts a class into a module', 'Compiles the code to bytecode', 'Acts as the class constructor to initialize object attributes', 'D', 'medium', true);

-- C Questions (20)
INSERT INTO questions (language, question_text, option_a, option_b, option_c, option_d, correct_option, difficulty_level, is_active) VALUES
('c', 'Which format specifier is used to print an integer value in C using printf()?', '%d', '%f', '%c', '%s', 'A', 'easy', true),
('c', 'How many times will "Hello" be printed by this for loop?

for (int i = 0; i < 3; i++) {
    printf("Hello ");
}', '2 times', '3 times', '4 times', 'Infinite times', 'B', 'easy', true),
('c', 'What does the return 0; statement at the end of main() signify?', 'The program failed with an error.', 'The program should restart from the beginning.', 'The program executed successfully.', 'It clears all variables from memory.', 'C', 'easy', true),
('c', 'Which character automatically marks the end of a string in C?', '\n (Newline)', '\t (Tab)', '. (Period)', '\0 (Null character)', 'D', 'medium', true),
('c', 'What will be the output of this C code?

#include <stdio.h>
int main() {
    int x = 100;
    int *ptr = &x;
    printf("%d", *ptr);
    return 0;
}', '100', 'Memory address of x', '0', 'Compile error', 'A', 'medium', true),
('c', 'What will be printed by this program?

#include <stdio.h>
void changeValue(int num) {
    num = 50;
}
int main() {
    int a = 10;
    changeValue(a);
    printf("%d", a);
    return 0;
}', '50', '10', '0', 'Garbage value', 'B', 'medium', true),
('c', 'Which keyword is used to group variables of different data types under a single name?', 'union', 'enum', 'struct', 'group', 'C', 'medium', true),
('c', 'A variable declared inside a function is known as a:', 'Global variable', 'Static variable', 'External variable', 'Local variable', 'D', 'easy', true),
('c', 'Which data type is NOT allowed as a condition inside a standard switch() statement in C?', 'float', 'int', 'char', 'enum', 'A', 'medium', true),
('c', 'Which mode string should be passed to fopen() to open an existing text file for reading only?', '"w"', '"r"', '"a"', '"wb"', 'B', 'easy', true),
('c', 'What distinguishes a do-while loop from a standard while loop in C?', 'A do-while loop cannot use the break statement.', 'A do-while loop evaluates its condition before running the loop body.', 'A do-while loop is guaranteed to execute its code block at least once.', 'A do-while loop only works with integer conditions.', 'C', 'medium', true),
('c', 'What does declaring a function with a void return type indicate?', 'The function returns an integer value of 0.', 'The function takes no input parameters.', 'The function can return any variable data type dynamically.', 'The function does not return any value to the caller.', 'D', 'medium', true),
('c', 'What will be the output of sizeof(struct Point)?

#include <stdio.h>
struct Point {
    int x;
    int y;
};
int main() {
    printf("%zu", sizeof(struct Point));
    return 0;
}', '8', '2', '4', '16', 'A', 'hard', true),
('c', 'How much memory does a char variable occupy?', '2 Bytes', '1 Byte', '4 Bytes', '8 Bytes', 'B', 'easy', true),
('c', 'Which operator gets the memory address of a variable?', '*', '%', '&', '#', 'C', 'easy', true),
('c', 'If x = 5, what is the value of ++x?', '5', '4', '0', '6', 'D', 'easy', true),
('c', 'Which standard library function is used to dynamically allocate memory in C?', 'malloc()', 'alloc()', 'new()', 'create()', 'A', 'medium', true),
('c', 'Which keyword is used to prevent a variable''s value from being modified after initialization?', 'static', 'const', 'volatile', 'fixed', 'B', 'medium', true),
('c', 'Which keyword gives an existing data type a new name?', 'struct', 'enum', 'typedef', 'alias', 'C', 'medium', true),
('c', 'Which function is the entry point of every C program?', 'start()', 'begin()', 'run()', 'main()', 'D', 'easy', true);
