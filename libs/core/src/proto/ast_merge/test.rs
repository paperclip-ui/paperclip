// macro_rules! test_case {
//     ($name: ident, $a: expr, $b: expr) => {
//         #[test]
//         fn $name() {
//             let mut main = parse_pc($a, "/entry.pc").unwrap();
//             let other = parse_pc($b, "/entry.pc").unwrap();
//             main.merge(&other);
//             assert_eq!(serialize_pc(&main), serialize_pc(&other));
//             assert_eq!(main, other);
//         }
//     };
// }

// // test_case!(can_merge_two_elements_together_at_the_document_level, "div\n", "div\nspan");
