-- Auto-generated 20 C and 20 Python questions seed script
DELETE FROM questions;
INSERT INTO questions (language, question_text, option_a, option_b, option_c, option_d, correct_option, is_active, difficulty_level) VALUES ('c', 'Which format specifier is used to print an integer value in C using printf()?', '%f', '%c', '%d', '%s', 'C', 1, 'medium');
INSERT INTO questions (language, question_text, option_a, option_b, option_c, option_d, correct_option, is_active, difficulty_level) VALUES ('c', 'How many times will "Hello" be printed by this for loop?
for (int i = 0; i < 3; i++) {
printf("Hello ");
}', '2 times', '3 times', '4 times', 'Infinite times', 'B', 1, 'medium');
INSERT INTO questions (language, question_text, option_a, option_b, option_c, option_d, correct_option, is_active, difficulty_level) VALUES ('c', 'What does the return 0; statement at the end of main() signify?', 'The program failed with an error.', 'The program executed successfully.', 'The program should restart from the beginning.', 'It clears all variables from memory.', 'B', 1, 'medium');
INSERT INTO questions (language, question_text, option_a, option_b, option_c, option_d, correct_option, is_active, difficulty_level) VALUES ('c', 'Which character automatically marks the end of a string in C?', '\n (Newline)', '\t (Tab)', '\0 (Null character)', '. (Period)', 'C', 1, 'medium');
INSERT INTO questions (language, question_text, option_a, option_b, option_c, option_d, correct_option, is_active, difficulty_level) VALUES ('c', 'What will be the output of this C code?
#include <stdio.h>
int main() {
int x = 100;
int *ptr = &x;
printf("%d", *ptr);
return 0;
}', 'Memory address of x', '100', '0', 'Compile error', 'B', 1, 'medium');
INSERT INTO questions (language, question_text, option_a, option_b, option_c, option_d, correct_option, is_active, difficulty_level) VALUES ('c', 'What will be printed by this program?
#include <stdio.h>
void changeValue(int num) {
num = 50;
}
int main() {
int a = 10;
changeValue(a);
printf("%d", a);
return 0;
}', '10', '50', '0', 'Garbage value', 'A', 1, 'medium');
INSERT INTO questions (language, question_text, option_a, option_b, option_c, option_d, correct_option, is_active, difficulty_level) VALUES ('c', 'Which keyword is used to group variables of different data types under a single name?', 'union', 'struct', 'enum', 'group', 'B', 1, 'medium');
INSERT INTO questions (language, question_text, option_a, option_b, option_c, option_d, correct_option, is_active, difficulty_level) VALUES ('c', 'A variable declared inside a function is known as a:', 'Global variable', 'Static variable', 'Local variable', 'External variable', 'C', 1, 'medium');
INSERT INTO questions (language, question_text, option_a, option_b, option_c, option_d, correct_option, is_active, difficulty_level) VALUES ('c', 'Which data type is NOT allowed as a condition inside a standard switch() statement in C?', 'int', 'char', 'float', 'enum', 'C', 1, 'medium');
INSERT INTO questions (language, question_text, option_a, option_b, option_c, option_d, correct_option, is_active, difficulty_level) VALUES ('c', 'Which mode string should be passed to fopen() to open an existing text file for reading only?', '"w"', '"r"', '"a"', '"wb"', 'B', 1, 'medium');
INSERT INTO questions (language, question_text, option_a, option_b, option_c, option_d, correct_option, is_active, difficulty_level) VALUES ('c', 'What distinguishes a do-while loop from a standard while loop in C?', 'A do-while loop cannot use the break statement.', 'A do-while loop is guaranteed to execute its code block at least once.', 'A do-while loop evaluates its condition before running the loop body.', 'A do-while loop only works with integer conditions.', 'B', 1, 'medium');
INSERT INTO questions (language, question_text, option_a, option_b, option_c, option_d, correct_option, is_active, difficulty_level) VALUES ('c', 'What does declaring a function with a void return type indicate?', 'The function returns an integer value of 0.', 'The function takes no input parameters.', 'The function does not return any value to the caller.', 'The function can return any variable data type dynamically.', 'C', 1, 'medium');
INSERT INTO questions (language, question_text, option_a, option_b, option_c, option_d, correct_option, is_active, difficulty_level) VALUES ('c', 'What will be the output of sizeof(struct Point)?
#include <stdio.h>
struct Point {
int x;
int y;
};
int main() {
printf("%zu", sizeof(struct Point));
return 0;
}', '2', '4', '8', '16', 'C', 1, 'medium');
INSERT INTO questions (language, question_text, option_a, option_b, option_c, option_d, correct_option, is_active, difficulty_level) VALUES ('c', 'How much memory does a char variable occupy?', '1 Byte', '2 Bytes', '4 Bytes', '8 Bytes', 'A', 1, 'medium');
INSERT INTO questions (language, question_text, option_a, option_b, option_c, option_d, correct_option, is_active, difficulty_level) VALUES ('c', 'Which operator gets the memory address of a variable?', '*', '%', '&', '#', 'C', 1, 'medium');
INSERT INTO questions (language, question_text, option_a, option_b, option_c, option_d, correct_option, is_active, difficulty_level) VALUES ('c', 'If x = 5, what is the value of ++x?', '5', '6', '4', '0', 'B', 1, 'medium');
INSERT INTO questions (language, question_text, option_a, option_b, option_c, option_d, correct_option, is_active, difficulty_level) VALUES ('c', 'Which standard library function is used to dynamically allocate memory in C?', 'alloc()', 'malloc()', 'new()', 'create()', 'B', 1, 'medium');
INSERT INTO questions (language, question_text, option_a, option_b, option_c, option_d, correct_option, is_active, difficulty_level) VALUES ('c', 'Which keyword is used to prevent a variable''s value from being modified after initialization?', 'static', 'volatile', 'const', 'fixed', 'C', 1, 'medium');
INSERT INTO questions (language, question_text, option_a, option_b, option_c, option_d, correct_option, is_active, difficulty_level) VALUES ('c', 'Which keyword gives an existing data type a new name?', 'struct', 'typedef', 'enum', 'alias', 'B', 1, 'medium');
INSERT INTO questions (language, question_text, option_a, option_b, option_c, option_d, correct_option, is_active, difficulty_level) VALUES ('c', 'Which function is the entry point of every C program?', 'start()', 'main()', 'begin()', 'run()', 'B', 1, 'medium');
INSERT INTO questions (language, question_text, option_a, option_b, option_c, option_d, correct_option, is_active, difficulty_level) VALUES ('python', 'Which statement about Python lists is correct?', 'Lists cannot contain duplicate values', 'Lists are immutable', 'Lists are ordered and mutable', 'Lists can contain only one data type', 'C', 1, 'medium');
INSERT INTO questions (language, question_text, option_a, option_b, option_c, option_d, correct_option, is_active, difficulty_level) VALUES ('python', 'What does *args allow a Python function to receive?', 'Only keyword arguments', 'A variable number of positional arguments', 'Exactly two arguments', 'Only integer arguments', 'B', 1, 'medium');
INSERT INTO questions (language, question_text, option_a, option_b, option_c, option_d, correct_option, is_active, difficulty_level) VALUES ('python', 'Which data structure stores values as key-value pairs?', 'List', 'Tuple', 'Set', 'Dictionary', 'D', 1, 'medium');
INSERT INTO questions (language, question_text, option_a, option_b, option_c, option_d, correct_option, is_active, difficulty_level) VALUES ('python', 'What is the output?

x = [10, 20, 30, 40]
print(x[-2])', '20', '30', '40', 'Error', 'B', 1, 'medium');
INSERT INTO questions (language, question_text, option_a, option_b, option_c, option_d, correct_option, is_active, difficulty_level) VALUES ('python', 'What is the output?

text = "Python"
print(text[1:5])', 'Pyth', 'ytho', 'ython', 'tho', 'B', 1, 'medium');
INSERT INTO questions (language, question_text, option_a, option_b, option_c, option_d, correct_option, is_active, difficulty_level) VALUES ('python', 'What is the output?

class Parent:
    def show(self):
        return "Parent"

class Child(Parent):
    def show(self):
        return "Child"

obj = Child()
print(obj.show())', 'Parent', 'Child', 'Parent Child', 'Error', 'B', 1, 'medium');
INSERT INTO questions (language, question_text, option_a, option_b, option_c, option_d, correct_option, is_active, difficulty_level) VALUES ('python', 'What is the output?

x = {1, 2, 3}
y = {2, 3, 4}

print(x & y)', '{1, 4}', '{1, 2, 3, 4}', '{2, 3}', '{1, 2}', 'C', 1, 'medium');
INSERT INTO questions (language, question_text, option_a, option_b, option_c, option_d, correct_option, is_active, difficulty_level) VALUES ('python', 'What does **kwargs allow in a function?', 'Variable number of positional arguments', 'Variable number of keyword arguments', 'Only dictionary arguments', 'Only two arguments', 'B', 1, 'medium');
INSERT INTO questions (language, question_text, option_a, option_b, option_c, option_d, correct_option, is_active, difficulty_level) VALUES ('python', 'Which method removes and returns the last element of a list by default?', 'remove()', 'delete()', 'pop()', 'clear()', 'C', 1, 'medium');
INSERT INTO questions (language, question_text, option_a, option_b, option_c, option_d, correct_option, is_active, difficulty_level) VALUES ('python', 'What does the pass statement do?', 'Terminates the program', 'Skips the entire loop', 'Acts as a placeholder and performs no action', 'Returns None from a function immediately', 'C', 1, 'medium');
INSERT INTO questions (language, question_text, option_a, option_b, option_c, option_d, correct_option, is_active, difficulty_level) VALUES ('python', 'What is the output?

numbers = [10, 20, 30, 40, 50]
print(numbers[::2])', '[10, 20]', '[20, 40]', '[10, 30, 50]', '[10, 20, 30]', 'C', 1, 'medium');
INSERT INTO questions (language, question_text, option_a, option_b, option_c, option_d, correct_option, is_active, difficulty_level) VALUES ('python', 'Which built-in function returns the number of items in a list, tuple, string, or dictionary?', 'count()', 'size()', 'len()', 'length()', 'C', 1, 'medium');
INSERT INTO questions (language, question_text, option_a, option_b, option_c, option_d, correct_option, is_active, difficulty_level) VALUES ('python', 'What does the enumerate() function provide when iterating over a sequence?', 'Only the values', 'Only the indexes', 'Index-value pairs', 'Sorted values', 'C', 1, 'medium');
INSERT INTO questions (language, question_text, option_a, option_b, option_c, option_d, correct_option, is_active, difficulty_level) VALUES ('python', 'Which statement about strings in Python is correct?', 'Strings are mutable', 'Strings are immutable', 'Strings cannot contain numbers', 'Strings cannot be indexed', 'B', 1, 'medium');
INSERT INTO questions (language, question_text, option_a, option_b, option_c, option_d, correct_option, is_active, difficulty_level) VALUES ('python', 'Which keyword is used to manually trigger an exception?', 'throw', 'except', 'raise', 'error', 'C', 1, 'medium');
INSERT INTO questions (language, question_text, option_a, option_b, option_c, option_d, correct_option, is_active, difficulty_level) VALUES ('python', 'What is serialization?', 'Converting data into a format suitable for storage or transmission', 'Arranging numbers in ascending order', 'Converting strings into integers', 'Executing statements sequentially', 'A', 1, 'medium');
INSERT INTO questions (language, question_text, option_a, option_b, option_c, option_d, correct_option, is_active, difficulty_level) VALUES ('python', 'What does eval() do?', 'Evaluates a Python expression from a string or compiled code object', 'Checks a program for syntax errors only', 'Executes only functions', 'Converts expressions into comments', 'A', 1, 'medium');
INSERT INTO questions (language, question_text, option_a, option_b, option_c, option_d, correct_option, is_active, difficulty_level) VALUES ('python', 'What is the output of bool([])?', 'True', 'False', 'None', 'Error', 'B', 1, 'medium');
INSERT INTO questions (language, question_text, option_a, option_b, option_c, option_d, correct_option, is_active, difficulty_level) VALUES ('python', 'What statement is used to handle exceptions in Python?', 'try...catch', 'try...except', 'do...except', 'try...finally only', 'B', 1, 'medium');
INSERT INTO questions (language, question_text, option_a, option_b, option_c, option_d, correct_option, is_active, difficulty_level) VALUES ('python', 'What does the __init__ method do in a Python class?', 'Destroys an object instance', 'Acts as the class constructor to initialize object attributes', 'Converts a class into a module', 'Compiles the code to bytecode', 'B', 1, 'medium');