-- Comprehensive Sample Questions for Snake MCQ Challenge

-- ============================================
-- PYTHON QUESTIONS
-- ============================================

INSERT INTO questions (language, question_text, option_a, option_b, option_c, option_d, correct_option, difficulty_level) VALUES
('Python', 'Which of the following is used to create a dictionary in Python?', '{}', '[]', '()', '<>', 'A', 'easy'),
('Python', 'What is the output of print(type([1, 2, 3]))?', '<class ''list''>', '<class ''tuple''>', '<class ''dict''>', '<class ''set''>', 'A', 'easy'),
('Python', 'How do you add an element to a list in Python?', 'list.append(element)', 'list.add(element)', 'list.insert_end(element)', 'list.push(element)', 'A', 'easy'),
('Python', 'Which method removes and returns the first element from a list?', 'pop(0)', 'remove(0)', 'delete(0)', 'shift()', 'A', 'easy'),
('Python', 'What is the correct way to slice a list from index 2 to 5?', 'list[2:5]', 'list[2-5]', 'list[2...5]', 'list.slice(2, 5)', 'A', 'medium'),
('Python', 'Which keyword is used to create an exception handler?', 'try...except', 'try...catch', 'error...handle', 'exception...handle', 'A', 'medium'),
('Python', 'What does the len() function do?', 'Returns the length of an object', 'Returns the type of an object', 'Converts to lowercase', 'Removes duplicates', 'A', 'easy'),
('Python', 'How do you create a set in Python?', '{1, 2, 3}', '[1, 2, 3]', '(1, 2, 3)', '{{1, 2, 3}}', 'A', 'medium'),
('Python', 'What is the output of 5 // 2 in Python?', '2', '2.5', '3', '2.0', 'A', 'easy'),
('Python', 'Which built-in function returns the maximum value?', 'max()', 'maximum()', 'get_max()', 'find_max()', 'A', 'easy'),
('Python', 'What does the range() function do?', 'Generates a sequence of numbers', 'Measures distance', 'Finds a value', 'Sorts a list', 'A', 'easy'),
('Python', 'How do you iterate over a list with index in Python?', 'enumerate(list)', 'iterate(list)', 'loop(list)', 'for_each(list)', 'A', 'medium'),
('Python', 'What is a lambda function in Python?', 'An anonymous function', 'A named function', 'A class method', 'A loop construct', 'A', 'medium'),
('Python', 'Which method converts a string to uppercase?', 'upper()', 'uppercase()', 'toUpper()', 'UP()', 'A', 'easy'),
('Python', 'What is the correct syntax for a for loop in Python?', 'for i in range(10):', 'for i = 0; i < 10; i++', 'for (i; i<10)', 'loop i from 0 to 10:', 'A', 'easy'),

-- ============================================
-- C PROGRAMMING QUESTIONS
-- ============================================

('C', 'Which of the following is a valid C identifier?', '_variable123', '123variable', '$variable', '-variable', 'A', 'easy'),
('C', 'What is the size of int in C (typically)?', '4 bytes', '2 bytes', '8 bytes', '1 byte', 'A', 'easy'),
('C', 'Which of the following is used to input a value in C?', 'scanf()', 'printf()', 'cin', 'input()', 'A', 'easy'),
('C', 'What is the output of printf("%d", 5)?', '5', '5.0', 'error', 'no output', 'A', 'easy'),
('C', 'Which operator is used for dynamic memory allocation in C?', 'malloc()', 'allocate()', 'new()', 'alloc()', 'A', 'easy'),
('C', 'What is the correct syntax to declare a pointer?', 'int *ptr;', 'int &ptr;', 'int ptr*;', 'ptr int*;', 'A', 'medium'),
('C', 'Which of the following is used to free dynamically allocated memory?', 'free()', 'delete()', 'release()', 'remove()', 'A', 'medium'),
('C', 'What does the strlen() function return?', 'Length of a string', 'Number of words', 'Memory size', 'String comparison', 'A', 'easy'),
('C', 'Which header file contains string functions?', '<string.h>', '<stdio.h>', '<stdlib.h>', '<math.h>', 'A', 'easy'),
('C', 'What is the correct way to include a standard library?', '#include <stdio.h>', '#include "stdio.h"', 'import stdio.h', 'include <stdio.h>', 'A', 'easy'),
('C', 'What is a structure in C?', 'A collection of variables of different types', 'A loop construct', 'A function definition', 'An array type', 'A', 'medium'),
('C', 'Which of the following is used to compare two strings?', 'strcmp()', 'strcpy()', 'strlen()', 'strcat()', 'A', 'easy'),
('C', 'What does the strcpy() function do?', 'Copies one string to another', 'Compares strings', 'Finds string length', 'Concatenates strings', 'A', 'easy'),
('C', 'What is a void pointer?', 'A pointer that can hold any data type', 'A pointer to nothing', 'A null pointer', 'An undefined pointer', 'A', 'medium'),
('C', 'Which of the following is not a loop in C?', 'iterate', 'for', 'while', 'do-while', 'A', 'easy'),
('C', 'What is the correct syntax for an if statement in C?', 'if (condition) { }', 'if condition { }', 'if (condition) [ ]', 'if condition [ ]', 'A', 'easy'),
('C', 'Which function is used to find the length of an array in C?', 'Not directly available', 'length()', 'sizeof()', 'count()', 'C', 'medium'),
('C', 'What is a NULL pointer?', 'A pointer set to zero/NULL', 'An uninitialized pointer', 'A pointer to main()', 'A wild pointer', 'A', 'medium'),
('C', 'What does the assert() macro do?', 'Tests a condition and terminates if false', 'Assigns a value', 'Declares a variable', 'Allocates memory', 'A', 'medium'),
('C', 'What is the return type of malloc()?', 'void*', 'int*', 'char*', 'void', 'A', 'medium'),

-- ============================================
-- ADVANCED PYTHON QUESTIONS
-- ============================================

('Python', 'What is the difference between == and is in Python?', '== compares values, is compares identity', '== compares identity, is compares values', 'They are the same', 'No difference for objects', 'A', 'hard'),
('Python', 'What does *args do in a function?', 'Allows variable number of positional arguments', 'Multiplies arguments', 'Creates a tuple of keywords', 'Expands a list', 'A', 'hard'),
('Python', 'What is a decorator in Python?', 'A function that modifies another function', 'A class method', 'A type of variable', 'An import statement', 'A', 'hard'),
('Python', 'What is the GIL in Python?', 'Global Interpreter Lock', 'Graphical Interface Library', 'Global Integration Layer', 'Garbage Index List', 'A', 'hard'),
('Python', 'What is list comprehension?', 'A concise way to create lists', 'Reading a list from a file', 'Understanding list concepts', 'Listing comprehensions', 'A', 'medium'),

-- ============================================
-- ADVANCED C QUESTIONS
-- ============================================

('C', 'What is the difference between struct and union in C?', 'union shares memory, struct does not', 'struct shares memory, union does not', 'They are identical', 'No difference for operations', 'A', 'hard'),
('C', 'What is a static variable in C?', 'Retains value between function calls', 'A constant variable', 'A global variable', 'A local variable', 'A', 'hard'),
('C', 'What does the const keyword do?', 'Makes a variable immutable', 'Creates a global variable', 'Defines a function', 'Allocates memory', 'A', 'medium'),
('C', 'What is pointer arithmetic in C?', 'Performing operations on pointers', 'Mathematical calculations', 'Array indexing', 'Memory allocation', 'A', 'hard'),
('C', 'What is the difference between ++i and i++ in C?', '++i is prefix, i++ is postfix', 'i++ is prefix, ++i is postfix', 'They are the same', 'No difference in loops', 'A', 'medium');
