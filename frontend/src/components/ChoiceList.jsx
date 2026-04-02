import MCQOptionRow from "./MCQOptionRow";

function renderChoiceLabel(index) {
  return String.fromCharCode(65 + index);
}

export default function ChoiceList({
  choices,
  selectedAnswer,
  onSelectChoice,
  disabled,
  getOptionVariant,
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Answer choices"
      className="space-y-2"
    >
      {choices.map((choice, index) => (
        <MCQOptionRow
          key={`${choice.id}-${index}`}
          label={renderChoiceLabel(index)}
          text={choice.text}
          onSelect={() => onSelectChoice(choice.id)}
          disabled={disabled}
          isSelected={selectedAnswer === choice.id}
          variant={getOptionVariant(choice)}
        />
      ))}
    </div>
  );
}
