[
  {
    "host": "home",
    "path": "",
    "connects": "connect home",
    "contracts": [
      {
        "contract": "contract-5BbHzS.cct",
        "type": "Unique Paths in a Grid II",
        "input": [
          "[ 0, 0, 0, 0, 0, 0, 0 ]",
          "[ 0, 0, 0, 0, 0, 0, 0 ]",
          "[ 0, 0, 1, 0, 0, 0, 0 ]",
          "[ 0, 0, 0, 0, 1, 0, 0 ]",
          "[ 0, 1, 1, 0, 0, 0, 0 ]",
          "[ 1, 0, 0, 0, 0, 0, 0 ]"
        ],
        "text": "You are located in the top-left corner of the following grid:\n\n 0,0,0,0,0,0,0,\n0,0,0,0,0,0,0,\n0,0,1,0,0,0,0,\n0,0,0,0,1,0,0,\n0,1,1,0,0,0,0,\n1,0,0,0,0,0,0,\n\n You are trying to reach the bottom-right corner of the grid, but you can only move down or right on each step. Furthermore, there are obstacles on the grid that you cannot move onto. These obstacles are denoted by '1', while empty spaces are denoted by 0.\n\n Determine how many unique paths there are from start to finish.\n\n NOTE: The data returned for this contract is an 2D array of numbers representing the grid.",
        "attempts": 10,
        "result": "no tool",
        "solve": false
      },
      {
        "contract": "contract-5ET5hd.cct",
        "type": "Square Root",
        "input": "255790117359810257794079993544774122080805903356112371773097912069163287405827513156156434366735489250190439317669975854962496430823049887692434974431063106623811296926306463804494802208141431197556193n",
        "text": "You are given a ~200 digit BigInt. Find the square root of this number, to the nearest integer.\n\nThe input is a BigInt value. The answer must be the string representing the solution's BigInt value. The trailing \"n\" is not part of the string.\n\nHint: If you are having trouble, you might consult https://en.wikipedia.org/wiki/Methods_of_computing_square_roots\n\nInput number:\n255790117359810257794079993544774122080805903356112371773097912069163287405827513156156434366735489250190439317669975854962496430823049887692434974431063106623811296926306463804494802208141431197556193",
        "attempts": 10,
        "result": "no tool",
        "solve": false
      },
      {
        "contract": "contract-8TFBeE.cct",
        "type": "Array Jumping Game II",
        "input": "[ 0, 2, 4, 3, 2, 2, 2, 0, 1, 3, 5, 4, 3, 6, 3, 0, 2, 3, 4, 1, 4, 2, 2 ]",
        "text": "You are given the following array of integers:\n\n 0,2,4,3,2,2,2,0,1,3,5,4,3,6,3,0,2,3,4,1,4,2,2\n\n Each element in the array represents your MAXIMUM jump length at that position. This means that if you are at position i and your maximum jump length is n, you can jump to any position from i to i+n. \n\nAssuming you are initially positioned at the start of the array, determine the minimum number of jumps to reach the last index.\n\n If it's impossible to reach the last index, then the answer should be 0.",
        "attempts": 3,
        "result": "no tool",
        "solve": false
      },
      {
        "contract": "contract-ADymB3.cct",
        "type": "Find All Valid Math Expressions",
        "input": "[ 82590120701, 55 ]",
        "text": "You are given the following string which contains only digits between 0 and 9:\n\n 82590120701\n\n You are also given a target number of 55. Return all possible ways you can add the +(add), -(subtract), and *(multiply) operators to the string such that it evaluates to the target number. (Normal order of operations applies.)\n\n The provided answer should be an array of strings containing the valid expressions. The data provided by this problem is an array with two elements. The first element is the string of digits, while the second element is the target number:\n\n [\"82590120701\", 55]\n\n NOTE: The order of evaluation expects script operator precedence.\n NOTE: Numbers in the expression cannot have leading 0's. In other words, \"1+01\" is not a valid expression.\n\n Examples:\n\n Input: digits = \"123\", target = 6\n Output: [\"1+2+3\", \"1*2*3\"]\n\n Input: digits = \"105\", target = 5\n Output: [\"1*0+5\", \"10-5\"]",
        "attempts": 10,
        "result": "no tool",
        "solve": false
      },
      {
        "contract": "contract-B4grdv.cct",
        "type": "Largest Rectangle in a Matrix",
        "input": [
          "[ 0, 1, 0, 0, 0, 0, 0, 0, 0 ]",
          "[ 0, 0, 0, 1, 0, 0, 1, 0, 0 ]",
          "[ 0, 0, 0, 1, 0, 0, 0, 0, 0 ]",
          "[ 0, 0, 0, 1, 0, 0, 0, 0, 0 ]",
          "[ 0, 1, 0, 0, 0, 1, 1, 0, 0 ]"
        ],
        "text": "You are given a binary matrix consisting only of 0s and 1s:\n\n[\n  [0,1,0,0,0,0,0,0,0],\n  [0,0,0,1,0,0,1,0,0],\n  [0,0,0,1,0,0,0,0,0],\n  [0,0,0,1,0,0,0,0,0],\n  [0,1,0,0,0,1,1,0,0]\n]\n\nYour task is to find the two corners of the largest rectangle ([[r1,c1],[r2,c2]]) that does not contain any 1s.\n\nExample 1:\nData:\n[\n  [1,0,0],\n  [0,0,0]\n]\n\nAnswer:[[0,1],[1,2]]\n\nExample 2:\nData:\n[\n  [0,0,0,1],\n  [0,0,0,0],\n  [0,0,1,0],\n  [0,0,0,1]\n]\n\nAnswer: [[0,0],[3,1]]\n",
        "attempts": 10,
        "result": "no tool",
        "solve": false
      },
      {
        "contract": "contract-BsITN7.cct",
        "type": "Proper 2-Coloring of a Graph",
        "input": [
          10,
          [
            "[ 2, 4 ]",
            "[ 2, 7 ]",
            "[ 1, 6 ]",
            "[ 6, 7 ]",
            "[ 8, 9 ]",
            "[ 3, 4 ]",
            "[ 2, 5 ]",
            "[ 7, 8 ]",
            "[ 4, 8 ]",
            "[ 0, 6 ]",
            "[ 0, 8 ]",
            "[ 4, 6 ]"
          ]
        ],
        "text": "You are given the following data, representing a graph:\n [10,[[2,4],[2,7],[1,6],[6,7],[8,9],[3,4],[2,5],[7,8],[4,8],[0,6],[0,8],[4,6]]]\n Note that \"graph\", as used here, refers to the field of graph theory, and has no relation to statistics or plotting. The first element of the data represents the number of vertices in the graph. Each vertex is a unique number between 0 and 9. The next element of the data represents the edges of the graph. Two vertices u,v in a graph are said to be adjacent if there exists an edge [u,v]. Note that an edge [u,v] is the same as an edge [v,u], as order does not matter. You must construct a 2-coloring of the graph, meaning that you have to assign each vertex in the graph a \"color\", either 0 or 1, such that no two adjacent vertices have the same color. Submit your answer in the form of an array, where element i represents the color of vertex i. If it is impossible to construct a 2-coloring of the given graph, instead submit an empty array.\n\n Examples:\n\n Input: [4, [[0, 2], [0, 3], [1, 2], [1, 3]]]\n Output: [0, 0, 1, 1]\n\n Input: [3, [[0, 1], [0, 2], [1, 2]]]\n Output: []",
        "attempts": 5,
        "result": "no tool",
        "solve": false
      },
      {
        "contract": "contract-D9A8IJ.cct",
        "type": "Algorithmic Stock Trader II",
        "input": "[ 145, 193, 196, 88, 124, 1, 167, 179, 88, 152, 183, 135, 185, 103, 152, 141, 83, 13, 149, 56, 63, 68, 11, 92 ]",
        "text": "You are given the following array of stock prices (which are numbers) where the i-th element represents the stock price on day i:\n\n 145,193,196,88,124,1,167,179,88,152,183,135,185,103,152,141,83,13,149,56,63,68,11,92\n\n Determine the maximum possible profit you can earn using as many transactions as you'd like. A transaction is defined as buying and then selling one share of the stock. Note that you cannot engage in multiple transactions at once. In other words, you must sell the stock before you buy it again.\n\n If no profit can be made, then the answer should be 0.",
        "attempts": 10,
        "result": "no tool",
        "solve": false
      },
      {
        "contract": "contract-KB8Qnn.cct",
        "type": "Unique Paths in a Grid I",
        "input": "[ 6, 8 ]",
        "text": "You are in a grid with 6 rows and 8 columns, and you are positioned in the top-left corner of that grid. You are trying to reach the bottom-right corner of the grid, but you can only move down or right on each step. Determine how many unique paths there are from start to finish.\n\n NOTE: The data returned for this contract is an array with the number of rows and columns:\n\n [6, 8]",
        "attempts": 10,
        "result": "no tool",
        "solve": false
      },
      {
        "contract": "contract-NfpTYC.cct",
        "type": "Merge Overlapping Intervals",
        "input": [
          "[ 12, 14 ]",
          "[ 12, 22 ]",
          "[ 13, 23 ]",
          "[ 2, 9 ]",
          "[ 2, 9 ]",
          "[ 15, 22 ]",
          "[ 8, 16 ]",
          "[ 2, 7 ]",
          "[ 7, 15 ]",
          "[ 2, 12 ]",
          "[ 20, 26 ]",
          "[ 1, 6 ]",
          "[ 25, 33 ]",
          "[ 7, 12 ]",
          "[ 16, 24 ]",
          "[ 23, 26 ]",
          "[ 12, 19 ]",
          "[ 24, 27 ]"
        ],
        "text": "Given the following array of arrays of numbers representing a list of intervals, merge all overlapping intervals.\n\n [[12,14],[12,22],[13,23],[2,9],[2,9],[15,22],[8,16],[2,7],[7,15],[2,12],[20,26],[1,6],[25,33],[7,12],[16,24],[23,26],[12,19],[24,27]]\n\n Example:\n\n [[1, 3], [8, 10], [2, 6], [10, 16]]\n\n would merge into [[1, 6], [8, 16]].\n\n The intervals must be returned in ASCENDING order. You can assume that in an interval, the first number will always be smaller than the second.",
        "attempts": 15,
        "result": "no tool",
        "solve": false
      },
      {
        "contract": "contract-b91ysz.cct",
        "type": "Sanitize Parentheses in Expression",
        "input": "()))())((()a)))(a",
        "text": "Given the following string:\n\n ()))())((()a)))(a\n\n remove the minimum number of invalid parentheses in order to validate the string. If there are multiple minimal ways to validate the string, provide all of the possible results. The answer should be provided as an array of strings. If it is impossible to validate the string the result should be an array with only an empty string.\n\n IMPORTANT: The string may contain letters, not just parentheses.\n\n Examples:\n\n \"()())()\" -> [\"()()()\", \"(())()\"]\n \"(a)())()\" -> [\"(a)()()\", \"(a())()\"]\n \")(\" -> [\"\"]",
        "attempts": 10,
        "result": "no tool",
        "solve": false
      },
      {
        "contract": "contract-cjuq7R.cct",
        "type": "Array Jumping Game",
        "input": "[ 10, 0, 0, 7, 4, 0, 6, 10, 5 ]",
        "text": "You are given the following array of integers:\n\n 10,0,0,7,4,0,6,10,5\n\n Each element in the array represents your MAXIMUM jump length at that position. This means that if you are at position i and your maximum jump length is n, you can jump to any position from i to i+n. \n\nAssuming you are initially positioned at the start of the array, determine whether you are able to reach the last index.\n\n Your answer should be submitted as 1 or 0, representing true and false respectively.",
        "attempts": 1,
        "result": "no tool",
        "solve": false
      },
      {
        "contract": "contract-cyBo2y.cct",
        "type": "Algorithmic Stock Trader III",
        "input": "[ 19, 43, 85, 18, 79, 178, 10, 6, 158, 168 ]",
        "text": "You are given the following array of stock prices (which are numbers) where the i-th element represents the stock price on day i:\n\n 19,43,85,18,79,178,10,6,158,168\n\n Determine the maximum possible profit you can earn using at most two transactions. A transaction is defined as buying and then selling one share of the stock. Note that you cannot engage in multiple transactions at once. In other words, you must sell the stock before you buy it again.\n\n If no profit can be made, then the answer should be 0.",
        "attempts": 10,
        "result": "no tool",
        "solve": false
      },
      {
        "contract": "contract-dhXsW6.cct",
        "type": "Compression III: LZ Compression",
        "input": "C67izRBD3RERLY6mz2BLgYwgYwnuLCWWgYwnuLTTskawnuLTTsk24jVTTskkeskkkkeskkkkXqVP4bLdbLdbLdbLd7f",
        "text": "Lempel-Ziv (LZ) compression is a data compression technique which encodes data using references to earlier parts of the data. In this variant of LZ, data is encoded in two types of chunk. Each chunk begins with a length L, encoded as a single ASCII digit from 1 to 9, followed by the chunk data, which is either:\n\n 1. Exactly L characters, which are to be copied directly into the uncompressed data.\n 2. A reference to an earlier part of the uncompressed data. To do this, the length is followed by a second ASCII digit X: each of the L output characters is a copy of the character X places before it in the uncompressed data.\n\n For both chunk types, a length of 0 instead means the chunk ends immediately, and the next character is the start of a new chunk. The two chunk types alternate, starting with type 1, and the final chunk may be of either type.\n\n You are given the following input string:\n     C67izRBD3RERLY6mz2BLgYwgYwnuLCWWgYwnuLTTskawnuLTTsk24jVTTskkeskkkkeskkkkXqVP4bLdbLdbLdbLd7f\n Encode it using Lempel-Ziv encoding with the minimum possible output length.\n\n Examples (some have other possible encodings of minimal length):\n     abracadabra     ->  7abracad47\n     mississippi     ->  4miss433ppi\n     aAAaAAaAaAA     ->  3aAA53035\n     2718281828      ->  627182844\n     abcdefghijk     ->  9abcdefghi02jk\n     aaaaaaaaaaaa    ->  3aaa91\n     aaaaaaaaaaaaa   ->  1a91031\n     aaaaaaaaaaaaaa  ->  1a91041",
        "attempts": 10,
        "result": "no tool",
        "solve": false
      },
      {
        "contract": "contract-hXbpj5.cct",
        "type": "Compression II: LZ Decompression",
        "input": "9GzQnl4DsJ04eXdK779F8826V4mG153kJ6278w82qFX2g382ZB5845TNb238dy41Vndy349nolleHLf704D0sl612CE49",
        "text": "Lempel-Ziv (LZ) compression is a data compression technique which encodes data using references to earlier parts of the data. In this variant of LZ, data is encoded in two types of chunk. Each chunk begins with a length L, encoded as a single ASCII digit from 1 to 9, followed by the chunk data, which is either:\n\n 1. Exactly L characters, which are to be copied directly into the uncompressed data.\n 2. A reference to an earlier part of the uncompressed data. To do this, the length is followed by a second ASCII digit X: each of the L output characters is a copy of the character X places before it in the uncompressed data.\n\n For both chunk types, a length of 0 instead means the chunk ends immediately, and the next character is the start of a new chunk. The two chunk types alternate, starting with type 1, and the final chunk may be of either type.\n\n You are given the following LZ-encoded string:\n     9GzQnl4DsJ04eXdK779F8826V4mG153kJ6278w82qFX2g382ZB5845TNb238dy41Vndy349nolleHLf704D0sl612CE49\n Decode it and output the original string.\n\n Example: decoding '5aaabb450723abb' chunk-by-chunk\n\n     5aaabb           ->  aaabb\n     5aaabb45         ->  aaabbaaab\n     5aaabb450        ->  aaabbaaab\n     5aaabb45072      ->  aaabbaaababababa\n     5aaabb450723abb  ->  aaabbaaababababaabb",
        "attempts": 10,
        "result": "no tool",
        "solve": false
      },
      {
        "contract": "contract-jLJzNy.cct",
        "type": "Generate IP Addresses",
        "input": "196132109133",
        "text": "Given the following string containing only digits, return an array with all possible valid IP address combinations that can be created from the string:\n\n 196132109133\n\n Note that an octet cannot begin with a '0' unless the number itself is exactly '0'. For example, '192.168.010.1' is not a valid IP.\n\n Examples:\n\n 25525511135 -> [\"255.255.11.135\", \"255.255.111.35\"]\n 1938718066 -> [\"193.87.180.66\"]",
        "attempts": 10,
        "result": "no tool",
        "solve": false
      },
      {
        "contract": "contract-kuMxE7.cct",
        "type": "Algorithmic Stock Trader IV",
        "input": [
          8,
          "[ 38, 26, 199, 111, 117, 16, 47, 144, 169, 15, 145, 183, 73, 135, 142, 194 ]"
        ],
        "text": "You are given the following array with two elements:\n\n [8, [38,26,199,111,117,16,47,144,169,15,145,183,73,135,142,194]]\n\n The first element is an integer k. The second element is an array of stock prices (which are numbers) where the i-th element represents the stock price on day i.\n\n Determine the maximum possible profit you can earn using at most k transactions. A transaction is defined as buying and then selling one share of the stock. Note that you cannot engage in multiple transactions at once. In other words, you must sell the stock before you can buy it again.\n\n If no profit can be made, then the answer should be 0.",
        "attempts": 10,
        "result": "no tool",
        "solve": false
      },
      {
        "contract": "contract-mXVpVk.cct",
        "type": "Encryption II: Vigenère Cipher",
        "input": "[ DEBUGCLOUDMACROMOUSEMODEM, OPERATING ]",
        "text": "Vigenère cipher is a type of polyalphabetic substitution. It uses  the Vigenère square to encrypt and decrypt plaintext with a keyword.\n\n   Vigenère square:\n          A B C D E F G H I J K L M N O P Q R S T U V W X Y Z \n        +----------------------------------------------------\n      A | A B C D E F G H I J K L M N O P Q R S T U V W X Y Z \n      B | B C D E F G H I J K L M N O P Q R S T U V W X Y Z A \n      C | C D E F G H I J K L M N O P Q R S T U V W X Y Z A B\n      D | D E F G H I J K L M N O P Q R S T U V W X Y Z A B C\n      E | E F G H I J K L M N O P Q R S T U V W X Y Z A B C D\n                 ...\n      Y | Y Z A B C D E F G H I J K L M N O P Q R S T U V W X\n      Z | Z A B C D E F G H I J K L M N O P Q R S T U V W X Y\n\n For encryption each letter of the plaintext is paired with the corresponding letter of a repeating keyword. For example, the plaintext DASHBOARD is encrypted with the keyword LINUX:\n    Plaintext: DASHBOARD\n    Keyword:   LINUXLINU\n So, the first letter D is paired with the first letter of the key L. Therefore, row D and column L of the  Vigenère square are used to get the first cipher letter O. This must be repeated for the whole ciphertext.\n\n You are given an array with two elements:\n   [\"DEBUGCLOUDMACROMOUSEMODEM\", \"OPERATING\"]\n The first element is the plaintext, the second element is the keyword.\n\n Return the ciphertext as uppercase string.",
        "attempts": 10,
        "result": "no tool",
        "solve": false
      },
      {
        "contract": "contract-oOXCRn.cct",
        "type": "HammingCodes: Encoded Binary to Integer",
        "input": "0000000001000000100100101011101011101101000111011001110101110110",
        "text": "You are given the following encoded binary string: \n '0000000001000000100100101011101011101101000111011001110101110110' \n\n Decode it as an 'extended Hamming code' and convert it to a decimal value.\n The binary string may include leading zeroes.\n An 'extended Hamming code' has an additional parity bit to enhance error detection.\n A parity bit is inserted at every position N where N is a power of 2, with the additional parity bit at position 0.\n Parity bits are used to make the total number of '1' bits in a given set of data even.\n Each parity bit at position N alternately considers N bits then ignores N bits, starting at and including position N.\n The additional parity bit at position 0 considers all bits including parity bits.\n For example, the parity bit at position 2 considers bits 2 to 3 and 6 to 7. The parity bit at position 1 considers bits 1, 3, 5 and 7.\n The endianness of the parity bits is reversed compared to the endianness of the data bits:\n Data bits are encoded most significant bit first and the parity bits encoded least significant bit first.\n The additional parity bit at position 0 is set last.\n There is a ~55% chance for an altered bit at a random index.\n Find the possible altered bit, fix it and extract the decimal value.\n\n Examples:\n\n '11110000' passes the parity checks and has data bits of 1000, which is 8 in binary.\n '1001101010' fails the parity checks and needs the last bit to be corrected to get '1001101011', after which the data bits are found to be 10101, which is 21 in binary.\n\n For more information on the 'rule' of encoding, refer to Wikipedia (https://wikipedia.org/wiki/Hamming_code) or the 3Blue1Brown videos on Hamming Codes. (https://youtube.com/watch?v=X8jsijhllIA)\n NOTE: The wikipedia entry does not cover the specific 'extended Hamming code' structure used in this contract.",
        "attempts": 10,
        "result": "no tool",
        "solve": false
      },
      {
        "contract": "contract-rp0cf2.cct",
        "type": "Shortest Path in a Grid",
        "input": [
          "[ 0, 0, 0, 0, 1, 0 ]",
          "[ 0, 0, 0, 0, 0, 0 ]",
          "[ 0, 0, 0, 0, 0, 0 ]",
          "[ 0, 0, 0, 0, 0, 1 ]",
          "[ 1, 1, 0, 1, 0, 0 ]",
          "[ 0, 1, 1, 0, 1, 1 ]",
          "[ 1, 0, 1, 0, 1, 1 ]",
          "[ 0, 1, 0, 0, 0, 0 ]",
          "[ 0, 0, 0, 0, 0, 0 ]",
          "[ 1, 0, 0, 0, 1, 0 ]",
          "[ 0, 0, 1, 0, 0, 0 ]",
          "[ 1, 0, 0, 0, 0, 0 ]"
        ],
        "text": "You are located in the top-left corner of the following grid:\n\n   [[0,0,0,0,1,0],\n   [0,0,0,0,0,0],\n   [0,0,0,0,0,0],\n   [0,0,0,0,0,1],\n   [1,1,0,1,0,0],\n   [0,1,1,0,1,1],\n   [1,0,1,0,1,1],\n   [0,1,0,0,0,0],\n   [0,0,0,0,0,0],\n   [1,0,0,0,1,0],\n   [0,0,1,0,0,0],\n   [1,0,0,0,0,0]]\n\n You are trying to find the shortest path to the bottom-right corner of the grid, but there are obstacles on the grid that you cannot move onto. These obstacles are denoted by '1', while empty spaces are denoted by 0.\n\n Determine the shortest path from start to finish, if one exists. The answer should be given as a string of UDLR characters, indicating the moves along the path\n\n NOTE: If there are multiple equally short paths, any of them is accepted as answer. If there is no path, the answer should be an empty string.\n NOTE: The data returned for this contract is an 2D array of numbers representing the grid.\n\n Examples:\n\n     [[0,1,0,0,0],\n      [0,0,0,1,0]]\n \n Answer: 'DRRURRD'\n\n     [[0,1],\n      [1,0]]\n \n Answer: \"\"",
        "attempts": 10,
        "result": "no tool",
        "solve": false
      },
      {
        "contract": "contract-sJHGwG.cct",
        "type": "HammingCodes: Integer to Encoded Binary",
        "input": 28794031939689010,
        "text": "You are given the following decimal value: \n 28794031939689010 \n\n Convert it to a binary representation and encode it as an 'extended Hamming code'.\n  The number should be converted to a string of '0' and '1' with no leading zeroes.\n An 'extended Hamming code' has an additional parity bit to enhance error detection.\n A parity bit is inserted at every position N where N is a power of 2, with the additional parity bit at position 0.\n Parity bits are used to make the total number of '1' bits in a given set of data even.\n Each parity bit at position N alternately considers N bits then ignores N bits, starting at and including position N.\n The additional parity bit at position 0 considers all bits including parity bits.\n For example, the parity bit at position 2 considers bits 2 to 3 and 6 to 7. The parity bit at position 1 considers bits 1, 3, 5 and 7.\n The endianness of the parity bits is reversed compared to the endianness of the data bits:\n Data bits are encoded most significant bit first and the parity bits encoded least significant bit first.\n The additional parity bit at position 0 is set last.\n\n Examples:\n\n 8 in binary is 1000, and encodes to 11110000 (pppdpddd - where p is a parity bit and d is a data bit)\n 21 in binary is 10101, and encodes to 1001101011 (pppdpdddpd)\n\n For more information on the 'rule' of encoding, refer to Wikipedia (https://wikipedia.org/wiki/Hamming_code) or the 3Blue1Brown videos on Hamming Codes. (https://youtube.com/watch?v=X8jsijhllIA)\n NOTE: The wikipedia entry does not cover the specific 'extended Hamming code' structure used in this contract.",
        "attempts": 10,
        "result": "no tool",
        "solve": false
      },
      {
        "contract": "contract-tFe1C2.cct",
        "type": "Compression I: RLE Compression",
        "input": "JhgggggggggBBBBBBBBBBBBBssJJJJJJJ444jjjjjjjjQQAAAAAAAA11111111111117766BB2kkkkk",
        "text": "Run-length encoding (RLE) is a data compression technique which encodes data as a series of runs of a repeated single character. Runs are encoded as a length, followed by the character itself. Lengths are encoded as a single ASCII digit; runs of 10 characters or more are encoded by splitting them into multiple runs.\n\n You are given the following input string:\n     JhgggggggggBBBBBBBBBBBBBssJJJJJJJ444jjjjjjjjQQAAAAAAAA11111111111117766BB2kkkkk\n Encode it using run-length encoding with the minimum possible output length.\n\n Examples:\n\n     aaaaabccc            ->  5a1b3c\n     aAaAaA               ->  1a1A1a1A1a1A\n     111112333            ->  511233\n     zzzzzzzzzzzzzzzzzzz  ->  9z9z1z  (or 9z8z2z, etc.)",
        "attempts": 10,
        "result": "no tool",
        "solve": false
      },
      {
        "contract": "contract-wAgX8H.cct",
        "type": "Minimum Path Sum in a Triangle",
        "input": [
          "[ 1 ]",
          "[ 8, 9 ]",
          "[ 4, 1, 8 ]",
          "[ 4, 7, 9, 5 ]",
          "[ 7, 3, 9, 3, 5 ]"
        ],
        "text": "Given a triangle, find the minimum path sum from top to bottom. In each step of the path, you may only move to adjacent numbers in the row below. The triangle is represented as a 2D array of numbers:\n\n [\n      [1],\n     [8,9],\n    [4,1,8],\n   [4,7,9,5],\n  [7,3,9,3,5]\n]\n\n Example: If you are given the following triangle:\n\n[\n      [2],\n     [3,4],\n    [6,5,7],\n   [4,1,8,3]\n ]\n\n The minimum path sum is 11 (2 -> 3 -> 5 -> 1).",
        "attempts": 10,
        "result": "no tool",
        "solve": false
      },
      {
        "contract": "contract-zvpSea.cct",
        "type": "Total Number of Primes",
        "input": "[ 2857704, 3136742 ]",
        "text": "You are given two random non-negative integers: 2857704,3136742.\n The first will be up to 5000000, and the second will be at most 1000000 greater.\n Determine the amount of prime numbers between them (including the numbers given).\n\n Example:\n The range of [0,20] contains the primes [2,3,5,7,11,13,17,19], resulting in an answer of 8.",
        "attempts": 10,
        "result": "no tool",
        "solve": false
      }
    ]
  }
]
