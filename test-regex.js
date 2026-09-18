const PASCAL_CASE_PATTERN = /^(?:[A-Z][a-z]+){2,}\d{1,5}$/;
const UNDERSCORE_PATTERN = /^[A-Z][a-z]+(?:_[A-Z][a-z]+)+_?\d{1,5}$/;
const HYPHEN_PATTERN = /^[A-Z][a-z]+(?:-[A-Z][a-z]+)+-?\d{1,5}$/;

const examples = [
  "Cultural_Comfort5894",
  "Salty-Tomato5654",
  "Top-Nebula-8302",
  "PomegranateOk3520",
  "Conscious_Age_1077",
  "Capital-Factor-382",
  "Plastic_Ninja_9014",
  "Patient_Library_253"
];

for (const ex of examples) {
  const match = PASCAL_CASE_PATTERN.test(ex) || UNDERSCORE_PATTERN.test(ex) || HYPHEN_PATTERN.test(ex);
  console.log(`${ex}: ${match}`);
}
