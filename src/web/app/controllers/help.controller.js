class HelpController {
  static commandsList = (req, res) => {
    console.log('Ejecutando commandsList - versión actualizada');
    const commands = [
      { command: '/start', description: 'Iniciar el bot' },
      { command: '/help', description: 'Mostrar ayuda' },
      { command: '/registrarse', description: 'Registrar usuario' },
      {
        command: '/consultar_usuario',
        description: 'Consultar datos del usuario',
      },
      { command: '/agregar_gasto', description: 'Agregar un nuevo gasto' },
      {
        command: '/consultar_gastos',
        description: 'Consultar gastos registrados',
      },
      { command: '/agregar_tarjeta', description: 'Agregar una nueva tarjeta' },
    ];

    res.json(commands);
  };
}

export { HelpController };
