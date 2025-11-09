const calculateTotal = (amounts) => {
  return amounts.reduce((total, amount) => total + amount, 0);
};

const formatCurrency = (amount, currency = 'COP') => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
  }).format(amount);
};

const calculateCreditCardInstalments = (
  totalAmount,
  numberOfInstalments,
  annualInterestRate, // expresada como decimal, por ejemplo, 0.243 para 24.3%
) => {
  if (numberOfInstalments <= 0)
    throw new Error('El número de cuotas debe ser mayor que 0');
  if (annualInterestRate < 0) throw new Error('La tasa no puede ser negativa');

  // Convertir tasa efectiva anual a tasa mensual
  const monthlyInterestRate = Math.pow(1 + annualInterestRate, 1 / 12) - 1;

  if (monthlyInterestRate === 0) return totalAmount / numberOfInstalments;

  // Calcular el valor de cada cuota con la fórmula de anualidades ordinarias francesa. Se usa la fórmula:
  // A = P * [r(1 + r)^n] / [(1 + r)^n – 1]
  // donde:
  // A = valor de la cuota
  // P = monto total del préstamo
  // r = tasa de interés por período
  // n = número total de pagos
  const instalmentValue =
    (totalAmount *
      (monthlyInterestRate *
        Math.pow(1 + monthlyInterestRate, numberOfInstalments))) /
    (Math.pow(1 + monthlyInterestRate, numberOfInstalments) - 1);

  return instalmentValue;
};

export { calculateTotal, formatCurrency, calculateCreditCardInstalments };
