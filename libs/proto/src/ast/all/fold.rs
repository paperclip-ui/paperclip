// pub use super::super::base;
// pub use super::super::docco;
// pub use super::super::pc;
// use super::ImmutableExpression;
// use super::{Expression, ImmutableExpressionRef};

// pub trait Foldable<Ret> {
//     fn fold<TFolder>(self, folder: TFolder) -> Ret
//     where
//         TFolder: Fn(&Self) -> Option<Ret>;
// }

// impl<'expr> Foldable<ImmutableExpression> for ImmutableExpressionRef<'expr> {
//     fn fold<TUpdate>(self, update: TUpdate) -> ImmutableExpression
//     where
//         TUpdate: Fn(&Self) -> Option<ImmutableExpression>,
//     {
//         if let Some(new_self) = (update)(&self) {
//             new_self
//         } else {
//             match self {
//                 ImmutableExpressionRef::Array(expr) => {
//                     ImmutableExpression::Array(pc::Array { ..expr.clone() })
//                 }
//                 ImmutableExpressionRef::Atom(expr) => ImmutableExpression::Atom(pc::Atom {
//                     value: if let Some(value) = &expr.value {
//                         None
//                     } else {
//                         None
//                     },
//                     ..expr.clone()
//                 }),
//                 _ => {
//                     self.into()
//                 }
//             }
//         }
//     }
// }

// // macro_rules! updatable {
// //     ($($ty:path => ($this:ident, $update: ident) $body:block), *) => {
// //         $(
// //           impl Updatable<$ty> for $ty {
// //             fn update<TUpdate>(self, $update: TUpdate) -> $ty where TUpdate: Fn(&Self) -> $ty {
// //               $body
// //             }
// //           }
// //         )*
// //     };
// // }

// // updatable!(
// //   pc::Array => (self, update) {
// //     update(&self.outer())
// //   }
// // );
