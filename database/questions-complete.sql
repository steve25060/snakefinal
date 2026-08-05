-- ================================================================
-- SNAKE MCQ CHALLENGE - Official Questions (User Provided)
-- 20 Python + 20 C Programming Questions
-- Correct options are RANDOMIZED across A/B/C/D (5 each per language)
-- Python correct: A=Q1,5,9,13,17 | B=Q2,6,10,14,18 | C=Q3,7,11,15,19 | D=Q4,8,12,16,20
-- C correct:      A=Q1,5,9,13,17 | B=Q2,6,10,14,18 | C=Q3,7,11,15,19 | D=Q4,8,12,16,20
-- ================================================================

-- ============================================
-- PYTHON QUESTIONS (20)
-- ============================================

INSERT INTO questions (language, question_text, option_a, option_b, option_c, option_d, correct_option, difficulty_level) VALUES
-- Q1: correct → A
('python',
'Which statement about Python lists is correct?',
'Lists are ordered and mutable',
'Lists cannot contain duplicate values',
'Lists are immutable',
'Lists can contain only one data type',
'A', 'medium'),

-- Q2: correct → B
('python',
'What does *args allow a Python function to receive?',
'Only keyword arguments',
'A variable number of positional arguments',
'Exactly two arguments',
'Only integer arguments',
'B', 'medium'),

-- Q3: correct → C
('python',
'Which data structure stores values as key-value pairs?',
'List',
'Tuple',
'Dictionary',
'Set',
'C', 'easy'),

-- Q4: correct → D
('python',
E'What is the output?\n\nx = [10, 20, 30, 40]\nprint(x[-2])',
'20',
'40',
'Error',
'30',
'D', 'medium'),

-- Q5: correct → A
('python',
E'What is the output?\n\ntext = "Python"\nprint(text[1:5])',
'ytho',
'Pyth',
'ython',
'tho',
'A', 'medium'),

-- Q6: correct → B
('python',
E'What is the output?\n\nclass Parent:\n    def show(self):\n        return "Parent"\n\nclass Child(Parent):\n    def show(self):\n        return "Child"\n\nobj = Child()\nprint(obj.show())',
'Parent',
'Child',
'Parent Child',
'Error',
'B', 'medium'),

-- Q7: correct → C
('python',
E'What is the output?\n\nx = {1, 2, 3}\ny = {2, 3, 4}\nprint(x & y)',
'{1, 4}',
'{1, 2, 3, 4}',
'{2, 3}',
'{1, 2}',
'C', 'medium'),

-- Q8: correct → D
('python',
'What does **kwargs allow in a function?',
'Variable number of positional arguments',
'Only dictionary arguments',
'Only two arguments',
'Variable number of keyword arguments',
'D', 'medium'),

-- Q9: correct → A
('python',
'Which method removes and returns the last element of a list by default?',
'pop()',
'remove()',
'delete()',
'clear()',
'A', 'easy'),

-- Q10: correct → B
('python',
'What does the pass statement do?',
'Terminates the program',
'Acts as a placeholder and performs no action',
'Skips the entire loop',
'Returns None from a function immediately',
'B', 'easy'),

-- Q11: correct → C
('python',
E'What is the output?\n\nnumbers = [10, 20, 30, 40, 50]\nprint(numbers[::2])',
'[10, 20]',
'[20, 40]',
'[10, 30, 50]',
'[10, 20, 30]',
'C', 'medium'),

-- Q12: correct → D
('python',
'Which built-in function returns the number of items in a list, tuple, string, or dictionary?',
'count()',
'size()',
'length()',
'len()',
'D', 'easy'),

-- Q13: correct → A
('python',
'What does the enumerate() function provide when iterating over a sequence?',
'Index-value pairs',
'Only the values',
'Only the indexes',
'Sorted values',
'A', 'medium'),

-- Q14: correct → B
('python',
'Which statement about strings in Python is correct?',
'Strings are mutable',
'Strings are immutable',
'Strings cannot contain numbers',
'Strings cannot be indexed',
'B', 'easy'),

-- Q15: correct → C
('python',
'Which keyword is used to manually trigger an exception?',
'throw',
'except',
'raise',
'error',
'C', 'medium'),

-- Q16: correct → D
('python',
'What is serialization?',
'Arranging numbers in ascending order',
'Converting strings into integers',
'Executing statements sequentially',
'Converting data into a format suitable for storage or transmission',
'D', 'medium'),

-- Q17: correct → A
('python',
'What does eval() do?',
'Evaluates a Python expression from a string or compiled code object',
'Checks a program for syntax errors only',
'Executes only functions',
'Converts expressions into comments',
'A', 'hard'),

-- Q18: correct → B
('python',
'What is the output of bool([])?',
'True',
'False',
'None',
'Error',
'B', 'medium'),

-- Q19: correct → C
('python',
'What statement is used to handle exceptions in Python?',
'try...catch',
'do...except',
'try...except',
'try...finally only',
'C', 'easy'),

-- Q20: correct → D
('python',
'What does the __init__ method do in a Python class?',
'Destroys an object instance',
'Converts a class into a module',
'Compiles the code to bytecode',
'Acts as the class constructor to initialize object attributes',
'D', 'medium');


-- ============================================
-- C PROGRAMMING QUESTIONS (20)
-- ============================================

INSERT INTO questions (language, question_text, option_a, option_b, option_c, option_d, correct_option, difficulty_level) VALUES
-- C Q1: correct → A
('c',
'Which format specifier is used to print an integer value in C using printf()?',
'%d',
'%f',
'%c',
'%s',
'A', 'easy'),

-- C Q2: correct → B
('c',
E'How many times will "Hello" be printed by this for loop?\n\nfor (int i = 0; i < 3; i++) {\n    printf("Hello ");\n}',
'2 times',
'3 times',
'4 times',
'Infinite times',
'B', 'easy'),

-- C Q3: correct → C
('c',
'What does the return 0; statement at the end of main() signify?',
'The program failed with an error.',
'The program should restart from the beginning.',
'The program executed successfully.',
'It clears all variables from memory.',
'C', 'easy'),

-- C Q4: correct → D
('c',
'Which character automatically marks the end of a string in C?',
'\\n (Newline)',
'\\t (Tab)',
'. (Period)',
'\\0 (Null character)',
'D', 'medium'),

-- C Q5: correct → A
('c',
E'What will be the output of this C code?\n\n#include <stdio.h>\nint main() {\n    int x = 100;\n    int *ptr = &x;\n    printf("%d", *ptr);\n    return 0;\n}',
'100',
'Memory address of x',
'0',
'Compile error',
'A', 'medium'),

-- C Q6: correct → B
('c',
E'What will be printed by this program?\n\n#include <stdio.h>\nvoid changeValue(int num) {\n    num = 50;\n}\nint main() {\n    int a = 10;\n    changeValue(a);\n    printf("%d", a);\n    return 0;\n}',
'50',
'10',
'0',
'Garbage value',
'B', 'medium'),

-- C Q7: correct → C
('c',
'Which keyword is used to group variables of different data types under a single name?',
'union',
'enum',
'struct',
'group',
'C', 'medium'),

-- C Q8: correct → D
('c',
'A variable declared inside a function is known as a:',
'Global variable',
'Static variable',
'External variable',
'Local variable',
'D', 'easy'),

-- C Q9: correct → A
('c',
'Which data type is NOT allowed as a condition inside a standard switch() statement in C?',
'float',
'int',
'char',
'enum',
'A', 'medium'),

-- C Q10: correct → B
('c',
'Which mode string should be passed to fopen() to open an existing text file for reading only?',
'"w"',
'"r"',
'"a"',
'"wb"',
'B', 'easy'),

-- C Q11: correct → C
('c',
'What distinguishes a do-while loop from a standard while loop in C?',
'A do-while loop cannot use the break statement.',
'A do-while loop evaluates its condition before running the loop body.',
'A do-while loop is guaranteed to execute its code block at least once.',
'A do-while loop only works with integer conditions.',
'C', 'medium'),

-- C Q12: correct → D
('c',
'What does declaring a function with a void return type indicate?',
'The function returns an integer value of 0.',
'The function takes no input parameters.',
'The function can return any variable data type dynamically.',
'The function does not return any value to the caller.',
'D', 'medium'),

-- C Q13: correct → A
('c',
E'What will be the output of sizeof(struct Point)?\n\n#include <stdio.h>\nstruct Point {\n    int x;\n    int y;\n};\nint main() {\n    printf("%zu", sizeof(struct Point));\n    return 0;\n}',
'8',
'2',
'4',
'16',
'A', 'hard'),

-- C Q14: correct → B
('c',
'How much memory does a char variable occupy?',
'2 Bytes',
'1 Byte',
'4 Bytes',
'8 Bytes',
'B', 'easy'),

-- C Q15: correct → C
('c',
'Which operator gets the memory address of a variable?',
'*',
'%',
'&',
'#',
'C', 'easy'),

-- C Q16: correct → D
('c',
'If x = 5, what is the value of ++x?',
'5',
'4',
'0',
'6',
'D', 'easy'),

-- C Q17: correct → A
('c',
'Which standard library function is used to dynamically allocate memory in C?',
'malloc()',
'alloc()',
'new()',
'create()',
'A', 'medium'),

-- C Q18: correct → B
('c',
'Which keyword is used to prevent a variable''s value from being modified after initialization?',
'static',
'const',
'volatile',
'fixed',
'B', 'medium'),

-- C Q19: correct → C
('c',
'Which keyword gives an existing data type a new name?',
'struct',
'enum',
'typedef',
'alias',
'C', 'medium'),

-- C Q20: correct → D
('c',
'Which function is the entry point of every C program?',
'start()',
'begin()',
'run()',
'main()',
'D', 'easy');
