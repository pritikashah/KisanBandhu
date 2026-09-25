const normalizeDecimalString = (value) => {
  const stringValue = String(value).trim();

  if (!/^\d+(\.\d+)?$/.test(stringValue)) {
    throw new Error("Invalid decimal value.");
  }

  return stringValue;
};

const multiplyDecimalStrings = (firstValue, secondValue) => {
  const first = normalizeDecimalString(firstValue);
  const second = normalizeDecimalString(secondValue);

  const firstParts = first.split(".");
  const secondParts = second.split(".");

  const firstInteger = firstParts[0];
  const firstFraction = firstParts[1] || "";

  const secondInteger = secondParts[0];
  const secondFraction = secondParts[1] || "";

  const firstDigits = `${firstInteger}${firstFraction}`;
  const secondDigits = `${secondInteger}${secondFraction}`;

  const firstNumber = BigInt(firstDigits);
  const secondNumber = BigInt(secondDigits);

  const result = firstNumber * secondNumber;

  const decimalPlaces =
    firstFraction.length + secondFraction.length;

  let resultString = result.toString();

  if (decimalPlaces === 0) {
    return resultString;
  }

  if (resultString.length <= decimalPlaces) {
    resultString =
      resultString.padStart(decimalPlaces + 1, "0");
  }

  const decimalPosition =
    resultString.length - decimalPlaces;

  resultString =
    resultString.slice(0, decimalPosition) +
    "." +
    resultString.slice(decimalPosition);

  resultString = resultString.replace(/0+$/, "");
  resultString = resultString.replace(/\.$/, "");

  return resultString || "0";
};

const subtractDecimalStrings = (firstValue, secondValue) => {
  const first = normalizeDecimalString(firstValue);
  const second = normalizeDecimalString(secondValue);

  const firstParts = first.split(".");
  const secondParts = second.split(".");

  const firstFraction = firstParts[1] || "";
  const secondFraction = secondParts[1] || "";

  const decimalPlaces = Math.max(
    firstFraction.length,
    secondFraction.length
  );

  const firstInteger =
    firstParts[0] + firstFraction.padEnd(decimalPlaces, "0");

  const secondInteger =
    secondParts[0] + secondFraction.padEnd(decimalPlaces, "0");

  const firstNumber = BigInt(firstInteger);
  const secondNumber = BigInt(secondInteger);

  const result = firstNumber - secondNumber;
  const negative = result < 0n;

  let resultString = (
    negative ? -result : result
  ).toString();

  if (decimalPlaces > 0) {
    if (resultString.length <= decimalPlaces) {
      resultString =
        resultString.padStart(decimalPlaces + 1, "0");
    }

    const decimalPosition =
      resultString.length - decimalPlaces;

    resultString =
      resultString.slice(0, decimalPosition) +
      "." +
      resultString.slice(decimalPosition);

    resultString = resultString.replace(/0+$/, "");
    resultString = resultString.replace(/\.$/, "");
  }

  if (!resultString) {
    resultString = "0";
  }

  return negative
    ? `-${resultString}`
    : resultString;
};

module.exports = {
  normalizeDecimalString,
  multiplyDecimalStrings,
  subtractDecimalStrings,
};