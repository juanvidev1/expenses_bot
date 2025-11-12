document.addEventListener('DOMContentLoaded', () => {
  const debug = document.getElementById('debug');
  const params = new URLSearchParams(window.location.search);
  const userIdParam = params.get('userId');
  const cardsParam = params.get('cards');

  let userCards = [];

  if (userIdParam) {
    debug.textContent = `Parámetro userId recibido: ${userIdParam}`;
    console.log('Parámetro userId recibido:', userIdParam);
  } else {
    debug.textContent = 'No se recibió parámetro userId';
    console.log('No se recibió parámetro userId');
  }

  if (cardsParam) {
    try {
      userCards = JSON.parse(cardsParam);
      console.log('Tarjetas recibidas:', userCards);
      debug.textContent += ` | Tarjetas: ${userCards.length}`;
    } catch (error) {
      console.error('Error parseando tarjetas:', error);
      debug.textContent += ' | Error parseando tarjetas';
    }
  }

  const getCards = async (userId) => {
    try {
      const response = await fetch(`http://localhost:3052/api/cards/${userId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Tarjetas recibidas del servidor:', data.cards);
      debug.textContent += ` | Tarjetas recibidas: ${JSON.stringify(
        data.cards,
      )}`;
      return data.cards;
    } catch (error) {
      console.error('Error al obtener las tarjetas:', error);
      debug.textContent += ` | Error al obtener tarjetas: ${error.message}`;
    }
  };

  const populateCardsSelector = (cards, element) => {
    const cardsSelector = element || document.getElementById('cards');
    if (cards && cards.length > 0) {
      cardsSelector.innerHTML = `
        <option value="">Seleccionar tarjeta</option>
        ${cards
          .map(
            (card) => `
          <option value="${card.id}">${card.card_number} (${card.card_type})</option>
        `,
          )
          .join('')}
      `;
    } else {
      cardsSelector.innerHTML =
        '<option value="">No hay tarjetas disponibles</option>';
    }
  };

  const paymentMethodSelect = document.getElementById('forma-pago');
  const instalmentsNumberInput = document.getElementById('numero-cuotas');
  const gCardsSelector = document.getElementById('cards');
  const instalmentValue = document.getElementById('valor-cuota');
  const creditTotalValue = document.getElementById('valor-compra-credito');
  instalmentsNumberInput.value = ''; // Valor
  instalmentsNumberInput.classList.add('hidden'); // Oculto por defecto
  gCardsSelector.classList.add('hidden'); // Oculto por defecto
  instalmentValue.value = '';
  creditTotalValue.value = '';
  instalmentValue.classList.add('hidden');
  creditTotalValue.classList.add('hidden');
  paymentMethodSelect.value = 'Efectivo'; // Valor por defecto
  console.log(
    'Método de pago seleccionado por defecto:',
    paymentMethodSelect.value,
  );
  paymentMethodSelect.addEventListener('change', (event) => {
    console.log('Método de pago seleccionado:', event.target.value);
    const selectedMethod = event.target.value;
    if (selectedMethod === 'Tarjeta de crédito') {
      instalmentsNumberInput.classList.remove('hidden');
      gCardsSelector.classList.remove('hidden');
      // Usar las tarjetas de los parámetros URL si están disponibles
      if (userCards.length > 0) {
        populateCardsSelector(userCards, gCardsSelector);
      } else if (userIdParam) {
        getCards(userIdParam)
          .then((fetchedCards) => {
            console.log('Tarjetas obtenidas:', fetchedCards);
            populateCardsSelector(fetchedCards, gCardsSelector);
          })
          .catch((error) => {
            console.error('Error en la obtención de tarjetas:', error);
            populateCardsSelector([], gCardsSelector);
          });
      } else {
        populateCardsSelector([], gCardsSelector);
      }
      instalmentValue.classList.remove('hidden');
      creditTotalValue.classList.remove('hidden');
    } else {
      instalmentsNumberInput.classList.add('hidden');
      gCardsSelector.classList.add('hidden');
      instalmentValue.classList.add('hidden');
      creditTotalValue.classList.add('hidden');
    }
  });

  const validateData = (data) => {
    let isValid = true;

    // Validar monto
    if (isNaN(data.monto) || data.monto <= 0) {
      isValid = false;
      document.getElementById('monto').classList.add('error');
    } else {
      document.getElementById('monto').classList.remove('error');
    }

    // Validar categoría
    if (!data.categoria) {
      isValid = false;
      document.getElementById('categoria').classList.add('error');
    } else {
      document.getElementById('categoria').classList.remove('error');
    }

    // Validar forma de pago
    if (!data.formaPago) {
      isValid = false;
      document.getElementById('forma-pago').classList.add('error');
    } else {
      document.getElementById('forma-pago').classList.remove('error');
    }

    // Validar número de cuotas si es tarjeta de crédito
    if (
      data.formaPago === 'Tarjeta de crédito' &&
      (isNaN(data.numeroCuotas) || data.numeroCuotas <= 0)
    ) {
      isValid = false;
      document.getElementById('numero-cuotas').classList.add('error');
    } else {
      document.getElementById('numero-cuotas').classList.remove('error');
    }

    // Validar tarjeta asociada si es tarjeta de crédito
    if (data.formaPago === 'Tarjeta de crédito' && !data.tarjetaAsociada) {
      isValid = false;
      document.getElementById('cards').classList.add('error');
    } else {
      document.getElementById('cards').classList.remove('error');
    }

    // Validar fecha
    if (!data.fechaCompra) {
      isValid = false;
      document.getElementById('fecha').classList.add('error');
    } else {
      document.getElementById('fecha').classList.remove('error');
    }

    return isValid;
  };

  const checkWebApp = () => {
    const tg = window.Telegram?.WebApp;
    if (!tg) {
      debug.textContent = 'WebApp API no disponible, reintentando...';
      console.log('WebApp API no disponible, reintentando...');
      setTimeout(checkWebApp, 100); // reintenta cada 100ms
      return;
    }

    debug.textContent = `WebApp API disponible! ✅ | Version: ${
      tg.version || 'N/A'
    }`;
    console.log('WebApp API disponible:', tg);
    console.log('WebApp version:', tg.version);
    console.log('WebApp initData:', tg.initData);
    console.log('WebApp isExpanded:', tg.isExpanded);
    console.log('Métodos disponibles:', Object.getOwnPropertyNames(tg));

    // API lista, inicializa
    tg.ready();
    tg.expand();

    document.getElementById('button').addEventListener('click', (event) => {
      event.preventDefault(); // Prevenir el envío del formulario
      
      const comercio = document.getElementById('comercio').value;
      const monto = parseFloat(document.getElementById('monto').value);
      const categoria = document.getElementById('categoria').value;
      const formaPago = document.getElementById('forma-pago').value;
      const numeroCuotas = parseInt(
        document.getElementById('numero-cuotas').value,
      );
      const tarjetaAsociada = document.getElementById('cards').value;
      const valorCuota = parseFloat(
        document.getElementById('valor-cuota').value,
      );
      const valorTotalCredito = parseFloat(
        document.getElementById('valor-compra-credito').value,
      );
      const estadoPago = document.getElementById('estado-pago').checked;
      const descripcion = document.getElementById('descripcion').value;
      const fechaCompra = document.getElementById('fecha').value;

      const dataToSend = {
        comercio,
        monto,
        categoria,
        formaPago,
        numeroCuotas,
        tarjetaAsociada,
        valorCuota,
        valorTotalCredito,
        estadoPago,
        descripcion,
        fechaCompra,
      };

      console.log('Validando datos:', dataToSend);
      const isValid = validateData(dataToSend);
      console.log('Resultado de validación:', isValid);

      if (!isValid) {
        alert('Por favor completa todos los campos requeridos');
        return;
      }
      const jsonString = JSON.stringify(dataToSend);

      debug.textContent = `Enviando: ${comercio} - $${monto} | Forma de pago: ${formaPago} | JSON: ${jsonString}`;
      console.log('Datos a enviar:', dataToSend);
      console.log('JSON string:', jsonString);
      console.log('WebApp object:', tg);
      console.log('sendData method:', typeof tg.sendData);
      console.log('sendData exists:', 'sendData' in tg);

      // Intentar múltiples métodos
      try {
        if (typeof tg.sendData === 'function') {
          console.log('Intentando sendData...');
          tg.sendData(jsonString);
          debug.textContent += ' | ✅ sendData ejecutado!';
          console.log('sendData ejecutado exitosamente');
        } else {
          console.log('sendData no está disponible');

          debug.textContent += ' | ❌ sendData no disponible';

          // Alternativa: usar postMessage
          if (window.parent && window.parent !== window) {
            console.log('Intentando postMessage...');
            window.parent.postMessage(jsonString, '*');
            debug.textContent += ' | ✅ postMessage enviado!';
          }
        }
      } catch (error) {
        debug.textContent += ' | ❌ Error: ' + error.message;
        console.error('Error en sendData:', error);
      }
    });
  };

  // Verificar si estamos en Telegram
  if (window.Telegram) {
    console.log('Telegram object detectado');
    checkWebApp();
  } else {
    console.log('No estamos en Telegram, simulando...');
    debug.textContent = 'No estamos en Telegram - modo simulación';

    document.getElementById('button').addEventListener('click', () => {
      const comercio = document.getElementById('comercio').value;
      const monto = parseFloat(document.getElementById('monto').value);

      if (!comercio || !monto) {
        alert('Por favor completa todos los campos');
        return;
      }

      debug.textContent = `Simulación: ${comercio} - $${monto}`;
      console.log('Datos simulados:', { comercio, monto });
    });
  }
});
