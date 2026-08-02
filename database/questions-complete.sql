-- Comprehensive Questions for Snake MCQ Challenge
-- 20 Python questions and 20 C questions

-- ============================================
-- PYTHON QUESTIONS (20)
-- ============================================

INSERT INTO questions (language, question_text, option_a, option_b, option_c, option_d, correct_option, difficulty_level) VALUES
('python', 'Which keyword is used to define a function in Python?', 'def', 'function', 'func', 'define', 'A', 'easy'),
('python', 'What is the output of: print(2 ** 3)?', '6', '8', '9', '23', 'B', 'easy'),
('python', 'How do you create a list in Python?', 'list = []', 'list = ()', 'list = {}', 'list = <>', 'A', 'easy'),
('python', 'Which method is used to add an element to the end of a list?', 'append()', 'add()', 'insert()', 'push()', 'A', 'easy'),
('python', 'What is the correct file extension for Python files?', '.py', '.python', '.pt', '.pyt', 'A', 'easy'),

('python', 'What does len() function return?', 'Length of object', 'Type of object', 'Value of object', 'Size in bytes', 'A', 'medium'),
('python', 'Which of the following is mutable in Python?', 'List', 'Tuple', 'String', 'Integer', 'A', 'medium'),
('python', 'What is the output of: print(type([]))?', '<class list>', '<class array>', '<class tuple>', '<class dict>', 'A', 'medium'),
('python', 'How do you start a for loop in Python?', 'for i in range(5):', 'for (i=0; i<5; i++)', 'foreach i in 5:', 'loop i to 5:', 'A', 'medium'),
('python', 'What does the // operator do in Python?', 'Floor division', 'Exponentiation', 'Modulus', 'Regular division', 'A', 'medium'),

('python', 'Which keyword is used for exception handling?', 'try', 'catch', 'except', 'Both A and C', 'D', 'medium'),
('python', 'What is a lambda function in Python?', 'Anonymous function', 'Named function', 'Built-in function', 'Class method', 'A', 'medium'),
('python', 'How do you create a dictionary in Python?', 'dict = {}', 'dict = []', 'dict = ()', 'dict = <>', 'A', 'easy'),
('python', 'What is the output of: print(bool(0))?', 'True', 'False', '0', 'None', 'B', 'easy'),
('python', 'Which method converts a string to lowercase?', 'lower()', 'lowercase()', 'toLower()', 'downcase()', 'A', 'easy'),

('python', 'What does the self parameter represent in a class?', 'Instance of class', 'Class itself', 'Parent class', 'Method name', 'A', 'medium'),
('python', 'How do you import a module in Python?', 'import module_name', 'include module_name', 'require module_name', 'using module_name', 'A', 'easy'),
('python', 'What is the output of: print(3 * "A")?', 'AAA', '3A', 'A3', 'Error', 'A', 'medium'),
('python', 'Which function is used to get input from user?', 'input()', 'scanf()', 'get()', 'read()', 'A', 'easy'),
('python', 'What is a tuple in Python?', 'Immutable sequence', 'Mutable sequence', 'Key-value pairs', 'Ordered set', 'A', 'medium');

-- ============================================
-- C PROGRAMMING QUESTIONS (20)
-- ============================================

INSERT INTO questions (language, question_text, option_a, option_b, option_c, option_d, correct_option, difficulty_level) VALUES
('c', 'Which header file is required for printf()?', 'stdio.h', 'stdlib.h', 'string.h', 'math.h', 'A', 'easy'),
('c', 'What is the size of int in C (typically)?', '2 or 4 bytes', '1 byte', '8 bytes', '16 bytes', 'A', 'medium'),
('c', 'Which symbol is used for single-line comments in C?', '//', '/*', '#', '--', 'A', 'easy'),
('c', 'What does the & operator do in scanf()?', 'Address-of operator', 'Bitwise AND', 'Logical AND', 'Pointer operator', 'A', 'medium'),
('c', 'Which function is used to allocate memory dynamically?', 'malloc()', 'alloc()', 'new()', 'create()', 'A', 'medium'),

('c', 'What is the correct syntax to declare a pointer?', 'int *ptr;', 'int ptr*;', 'pointer int ptr;', 'int ptr&;', 'A', 'medium'),
('c', 'Which loop always executes at least once?', 'do-while', 'while', 'for', 'foreach', 'A', 'medium'),
('c', 'What does NULL represent in C?', 'Null pointer', 'Zero value', 'Empty string', 'Undefined', 'A', 'medium'),
('c', 'Which operator is used to access structure members?', '.', '->', '::', '~', 'A', 'easy'),
('c', 'What is the return type of main() function?', 'int', 'void', 'char', 'float', 'A', 'easy'),

('c', 'Which function is used to copy strings?', 'strcpy()', 'copy()', 'strcat()', 'strdup()', 'A', 'medium'),
('c', 'What does sizeof() operator return?', 'Size in bytes', 'Number of elements', 'Memory address', 'Type of variable', 'A', 'medium'),
('c', 'Which keyword is used to prevent variable modification?', 'const', 'final', 'readonly', 'static', 'A', 'medium'),
('c', 'What is an array in C?', 'Collection of same type', 'Collection of any type', 'Linked data structure', 'Tree structure', 'A', 'easy'),
('c', 'Which operator has highest precedence?', '()', '*', '+', '==', 'A', 'medium'),

('c', 'What does the break statement do?', 'Exit from loop', 'Skip iteration', 'Return value', 'Pause execution', 'A', 'easy'),
('c', 'Which header file is needed for sqrt()?', 'math.h', 'stdio.h', 'stdlib.h', 'cmath.h', 'A', 'easy'),
('c', 'What is the output of: printf("%d", 5/2);?', '2', '2.5', '3', '5', 'A', 'medium'),
('c', 'Which storage class has global scope?', 'extern', 'auto', 'register', 'static', 'A', 'medium'),
('c', 'What does the continue statement do?', 'Skip to next iteration', 'Exit loop', 'Return from function', 'Pause execution', 'A', 'easy');
