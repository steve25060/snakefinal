-- Comprehensive Questions for Snake MCQ Challenge
-- 20 Python questions and 20 C questions with well-balanced options A, B, C, D

-- ============================================
-- PYTHON QUESTIONS (20)
-- ============================================

INSERT INTO questions (language, question_text, option_a, option_b, option_c, option_d, correct_option, difficulty_level) VALUES
('python', 'Which keyword is used to define a function in Python?', 'func', 'def', 'function', 'define', 'B', 'easy'),
('python', 'What is the output of: print(2 ** 3)?', '6', '8', '9', '23', 'B', 'easy'),
('python', 'How do you create a list in Python?', 'list = ()', 'list = {}', 'list = []', 'list = <>', 'C', 'easy'),
('python', 'Which method is used to add an element to the end of a list?', 'add()', 'insert()', 'push()', 'append()', 'D', 'easy'),
('python', 'What is the correct file extension for Python files?', '.python', '.py', '.pt', '.pyt', 'B', 'easy'),

('python', 'What does len() function return?', 'Type of object', 'Value of object', 'Length of object', 'Size in bytes', 'C', 'medium'),
('python', 'Which of the following is mutable in Python?', 'Tuple', 'List', 'String', 'Integer', 'B', 'medium'),
('python', 'What is the output of: print(type([]))?', '<class list>', '<class array>', '<class tuple>', '<class dict>', 'A', 'medium'),
('python', 'How do you start a for loop in Python?', 'for (i=0; i<5; i++)', 'foreach i in 5:', 'for i in range(5):', 'loop i to 5:', 'C', 'medium'),
('python', 'What does the // operator do in Python?', 'Exponentiation', 'Modulus', 'Regular division', 'Floor division', 'D', 'medium'),

('python', 'Which keyword is used for exception handling?', 'try', 'catch', 'except', 'Both A and C', 'D', 'medium'),
('python', 'What is a lambda function in Python?', 'Anonymous function', 'Named function', 'Built-in function', 'Class method', 'A', 'medium'),
('python', 'How do you create a dictionary in Python?', 'dict = []', 'dict = {}', 'dict = ()', 'dict = <>', 'B', 'easy'),
('python', 'What is the output of: print(bool(0))?', 'True', 'False', '0', 'None', 'B', 'easy'),
('python', 'Which method converts a string to lowercase?', 'lowercase()', 'toLower()', 'lower()', 'downcase()', 'C', 'easy'),

('python', 'What does the self parameter represent in a class?', 'Class itself', 'Instance of class', 'Parent class', 'Method name', 'B', 'medium'),
('python', 'How do you import a module in Python?', 'import module_name', 'include module_name', 'require module_name', 'using module_name', 'A', 'easy'),
('python', 'What is the output of: print(3 * "A")?', '3A', 'A3', 'AAA', 'Error', 'C', 'medium'),
('python', 'Which function is used to get input from user?', 'scanf()', 'get()', 'read()', 'input()', 'D', 'easy'),
('python', 'What is a tuple in Python?', 'Immutable sequence', 'Mutable sequence', 'Key-value pairs', 'Ordered set', 'A', 'medium');

-- ============================================
-- C PROGRAMMING QUESTIONS (20)
-- ============================================

INSERT INTO questions (language, question_text, option_a, option_b, option_c, option_d, correct_option, difficulty_level) VALUES
('c', 'Which header file is required for printf()?', 'stdlib.h', 'stdio.h', 'string.h', 'math.h', 'B', 'easy'),
('c', 'What is the size of int in C (typically)?', '1 byte', '2 or 4 bytes', '8 bytes', '16 bytes', 'B', 'medium'),
('c', 'Which symbol is used for single-line comments in C?', '/*', '#', '//', '--', 'C', 'easy'),
('c', 'What does the & operator do in scanf()?', 'Address-of operator', 'Bitwise AND', 'Logical AND', 'Pointer operator', 'A', 'medium'),
('c', 'Which function is used to allocate memory dynamically?', 'alloc()', 'new()', 'malloc()', 'create()', 'C', 'medium'),

('c', 'What is the correct syntax to declare a pointer?', 'int ptr*;', 'int *ptr;', 'pointer int ptr;', 'int ptr&;', 'B', 'medium'),
('c', 'Which loop always executes at least once?', 'while', 'for', 'do-while', 'foreach', 'C', 'medium'),
('c', 'What does NULL represent in C?', 'Null pointer', 'Zero value', 'Empty string', 'Undefined', 'A', 'medium'),
('c', 'Which operator is used to access structure members?', '->', '.', '::', '~', 'B', 'easy'),
('c', 'What is the return type of main() function?', 'void', 'char', 'int', 'float', 'C', 'easy'),

('c', 'Which function is used to copy strings?', 'copy()', 'strcpy()', 'strcat()', 'strdup()', 'B', 'medium'),
('c', 'What does sizeof() operator return?', 'Size in bytes', 'Number of elements', 'Memory address', 'Type of variable', 'A', 'medium'),
('c', 'Which keyword is used to prevent variable modification?', 'final', 'readonly', 'const', 'static', 'C', 'medium'),
('c', 'What is an array in C?', 'Collection of same type', 'Collection of any type', 'Linked data structure', 'Tree structure', 'A', 'easy'),
('c', 'Which operator has highest precedence?', '*', '()', '+', '==', 'B', 'medium'),

('c', 'What does the break statement do?', 'Skip iteration', 'Return value', 'Exit from loop', 'Pause execution', 'C', 'easy'),
('c', 'Which header file is needed for sqrt()?', 'stdio.h', 'math.h', 'stdlib.h', 'cmath.h', 'B', 'easy'),
('c', 'What is the output of: printf("%d", 5/2);?', '2.5', '2', '3', '5', 'B', 'medium'),
('c', 'Which storage class has global scope?', 'extern', 'auto', 'register', 'static', 'A', 'medium'),
('c', 'What does the continue statement do?', 'Exit loop', 'Return from function', 'Skip to next iteration', 'Pause execution', 'C', 'easy');
